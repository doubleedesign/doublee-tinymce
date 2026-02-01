/* global doublee_tinymce */

export class MiniblockPlugin {
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
			onClick: this.updateCurrentThemeSwatch.bind(this),
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

	displayCurrentColorThemeSwatch(event) {
		const colorThemeTrigger = event?.target.$el[0].querySelector('.mce-color-theme-field');
		const colorThemeLabel = event?.target.$el[0].querySelector('.mce-color-theme-field .mce-txt')?.textContent;
		if(colorThemeTrigger && colorThemeLabel) {
			colorThemeTrigger.insertAdjacentHTML('afterbegin', `<span class="mce-color-theme-field__swatch mce-color-theme-field__swatch--${colorThemeLabel.toLowerCase()}"></span>`);
		}
	}

	updateCurrentThemeSwatch(event) {
		const colorThemeTrigger = document.querySelector('.mce-color-theme-field');
		const clickedOption = event?.target?.closest('.mce-menu-item');
		const clickedOptionLabel = clickedOption?.innerText?.trim();
		if(colorThemeTrigger && clickedOptionLabel) {
			// Remove the old swatch
			const oldSwatch = colorThemeTrigger.querySelector('.mce-color-theme-field__swatch');
			if(oldSwatch) {
				oldSwatch.remove();
			}

			// Insert the new swatch according to the newly-selected option
			colorThemeTrigger.insertAdjacentHTML('afterbegin', `<span class="mce-color-theme-field__swatch mce-color-theme-field__swatch--${clickedOptionLabel.toLowerCase()}"></span>`);
		}
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
