/**
 * Node of layer tree
 * @param node      {DOM Element} the corresponding DOM element
 * @param name      {String} name of the node. In this case the tag name
 */
function LayerTreeNode(node, name) {
  JsTreeNode.call(this, (!node) ? '' : node.tagName);

  this.domNode = (!node) ? null : node;
  this.domXPath = (!node) ? null : getXPath(node);

  var child = this.domNode.firstChild;
  var str = '';
  while (child) {
    if (child.nodeType == 3)
      str += child.nodeValue.trim() + '\n';
    child = child.nextSibling;
  } // while (child)
  this.text = str.trim().replace(/\n/g, ' ');

  this.top = (!node) ? 0 : node.offsetTop;
  this.left = (!node) ? 0 : node.offsetLeft;
  this.width = (!node) ? 0 : node.offsetWidth;
  this.height = (!node) ? 0 : node.offsetHeight;
  this.css = {};

  if (node) {
    var parent = node.offsetParent;
    while (parent) {
      this.top += parent.offsetTop;
      this.left += parent.offsetLeft;
      parent = parent.offsetParent;
    } // while (parent)
    for (i in properties) {
      var style = document.defaultView.getComputedStyle(node).getPropertyValue(properties[i]);
      style = (!style) ? '' : style.trim();
      this.css[properties[i]] = style;
    } // for (i in properties)
  } // if (node)
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;

  /**
   * Cast the layer node into a string
   * @return        {String} string representation of the layer node
   */
  this.toString = function() {
    return this.nodeName +
           ': top=' + this.top + ';left=' + this.left + ';width=' + this.width + ';height=' + this.height +
           '; XPath="' + this.domXPath + '"';
  }; // this.toString = function()

} // function LayerTreeNode(node)


/**
 * Layer tree implementation
 * @param root    {LayerTreeNode} root node of the tree
 * @param name    {String} name of the tree
 */
function LayerTree(root, name) {
  JsTree.apply(this, [root, name]);

  /**
   * Recursively add layer nodes to the tree
   * @param domNode      DOM node to be appended
   * @param layerNode    Layer node of the corresponding DOM node
   */
  var makeNodes = function(domNode, layerNode) {
    var child = domNode.firstElementChild;
    while (child) {
      if (isNodeVisible(child)) {
        var childLayer = new LayerTreeNode(child, child.tagName);
        layerNode.appendChild(childLayer);
        makeNodes(child, childLayer);
      } // if (isNodeVisible(child))
      child = child.nextElementSibling;
    } // while (child)
  }; // var makeNodes = function(domNode, layerNode)

  makeNodes(this.root.domNode, root);
} // function LayerTree(root, name)

