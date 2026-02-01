(function () {
	'use strict';

	/* global doublee_tinymce */

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

	/* global doublee_tinymce */

	/** @type {{ PluginManager: import('tinymce').AddOnManager }} */
	const tinymce = window.tinymce;

	tinymce.PluginManager.add('doublee_miniblocks_pullquote', function (editor, url) {
		new PullquotePlugin(editor, url);
	});

	class PullquotePlugin extends MiniblockPlugin {
		/** @param {import('tinymce').Editor} editor */
		constructor(editor, url) {
			super();
			const plugin = this;

			editor.addButton('doublee_miniblocks_pullquote', {
				title: 'Insert pullquote with citation',
				image: url + '/icons/pullquote.svg',
				onclick: function () {
					plugin.openModal(editor);
				}
			});

			editor.on('click', function (e) {
				// Handle clicks on existing pullquotes
				/** @var {HTMLElement} */
				const pullquote = editor.dom.getParent(e.target, 'blockquote.pullquote');
				if (pullquote) {
					const data = {
						quote: decodeURIComponent(pullquote.getAttribute('data-quote') || ''),
						citation: decodeURIComponent(pullquote.getAttribute('data-citation') || ''),
						colorTheme: pullquote.getAttribute('data-color-theme') || ''
					};
					plugin.openModal(editor, data, pullquote);
				}
			});

			editor.on('BeforeSetContent', function (e) {
				// Prevent cursor from entering the blockquote and ensure they stay non-editable when content is loaded
				e.content = e.content.replace(
					/<blockquote class="pullquote"/g,
					'<blockquote class="pullquote" contenteditable="false"'
				);
			});
		}

		openModal(editor, existingData, existingNode) {
			const defaults = doublee_tinymce?.defaults?.['pullquote'] || {};

			const data = {
				quote: existingData?.quote ?? defaults?.quote ?? '',
				citation: existingData?.citation ?? defaults?.citation ?? '',
				colorTheme: existingData?.colorTheme ?? defaults?.colorTheme ?? ''
			};

			editor.windowManager.open({
				title: existingNode ? 'Edit pullquote' : 'Insert pullquote',
				body: [
					{
						type: 'textbox',
						name: 'quote',
						label: 'Quote',
						value: data.quote,
						multiline: true,
						minHeight: 100,
					},
					{
						type: 'textbox',
						name: 'citation',
						label: 'Citation',
						value: data.citation,
						multiline: false,
					},
					this.createColorThemeSelector(data.colorTheme)
				],
				onsubmit: function (e) {
					const citation = e.data.citation ? e.data.citation.trim() : '';

					const html = `
					<blockquote class="pullquote" 
								contenteditable="false" 
								${e.data.colorTheme ? `data-color-theme="${e.data.colorTheme}"` : ''}
								data-quote="${encodeURIComponent(e.data.quote)}"
								${citation ? `data-citation="${encodeURIComponent(citation)}"` : ''}
						>
	                    <p>${e.data.quote}</p>
	                    ${citation ? `<cite>${citation}</cite>` : ''}
               		</blockquote>
				`;

					if (existingNode) {
						editor.dom.setOuterHTML(existingNode, html);
					}
					else {
						editor.insertContent(html + '<p></p>');
					}
				}
			}, {});
		}
	}

})();
//# sourceMappingURL=pullquote.dist.js.map
