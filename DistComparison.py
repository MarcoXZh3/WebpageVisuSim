'''
Created on Dec 14, 2015

@author: MarcoXZh
'''

import random


class Rectangle(object):
    '''
    The rectangle class
    '''

    def __init__(self, left, top, width, height):
        assert type(left) is int and type(top) is int and type(width) is int and type(height) is int
        self.left = left
        self.top = top
        self.height = height
        self.width = width
    pass # def __init__(self, left, top, width, height)

    def getLeft(self):          return self.left
    def getTop(self):           return self.top
    def getRight(self):         return self.left + self.width
    def getBottom(self):        return self.top + self.height
    def getWidth(self):         return self.width
    def getHeight(self):        return self.height
    def getCentroid(self):      return (self.left + 0.5 * self.width, self.top + 0.5 * self.height)

    def __str__(self):
        return 'Rectangle[left=%d, top=%d, width=%d, height=%d]' % (self.left, self.top, self.width, self.height)
    pass # def __str__(self)

    @staticmethod
    def overlaps(rect1, rect2):
        assert type(rect1) is Rectangle and type(rect2) is Rectangle
        if rect1.getLeft() > rect2.getRight() or rect2.getLeft() > rect1.getRight() or \
           rect1.getTop() > rect2.getBottom() or rect2.getTop() > rect1.getBottom():
            return False
        return True
    pass # def overlaps(rect1, rect2)

pass # class Rectangle(object)

def calcEdgeDist(rect1, rect2):
    assert type(rect1) is Rectangle and type(rect2) is Rectangle

    l1, t1, r1, b1 = rect1.getLeft(), rect1.getTop(), rect1.getRight(), rect1.getBottom()
    l2, t2, r2, b2 = rect2.getLeft(), rect2.getTop(), rect2.getRight(), rect2.getBottom()
    hEdgeDist = min([abs(l1 - l2), abs(l1 - r2), abs(r1 - l2), abs(r1 - r2)])
    vEdgeDist = min([abs(t1 - t2), abs(t1 - b2), abs(b1 - t2), abs(b1 - b2)])

    if (l1 > r2 and t1 > b2) or (r1 < l2 and t1 > b2) or (l1 > r2 and b1 < t2) or (r1 < l2 and b1 < t2):
        return max(hEdgeDist, vEdgeDist)
    return min(hEdgeDist, vEdgeDist) * (-1.0 if Rectangle.overlaps(rect1, rect2) else 1.0)
pass # def calcEdgeDist(rect1, rect2)

def calcNormalizedEdgeDist(rect1, rect2):
    assert type(rect1) is Rectangle and type(rect2) is Rectangle

    l1, t1, r1, b1 = rect1.getLeft(), rect1.getTop(), rect1.getRight(), rect1.getBottom()
    l2, t2, r2, b2 = rect2.getLeft(), rect2.getTop(), rect2.getRight(), rect2.getBottom()
    hEdgeDist = min([abs(l1 - l2), abs(l1 - r2), abs(r1 - l2), abs(r1 - r2)])
    vEdgeDist = min([abs(t1 - t2), abs(t1 - b2), abs(b1 - t2), abs(b1 - b2)])

    if (l1 > r2 and t1 > b2) or (r1 < l2 and t1 > b2) or (l1 > r2 and b1 < t2) or (r1 < l2 and b1 < t2):
        relevantLength = 0.5 * (rect1.getWidth() + rect2.getWidth()) if hEdgeDist == max(hEdgeDist, vEdgeDist) else \
                         0.5 * (rect1.getHeight() + rect2.getHeight())
        return max(hEdgeDist, vEdgeDist) / relevantLength
    pass # if (l1 > r2 and t1 > b2) or (r1 < l2 and t1 > b2) or (l1 > r2 and b1 < t2) or (r1 < l2 and b1 < t2)
    relevantLength = 0.5 * (rect1.getWidth() + rect2.getWidth()) if hEdgeDist == min(hEdgeDist, vEdgeDist) else \
                     0.5 * (rect1.getHeight() + rect2.getHeight())
    return min(hEdgeDist, vEdgeDist) / relevantLength * (-1.0 if Rectangle.overlaps(rect1, rect2) else 1.0)
pass # def calcNormalizedEdgeDist(rect1, rect2)

def calcHausdorffDist(rect1, rect2):
    assert type(rect1) is Rectangle and type(rect2) is Rectangle

    def hausdorffDist(a, b):
        l1, t1, r1, b1 = a.getLeft(), a.getTop(), a.getRight(), a.getBottom()
        l2, t2, r2, b2 = b.getLeft(), b.getTop(), b.getRight(), b.getBottom()
        cx1, cy1 = a.getCentroid()
        cx2, cy2 = b.getCentroid()

        if l1 >= l2 and r1 <= r2 and t1 >= t2 and b1 <= b2:             # inside
            return 0.0
        deltaX = l2 - l1 if cx1 < cx2 else r2 - r1
        deltaY = t2 - t1 if cy1 < cy2 else b2 - b1
        if l1 >= l2 and r1 <= r2:                                       # north/south
            return 1.0 * abs(deltaY)
        if t1 >= t2 and b1 <= b2:                                       # west/east
            return 1.0 * abs(deltaX)
        return (deltaX ** 2.0 + deltaY ** 2.0) ** 0.5                   # corners
    pass # def hausdorffDist(rect1, rect2)

    return max(hausdorffDist(rect1, rect2), hausdorffDist(rect2, rect1))
pass # def calcHausdorffDist(rect1, rect2)

def calcNormalizedHausdorffDist(rect1, rect2):
    assert type(rect1) is Rectangle and type(rect2) is Rectangle

    def normalizedHausdorffDist(a, b):
        l1, t1, r1, b1 = a.getLeft(), a.getTop(), a.getRight(), a.getBottom()
        l2, t2, r2, b2 = b.getLeft(), b.getTop(), b.getRight(), b.getBottom()
        cx1, cy1 = a.getCentroid()
        cx2, cy2 = b.getCentroid()

        if l1 >= l2 and r1 <= r2 and t1 >= t2 and b1 <= b2:             # inside
            return 0.0
        deltaX = l2 - l1 if cx1 < cx2 else r2 - r1
        deltaY = t2 - t1 if cy1 < cy2 else b2 - b1
        if l1 >= l2 and r1 <= r2:                                       # north/south
            return 1.0 * abs(deltaY) / a.getHeight()
        if t1 >= t2 and b1 <= b2:                                       # west/east
            return 1.0 * abs(deltaX) / a.getWidth()
        diagonal = (a.getWidth() ** 2.0 + a.getHeight() ** 2.0) ** 0.5
        return (deltaX ** 2.0 + deltaY ** 2.0) ** 0.5 / diagonal        # corners
    pass # def normalizedHausdorffDist(a, b)

    return max(normalizedHausdorffDist(rect1, rect2), normalizedHausdorffDist(rect2, rect1))
pass # def calcNormalizedHausdorffDist(rect1, rect2)

def calcCentroidDist(rect1, rect2):
    assert type(rect1) is Rectangle and type(rect2) is Rectangle
    cx1, cy1 = rect1.getCentroid()
    cx2, cy2 = rect2.getCentroid()
    return ((cx1 - cx2) ** 2.0 + (cy1 - cy2) ** 2.0) ** 0.5
pass # def calcCentroidDist(rect1, rect2)

def calcNormalizedCentroidDist(rect1, rect2):
    assert type(rect1) is Rectangle and type(rect2) is Rectangle
    cx1, cy1 = rect1.getCentroid()
    cx2, cy2 = rect2.getCentroid()

    relevantLength = (0.5 * (rect1.getWidth() + rect2.getWidth())) if (cx1==cx2 or abs(cy1-cy2)/abs(cx1-cx2) < 1.0) \
                else (0.5 * (rect1.getHeight() + rect2.getHeight()))
    print relevantLength
    return ((cx1 - cx2) ** 2.0 + (cy1 - cy2) ** 2.0) ** 0.5 / relevantLength
pass # def calcNormalizedCentroidDist(rect1, rect2)

def testDistances(debug=False):
    number = 1000

    # Generate test cases Part 1: fix size, random position
    cases1, cases2 = [], []
    num = 0
    while num < 10:
        width1, height1 = random.randint(10, 100), random.randint(10, 100)
        width2, height2 = random.randint(10, 100), random.randint(10, 100)
        x1, y1 = random.randint(0, 800), random.randint(0, 800)
        x2, y2 = random.randint(0, 100), random.randint(0, 100)
        for j in range(number/10):
            delta = j * (8000 / number)
            cases1.append([x1, y1, width1, height1, x2, y2 + delta, width2, height2])
            cases2.append([x1, y1, width1, height1, x2 + delta, y2, width2, height2])
        pass # for j in range(number/10)
        num += 1
    pass # while num < 10

    # Generate test cases Part 2: fix position, random size
    testcases = cases1 + cases2
    num = 0
    while num < (number/10):
        x1, y1 = random.randint(0, 800), random.randint(0, 800)
        x2, y2 = random.randint(0, 800), random.randint(0, 800)
        width1, height1 = random.randint(10, 100), random.randint(10, 100)
        width2, height2 = random.randint(10, 100), random.randint(10, 100)
        for j in range(10):
            width1 += random.randint(0, 50)
            height1 += random.randint(0, 50)
            width2 += random.randint(0, 50)
            height2 += random.randint(0, 50)
            testcases.append([x1, y1, width1, height1, x2, y2, width2, height2])
        pass # for j in range(10)
        num += 1
    pass # while num < (number/10)

    # Calculate the distances and output the results
    f = open('databases/distTestcases.txt', 'w')
    f.write('L1\tT1\tW1\tH1\tL2\tT2\tW2\tH2\tCD\tNCD\tED\tNED\tHD\tNHD\n')
    for x1, y1, width1, height1, x2, y2, width2, height2 in testcases:
        rect1, rect2 = Rectangle(x1, y1, width1, height1), Rectangle(x2, y2, width2, height2)
        cd = calcCentroidDist(rect1, rect2)
        ncd = calcNormalizedCentroidDist(rect1, rect2)
        ed = calcEdgeDist(rect1, rect2)
        ned = calcNormalizedEdgeDist(rect1, rect2)
        hd = calcHausdorffDist(rect1, rect2)
        nhd = calcNormalizedHausdorffDist(rect1, rect2)
        f.write('%d\t%d\t%d\t%d\t%d\t%d\t%d\t%d\t%.4f\t%.4f\t%.4f\t%.4f\t%.4f\t%.4f\n' % \
                (x1, y1, width1, height1, x2, y2, width2, height2, cd, ncd, ed, ned, hd, nhd ))
    pass # for x1, y1, width1, height1, x2, y2, width2, height2 in testcases
    if debug:
        g = open('databases/distTestcases.svg', 'w')
        g.write('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="1000">\n')
        g.write('  <rect width="1000" height="1000" />\n\n')
        for c in testcases:
            g.write('  <rect x="%d" y="%d" width="%d" height="%d" />\n' % (c[0], c[1], c[2], c[3]))
            g.write('  <rect x="%d" y="%d" width="%d" height="%d" />\n' % (c[4], c[5], c[6], c[7]))
            g.write('  <line x1="%d" y1="%d" x2="%d" y2="%d" />\n\n'  % \
                    (c[0]+0.5*c[2], c[1]+0.5*c[3], c[4]+0.5*c[6], c[5]+0.5*c[7]))
        pass # for c in testcases
        g.write('  <style> line {stroke:black;} rect{fill:white; stroke:black;} </style>\n')
        g.write('</svg>\n')
        g.close()
    pass # if debug
pass # def testDistances(debug=False)


if __name__ == '__main__':
    testDistances()
pass # if __name__ == '__main__'
