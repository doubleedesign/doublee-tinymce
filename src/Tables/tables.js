import './tinymce49-table/plugin.js';

/** @type {{ PluginManager: import('tinymce').AddOnManager }} */
const tinymce = window.tinymce;

// Handle adding default attributes to table elements
tinymce.activeEditor.on('NodeChange', function ({ element, parents }) {
	const elementsToWatch = ['TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY', 'TFOOT'];
	if (elementsToWatch.includes(element.nodeName) || parents.some(p => elementsToWatch.includes(p.nodeName))) {
		addClassToElementIfPresent([element, ...parents], 'TABLE', 'table');
		addClassToElementIfPresent([element, ...parents], 'THEAD', 'table__header');
		addClassToElementIfPresent([element, ...parents], 'TBODY', 'table__body');
		addClassToElementIfPresent([element, ...parents], 'TFOOT', 'table__footer');
	}

	// FIXME: This doesn't capture changes such as changing table row properties (adding thead, tfoot) immediately
});


// Hackily remove some unwanted settings that can't be configured away without modifying the TinyMCE plugin source code
tinymce.activeEditor.on('OpenWindow', function ({ win }) {
	if (win?.features?.title === 'Table properties') {
		removeElementByLabelText(win.$el[0], 'Height');
	}
	if (win?.features?.title === 'Row properties') {
		removeElementByLabelText(win.$el[0], 'Height');
		removeElementByLabelText(win.$el[0], 'Alignment');
	}
	if (win?.features?.title === 'Cell properties') {
		removeElementByLabelText(win.$el[0], 'Height');
		removeElementByLabelText(win.$el[0], 'H Align');
		removeElementByLabelText(win.$el[0], 'V Align');
	}
});

function addClassToElementIfPresent(nodes, element, className) {
	const targetNodes = nodes.filter(n => n.nodeName === element);
	targetNodes.forEach(n => {
		if (!n.classList.contains(className)) {
			n.classList.add(className);
		}
	});
}

function removeElementByLabelText(modal, labelText) {
	const labels = modal.querySelectorAll('label');
	labels.forEach(label => {
		if (label.textContent.trim() === labelText) {
			const parent = label.closest('.mce-formitem');
			if (parent) {
				parent.remove();
			}
		}
	});
}
