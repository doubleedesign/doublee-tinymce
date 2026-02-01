(function () {
	'use strict';

	class MiniblockPlugin {
		constructor() {
			if (this.constructor === MiniblockPlugin) {
				throw new Error('Cannot instantiate abstract class MiniblockPlugin directly');
			}
		}

		createColorThemeSelector(selectedValue) {
			return {
				type: 'listbox',
				name: 'colorTheme',
				label: 'Colour theme',
				value: selectedValue || '',
				classes: 'color-theme-field',
				values: [
					{ text: 'Inherit', value: '', classes: 'color-theme-field__swatch color-theme-field__swatch--inherit' },
					...Object.keys(doublee_tinymce.palette).map(colorName => ({
						text: colorName,
						value: colorName,
						classes: `color-theme-field__swatch color-theme-field__swatch--${colorName}`
					}))
				]
			};
		}

		createHAlignSelector(selectedValue) {
			let icon = 'align-start';
			if(selectedValue === 'center') {
				icon = 'align-center';
			}
			else if(selectedValue === 'end') {
				icon = 'align-end';
			}

			return {
				type: 'listbox',
				name: 'hAlign',
				label: 'Horizontal alignment',
				icon: icon,
				value: selectedValue || 'start',
				classes: 'halign-field',
				onClick: (event) => {
					this.insertHAlignIcons();
					this.updateCurrentHAlignIcon(event);
				},
				values: [
					{ text: 'Start', value: 'start', icon: 'align-start', classes: 'halign-field__option halign-field__option--start' },
					{ text: 'Middle', value: 'center', icon: 'align-center', classes: 'halign-field__option halign-field__option--center', },
					{ text: 'End', value: 'end', icon: 'align-end', classes: 'halign-field__option halign-field__option--end' }
				]
			};
		}

		// Insert SVG icon of the currently selected value into the hAlign selector button
		insertCurrentHAlignIcon(event) {
			const icon = event?.target.$el[0].querySelector('.mce-halign-field button .mce-ico');
			if(icon) {
				this.insertCustomIcon(icon);
			}
		}

		updateCurrentHAlignIcon(event) {
			const hAlignTriggerIcon = document.querySelector('.mce-halign-field button .mce-ico');
			const clickedOptionIcon = event?.target?.closest('.mce-menu-item')?.querySelector('.mce-ico');
			if(hAlignTriggerIcon && clickedOptionIcon) {
				const hAlignTrigger = hAlignTriggerIcon.parentElement;
				// Insert corresponding TinyMCE native icon element, and remove the old one
				hAlignTriggerIcon.insertAdjacentHTML('afterend', clickedOptionIcon.cloneNode().outerHTML);
				hAlignTriggerIcon.remove();

				// Remove the old SVG
				hAlignTrigger.querySelector('.mce-doublee-custom-icon')?.remove();

				// Insert the new SVG according to the newly-inserted TinyMCE icon
				this.insertCustomIcon(hAlignTrigger.querySelector('.mce-ico'));
			}
		}

		// Insert SVG icons into the hAlign selector menu
		insertHAlignIcons() {
			setTimeout(() => {
				const hAlignIcons = document.querySelectorAll('.mce-halign-field__option .mce-ico');
				const iconsAlreadyInserted = document.querySelectorAll('.mce-halign-field__option .mce-doublee-custom-icon');
				if(iconsAlreadyInserted.length > 0) {
					return;
				}

				hAlignIcons.forEach(icon => {
					this.insertCustomIcon(icon);
				});
			}, 100);
		}

		insertCustomIcon(mceIconToAttachTo) {
			let iconHtml = null;
			if(mceIconToAttachTo.classList.contains('mce-i-align-start')) {
				iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 9v6h11V9H9zM4 20h1.5V4H4v16z"/></svg>';
			}
			else if(mceIconToAttachTo.classList.contains('mce-i-align-center')) {
				iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.5 15v5H11v-5H4V9h7V4h1.5v5h7v6h-7Z"/></svg>';
			}
			else if(mceIconToAttachTo.classList.contains('mce-i-align-end')) {
				iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 15h11V9H4v6zM18.5 4v16H20V4h-1.5z"/></svg>';
			}

			if(iconHtml) {
				mceIconToAttachTo.insertAdjacentHTML('afterend', '<span class="mce-doublee-custom-icon">' + iconHtml + '</span>');
			}
		}
	}

	/* global acf */

	/** @type {{ PluginManager: import('tinymce').AddOnManager }} */
	const tinymce = window.tinymce;

	class ButtonGroupPlugin extends MiniblockPlugin {
		/**
		 * @param {import('tinymce').Editor} editor
		 * @param {string} url
		 */
		constructor(editor, url) {
			super();
			const plugin = this;

			editor.addButton('doublee_miniblocks_buttongroup', {
				title: 'Insert button group',
				image: url + '/icons/button-group.svg',
				onclick: function () {
					plugin.openModal(editor);
				}
			});

			editor.on('click', function (e) {
				// Handle clicks on existing button groups
				const buttonGroupNode = editor.dom.getParent(e.target, 'div.button-group');
				if (buttonGroupNode) {
					const links = Array.from(buttonGroupNode.getElementsByTagName('a')).map(link => ({
						url: link.getAttribute('href') || '',
						label: link.textContent || '',
						target: link.getAttribute('target') || '',
						style: link.getAttribute('data-style') || ''
					}));
					const data = {
						links: links,
						colorTheme: buttonGroupNode.getAttribute('data-color-theme') || '',
						hAlign: buttonGroupNode.getAttribute('data-halign') || ''
					};
					plugin.openModal(editor, data, buttonGroupNode);
				}
			});

			editor.on('BeforeSetContent', function (e) {
				// Ensure button groups stay non-editable
				e.content = e.content.replace(
					/<div class="button-group" role="group" /g,
					'<div class="button-group" role="group" contenteditable="false"'
				);
			});
		}

		openModal(editor, existingData = {}, existingNode = null) {

			const plugin = this;
			const data = existingData || { links: [], colorTheme: '', hAlign: '' };

			this.getRepeaterFieldHtml().then((response) => {
				if (!response.success || !response?.data?.form_html || !response?.data?.acf_button_group_repeater_key) {
					console.error('AJAX response error:', response);
					throw new Error('Invalid or incomplete response from server when fetching button group form');
				}

				editor.windowManager.open({
					title: existingNode ? 'Edit Button Group' : 'Insert Button Group',
					body: [
						{
							type: 'container',
							label: 'Links',
							html: '<div id="button-group-form-container"></div>'
						},
						plugin.createColorThemeSelector(data.colorTheme),
						plugin.createHAlignSelector(data.hAlign)
					],
					onOpen: function (event) {
						plugin.insertCurrentHAlignIcon(event);
					},
					onSubmit: function (event) {
						const links = plugin.processRepeaterRows(response.data.acf_button_group_repeater_key);
						const colorTheme = event.data.colorTheme || '';
						const hAlign = event.data.hAlign || '';
						const htmlString = plugin.generateHtmlToInsert(links, colorTheme, hAlign);

						if (existingNode) {
							editor.dom.setOuterHTML(existingNode, htmlString);
						}
						else {
							editor.insertContent(htmlString + '<p></p>');
						}
					},
					onClose: function () {
					}
				}, {});

				// Initialise ACF fields that were added to the modal as plain HTML
				// Note: This needs to be done after the modal opens so that the element is in the DOM
				const container = editor.$.find('#button-group-form-container')[0];
				if (container) {
					container.innerHTML = response.data.form_html;
					acf.doAction('ready', jQuery(container));
				}
				else {
					throw new Error('Failed to find container for button group form fields in modal');
				}

				// Pre-fill existing data into the ACF fields
				if (existingNode) {
					plugin.prepopulateRepeaterRows(response.data.acf_button_group_repeater_key, data);
				}
			}).catch((error) => {
				console.error(error);
				editor.windowManager.close();
				editor.windowManager.alert('There was an error when loading the form for a button group.', null);
			});
		}

		getRepeaterFieldHtml() {
			return jQuery.ajax({
				url: doublee_tinymce.ajaxUrl,
				type: 'POST',
				data: {
					headers: {
						'Content-Type': 'application/json',
						'X-Requested-With': 'XMLHttpRequest'
					},
					// This action name must match the PHP action hook, without the wp_ajax_ prefix
					action: 'get_button_group_modal_content',
					nonce: doublee_tinymce.nonce,
					body: JSON.stringify(doublee_tinymce.context)
				},
				success: function (response) {
					if (response.data.html) {
						return response.data.html;
					}
					else {
						return '<div>Failed to load form fields.</div>';
					}
				},
				error: function (error) {
					console.error(error);

					return '<div>Failed to load form fields.</div>';
				}
			});
		}

		prepopulateRepeaterRows(field_key, data) {
			if (!data.links || data.links.length === 0) {
				return;
			}

			const repeaterField = acf.getField(field_key);
			if (!repeaterField) {
				console.error(`Repeater field with key ${field_key} not found.`);

				return;
			}

			// Remove existing empty rows first (caused by the min rows setting)
			repeaterField.$rows().each(function () {
				repeaterField.remove(jQuery(this));
			});

			let index = 0;

			const populateRow = function ($row) {
				const item = data.links[index];
				const linkField = acf.getField($row.find('[data-name="link"]'));
				const styleField = acf.getField($row.find('[data-name="style"]'));

				if (linkField) {
					linkField.val({
						url: item.url || '',
						title: item.label || '',
						target: item.target || ''
					});
				}
				if (styleField) {
					styleField.val(item.style ? (item.style === 'default' ? '' : `is${item.style.charAt(0).toUpperCase() + item.style.slice(1)}`) : '');
				}

				index++;
			};

			// Listen for rows being appended
			acf.addAction('append', populateRow);

			// Now add all the rows to trigger the listener and hence the populate function
			data.links.forEach(function () {
				repeaterField.add();
			});

			// Remove the listener when done
			acf.removeAction('append', populateRow);
		}

		processRepeaterRows(field_key) {
			const repeaterField = acf.getField(field_key);
			if (!repeaterField) {
				console.error(`Repeater field with key ${field_key} not found.`);

				return [];
			}

			return repeaterField.$rows().map(function () {
				const $row = jQuery(this);
				const rowFields = acf.getFields({ parent: $row });

				const linkField = rowFields.find(field => field.get('name') === 'link');
				const styleField = rowFields.find(field => field.get('name') === 'style');

				return {
					url: linkField ? linkField.val().url : '',
					label: linkField ? linkField.val().title : '',
					target: linkField ? linkField.val().target : '',
					style: styleField ? (styleField.val().startsWith('is') ? styleField.val().slice(2).toLowerCase() : styleField.val().toLowerCase()) : ''
				};
			}).get();
		}

		// TODO: Could maybe do this as an AJAX call to use Comet Button to generate HTML if available
		generateHtmlToInsert(links, colorTheme, hAlign) {
			let html = document.createElement('div');
			html.className = 'button-group';
			html.setAttribute('contenteditable', 'false');
			html.setAttribute('role', 'group');
			if (colorTheme) {
				html.setAttribute('data-color-theme', colorTheme);
			}
			if (hAlign) {
				html.setAttribute('data-halign', hAlign);
			}
			links.forEach(item => {
				const link = document.createElement('a');
				link.className = 'button';
				link.setAttribute('href', item.url);
				link.textContent = item?.label ?? 'Untitled link';
				if (link.target) {
					link.setAttribute('target', item.target);
				}
				if (item.style && item.style !== 'default') {
					link.setAttribute('data-style', item.style);
				}
				html.appendChild(link);
			});

			return html.outerHTML;
		}
	}

	tinymce.PluginManager.add('doublee_miniblocks_buttongroup', function (editor, url) {
		new ButtonGroupPlugin(editor, url);
	});

})();
//# sourceMappingURL=buttongroup.dist.js.map
