function openJSONFile() {
    let file = dialog.showOpenDialogSync({
        title: 'Select JSON file',
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (file != undefined) {
        file = file[0];
        try {
            let filedata = fs.readFileSync(file, 'utf-8');
            window.nexusData = JSON.parse(filedata);
            setWorkspaceForm(window.nexusData);
            $('#file-main-title').text(file);
        } catch (e) {
            dialog.showErrorBox('File opening error', 'Unable to open file.');
        }
    }
}
function saveJSONFile() {
    let file = dialog.showSaveDialogSync({
        title: 'Select JSON file',
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
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
