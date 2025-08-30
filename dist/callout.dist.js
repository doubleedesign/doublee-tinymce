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
	}

	/** @type {{ PluginManager: import('tinymce').AddOnManager }} */
	const tinymce = window.tinymce;

	tinymce.PluginManager.add('doublee_miniblocks_callout', function (editor, url) {
		new CalloutPlugin(editor, url);
	});

	class CalloutPlugin extends MiniblockPlugin {
		/** @param {import('tinymce').Editor} editor */
		constructor(editor, url) {
			super();
			const plugin = this;

			editor.addButton('doublee_miniblocks_callout', {
				title: 'Insert callout or alert message',
				image: url + '/icons/callout.svg',
				onclick: function () {
					plugin.openModal(editor);
				}
			});

			editor.on('click', function (e) {
				// Handle clicks on existing callouts
				/** @var {HTMLElement} */
				const callout = editor.dom.getParent(e.target, 'div.callout');
				if (callout) {
					const data = {
						content: decodeURIComponent(callout.getAttribute('data-content') || ''),
						colorTheme: callout.getAttribute('data-color-theme') || ''
					};
					plugin.openModal(editor, data, callout);
				}
			});

			editor.on('BeforeSetContent', function (e) {
				// Ensure callouts stay non-editable when content is loaded
				e.content = e.content.replace(
					/<div class="callout"/g,
					'<div class="callout" contenteditable="false"'
				);
			});
		}

		openModal(editor, existingData, existingNode) {
			const data = existingData || { content: '', colorTheme: '' };

			editor.windowManager.open({
				title: existingNode ? 'Edit callout' : 'Insert callout',
				body: [
					{
						type: 'textbox',
						name: 'content',
						label: 'Content',
						value: data.content,
						multiline: true,
						minHeight: 100,
					},
					this.createColorThemeSelector(data.colorTheme)
				],
				onsubmit: function (e) {
					const content = e.data.content.trim();
					if (content === '') {
						return;
					}
					const encodedContent = encodeURIComponent(content);
					const colorTheme = e.data.colorTheme || '';
					const calloutHtml = `
					<div class="callout" 
						data-content="${encodedContent}" 
						data-color-theme="${colorTheme}" 
						contenteditable="false">
						<p>${content}</p>
					</div>
				`;
					if (existingNode) {
						existingNode.outerHTML = calloutHtml;
					}
					else {
						editor.insertContent(calloutHtml);
					}
				}
			});
		}
	}

})();
//# sourceMappingURL=callout.dist.js.map
