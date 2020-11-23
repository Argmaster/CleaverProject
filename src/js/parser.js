function getDefaultNexusData() {
    return {
        TAXA_TITLE: 'None',
        TAXA_DIMENSIONS: 'NTAX=0',
        TAXLABELS: [],
        CHARACTERS_TITLE: "'none'",
        CHARACTERS_DIMENSIONS: 'NCHAR=0',
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
}

function parseTaxaSection(sourceString, nexusData, beginIndex) {
    // truncate begining of string that do not contain
    // desired data to avoid regexes to match too improper
    // apperances of regex
    let taxaString = sourceString.substr(beginIndex);
    // parse constrants of TAXA const: TITLE
    let start_index = taxaString.search(/TITLE/i);
    taxaString = taxaString.substr(start_index);
    let end_index = taxaString.search(/;/);
    start_index = taxaString.search(/\s/);
    nexusData.TAXA_TITLE = taxaString.substr(start_index, end_index - start_index).trim();

    // parse constrants of TAXA const: DIMENSIONS
    start_index = taxaString.search(/DIMENSIONS/i);
    taxaString = taxaString.substr(start_index);
    end_index = taxaString.search(/;/);
    start_index = taxaString.search(/\s+.*?;/);
    nexusData.TAXA_DIMENSIONS = taxaString.substr(start_index, end_index - start_index).trim();

    // parse file data labels section (TAXLABELS)
    taxaString = taxaString.substr(taxaString.search(/TAXLABELS/i));
    start_index = taxaString.search(/[ \n]/);
    end_index = taxaString.search(/;/);
    nexusData.TAXLABELS = taxaString
        .substr(start_index, end_index - start_index)
        .trim()
        .split(' ');
}

function parseDataSection(sourceString, nexusData, beginIndex) {
    // truncate begining of string that do not contain
    // desired data to avoid regexes to match too improper
    // apperances of regex
    let dataString = sourceString.substr(beginIndex);
    // parse constrants of CHARACTERS const: TITLE
    let start_index = dataString.search(/TITLE/i);
    // truncate beginning of file
    dataString = dataString.substr(start_index);
    let end_index = dataString.search(/;/);
    start_index = dataString.search(/\s/);
    nexusData.CHARACTERS_TITLE = dataString.substr(start_index, end_index - start_index).trim();

    // parse constrants of CHARACTERS section: DIMENSIONS
    start_index = dataString.search(/DIMENSIONS/i);
    // truncate beginning of source
    dataString = dataString.substr(start_index);
    end_index = dataString.search(/;/);
    start_index = dataString.search(/\s+.*?;/);
    nexusData.CHARACTERS_DIMENSIONS = dataString.substr(start_index, end_index - start_index).trim();

    // truncate constants
    dataString = dataString.substr(dataString.search(/SYMBOLS/i));
    // get accepted symbols
    start_index = dataString.search(/"/);
    end_index = dataString.search(/;/);
    nexusData.SYMBOLS = dataString.substr(start_index, end_index - start_index).replace(/^"|"$|\s/g, '');
    if (!nexusData.SYMBOLS.includes('?')) nexusData.SYMBOLS += '?';

    // truncate symbols
    dataString = dataString.substr(dataString.search(/CHARSTATELABELS/i));
    // parse features
    start_index = dataString.search(/\d/);
    end_index = dataString.search(/;/);
    let featuresBuffer = dataString
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
    dataString = dataString.substr(dataString.search(/MATRIX/i));
    nexusData.MATRIX = dataString.substr(dataString.search(/[\n]/), dataString.search(/;/)).trim().split(/\n/);
    let matrixLength = Math.min(nexusData.MATRIX.length, nexusData.TAXLABELS.length);
    // matrix lines analize
    nexusData.MATRIX = nexusData.MATRIX.slice(0, matrixLength);
    for (let i = 0; i < matrixLength; i++) {
        nexusData.MATRIX[i] = nexusData.MATRIX[i].replace(/^\s+/, '').split(/\s+/);
        // each line have to end up as list of two subscriptable values
        if (nexusData.MATRIX[i].length > 1) {
            nexusData.MATRIX[i] = nexusData.MATRIX[i].slice(1).join('').padEnd(nexusData.FEATURES_NAMES.length, '?');
        }
    }
}

function parseTreeSection(sourceString, nexusData, beginIndex) {
    // truncate begining of string that do not contain
    // desired data to avoid regexes to match too improper
    // apperances of regex
    sourceString = sourceString.substr(beginIndex);
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

function parseNexusFile(sourceString) {
    let nexusData = getDefaultNexusData();
    // if there is BEGIN TAXA section in the file (this header exists)
    // parse its body and place values in nexusData
    let beginIndex = sourceString.search(/BEGIN\s+TAXA/);
    // before performing parsing of each individual section
    // of file, try to parse it
    if (beginIndex != -1) {
        parseTaxaSection(sourceString, nexusData, beginIndex);
    }
    beginIndex = sourceString.search(/BEGIN\s+CHARACTERS/);
    if (beginIndex != -1) {
        parseDataSection(sourceString, nexusData, beginIndex);
    }
    beginIndex = sourceString.search(/BEGIN\s+TREES/);
    if (beginIndex != -1) {
        parseTreeSection(sourceString, nexusData, beginIndex);
    }
    nexusData.TAIL = "";
    return nexusData;
}
