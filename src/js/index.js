const { dialog, Menu, shell } = require("electron").remote;
const fs = require("fs");

function setTreeIndexed() {
    window.nexusData.TREE = $("#TREE").val().trim();
    window.nexusData.TREE = toIndexedTree(window.nexusData);
    $("#TREE").val(window.nexusData.TREE);
}
function setTreeNamed() {
    window.nexusData.TREE = $("#TREE").val().trim();
    window.nexusData.TREE = toNamedTree(window.nexusData);
    $("#TREE").val(window.nexusData.TREE);
}
$("#TREE").on("change keyup paste", renderTree);
$("#openNexusFile").on("click", openNexusFile);
$("#saveNexusFile").on("click", saveNexusFile);
$("#openJSONFile").on("click", openJSONFile);
$("#saveJSONFile").on("click", saveJSONFile);
$(".file-menu-grab").on("click", toggleFileProperties);
$("#tRep0").on("click", setTreeNamed);
$("#tRep1").on("click", setTreeIndexed);
const template = [
    {
        label: "Nexus file",
        submenu: [
            {
                label: "Open file",
                click: openNexusFile,
            },
            {
                label: "Save file",
                click: saveNexusFile,
            },
        ],
    },
    {
        label: "JSON file",
        submenu: [
            {
                label: "Open file",
                click: openJSONFile,
            },
            {
                label: "Save file",
                click: saveJSONFile,
            },
        ],
    },
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "delete" },
            { role: "selectall" },
        ],
    },
    {
        label: "Properties",
        click: toggleFileProperties,
    },
    {
        label: "Redraw Tree",
        click: renderTree,
    },
    {
        label: "Author",
        click: () => shell.openExternal("https://github.com/Argmaster"),
    },
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
setWorkspaceForm(window.nexusData);
