'''
http://www.brucelindbloom.com/index.html?Math.html
http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
RGB is sRGB
Illuminant D65: xr = 95.047, yr = 100.000, zr = 108.883

Created on Mar 13, 2015
@author: MarcoXZh
'''

import math, sqlite3, random, os, json
from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie2000


def createDatabase():
    conn = sqlite3.connect('databases/colorTest.db')
    c = conn.cursor()
    index = 0
    for r in range(0, 256):
        c.execute('CREATE TABLE colors%03d (' + \
                  'idx int primary key, Green smallint, Blue smallint, L real, a real, b real);' % r)
        for g in range(0, 256):
            records = []
            for b in range(0, 256):
                lab = convert_color(sRGBColor(r / 255.0, g / 255.0, b / 255.0), LabColor)
                records.append((index, g, b, lab[0], lab[1], lab[2]))
                index += 1
                print '%8d -- %03d %03d %03d' % (index, r, g, b)
            pass # for b in range(0, 256)
            c.executemany('INSERT INTO colors%03d VALUES (?, ?, ?, ?, ?, ?);' % r, records)
            conn.commit()
            print '=========================='
        pass # for g in range(0, 256)
    pass # for r in range(0, 256)
    c.close()
pass # def createDatabase()

def calcColorDifference(numbers):
    colors1 = set()
    while len(colors1) < numbers:
        colors1.add(random.randint(0, 16777215))             # 256^3 - 1
    colors1 = list(colors1)
    colors2 = set()
    while len(colors2) < numbers:
        colors2.add(random.randint(0, 16777215))             # 256^3 - 1
    colors2 = list(colors2)
    filename = os.path.join('databases', 'colorDiffs.txt')
    if (os.path.exists(filename)):
        os.remove(filename)

    colorDiffs = [];
    for i in range(numbers):
        rgb1, rgb2 = colors1[i], colors2[i]
        r1, g1, b1 = rgb1 / 65536, rgb1 % 65536 / 256, rgb1 % 256
        r2, g2, b2 = rgb2 / 65536, rgb2 % 65536 / 256, rgb2 % 256
        lab1 = convert_color(sRGBColor(r1 / 255.0, g1 / 255.0, b1 / 255.0), LabColor)
        lab2 = convert_color(sRGBColor(r2 / 255.0, g2 / 255.0, b2 / 255.0), LabColor)
        deltaE = delta_e_cie2000(lab1, lab2)
        maxChannel = int(max(math.fabs(r1 - r2), math.fabs(g1 - g2), math.fabs(b1 - b2)))
        euclideanDist = math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
        colorDiffs.append([rgb1, rgb2, lab1.lab_l, lab1.lab_a, lab1.lab_b, \
                           lab2.lab_l, lab2.lab_a, lab2.lab_b, deltaE, maxChannel, euclideanDist])
        print i
    pass # for rgb in rgbs
    digits = int(math.log(numbers, 10)) + 1
    f = open(filename, 'w')
    f.write('Number\tColor1\tColor2\tDeltaE\tMaxChnl\tEucDist\n')
    for i, cd in enumerate(colorDiffs):
        f.write('%d/%d\t#%06X\t#%06X\t%.4f\t%d\t%.4f\n' % (i+1, numbers, cd[0], cd[1], cd[-3], cd[-2], cd[-1]))
        print ('%%%dd/%%%dd\t#%%06X\t#%%06X\t%%8.4f\t%%d\t%%8.4f' % (digits, digits)) % \
              (i+1, numbers, cd[0], cd[1], cd[-3], cd[-2], cd[-1])
    pass # for i, cd in enumerate(colorDiffs)
    f.close()
pass # def calcColorDifference(numbers)

def splitColorDiferrence():
    f = open(os.path.join('databases', 'colorDiffs.txt'), 'r')
    index = -1
    colorPairs = []
    for line in f:
        if index >= 0:
            values = line.strip().split()
            colorPairs.append({'index': index, 'color1': values[1], 'color2': values[2], \
                     'deltaE': float(values[3]), 'maxChnl': int(values[4]), 'EucDist': float(values[5])})
        pass # if index != 0
        index += 1
    pass # for line in f
    print colorPairs[200]
#     cps = sorted(colorPairs, key=lambda x: x['deltaE'])
pass # def splitColorDiferrence()

def analyzeSurveyResults(path):
    files = os.listdir(path)
    files.sort();
    resultsRGB, resultsLAB = [], []
    for f in files:
        resultRgb, resultLab = {}, {}
        txt = open(os.path.join(path, f), 'r')
        for line in txt:
            cps = json.loads(line.strip())
            assert len(cps) == 6
            tolerance = math.ceil(cps[0]['eucDist']) if cps[-1]['isRGB'] else \
                        math.ceil(cps[0]['deltaE'] * 10) / 10.0
            for i in range(1, 5):
                assert tolerance == math.ceil(cps[0]['eucDist']) if cps[-1]['isRGB'] else \
                                    math.ceil(cps[0]['deltaE'] * 10) / 10.0
            result = resultRgb if cps[-1]['isRGB'] else resultLab
            tolerance = '%.1f' % tolerance
            result[tolerance] = 1 if tolerance not in result else 1 + result[tolerance]
        pass # for line in txt
        resultsRGB.append(resultRgb)
        resultsLAB.append(resultLab)
        txt.close()
    pass # for f in files
    for r in resultsLAB:
        print r
    print 
    for r in resultsRGB:
        print r
pass # def analyzeSurveyResults(path)


if __name__ == '__main__':
#     calcColorDifference(100000)
#     splitColorDiferrence()
    analyzeSurveyResults(os.path.join('databases', 'ColorTest'))
    pass
pass # if __name__ == '__main__'
