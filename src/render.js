const { dialog, Menu } = require('electron').remote;
const fs = require('fs');
const { electron } = require('process');

window.nexusData = {
	TAXA_TITLE: 'TITLE None',
	TAXA_DIMENSIONS: 'DIMENSIONS NTAX=0',
	TAXLABELS: [],
	CHARACTERS_TITLE: "TITLE 'none'",
	CHARACTERS_DIMENSIONS: 'DIMENSIONS NCHAR=0',
	FEATURES_NAMES: [],
	FEATURES_OPT: [],
	MATRIX: [],
	TREE_TITLE: '',
	LINK_TAXA: '',
	TREE_NAME: '',
	TREE: '',
	SYMBOLS: '',
	TAIL: ''
};

function setWorkspaceForm() {
	$('#workspace').empty();
	let nexusData = window.nexusData;
	// create table header row
	$('#workspace').append(`
            <tr class="spec-header-row">
                <th class="spec-input-header">Species</th>
            </tr>
        `);
	// get element from DOM for multiple usaes
	let header_row = $('.spec-header-row');
	// for all features create column header
	for (const name of nexusData.FEATURES_NAMES) {
		header_row.append(`<th>
			<input class="spec-header" typ='text' value='${name}' spellcheck='false'>
		</th>`);
	}
	let radioIndex = 0;
	let rowIndex = 0;
	// create table row for each species
	for (const k in nexusData.TAXLABELS) {
		let form = '';
		for (let j in nexusData.FEATURES_NAMES) {
			form += `<td><div class="spec-radio-col">`;
			let hasCheck = false;
			for (let i = 0; i < nexusData.FEATURES_OPT[j].length; i++) {
				let checked = '';
				if (i == nexusData.MATRIX[k][j]) {
					checked = 'checked';
					hasCheck = true;
				}
				form += `
                    <input type="radio" name="R${radioIndex}A" ${checked}>
                    <label>${nexusData.FEATURES_OPT[j][i]}</label>`;
			}
			let checked = '';
			if (!hasCheck) {
				checked = 'checked';
			}
			form += `
                <input type="radio" name="R${radioIndex}A" id="unknown" ${checked}>
                <label>?</label>`;
			form += `</div></td>`;
			radioIndex++;
		}
		$('#workspace').append(`
            <tr class="spec-row" id="Row${rowIndex}">
                <td>
                    <input type="text" value="${nexusData.TAXLABELS[k]}" class="spec-input" spellcheck="false">
                </td>
				${form}
			</tr>`);
		rowIndex++;
	}
	$('#workspace').append(`
	<tr>
		<td class="add-species">
			<div></div><div></div>
		</td>
	</tr>`);
	$('td').on('mouseenter', function () {
		var $currentTable = $(this).closest('table');
		var index = $(this).index();
		$currentTable.find('td').removeClass('light-column');
		$currentTable.find('tr').each(function () {
			$(this).find('td').eq(index).addClass('light-column');
		});
	});
	$('#TAXA_TITLE').val(nexusData.TAXA_TITLE);
	$('#TAXA_DIMENSIONS').val(nexusData.TAXA_DIMENSIONS);
	$('#CHARACTERS_TITLE').val(nexusData.CHARACTERS_TITLE);
	$('#CHARACTERS_DIMENSIONS').val(nexusData.CHARACTERS_DIMENSIONS);
	$('#TREE_TITLE').val(nexusData.TREE_TITLE);
	$('#LINK_TAXA').val(nexusData.LINK_TAXA);
	$('#TREE_NAME').val(nexusData.TREE_NAME);
	$('#TREE').val(nexusData.TREE);
}
function getWorkspaceFormData() {
	let nexusData = {
		TAXA_TITLE: 'TITLE None',
		TAXA_DIMENSIONS: 'DIMENSIONS NTAX=0',
		TAXLABELS: [],
		CHARACTERS_TITLE: "TITLE 'none'",
		CHARACTERS_DIMENSIONS: 'DIMENSIONS NCHAR=0',
		FEATURES_NAMES: [],
		FEATURES_OPT: [],
		MATRIX: [],
		TREE_TITLE: '',
		LINK_TAXA: '',
		TREE_NAME: '',
		TREE: '',
		SYMBOLS: '',
		TAIL: window.nexusData.TAIL
	};
	nexusData.TAXA_TITLE = $('#TAXA_TITLE').val();
	nexusData.TAXA_DIMENSIONS = $('#TAXA_DIMENSIONS').val();
	nexusData.CHARACTERS_TITLE = $('#CHARACTERS_TITLE').val();
	nexusData.CHARACTERS_DIMENSIONS = $('#CHARACTERS_DIMENSIONS').val();
	nexusData.TREE_TITLE = $('#TREE_TITLE').val();
	nexusData.LINK_TAXA = $('#LINK_TAXA').val();
	nexusData.TREE_NAME = $('#TREE_NAME').val();
	nexusData.TREE = $('#TREE').val();
	$('.spec-input').each(function () {
		nexusData.TAXLABELS.push($(this).val().replace(/\s/, '_'));
	});
	$('.spec-header').each(function () {
		nexusData.FEATURES_NAMES.push($(this).val().replace(/\s/, '_'));
	});
	$('#Row0')
		.find('.spec-radio-col')
		.each(function () {
			let options = [];
			$(this)
				.find('label')
				.each(function () {
					options.push($(this).text());
				});
			options = options.slice(0, options.length - 1); // remove '?'
			nexusData.FEATURES_OPT.push(options);
		});
	if (window.nexusData.SYMBOLS == '') {
		for (let i = 0; i < nexusData.FEATURES_OPT.length; i) nexusData.SYMBOLS += i;
		nexusData.SYMBOLS += '?';
	} else {
		nexusData.SYMBOLS = window.nexusData.SYMBOLS;
	}
	$('.spec-row').each(function () {
		let options = [];
		let row_index = 0;
		$(this)
			.find('.spec-radio-col')
			.each(function () {
				let opt_index = 0;
				$(this)
					.find('input')
					.each(function () {
						if ($(this).is(':checked')) {
							options.push(nexusData.SYMBOLS[opt_index]);
						}
						opt_index++;
					});
			});
		row_index++;
		nexusData.MATRIX.push(options.join(''));
	});
	return nexusData;
}
function parseNexusFile(sourceString) {
	let nexusData = {
		TAXA_TITLE: 'TITLE None',
		TAXA_DIMENSIONS: 'DIMENSIONS NTAX=0',
		TAXLABELS: [],
		CHARACTERS_TITLE: "TITLE 'none'",
		CHARACTERS_DIMENSIONS: 'DIMENSIONS NCHAR=0',
		FEATURES_NAMES: [],
		FEATURES_OPT: [],
		MATRIX: [],
		TREE_TITLE: '',
		LINK_TAXA: '',
		TREE_NAME: '',
		TREE: '',
		SYMBOLS: '',
		TAIL: ''
	};
	let start_index = 0;
	let end_index = 0;

	// if specific part of file exists, parse it
	if (sourceString.search(/BEGIN\s+TAXA/) != -1) {
		// parse constrants of TAXA const: TITLE
		start_index = sourceString.search(/TITLE/i);
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/;/);
		start_index = sourceString.search(/\s/);
		nexusData.TAXA_TITLE = sourceString.substr(start_index, end_index - start_index).trim();

		// parse constrants of TAXA const: DIMENSIONS
		start_index = sourceString.search(/DIMENSIONS/i);
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/;/);
		start_index = sourceString.search(/\s+.*?;/);
		nexusData.TAXA_DIMENSIONS = sourceString.substr(start_index, end_index - start_index).trim();

		// parse file data labels section (TAXLABELS)
		sourceString = sourceString.substr(sourceString.search(/TAXLABELS/i));
		start_index = sourceString.search(/[ \n]/);
		end_index = sourceString.search(/;/);
		nexusData.TAXLABELS = sourceString
			.substr(start_index, end_index - start_index)
			.trim()
			.split(' ');
	}
	// if specific part of file exists, parse it
	if (sourceString.search(/BEGIN\s+CHARACTERS/) != -1) {
		// parse constrants of CHARACTERS const: TITLE
		start_index = sourceString.search(/TITLE/i);
		// truncate beginning of file
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/;/);
		start_index = sourceString.search(/\s/);
		nexusData.CHARACTERS_TITLE = sourceString.substr(start_index, end_index - start_index).trim();

		// parse constrants of CHARACTERS section: DIMENSIONS
		start_index = sourceString.search(/DIMENSIONS/i);
		// truncate beginning of source
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/;/);
		start_index = sourceString.search(/\s+.*?;/);
		nexusData.CHARACTERS_DIMENSIONS = sourceString.substr(start_index, end_index - start_index).trim();

		// truncate constants
		sourceString = sourceString.substr(sourceString.search(/SYMBOLS/i));
		// get accepted symbols
		start_index = sourceString.search(/"/);
		end_index = sourceString.search(/;/);
		nexusData.SYMBOLS = sourceString.substr(start_index, end_index - start_index).replace(/^"|"$|\s/g, '') + '?';

		// truncate symbols
		sourceString = sourceString.substr(sourceString.search(/CHARSTATELABELS/i));
		// parse features
		start_index = sourceString.search(/\d/);
		end_index = sourceString.search(/;/);
		let featuresBuffer = sourceString
			.substr(start_index, end_index - start_index)
			.trim()
			.split(',');
		// spit and place features in filedata object
		for (let f of featuresBuffer) {
			f = f.split(/\d/)[1].split('/');
			nexusData.FEATURES_NAMES.push(f[0].trim());
			nexusData.FEATURES_OPT.push(f[1].trim().split(/\s+/));
		}

		// truncate source to MATRIX keyword
		sourceString = sourceString.substr(sourceString.search(/MATRIX/i));
		nexusData.MATRIX = sourceString
			.substr(sourceString.search(/[\n]/), sourceString.search(/;/))
			.trim()
			.split(/\n/);
		let matrixLength = Math.min(nexusData.MATRIX.length, nexusData.TAXLABELS.length);
		// matrix lines analize
		nexusData.MATRIX = nexusData.MATRIX.slice(0, matrixLength);
		for (let i = 0; i < matrixLength; i++) {
			nexusData.MATRIX[i] = nexusData.MATRIX[i].replace(/^\s+/, '').split(/\s+/);
			// each line have to end up as list of two subscriptable values
			if (nexusData.MATRIX[i].length > 1) {
				nexusData.MATRIX[i] = nexusData.MATRIX[i]
					.slice(1)
					.join('')
					.padEnd(nexusData.FEATURES_NAMES.length, '?');
			}
		}
	}
	if (sourceString.search(/BEGIN\s+TREES/) != -1) {
		// parse constrants of TREES const: TITLE
		start_index = sourceString.search(/TITLE/i);
		// truncate beginning of file
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/;/);
		start_index = sourceString.search(/\s/);
		nexusData.TREE_TITLE = sourceString.substr(start_index, end_index - start_index).trim();

		// parse constrants of TREES section: LINK
		start_index = sourceString.search(/LINK/i);
		// truncate beginning of source
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/;/);
		start_index = sourceString.search(/\s/);
		nexusData.LINK_TAXA = sourceString.substr(start_index, end_index - start_index).trim();

		// parse constrants of TREES section: TREE_NAME
		start_index = sourceString.search(/TREE/i);
		// truncate beginning of source
		sourceString = sourceString.substr(start_index);
		end_index = sourceString.search(/=/);
		nexusData.TREE_NAME = sourceString
			.substr(0, end_index)
			.replace(/TREE|=/, '')
			.trim();

		// parse constrants of TREES section: TREE
		start_index = sourceString.search(/=/);
		// truncate beginning of source
		end_index = sourceString.search(/;/);
		nexusData.TREE = sourceString
			.substr(start_index, end_index - start_index)
			.replace(/=/, '')
			.trim();
		sourceString = sourceString.substr(sourceString.search(/END;/)).replace(/END;/, '');
	}
	nexusData.TAIL = sourceString;
	window.nexusData = nexusData;
	setWorkspaceForm();
}
function openNexusFile() {
	let file = dialog.showOpenDialogSync({ title: 'Select Nexus file', properties: ['openFile'] });
	if (file != undefined) {
		file = file[0];
		try {
			let filedata = fs.readFileSync(file, 'utf-8');
			$('#file-main-title').text(file);
			parseNexusFile(filedata);
		} catch (e) {
			dialog.showErrorBox('File opening error', 'Unable to open file.');
		}
	}
}
function openJSONFile() {
	let file = dialog.showOpenDialogSync({
		title: 'Select JSON file',
		properties: ['openFile'],
		filters: [{ name: '*', extensions: ['json'] }]
	});
	if (file != undefined) {
		file = file[0];
		try {
			let filedata = fs.readFileSync(file, 'utf-8');
			window.nexusData = JSON.parse(filedata);
			setWorkspaceForm();
			$('#file-main-title').text(file);
		} catch (e) {
			dialog.showErrorBox('File opening error', 'Unable to open file.');
		}
	}
}
function createNexusStructure() {
	let nexusData = getWorkspaceFormData();
	let TAXA_SECTION = `
BEGIN TAXA;
    TITLE ${nexusData.TAXA_TITLE};
    DIMENSIONS ${nexusData.TAXA_DIMENSIONS};
    TAXLABELS
${nexusData.TAXLABELS.join(' ')}
    ;
END;
`;
	let symbols = [];
	for (const s of nexusData.SYMBOLS) {
		symbols.push(s);
	}
	let features = [];
	for (let i = 0; i < nexusData.FEATURES_NAMES.length; i++) {
		features.push(`        ${i + 1} ${nexusData.FEATURES_NAMES[i]} / ${nexusData.FEATURES_OPT[i].join(' ')}`);
	}
	let max_length = 0;
	for (let lbl of nexusData.TAXLABELS) {
		if (max_length < lbl.length) {
			max_length = lbl.length;
		}
	}
	let matrix = [];
	for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
		matrix.push(`    ${nexusData.TAXLABELS[i].padEnd(max_length + 4, ' ')} ${nexusData.MATRIX[i]} `);
	}
	let CHARACTERS_SECTION = `
BEGIN CHARACTERS;
    TITLE ${nexusData.CHARACTERS_TITLE};
    DIMENSIONS ${nexusData.CHARACTERS_DIMENSIONS};
    FORMAT DATATYPE = STANDARD GAP = - MISSING = ? SYMBOLS = "  ${symbols.join(' ')}";
	CHARSTATELABELS
${features.join(',\n')};
    MATRIX
${matrix.join('\n')}
        ;
END;
`;
	let translate = [];
	for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
		translate.push(`        ${i + 1} ${nexusData.TAXLABELS[i]},`);
	}
	let TREES_SECTION = `
BEGIN TREES;
    Title ${nexusData.TREE_TITLE};
    LINK ${nexusData.LINK_TAXA};
    TRANSLATE
${translate.join('\n')}
        ;
    TREE ${nexusData.TREE_NAME} = ${nexusData.TREE};
END;
`;
	return `#NEXUS\n\n` + TAXA_SECTION + CHARACTERS_SECTION + TREES_SECTION + nexusData.TAIL;
}
function saveNexusFile() {
	let file = dialog.showSaveDialogSync({ title: 'Select Nexus file', properties: ['openFile'] });
	if (file != undefined) {
		try {
			fs.writeFileSync(file, createNexusStructure(), 'utf-8');
			$('#file-main-title').text(file);
		} catch (e) {
			dialog.showErrorBox('File saving error', 'Unable to save file.');
		}
	}
}
function saveJSONFile() {
	let file = dialog.showSaveDialogSync({
		title: 'Select JSON file',
		properties: ['openFile'],
		filters: [{ name: '*', extensions: ['json'] }]
	});
	if (file != undefined) {
		try {
			fs.writeFileSync(file, JSON.stringify(getWorkspaceFormData()), 'utf-8');
			$('#file-main-title').text(file);
		} catch (e) {
			dialog.showErrorBox('File saving error', 'Unable to save file.');
		}
	}
}
function toggleFileProperties() {
	let $menu = $('#file-menu');
	if ($menu.is(':visible')) {
		$menu.hide();
	} else {
		$menu.show();
	}
}
$('#openNexusFile').on('click', openNexusFile);
$('#saveNexusFile').on('click', saveNexusFile);
$('#openJSONFile').on('click', openJSONFile);
$('#saveJSONFile').on('click', saveJSONFile);
$('.file-menu-grab').on('click', toggleFileProperties);
const template = [
	{
		label: 'Nexus file',
		submenu: [
			{
				label: 'Open file',
				click: openNexusFile
			},
			{
				label: 'Save file',
				click: saveNexusFile
			}
		]
	},
	{
		label: 'JSON file',
		submenu: [
			{
				label: 'Open file',
				click: openJSONFile
			},
			{
				label: 'Save file',
				click: saveJSONFile
			}
		]
	},
	{
		label: 'Properties',
		click: toggleFileProperties
	},
	{
		label: 'Author',
		click: () => electron.shell.openExternal('https://github.com/Argmaster')
	}
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
