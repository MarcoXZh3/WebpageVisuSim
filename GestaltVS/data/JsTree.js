/**
 * JavaScript Implementation of "JsTreeNode" class
 * @author  MarcoXZh
 * @version 2.1
 */
function JsTreeNode(name) {
  this.nodeName = name;
  this.parent = null;
  this.childCount = 0;
  this.children = [];
  this.firstChild = null;
  this.lastChild = null;
  this.nextSibling = null;
  this.previousSibling = null;

  /**
   * Find out the index of "child" from children list of "node"
   * @param node        {JsTreeNode} the parent node to be searched
   * @param child       {JsTreeNode} the target node
   * @return            {Number} the index of the node; -1 means not found
   */
  var findChild = function(node, child) {
    if (!child || child.constructor.name != node.constructor.name)
      return -1;
    var c = node.firstChild;
    var index = 0;
    while (c) {
      if (c === child)
        return index;
      c = c.nextSibling;
      index ++;
    } // while (c)
    return -1;
  }; // var findChild = function(root, child) {...};

  /**
   * Append a new child node to this node
   * @param child       {JsTreeNode} the new child node
   * @return            {Boolean} true for succed; false for fail
   */
  this.appendChild = function(child) {
    if (findChild(this, child) != -1)
      return false;
    this.childCount = this.children.push(child);
    this.lastChild = child;
    if (this.childCount == 1) {
      this.firstChild = child;
      child.previousSibling = null;
    } else {
      child.previousSibling = this.children[this.childCount - 2];
      this.children[this.childCount - 2].nextSibling = child;
    } // else - if (this.childCount == 1)
    child.parent = this;
    child.nextSibling = null;
    return true;
  }; // this.appendChild = function(child) {...};

  /**
   * Insert a new child before an existing child
   * @param curChild    {JsTreeNode} the existing child
   * @param newChild    {JsTreeNode} the new child
   * @return            {Boolean} true for succed; false for fail
   */
  this.insertBefore = function(curChild, newChild) {
    if (!curChild) {
      this.appendChild(newChild);
      return ;
    } // if (!curChild)
    var index = findChild(this, curChild);
    if (index < 0)
      return false;
    this.children.splice(index, 0, newChild);
    this.childCount ++;
    newChild.parent = this;
    if (index == 0) {
      this.firstChild = newChild;
      newChild.previousSibling = null;
    } else {
      newChild.previousSibling = this.chilren[index - 1];
      this.chilren[index - 1].nextSibling = newChild;
    } // else - if (index == 0)
    newChild.nextSibling = curChild;
    curChild.previousSibling = newChild;
    return true;
  }; // this.insertBefore = function(curChild, newChild) {...};

  /**
   * Remove an existing child
   * @param child       {JsTreeNode} the child to be removed
   * @return            {Boolean} true for succed; false for fail
   */
  this.removeChild = function(child) {
    var index = findChild(this, child);
    if (index < 0)
      return false;
    this.children.splice(index, 1);
    this.childCount --;
    this.firstChild = this.childCount == 0 ? null : this.children[0];
    this.lastChild = this.childCount == 0 ? null : this.children[this.childCount - 1];
    if (child.nextSibing)
      child.nextSibing.previousSibling = child.previousSibing;
    if (child.previousSibing)
      child.previousSibing.nextSibling = child.nextSibing;
    child.parent = null;
    child.nextSibling = null;
    child.previousSibling = null;
    return true;
  }; // this.removeChild = function(child) {...};

  /**
   * Replace an existing child with the new child before
   * @param curChild    {JsTreeNode} the existing child
   * @param newChild    {JsTreeNode} the new child
   * @return            {Boolean} true for succed; false for fail
   */
  this.replaceChild = function(curChild, newChild) {
    var index = findChild(this, curChild);
    if (index < 0)
      return false;
    this.children.splice(index, 1, newChild);
    newChild.parent = this;
    if (index == 0)
      this.firstChild = newChild;
    if (index == this.childCount - 1)
      this.lastChild = newChild;
    newChild.previousSibling = curChild.previousSibling;
    newChild.nextSibling = curChild.nextSibling;
    if (curChild.nextSibling)
      curChild.nextSibling.previousSibling = newChild;
    if (curChild.previousSibling)
      curChild.previousSibling.nextSibling = newChild;
    curChild.parent = null;
    curChild.nextSibling = null;
    curChild.previousSibling = null;
    return true;
  }; // this.replaceChild = function(curChild, newChild) {...};

  /**
   * Check if the node contains an immediate child
   * @param child       {JsTreeNode} the child to be searched
   * @return            {Boolean} true for existing; false for not
   */
  this.contains = function(child) {
    return findChild(this, child) != -1;
  }; // this.contains = function(child) {...};

  /**
   * Cast the node into a string
   * @return            {String} string representation of the node
   */
  this.toString = function() {
    var str = this.nodeName + ': parent=' + (this.parent == null ? 'null' : this.parent.nodeName) +
              ';prev=' + (this.previousSibling ? this.previousSibling.nodeName : 'null') +
              ';next=' + (this.nextSibling ? this.nextSibling.nodeName : 'null') +
              '; children(' + this.childCount + ')=[';
    var child = this.firstChild;
    while (child) {
      str += child.nodeName + ', ';
      child = child.nextSibling;
    } // while (child)
    if (this.childCount > 0)
      str = str.substr(0, str.length - 2);
    str += ']:first=' + (this.firstChild ? this.firstChild.nodeName : 'null') +
           ';last=' + (this.lastChild ? this.lastChild.nodeName : 'null');
    return str;
  }; // this.toString = function() {...};

} // function JsTreeNode(name)


/**
 * JavaScript Implementation of "JsTree" class
 * @author  MarcoXZh
 * @version 2.1
 */
function JsTree(treeRoot, name) {
  this.treeName = name;
  this.root = treeRoot;

  /**
   * Remove all nodes frome the tree
   * @return            {Boolean} true for succed; false for fail
   */
  this.empty = function() {
    this.root = null;
    return true;
  }; // this.empty = function() {...};

  /**
   * Check if the tree is empty
   * @return            {Boolean} true for empty; false for not
   */
  this.isEmpty = function() {
    return this.root == null || this.root == undefined;
  }; // this.isEmpty = function() {...};

  /**
   * Find if the node is in the sub tree
   * @param root        {JsTreeNode} root node of the sub tree
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Boolean} true for found; false for not
   */
  var hasNode = function(root, node) {
    if (root === node)
      return true;
    var index = 0;
    while (index++ < root.childCount)
      if (hasNode(root.children[index - 1], node))
        return true;
    return false;
  }; // var hasNode = function(root, node) {...};

  /**
   * Find if the node is in the tree
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Boolean} true for found; false for not
   */
  this.contains = function(node) {
    return !(!node) && !this.isEmpty() && hasNode(this.root, node);
  }; // this.contains = function(node) {...};

  /**
   * Return the path of a node
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {String} path of the node; null means not in the tree
   */
  this.getNodePath = function(node) {
    if (!node || this.isEmpty() || !hasNode(this.root, node))
      return null;
    var path = '/' + node.nodeName;
    var parent = node.parent;
    while (parent) {
      path = '/' + parent.nodeName + path;
      parent = parent.parent;
    } // while (parent)
    return path;
  }; // this.getNodePath = function(node) {...};

  /**
   * Find the depth of a node:
   * number of edges from the node to the root
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Number} depth of the node; -1 means not in the tree
   */
  this.getNodeDepth = function(node) {
    if (!node || this.isEmpty() || !hasNode(this.root, node))
      return -1;
    var parent = node.parent;
    var depth = 0;
    while (parent) {
      depth ++;
      parent = parent.parent;
    } // while (parent)
    return depth;
  }; // this.getNodeDepth = function(node) {...};

  /**
   * Find the level of a node:
   * 1 + number of edges between the node and the root
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Number} level of the node; -1 means not in the tree
   */
  this.getNodeLevel = function(node) {
    return (!node || this.isEmpty() || !hasNode(this.root, node)) ? -1 : this.getNodeDepth(node) + 1;
  }; // this.getNodeLevel = function(node) {...};

  /**
   * Find the height of a node (assume it's in the tree):
   * number of edges on the longest downward path between the node and a leaf
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Number} height of the node
   */
  var getHeight = function(node) {
    if (node.childCount == 0)
      return 0;
    var height = 0, index = 0;
    while (index++ < node.childCount) {
      var h = getHeight(node.children[index - 1]);
      if (h > height)
        height = h;
    } // while (index++ < node.childCount)
    return height + 1;
  }; // var getHeight = function(node) {...};

  /**
   * Find the height of a node:
   * number of edges on the longest downward path between the node and a leaf
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Number} height of the node; -1 means not in the tree
   */
  this.getNodeHeight = function(node) {
    return (!node || this.isEmpty() || !hasNode(this.root, node)) ? -1 : getHeight(node);
  }; // this.getNodeHeight = function(node) {...};

  /**
   * Find the height of the tree:
   * number of edges on the longest downward path between the root and a leaf
   * @param node        {JsTreeNode} the target node to be searched
   * @return            {Number} height of the tree
   */
  this.getTreeHeight = function() {
    return this.isEmpty() ? 0 : getHeight(this.root);
  }; // this.getTreeHeight = function() {...};

  /**
   * Find the number of nodes from the sub tree:
   * @param root        {JsTreeNode} root of the sub tree
   * @return            {Number} size of the sub tree
   */
  var getSize = function(root) {
    var size = 1;
    if (root.childCount == 0)
      return size;
    var index = 0;
    while (index++ < root.childCount)
      size += getSize(root.children[index - 1]);
    return size;
  }; // var getSize = function(root) {};

  /**
   * Find the number of nodes from the tree:
   * @param root        {JsTreeNode} root of the sub tree
   * @return            {String} string representation of the sub tree
   */
  this.getTreeSize = function() {
    return this.isEmpty() ? 0 : getSize(this.root);
  }; // this.getTreeSize = function() {...};

  /**
   * Cast a sub tree to into a string with proper indentation
   * @param root        {JsTreeNode} root of the sub tree
   * @return            {String} string representation of the sub tree
   */
  var getNodeString = function(root, level) {
    var str = '  ';
    var index = 0;
    while (index++ < level)
      str += '|&nbsp;';
    if (str.length != 2)
      str = str.substr(0, str.length - 1) + '-';
    str += root.toString() + '<br/>';
    index = 0;
    while (index++ < root.childCount)
      str += getNodeString(root.children[index - 1], level + 1);
    return str;
  }; // var getNodeString = function(node, level) {...};

  /**
   * Cast the tree into a string
   * @return            {String} string representation of the tree
   */
  this.toString = function() {
    if (this.isEmpty())
      return '{Empty}';
    var str = '================&nbsp;' + this.constructor.name + ':&nbsp;\'' + this.treeName + '\'&nbsp;================<br/>';
    str += getNodeString(this.root, 0);
    str += '================&nbsp;' + this.constructor.name + ':&nbsp;\'' + this.treeName + '\'&nbsp;================';
    return str;
  }; // this.toString = function() {...};

} // function JsTree(treeRoot, name)

