'''
Created on Apr 21, 2015

@author: MarcoXZh
'''

import re, zss, datetime, os, pylzma
from PyTree import PyTree, PyTreeNode
from PIL import Image

class VisualTreeNode(PyTreeNode):
    '''
    Visual tree node for PageSimilarity
    '''

    def __init__(self, attributes):
        '''
        Constructor: create a new block tree node
            @param attributes:      {Dictionary} the argument dictionary
            attributes['name']:     node name (from super class PyTreeNode)
            attributes['left']:     (Optional, default is 0) left position of the node
            attributes['top']:      (Optional, default is 0) top position of the node
            attributes['right']:    (Optional, default is 0) right position of the node
            attributes['bottom']:   (Optional, default is 0) bottom position of the node
            attributes['width']:    (Optional, default is 0) width of the node
            attributes['height']:   (Optional, default is 0) height of the node
            attributes['info']:     (Optional, default is '') dump information of the node
        '''
        super(VisualTreeNode, self).__init__(name=attributes.get('name'))
        try:
            self.left = int(attributes.get('left'))
        except:
            self.left = 0
        try:
            self.top = int(attributes.get('top'))
        except:
            self.top = 0
        try:
            self.right = int(attributes.get('right'))
        except:
            self.right = 0
        try:
            self.bottom = int(attributes.get('bottom'))
        except:
            self.bottom = 0
        try:
            self.width = int(attributes.get('width'))
        except:
            self.width = 0
        try:
            self.height = int(attributes.get('height'))
        except:
            self.height = 0
        if self.width == 0:
            self.width = 1
        if self.height == 0:
            self.height = 1
        self.info = attributes.get('info')
        self.ncd = None
    pass # def __init__(self, attributes)

    def __str__(self):
        '''
        Return the string representation of the node
            @return:         {String} string representation of the node
        '''
        return '%s: left=%d, top=%d, width=%d, height=%d; NCD=%s, info=%s' % \
                   (self.nodeName, self.left, self.top, self.width, self.height, self.ncd, self.info)
    pass # def __str__(self)

pass # class VisualTreeNode(object)


class VisualTree(PyTree):
    '''
    Visual tree for PageSimilarity
    '''

    @staticmethod
    def parseVisualTree(txt):
        '''
        Create a visual tree by parsing a string
            @param txt:        {String} the visual tree string
            @return:           {VisualTree} the parsed visual tree
        '''
        depth = 0
        curNode = None
        txts = txt.splitlines()
        visualTree = VisualTree(name='', root=None)
        for line in txts:
            if len(line.strip()) == 0:
                continue
            if line.startswith('=='):
                visualTree.treeName = re.split('\'|"', line)[1]
                continue
            pass # if line.startswith('==')
            index1 = line.find('|-')
            index1 = 0 if index1 < 0 else index1 + 2
            index2 = line.find('; ')
            if index2 < 0:
                index2 = len(line)
            hier, node, info = line[:index1], line[index1:index2].strip(), line[index2+2:].strip()
            nodeAttr = {}
            nodeAttr['info'] = info
            infos = re.split(': ', node)
            nodeAttr['name'] = infos[0] if len(infos) > 1 else info
            attrs = re.split(',|;', infos[-1])
            for attr in attrs:
                pair = attr.split('=')
                nodeAttr[pair[0]] = pair[1]
            pass # for attr in attrs
            node = VisualTreeNode(nodeAttr)
            curDepth = len(hier) / 2
            if curDepth == 0:
                node.nodeName = '{0}'
                visualTree.root = node
            elif depth < curDepth:
                assert len(curNode.children) == 0
                node.nodeName = '{%s/00}' % curNode.nodeName[1:-1]
                curNode.append(node)
            else: # depth > curDepth
                index = depth - curDepth
                parent = curNode.parent
                while index > 0:
                    parent = parent.parent
                    index -= 1
                node.nodeName = '{%s/%02d}' % (parent.nodeName[1:-1], len(parent.children))
                parent.append(node)
            pass # if - elif - elif - else
            curNode = node
            depth = curDepth
        pass # for line in txts
        return visualTree
    pass # def parseVisualTree(txt)

pass # class VisualTree(object)

def parseFiles():
    '''
    Parse all test case files
    Split DomTree, LayerTree and BlockTree into different files
    '''
    for i in range(6, 10):
        path = os.path.join('databases', 'Subset%02d' % (i+1))
        files = os.listdir(path)
        files.sort()
        for f in files:
            if f[-4:] == '.png' or f[-7:] == '-DT.txt' or f[-7:] == '-LT.txt' or f[-7:] == '-BT.txt':
                continue
            if i == 6 and int(f[:-4]) <= 95:
                continue
            splitFile(os.path.join(path, f))
    pass # for i in range(10)
pass # def parseFiles()

def splitFile(filename):
    '''
    Split the data file into merging results, DomTree, LayerTree, and BlockTree
        @param filename:    {String} name of the data file
        @return:            {Tuple} tuple of the target data
    '''
    print 'Parsing: %s' % filename
    f = open(filename, 'r')
    txt = ''
    for line in f:
        txt += line
    f.close()
    data = txt.split('\n\n\n\n\n')
    assert len(data) == 4

    # Parse the mergingResults
    txt = data[0].split('\n\n')
    mrs = []
    for lines in txt:
        mrs.append(lines.splitlines())
#     for i, mr in enumerate(mrs):
#         for j, r in enumerate(mr):
#             print i, j, r
#     pass # for - for

    # Parse the DomTree
    domTree = VisualTree.parseVisualTree(data[1])
    f = open(filename[:-4] + '-DT.txt', 'w')
    f.write(str(domTree))
    f.close()

    # Parse the LayerTree
    layerTree = VisualTree.parseVisualTree(data[2])
    f = open(filename[:-4] + '-LT.txt', 'w')
    f.write(str(layerTree))
    f.close()

    # Parse the BlockTree
    blockTree = VisualTree.parseVisualTree(data[3])
    updateBlockTree(blockTree, filename[:-4] + '.png')
    f = open(filename[:-4] + '-BT.txt', 'w')
    f.write(str(blockTree))
    f.close()

    return mrs, domTree, layerTree, blockTree
pass # def splitFile(filename)

def updateBlockTree(blockTree, imgPath):
    '''
    Update the block tree
    set info to NCD between the render block and white image with same size
    @param blockTree:     {VisualTree} the block tree
    @param imgPath:       {String} the path of the image file
    '''
    
    def updateSubtree(root, img):
        for child in root.children:
            updateSubtree(child, img)
        img.crop((root.left, root.top, root.left + root.width, root.top + root.height)).save('databases/tmp-img1.png')
        Image.new('RGB', (root.width, root.height), '#FFF').save('databases/tmp-img2.png')
        data1 = open('databases/tmp-img1.png', 'rb').read()
        data2 = open('databases/tmp-img2.png', 'rb').read()
        len1 = len(pylzma.compress(data1))
        len2 = len(pylzma.compress(data2))
        root.ncd = str(1.0 * (len(pylzma.compress(data1 + data2)) - min(len1, len2)) / max(len1, len2))
    pass # def updateSubtree(root)
    img = Image.open(imgPath)
    updateSubtree(blockTree.root, img)
pass # def updateBlockTree1()

def treeEditDistance(visualTree1, visualTree2, useNCD):
    '''
    Calculate tree edit distance between two pages' block trees
        https://github.com/timtadh/zhang-shasha/
    @param visualTree1:     {String} the first visual tree
    @param visualTree2:     {String} the second visual tree
    @param useNCD:          {Boolean} True to use NCD as label; False to use node name
    @return:                {Integer} tree edit distance
    '''
    def builupTree(root, useNCD):
        tree = zss.Node(root.ncd[4:root.ncd.find(', ')] if useNCD else root.nodeName)
        for child in root.children:
            tree.addkid(builupTree(child, useNCD))
        return tree
    pass # def builupTree(root)

    t1 = builupTree(visualTree1.root, useNCD)
    t2 = builupTree(visualTree2.root, useNCD)

    return zss.simple_distance(t1, t2)
pass # def treeEditDistance(visualTree1, visualTree2)

def TestcaseTED(case):
    cases = []
    if case == 'DomTree':
        cases = [(1, '-DT.txt')]
    elif case == 'LayerTree':
        cases = [(2, '-LT.txt')]
    elif case == 'BlockTree':
        cases = [(3, '-BT.txt')]
    else:
        cases = [(1, '-DT.txt'), (2, '-LT.txt'), (3, '-BT.txt')]
    pass # if - elif - else
    if os.path.exists('databases/TEDs.txt'):
        os.remove('databases/TEDs.txt')
    for i in range(1):
        path = os.path.join('databases', 'Subset%02d' % (i+1))
        files = os.listdir(path)
        files.sort()
        results = []
        number = 1
        for j, f in enumerate(files):
            if (f[-4:] == '.txt'):              # I only need the file name but not file extension,
                continue                        # so here use PNG and skip TXTs
            result = []
            for k in cases:
                txt = ''
                f = open(os.path.join(path, f[:-4] + k[1]), 'r')
                for line in f:
                    if len(line.strip()) == 0:
                        continue
                    txt += line
                pass # for line in f
                result.append(VisualTree.parseVisualTree(txt))
            pass # for k in cases
            results.append(result)
        pass # for j, f in enumerate(files)
        for j in range(len(results)):
            for k in range(j+1, len(results)):
                text = ''
                for index, c in enumerate(cases):
                    t = datetime.datetime.now()
                    ted = treeEditDistance(results[j][index], results[k][index], True if c[1] == '-BT.txt' else False)
                    text += '%s=%d, time=%s\t' % (c[1], ted, str(datetime.datetime.now() - t))
                pass # for index, c in enumerate(cases)
                text = 'Subset%02d %4d/%4d -- %02d VS %02d:\t%s' % ((i+1), number, 1225, j, k, text)
                number += 1
                print text
                f = open('databases/TEDs.txt', 'a')
                f.write(text[:-1] + '\n')
                f.close()
        pass # for - for
    pass # for i in range(10)
pass # def TestcaseTED()


if __name__ == '__main__':
    parseFiles()        # Split the results into different files, and calculate NCD for block trees
#    TestcaseTED('All')
    pass
pass # if __name__ == '__main__'
