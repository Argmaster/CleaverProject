function createNexusStructure() {
    let nexusData = getWorkspaceFormData();
    let date = Date();
    let TAXA_SECTION = `
BEGIN TAXA;
    TITLE ${nexusData.TAXA_TITLE};
    DIMENSIONS ${nexusData.TAXA_DIMENSIONS};
    TAXLABELS
        ${nexusData.TAXLABELS.join("\n        ")}
    ;
END;
`;
    let symbols = [];
    for (const s of nexusData.SYMBOLS.replace("?", "")) {
        symbols.push(s);
    }
    let features = [];
    for (let i = 0; i < nexusData.FEATURES_NAMES.length; i++) {
        features.push(
            `        ${i + 1} ${
                nexusData.FEATURES_NAMES[i]
            } / ${nexusData.FEATURES_OPT[i].join(" ")}`
        );
    }
    let max_length = 0;
    for (let lbl of nexusData.TAXLABELS) {
        if (max_length < lbl.length) {
            max_length = lbl.length;
        }
    }
    let matrix = [];
    for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
        matrix.push(
            `    ${nexusData.TAXLABELS[i].padEnd(max_length + 4, " ")} ${
                nexusData.MATRIX[i]
            } `
        );
    }
    let CHARACTERS_SECTION = `
BEGIN CHARACTERS;
    TITLE ${nexusData.CHARACTERS_TITLE};
    DIMENSIONS ${nexusData.CHARACTERS_DIMENSIONS};
    FORMAT DATATYPE = STANDARD GAP = - MISSING = ? SYMBOLS = "  ${symbols.join(
        " "
    )}";
	CHARSTATELABELS
${features.join(",\n")};
    MATRIX
${matrix.join("\n")}
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
${translate.join("\n")}
        ;
    TREE ${nexusData.TREE_NAME} = ${nexusData.TREE};
END;
`;
    return (
        `#NEXUS\n[${date}]\n` +
        TAXA_SECTION +
        CHARACTERS_SECTION +
        TREES_SECTION +
        nexusData.TAIL
    );
}
function openNexusFile() {
    let file = dialog.showOpenDialogSync({
        title: "Select Nexus file",
        properties: ["openFile"],
        filters: [{ name: "NEXUS", extensions: ["nex", "nxs", "txt"] }],
    });
    if (file != undefined) {
        file = file[0];
        try {
            let filedata = fs.readFileSync(file, "utf-8");
            $("#file-main-title").text(file);
            window.nexusData = parseNexusFile(filedata);
            setWorkspaceForm(window.nexusData);
            renderTree();
        } catch (e) {
            dialog.showErrorBox("File opening error", "Unable to open file.");
        }
    }
}
function saveNexusFile() {
    let file = dialog.showSaveDialogSync({
        title: "Select Nexus file",
        properties: ["openFile"],
        filters: [{ name: "NEXUS", extensions: ["nex", "nxs", "txt"] }],
    });
    if (file != undefined) {
        try {
            fs.writeFileSync(file, createNexusStructure(), "utf-8");
            $("#file-main-title").text(file);
        } catch (e) {
            dialog.showErrorBox("File saving error", "Unable to save file.");
        }
    }
}
