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
			const data = existingData || { quote: '', citation: '', colorTheme: '' };

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
