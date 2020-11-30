let radioIndex = 0;

window.nexusData = getDefaultNexusData();

function makeRadioComponents(nexusData, labelIndex) {
    let form = "";
    for (let featureIndex in nexusData.FEATURES_NAMES) {
        form += `<td><div class="species-radio-cell">`;
        let hasCheck = false;
        let checked = "";
        for (
            let optionIndex = 0;
            optionIndex < nexusData.FEATURES_OPT[featureIndex].length;
            optionIndex++
        ) {
            checked = "";
            if (optionIndex == nexusData.MATRIX[labelIndex][featureIndex]) {
                checked = "checked";
                hasCheck = true;
            }
            form += `
                    <input type="radio" name="Radio${radioIndex}" ${checked}>
                    <label>${nexusData.FEATURES_OPT[featureIndex][optionIndex]}</label>`;
        }
        if (!hasCheck) checked = "checked";
        else checked = "";
        form += `
                <input type="radio" name="Radio${radioIndex}" id="unknown" ${checked}>
                <label>?</label>
            </div></td>`;
        radioIndex++;
    }
    return form;
}
function setWorkspaceForm(nexusData) {
    let $table = $("#_T0");
    let $species = $("#_S0");
    $species.empty();
    {
        $species.append(`<tr><td class="species-title">Species</td></tr>`);
        for (let labelIndex in nexusData.TAXLABELS) {
            $species.append(`
            <tr class="species-name-row"><td>
                <input type="text" value="${nexusData.TAXLABELS[labelIndex]}" spellcheck="false">
            </td></tr>
            `);
        }
    }
    $table.empty();
    {
        // prepare table headers row for radiobuttons
        let header_row = '<tr class="species-header-row">';
        // for all features create column header
        for (const name of nexusData.FEATURES_NAMES) {
            header_row += `<th>
                <input typ='text' value='${name}' spellcheck='false'>
            </th>`;
        }
        header_row += "</tr>";
        $table.append(header_row);
    }
    let rowIndex = 0;
    // create row for each species
    for (const labelIndex in nexusData.TAXLABELS) {
        $table.append(`
            <tr class="species-radio-row">
				${makeRadioComponents(nexusData, labelIndex, rowIndex)}
			</tr>`);
        rowIndex++;
    }
    $species.append(`
		<div class="add-species" title="Not implemented yet">
			<div></div><div></div>
        </div>
    `);
    {
        // highlighting hovered column
        $("td").on("mouseenter", function () {
            var $currentTable = $(this).closest("table.hoverable");
            var index = $(this).index();
            $currentTable.find("td").removeClass("light-column");
            $currentTable.find("tr").each(function () {
                $(this).find("td").eq(index).addClass("light-column");
            });
        });
    }
    $("#TAXA_TITLE").val(nexusData.TAXA_TITLE);
    if (nexusData.TAXA_DIMENSIONS == "NTAX=?")
        dialog.showErrorBox(
            "Data not specified",
            'TAXA DIMENSIONS are set to "?" consider changing it into valid value (integer).'
        );
    $("#TAXA_DIMENSIONS").val(nexusData.TAXA_DIMENSIONS);
    $("#CHARACTERS_TITLE").val(nexusData.CHARACTERS_TITLE);
    $("#CHARACTERS_DIMENSIONS").val(nexusData.CHARACTERS_DIMENSIONS);
    if (nexusData.CHARACTERS_DIMENSIONS == "NCHAR=?")
        dialog.showErrorBox(
            "Data not specified",
            'CHARACTERS DIMENSIONS are set to "?" consider changing it into valid value (integer).'
        );
    $("#SYMBOLS").val(nexusData.SYMBOLS);
    $("#TREE_TITLE").val(nexusData.TREE_TITLE);
    $("#LINK_TAXA").val(nexusData.LINK_TAXA);
    $("#TREE_NAME").val(nexusData.TREE_NAME);
    if (nexusData.TREE.search(/[a-zA-z]/) == -1) {
        nexusData.TREE = toNamedTree(nexusData);
    }
    $("#TREE").val(nexusData.TREE);
}
function getWorkspaceFormData() {
    let nexusData = getDefaultNexusData();
    {
        // pull constrants form properties workspace
        nexusData.TAXA_TITLE = $("#TAXA_TITLE").val().trim();
        nexusData.TAXA_DIMENSIONS = $("#TAXA_DIMENSIONS").val().trim();
        nexusData.CHARACTERS_TITLE = $("#CHARACTERS_TITLE").val().trim();
        nexusData.CHARACTERS_DIMENSIONS = $("#CHARACTERS_DIMENSIONS")
            .val()
            .trim();
        nexusData.SYMBOLS = $("#SYMBOLS").val().trim();
        nexusData.TREE_TITLE = $("#TREE_TITLE").val().trim();
        nexusData.LINK_TAXA = $("#LINK_TAXA").val().trim();
        nexusData.TREE_NAME = $("#TREE_NAME").val().trim();
        nexusData.TREE = $("#TREE").val().trim();
        /*    if (window.nexusData.SYMBOLS == '') {
        for (let i = 0; i < nexusData.FEATURES_OPT.length; i) nexusData.SYMBOLS += i;
        nexusData.SYMBOLS += '?';
    } else {
        nexusData.SYMBOLS = window.nexusData.SYMBOLS;
    } */
    }
    // get names of species from species table
    $(".species-name-row input").each(function () {
        nexusData.TAXLABELS.push($(this).val().trim().replace(/\s/, "_"));
    });
    // get features names form header row of radios table
    $(".species-header-row input").each(function () {
        nexusData.FEATURES_NAMES.push($(this).val().trim().replace(/\s/, "_"));
    });
    // get list of possible values for each feature
    // based on first non-title row of table
    $(".species-radio-row")
        .first()
        .find(".species-radio-cell")
        .each(function () {
            let options = [];
            $(this)
                .find("label")
                .each(function () {
                    options.push($(this).text());
                });
            options = options.slice(0, options.length - 1); // remove '?'
            nexusData.FEATURES_OPT.push(options);
        });
    // extract selected feature values from each row of table
    // translate them into proper symbols and place into table
    // then merge table into string and place in matrix
    $(".species-radio-row").each(function () {
        let options = [];
        $(this)
            .find(".species-radio-cell")
            .each(function () {
                $(this)
                    .find("input[type=radio]")
                    .each(function (index) {
                        if ($(this).is(":checked")) {
                            options.push(nexusData.SYMBOLS[index]);
                            return false;
                        }
                    });
            });
        nexusData.MATRIX.push(options.join(""));
    });
    return nexusData;
}
