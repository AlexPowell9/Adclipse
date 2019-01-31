//returns a node list of elements
let getContainers = () => {
    return document.getElementsByTagName("*");
}
//gets the height of the node
let getHeight = (node) => {
    return node.clientHeight||0;
}

let getWidth = (node) => {
    return node.clientWidth||0;
}

let selectContainerByRatio = (minRatio, maxRatio) => {
    let selected = [];
    
}

let selectRecursive(node, minRatio, maxRatio, selected) => {
    node.childNodes.forEach((node) => {
        if(node.height !== 0 && node.width !== 0){
            nRatio = getWidth(node)/getHeight(node);
            if(nRatio <= maxRatio && nRatio >= minRatio)selected.push(node);
        }
        selectRecursive(node, minRatio, maxRatio, selected)
    });
}

/**
 * Selects the node with the most children
*/
let selectByChildren(node) => {
    let returnNode = node
    let children = node.childNodes.length;
    node.childNodes.forEach((node) => {
        let curr= selectByChildren(node);
        if(curr.childNodes.length > children){
            returnNode = curr;
            children = curr.childNodes;
        }
    });
    return returnNode;
}

let selectMaxChilren(node, list){
    let children = node.childNodes.length;
    node.childNodes.forEach((node) => {
        if(node.childNodes.length > children) ;   
    })
}
