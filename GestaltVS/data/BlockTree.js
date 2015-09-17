/**
 * Node of block tree
 * @param nodes         {layer node List} the corresponding layer nodes
 * @param name          {String} name of the node
 */
function BlockTreeNode(nodes, name) {
  JsTreeNode.call(this, name);

  this.layerNodes = (!nodes) ? [] : nodes;
  this.domNodes = [];

  this.left = 9007199254740992;   // Max integer in JavaScript (2 ^ 53), therefore here means POS_INF
  this.top = 9007199254740992;
  this.right = 0;
  this.bottom = 0;
  for (var i = 0; i < this.layerNodes.length; i++) {
    var node = this.layerNodes[i];
    this.domNodes.push(node.domNode);
    if (this.left > node.left)      this.left = node.left;
    if (this.top > node.top)        this.top = node.top;
    if (this.right < node.right)    this.right = node.right;
    if (this.bottom < node.bottom)  this.bottom = node.bottom;
  } // for (var i = 0; i < this.layerNodes.length; i++)
  this.width = this.right - this.left;
  this.height = this.bottom - this.top;

  /**
   * Cast the block node into a string
   * @return            {String} string representation of the layer node
   */
  this.toString = function() {
    return 'top=' + this.top + ',left=' + this.left + ',width=' + this.width + ',height=' + this.height +
           '; ' + this.nodeName;
  }; // this.toString = function()

} // function BlockTreeNode(node, name)


/**
 * Block tree implementation
 * @param root          {BlockTreeNode} root node of the tree
 * @param name          {String} name of the tree
 */
function BlockTree(root, name) {
  JsTree.apply(this, [root, name]);

  /**
   * Find the block layer that contains a DOM element from a subtree
   * @param root        {BlockTreeNode} root of the subtree
   * @param layerNode   {LayerTreeNode} the specific layer tree node to find
   * @return            {BlockTreeNode} the target block layer
   */
  var findBlock = function(root, layerNode) {
    for (i in root.layerNodes)
      if (root.layerNodes[i] == layerNode)
        return root;
    var child = root.firstChild;
    while (child) {
      var block = findBlock(child, layerNode);
      if (block)
        return block;
      child = child.nextSibling;
    } // while (child)
    return null;
  }; // var findBlock = function(root, domNode)

  /**
   * Build up the block tree from a layer tree and corresponding merging results
   * @param mergingResults  {Array} the merging result array
   */
  this.buildUpTree = function(mergingResults) {
    for (var i = mergingResults.length - 1; i >= 0; i--) {
      var parent = findBlock(this.root, mergingResults[i][0].parent);
      var btNodeName = '';
      for (var j in mergingResults[i])
        btNodeName += mergingResults[i][j].nodeName + ',';
      btNodeName = btNodeName.substring(0, btNodeName.length - 1);
      var btNode = new BlockTreeNode(mergingResults[i], parent.nodeName + '/[' + btNodeName + ']');
      parent.insertBefore(parent.firstChild, btNode);
    } // for (var i = mergingResults.length - 1; i >= 0; i--)
  }; // this.buildUpTree = function(mergingResults)

} // function BlockTree(root, name)

