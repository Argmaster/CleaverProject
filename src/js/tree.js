function toIndexedTree(nexusData) {
    let tree = nexusData.TREE.replace(/\s+/, "");
    for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
        tree = tree.replace(RegExp(`${nexusData.TAXLABELS[i]}`), `${i + 1}`);
    }
    return tree;
}
function toNamedTree(nexusData) {
    let tree = nexusData.TREE.replace(/\s+/g, "");
    for (let i = 0; i < nexusData.TAXLABELS.length; i++) {
        tree = tree.replace(
            RegExp(`(?<=[,(])${i + 1}(?=[,)])`),
            nexusData.TAXLABELS[i]
        );
    }
    return tree;
}
function renderTreeLayer(nexusData, tree) {
    let treeStgring = "";
    let mergerClass = "branch-block-merger";
    for (let branch of tree) {
        if (branch instanceof Array) {
            treeStgring += renderTreeLayer(nexusData, branch);
        } else {
            mergerClass = "branch-merger";
            treeStgring += `<div class="branch-name"><div class="branch-connector"></div>${
                nexusData.TAXLABELS[branch - 1]
            }</div>`;
        }
    }
    return `<div class="branch-block">
        <div class="branch-block-connector"></div>
        <div class="${mergerClass}"></div>
        ${treeStgring}
        </div>`;
}
function getTreeDepth(tree) {
    let depth = 1;
    for (let branch of tree) {
        if (branch instanceof Array) {
            let branchDepth = getTreeDepth(branch);
            if (branchDepth >= depth) {
                depth = branchDepth;
            }
        }
    }
    depth += 1;
    return depth;
}
function renderTree() {
    $("#tree-div").empty();
    let nexusData = getWorkspaceFormData();
    let indexedTree = toIndexedTree(nexusData);
    indexedTree = indexedTree.replace(/\(/g, "[").replace(/\)/g, "]");
    indexedTree = JSON.parse(indexedTree);
    $("#tree-div").append(renderTreeLayer(nexusData, indexedTree));
}
