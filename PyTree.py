#!/usr/bin/python

'''
Created on Apr 16, 2015
@author: MarcoXZh
'''


class PyTreeNode(object):
    '''
    Tree node class in Python
    '''

    def __init__(self, **kwargs):
        '''
        Constructor: create a new Python tree node
            @param kwargs:      {Dictionary} the argument dictionary
            kwargs['name']:     {String} node name
        '''
        self.nodeName = str(kwargs.get('name'))

        self.parent = None
        self.previousSibling = None
        self.nextSibling = None
        self.children = []
        self.firstChild = None
        self.lastChild = None
    pass # def __init__(self, **kwargs)

    def append(self, child):
        '''
        Append a new child node
            @param child:    {PyTreeNode} the child to be appended
            @return:         {Boolean} True for succeed; False for fail
        '''
        if self == child or child in self.children or type(self).__name__ != type(child).__name__:
            return False
        if child.parent is not None and not child.parent.remove(child):
            return False
        self.children.append(child)
        self.lastChild = child
        child.parent = self
        child.nextSibling = None
        if len(self.children) == 1:
            self.firstChild = child
            child.previousSibling = None
        else:
            self.children[-2].nextSibling = child
            child.previousSibling = self.children[-2]
        pass # else - if len(self.children) == 1
        return True
    pass # def append(self, child)

    def insertBefore(self, curChild, newChild):
        '''
        Append a new child node
            @param curChild: {PyTreeNode} the current child in the children list
            @param newChild: {PyTreeNode} the new child to be inserted
            @return:         {Boolean} True for succeed; False for fail
        '''
        if not curChild:
            self.append(newChild)
            return
        pass # if not curChild

        if curChild not in self.children or newChild in self.children or \
           self == newChild or type(self).__name__ != type(newChild).__name__:
            return False
        if newChild.parent is not None and not newChild.parent.remove(newChild):
            return False
        index = self.children.index(curChild)
        self.children.insert(index, newChild)
        newChild.parent = self
        if index == 0:
            self.firstChild = newChild
            newChild.previousSibling = None
        else:
            newChild.previousSibling = self.children[index - 1]
            self.children[index - 1].nextSibling = newChild
        pass # else - if index == 0
        newChild.nextSibling = curChild
        curChild.previousSibling = newChild
        return True
    pass # def insertBefore(self, curChild, newChild)

    def remove(self, child):
        '''
        Append a new child node
            @param child:    {PyTreeNode} the child to be removed
            @return:         {Boolean} True for succeed; False for fail
        '''
        if child not in self.children:
            return False
        self.children.remove(child)
        self.firstChild = None if len(self.children) == 0 else self.children[0]
        self.lastChild  = None if len(self.children) == 0 else self.children[-1]
        if child.nextSibling is not None:
            child.nextSibling.previousSibling = child.previousSibling
        if child.previousSibling:
            child.previousSibling.nextSibling = child.nextSibling
        child.parent = None
        child.nextSibling = None
        child.previousSibling = None
        return True
    pass # def remove(self, child)

    def replace(self, curChild, newChild):
        '''
        Append a new child node
            @param curChild: {PyTreeNode} the current child in the children list
            @param newChild: {PyTreeNode} the new child to be inserted
            @return:         {Boolean} True for succeed; False for fail
        '''
        if curChild not in self.children or newChild in self.children or \
           self == newChild or type(self).__name__ != type(newChild).__name__:
            return False
        if newChild.parent is not None and not newChild.parent.remove(newChild):
            return False
        index = self.children.index(curChild)
        self.children[index] = newChild
        newChild.parent = self
        if index == 0:
            self.firstChild = newChild
        if index == len(self.children) - 1:
            self.lastChild = newChild
        newChild.previousSibling = curChild.previousSibling
        newChild.nextSibling = curChild.nextSibling
        if curChild.nextSibling is not None:
            curChild.nextSibling.previousSibling = newChild
        if curChild.previousSibling is not None:
            curChild.previousSibling.nextSibling = newChild
        curChild.parent = None
        curChild.nextSibling = None
        curChild.previousSibling = None
        return True
    pass # def replace(self, curChild, newChild)

    def contains(self, node):
        '''
        Check if the node is a child
            @param node:     {PyTreeNode} the node to be checked
            @return:         {Boolean} True for succeed; False for fail
        '''
        if node in self.children:
            assert node.parent is self
            return True
        return False
    pass # def contains(self, node)

    def __str__(self):
        '''
        Cast the tree node into string representation
            @return:         {String} string representation of the node
        '''
        return '%s: parent=%s, prev=%s, next=%s; children(%d)%s: first=%s, last=%s' % \
                   (self.nodeName, 'None' if not self.parent else self.parent.nodeName, \
                    'None' if not self.previousSibling else self.previousSibling.nodeName, \
                    'None' if not self.nextSibling else self.nextSibling.nodeName, \
                    len(self.children), [c.nodeName for c in self.children], \
                    'None' if not self.firstChild else self.firstChild.nodeName,
                    'None' if not self.lastChild else self.lastChild.nodeName)
    pass # def __str__(self)

pass # class PyTreeNode(object)


class PyTree(object):
    '''
    Tree class in Python
    '''

    def __init__(self, **kwargs):
        '''
        Constructor: create a new Python tree
            @param kwargs:      {Dictionary} the argument dictionary
            kwargs['name']:     {String} node name
            kwargs['root']:     {PyTreeNode} node name
        '''
        self.treeName = str(kwargs.get('name'))
        root = kwargs.get('root')
        self.root = root if isinstance(root, PyTreeNode) == True else None
    pass # def __init__(self, **kwargs)

    def empty(self):
        '''
        Empty the tree
            @return:         {Boolean} True for empty; False for not empty
        '''
        self.root = None
        return True
    pass # def empty(self)

    def isEmpty(self):
        '''
        Check if the tree is empty or not
            @return:         {Boolean} True for empty; False for not empty
        '''
        return self.root is None
    pass # def isEmpty(self)

    def __subtreeContains(self, root, node):
        '''
        Check if a subtree contains the target node
        Assume the two parameters are both valid
            @param root:     {PyTreeNode} root node of the subtree
            @param node:     {PyTreeNode} the target node to be searched
            @return:         {Boolean} True for contains; False for not
        '''
        if root is node:
            return True
        for child in root.children:
            if self.__subtreeContains(child, node) == True:
                return True
        pass # for - if
        return False
    pass # def __subtreeContains(self, root, node)

    def contains(self, node):
        '''
        Check if the tree contains the target node
            @param node:     {PyTreeNode} the target node to be searched
            @return:         {Boolean} True for contains; False for not
        '''
        if self.root is None or type(self.root).__name__ != type(node).__name__:
            return False
        return self.__subtreeContains(self.root, node)
    pass # def contains(self, node)

    def nodePath(self, node):
        '''
        Get the path of a node: from root to the node
            @param node:     {PyTreeNode} the target node
            @return:         {String} the path string
        '''
        if self.root is None or type(self.root).__name__ != type(node).__name__ or \
           self.__subtreeContains(self.root, node) != True:
            return None
        path = '/%s' % node.nodeName
        parent = node.parent
        while parent is not None:
            path = '/%s%s' % (parent.nodeName, path)
            parent = parent.parent
        pass # while parent is not None
        return path
    pass # def nodePath(self, node)

    def nodeDepth(self, node):
        '''
        Find the depth of a node: number of edges from the node to the root
            @param node:     {PyTreeNode} the target node
            @return:         {Integer} depth of the node
        '''
        if self.root is None or type(self.root).__name__ != type(node).__name__ or \
           self.__subtreeContains(self.root, node) != True:
            return -1
        parent = node.parent
        depth = 0
        while parent is not None:
            depth += 1
            parent = parent.parent
        pass # while parent is not None
        return depth
    pass # def nodeDepth(self, node)

    def nodeLevel(self, node):
        '''
        Find the level of a node: 1 + number of edges between the node and the root
            @param node:     {PyTreeNode} the target node
            @return:         {Integer} level of the node
        '''
        depth = self.nodeDepth(node)
        return depth + 1 if depth != -1 else -1
    pass # def nodeLevel(self, node)

    def __nodeHeight(self, node):
        '''
        Calculate the node's height: number of edges on the longest downward path between the node and a leaf
        Assume the parameter is valid
            @param node:     {PyTreeNode} the target node
            @return:         {Integer} height of the node
        '''
        if len(node.children) == 0:
            return 0
        height = 0
        for child in node.children:
            h = self.__nodeHeight(child)
            if h > height:
                height = h
        pass # for child in node.children
        return height + 1
    pass # def __nodeHeight(self, node)

    def nodeHeight(self, node):
        '''
        Calculate the node's height: number of edges on the longest downward path between the node and a leaf
            @param node:     {PyTreeNode} the target node
            @return:         {Integer} height of the node
        '''
        if self.root is None or type(self.root).__name__ != type(node).__name__ or \
           self.__subtreeContains(self.root, node) != True:
            return -1
        return self.__nodeHeight(node)
    pass # def nodeHeight(self, node)

    def treeHeight(self):
        '''
        Calculate the tree's height: number of edges on the longest downward path between the root and a leaf
            @return:         {Integer} height of the tree
        '''
        return 0 if self.root is None else self.__nodeHeight(self.root)
    pass # def treeHeight(self)

    def __subtreeSize(self, root):
        '''
        Calculate the subtree's size: number of nodes in the subtree
        Assume the parameter is valid
            @param root:     {PyTreeNode} the root of the subtree
            @return:         {Integer} size of the subtree
        '''
        size = 1
        if len(root.children) == 0:
            return size
        for child in root.children:
            size += self.__subtreeSize(child)
        return size
    pass # def __subtreeSize(self, root)

    def treeSize(self):
        '''
        Calculate the tree's size: number of nodes in the tree
            @return:         {Integer} size of the tree
        '''
        return 0 if self.root is None else self.__subtreeSize(self.root)
    pass # def treeSize(self)

    def __preOrderTraverse(self, root):
        '''
        Traverse the subtree and return node list pre-orderly
        Assume the parameter is valid
            @param root:     {PyTreeNode} the root of the subtree
            @return:         {List} node list of the subtree
        '''
        lst = [root]
        for child in root.children:
            lst += self.__preOrderTraverse(child)
        return lst
    pass # def __preOrderTraverse(self, root)

    def preOrderTraverse(self):
        '''
        Traverse the tree and return node list pre-orderly
            @return:         {List} node list of the tree
        '''
        return [] if self.root is None else self.__preOrderTraverse(self.root)
    pass # def preOrderTraverse(self)

    def __postOrderTraverse(self, root):
        '''
        Traverse the subtree and return node list post-orderly
        Assume the parameter is valid
            @param root:     {PyTreeNode} the root of the subtree
            @return:         {List} node list of the subtree
        '''
        lst = []
        for child in root.children:
            lst += self.__postOrderTraverse(child)
        lst.append(root)
        return lst
    pass # def __postOrderTraverse(self, root)

    def postOrderTraverse(self):
        '''
        Traverse the tree and return node list post-orderly
            @return:         {List} node list of the tree
        '''
        return [] if self.root is None else self.__postOrderTraverse(self.root)
    pass # def postOrderTraverse(self)

    def depthFirstTraverse(self):
        '''
        Traverse the tree and return node list depth-firstly -- this is the same with pre-order traversal
            @return:         {List} node list of the tree
        '''
        if self.root is None:
            return []
        queue = [self.root]
        lst = []
        curNode = None
        while len(queue) > 0:
            curNode = queue.pop()
            lst.append(curNode)
            for i in range(len(curNode.children) - 1, -1, -1):
                queue.append(curNode.children[i])
        pass # while len(queue) > 0
        return lst
    pass # def depthFirstTraverse(self)

    def breadthFirstTraverse(self):
        '''
        Traverse the tree and return node list bread-firstly
            @return:         {List} node list of the tree
        '''
        if self.root is None:
            return []
        queue = [self.root]
        lst = []
        curNode = None
        while len(queue) > 0:
            curNode = queue.pop()
            lst.append(curNode)
            for child in curNode.children:
                queue.insert(0, child)
        pass # while len(queue) > 0
        return lst
    pass # def breadthFirstTraverse(self)

    def __strSubtree(self, root, depth):
        '''
        Cast the tree into string representation
            @param root:     {PyTreeNode} the root of the subtree
            @param depth:    {Integer} actual depth of the root in the tree
            @return:         {String} string representation of the tree
        '''
        s = '  %s%s\n' % ('%s-' % ('| ' * depth)[:-1] if depth > 0 else '', root)
        for child in root.children:
            s += self.__strSubtree(child, depth + 1)
        return s
    pass # def __strSubtree(self, root, depth)

    def __str__(self):
        '''
        Cast the tree into string representation
            @return:         {String} string representation of the tree
        '''
        if self.root is None:
            return '{Empty}'
        title = '================ %s:\'%s\' ================' % (type(self).__name__, self.treeName)
        return '%s\n%s%s' % (title, self.__strSubtree(self.root, 0), title)
    pass # def __str__(self)

pass # class PyTree(object)


if __name__ == '__main__':
    nonNode = PyTreeNode(name='nonNode')
    root = PyTreeNode(name='root')
    tree = PyTree(name='Tree', root=root)
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    c12 = PyTreeNode(name='c12')
    print root.append(c12)                          # True
    c11 = PyTreeNode(name='c11')
    print root.insertBefore(nonNode, c11)           # False
    print root.insertBefore(c12, c11)               # False
    c14 = PyTreeNode(name='c14')
    print root.append(c14)                          # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c14']: first=c11, last=c14
  |-c11: parent=root, prev=None, next=c12; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c14; children(0)[]: first=None, last=None
  |-c14: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    c13 = PyTreeNode(name='c13')
    print root.replace(nonNode, c13)                # False
    print root.replace(c14, c13)                    # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    c21 = PyTreeNode(name='c21')
    c22 = PyTreeNode(name='c22')
    c23 = PyTreeNode(name='c23')
    c24 = PyTreeNode(name='c24')
    c25 = PyTreeNode(name='c25')
    c26 = PyTreeNode(name='c26')
    print c11.append(c21)                           # True
    print c11.append(c22)                           # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(2)['c21', 'c22']: first=c21, last=c22
  | |-c21: parent=c11, prev=None, next=c22; children(0)[]: first=None, last=None
  | |-c22: parent=c11, prev=c21, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c11.remove(nonNode)                       # False
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(2)['c21', 'c22']: first=c21, last=c22
  | |-c21: parent=c11, prev=None, next=c22; children(0)[]: first=None, last=None
  | |-c22: parent=c11, prev=c21, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c11.remove(c21)                           # True
    print c11.remove(c21)                           # False
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c12.append(c23)                           # True
    print c12.append(c23)                           # False
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(1)['c23']: first=c23, last=c23
  | |-c23: parent=c12, prev=None, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c12.append(c25)                           # True
    print c12.replace(nonNode, c25)                 # False
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(2)['c23', 'c25']: first=c23, last=c25
  | |-c23: parent=c12, prev=None, next=c25; children(0)[]: first=None, last=None
  | |-c25: parent=c12, prev=c23, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c12.replace(c25, c24)                     # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(2)['c23', 'c24']: first=c23, last=c24
  | |-c23: parent=c12, prev=None, next=c24; children(0)[]: first=None, last=None
  | |-c24: parent=c12, prev=c23, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c13.append(c25)                           # True
    print c13.append(c26)                           # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(2)['c23', 'c24']: first=c23, last=c24
  | |-c23: parent=c12, prev=None, next=c24; children(0)[]: first=None, last=None
  | |-c24: parent=c12, prev=c23, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(1)['c25']: first=c25, last=c25
  | |-c25: parent=c13, prev=None, next=None; children(0)[]: first=None, last=None
  | |-c26: parent=c13, prev=c25, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    c31 = PyTreeNode(name='c31')
    c41 = PyTreeNode(name='c41')
    print c23.append(c31)                           # True
    print c31.append(c41)                           # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(2)['c23', 'c24']: first=c23, last=c24
  | |-c23: parent=c12, prev=None, next=c24; children(1)['c31']: first=c31, last=c31
  | | |-c31: parent=c23, prev=None, next=None; children(1)['c41']: first=c41, last=c41
  | | | |-c41: parent=c31, prev=None, next=None; children(0)[]: first=None, last=None
  | |-c24: parent=c12, prev=c23, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(2)['c25', 'c26']: first=c25, last=c26
  | |-c25: parent=c13, prev=None, next=c26; children(0)[]: first=None, last=None
  | |-c26: parent=c13, prev=c25, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print c25.append(c31)                           # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(3)['c11', 'c12', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c12; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c12: parent=root, prev=c11, next=c13; children(2)['c23', 'c24']: first=c23, last=c24
  | |-c23: parent=c12, prev=None, next=c24; children(0)[]: first=None, last=None
  | |-c24: parent=c12, prev=c23, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c12, next=None; children(2)['c25', 'c26']: first=c25, last=c26
  | |-c25: parent=c13, prev=None, next=c26; children(1)['c31']: first=c31, last=c31
  | | |-c31: parent=c25, prev=None, next=None; children(1)['c41']: first=c41, last=c41
  | | | |-c41: parent=c31, prev=None, next=None; children(0)[]: first=None, last=None
  | |-c26: parent=c13, prev=c25, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    pre = tree.preOrderTraverse()
    print [x.nodeName for x in pre]
    post = tree.postOrderTraverse()
    print [x.nodeName for x in post]
    depth = tree.depthFirstTraverse()
    print [x.nodeName for x in depth]
    breadth = tree.breadthFirstTraverse()
    print [x.nodeName for x in breadth]
    print tree.contains(root)                       # True
    print tree.contains(c25)                        # True
    print tree.contains(nonNode)                    # False
    print tree.nodePath(root)                       # /root
    print tree.nodePath(c25)                        # /root/c13/c25
    print tree.nodePath(nonNode)                    # None
    print tree.nodeDepth(root)                      # 0
    print tree.nodeDepth(c25)                       # 2
    print tree.nodeDepth(nonNode)                   # -1
    print tree.nodeLevel(root)                      # 1
    print tree.nodeLevel(c25)                       # 3
    print tree.nodeLevel(nonNode)                   # -1
    print tree.nodeHeight(root)                     # 4
    print tree.nodeHeight(c25)                      # 2
    print tree.nodeHeight(nonNode)                  # -1
    print tree.treeHeight()                         # 4
    print tree.treeSize()                           # 11
    print root.remove(c12)                          # True
    print root.remove(c12)                          # True
    print tree
    '''
================ PyTree:'Tree' ================
  root: parent=None, prev=None, next=None; children(2)['c11', 'c13']: first=c11, last=c13
  |-c11: parent=root, prev=None, next=c13; children(1)['c22']: first=c22, last=c22
  | |-c22: parent=c11, prev=None, next=None; children(0)[]: first=None, last=None
  |-c13: parent=root, prev=c11, next=None; children(2)['c25', 'c26']: first=c25, last=c26
  | |-c25: parent=c13, prev=None, next=c26; children(1)['c31']: first=c31, last=c31
  | | |-c31: parent=c25, prev=None, next=None; children(1)['c41']: first=c41, last=c41
  | | | |-c41: parent=c31, prev=None, next=None; children(0)[]: first=None, last=None
  | |-c26: parent=c13, prev=c25, next=None; children(0)[]: first=None, last=None
================ PyTree:'Tree' ================
    '''
    print tree.isEmpty()                            # True
    print tree.empty()                              # True
    print tree                                      # {Empty}
    pre = tree.preOrderTraverse()
    print [x.nodeName for x in pre]
    post = tree.postOrderTraverse()
    print [x.nodeName for x in post]
    depth = tree.depthFirstTraverse()
    print [x.nodeName for x in depth]
    breadth = tree.breadthFirstTraverse()
    print [x.nodeName for x in breadth]
    print tree.isEmpty()                            # True
    print tree.contains(root)                       # False
    print tree.contains(nonNode)                    # False
    print tree.contains(None)                       # False
    print tree.treeSize()                           # 0

pass # if __name__ == '__main__':
