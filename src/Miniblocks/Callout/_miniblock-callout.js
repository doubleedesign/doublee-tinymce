/* global doublee_tinymce */
import { MiniblockPlugin } from '../_miniblock-plugin';

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
		const plugin = this;
		const defaults = doublee_tinymce?.defaults?.['callout'] || {};

		const data = {
			content: existingData?.content ?? defaults?.content ?? '',
			colorTheme: existingData?.colorTheme ?? defaults?.colorTheme ?? ''
		}

		editor.windowManager.open({
			title: existingNode ? 'Edit callout' : 'Insert callout',
			classes: 'doublee-miniblock-modal',
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
			onOpen: function (event) {
				plugin.displayCurrentColorThemeSwatch(event);
			},
			onSubmit: function (e) {
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
		}, {});
	}
}

