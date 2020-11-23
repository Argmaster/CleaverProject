function toIndexedTree(nexusData) {
    let tree = nexusData.TREE.replace(/\s+/, '');
    for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
        tree = tree.replace(RegExp(`${nexusData.TAXLABELS[i]}`), `${i + 1}`);
    }
    return tree;
}
function toNamedTree(nexusData) {
    let tree = nexusData.TREE.replace(/\s+/g, '');
    for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
        tree = tree.replace(RegExp(`(?<=[,(])${i + 1}(?=[,)])`), nexusData.TAXLABELS[i]);
    }
    return tree;
}

function renderTree(nexusData) {
    let $treeSpace = $('#tree-div');
    let treeData = nexusData.TREE.replace('(', '[').replace(')', ']');
}
