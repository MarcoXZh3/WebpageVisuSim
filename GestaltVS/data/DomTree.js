/**
 * Node of DOM tree
 * @param node          {DOM element} the corresponding layer nodes
 * @param name          {String} name of the node
 */
function DomTreeNode(node) {
  JsTreeNode.call(this, node.tagName);

  this.domNode = (!node) ? null : node;

  this.top = (!node) ? 0 : node.offsetTop;
  this.left = (!node) ? 0 : node.offsetLeft;
  this.width = (!node) ? 0 : node.offsetWidth;
  this.height = (!node) ? 0 : node.offsetHeight;
  if (node) {
    var parent = node.offsetParent;
    while (parent) {
      this.top += parent.offsetTop;
      this.left += parent.offsetLeft;
      parent = parent.offsetParent;
    } // while (parent)
  } // if (node)

  /**
   * Cast the DOM node into a string
   * @return            {String} string representation of the layer node
   */
  this.toString = function() {
    return this.nodeName + 
           ': top=' + this.top + ',left=' + this.left + ',width=' + this.width + ',height=' + this.height;
  }; // this.toString = function()

} // function DomTreeNode(node)


/**
 * DOM tree implementation
 * @param root          {DomTreeNode} root node of the tree
 * @param name          {String} name of the tree
 */
function DomTree(root, name) {
  JsTree.apply(this, [root, name]);

  /**
   * Build up the DOM tree from a the web page's original DOM
   * @param domNode     {DOM Element} the DOM element
   * @param domTreeNode {DomTreeNode} the corresponding DomTreeNode
   */
  var buildUpTree = function(domNode, domTreeNode) {
    var child = domNode.firstElementChild;
    while (child) {
      var childDomTreeNode = new DomTreeNode(child);
      domTreeNode.appendChild(childDomTreeNode);
      buildUpTree(child, childDomTreeNode);
      child = child.nextElementSibling;
    } // while (child)
  }; // var buildUpTree = function(domNode, domTreeNode)

  buildUpTree(this.root.domNode, this.root);
} // function DomTree(root, name)

