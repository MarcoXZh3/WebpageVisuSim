'''
http://www.brucelindbloom.com/index.html?Math.html
http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
RGB is sRGB
Illuminant D65: xr = 95.047, yr = 100.000, zr = 108.883

Created on Mar 13, 2015
@author: MarcoXZh
'''

import math, sqlite3, random, os

def RGBtoXYZ(rgb):
    if len(rgb) != 3:
        return None
    
    xyz = [0.0, 0.0, 0.0]
    for i in range(0, len(rgb)):
        xyz[i] = rgb[i] / 255.0
        xyz[i] = math.pow((xyz[i] + 0.055) / 1.055, 2.4) if xyz[i] > 0.04045 else xyz[i] / 12.92
    pass # for i in range(0, len(rgb))
    M = ((0.4124564, 0.3575761, 0.1804375), \
         (0.2126729, 0.7151522, 0.0721750), \
         (0.0193339, 0.1191920, 0.9503041))
    return [100.0 * (M[0][0] * xyz[0] + M[0][1] * xyz[1] + M[0][2] * xyz[2]), \
            100.0 * (M[1][0] * xyz[0] + M[1][1] * xyz[1] + M[1][2] * xyz[2]), \
            100.0 * (M[2][0] * xyz[0] + M[2][1] * xyz[1] + M[2][2] * xyz[2])]
pass # def RGBtoXYZ(*args)

'''
def XYZtoRGB(xyz):
    if len(xyz) != 3:
        return None
    
    M = (( 3.2404542, -1.5371385, -0.4985314), \
         (-0.9692660,  1.8760108,  0.0415560), \
         ( 0.0556434, -0.2040259,  1.0572252))
    rgb = [0.01 * (M[0][0] * xyz[0] + M[0][1] * xyz[1] + M[0][2] * xyz[2]), \
           0.01 * (M[1][0] * xyz[0] + M[1][1] * xyz[1] + M[1][2] * xyz[2]), \
           0.01 * (M[2][0] * xyz[0] + M[2][1] * xyz[1] + M[2][2] * xyz[2])]
    for i in range(0, len(rgb)):
        rgb[i] = 1.055 * math.pow(rgb[i], 1.0 / 2.4) - 0.055 if rgb[i] > 0.0031308 else 12.92 * rgb[i]
        rgb[i] = int(round(rgb[i] * 255.0))
    pass # for i in range(0, len(rgb))
    return rgb
pass # def XYZtoRGB(*args)
'''

def XYZtoLAB(xyz):
    if len(xyz) != 3:
        return None

    xyz_D65 = (95.047, 100.00, 108.883)
    lab = [0.0, 0.0, 0.0]
    for i in range(0, len(xyz)):
        lab[i] = xyz[i] / xyz_D65[i]
        lab[i] = math.pow(lab[i], 1.0 / 3.0) if lab[i] > 0.008856 else (903.3 * lab[i] + 16.0) / 116.0
    pass # for i in range(0, len(xyz))
    return [116.0 * lab[1] - 16.0, 500.0 * (lab[0] - lab[1]), 200.0 * (lab[1] - lab[2])]
pass # def XYZtoLAB(xyz)

'''
def LABtoXYZ(lab):
    if len(lab) != 3:
        return None

    xyz_D65 = (95.047, 100.00, 108.883)
    fy = (lab[0] + 16.0) / 116.0
    fx = lab[1] / 500.0 + fy
    fz = fy - lab[2] / 200.0

    x = math.pow(fx, 3.0)
    if x <= 0.008856:
        x = (116.0 * fx - 16.0) / 903.3
    y = math.pow(fy, 3.0) if lab[0] > 903.3 * 0.008856 else lab[0] / 903.3
    z = math.pow(fz, 3.0)
    if z <= 0.008856:
        z = (116.0 * fz - 16.0) / 903.3;
    return [x * xyz_D65[0], y * xyz_D65[1], z * xyz_D65[2]]
pass # def LABtoXYZ(lab)
'''

def deltaE2000(lab1, lab2):
    assert len(lab1) == 3 and len(lab2) == 3

    l_avg = (lab1[0] + lab2[0]) / 2.0
    l_delta_p = lab2[0] - lab1[0]
    s_l = math.pow(l_avg - 50.0, 2.0)
    s_l = 1.0 + (0.015 * s_l) / (math.sqrt(20.0 + s_l))
    c1 = math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2])
    c2 = math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2])
    c_avg = math.pow((c1 + c2) / 2.0, 7.0)
    g = (1.0 - math.sqrt(c_avg / (c_avg + math.pow(25.0, 7.0)))) / 2.0
    lab1[1] *= (1.0 + g)
    lab2[1] *= (1.0 + g)
    c1 = math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2])
    c2 = math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2])
    c_avg = (c1 + c2) / 2.0
    c_delta_p = c2 - c1
    s_c = 1.0 + 0.045 * c_avg
    h1 = math.atan2(lab1[2], lab1[1]) / math.pi * 180.0
    if h1 < 0.0:
        h1 += 360.0
    h2 = math.atan2(lab2[2], lab2[1]) / math.pi * 180.0
    if h2 < 0.0:
        h2 += 360.0
    h_delta = h2 - h1
    h_avg = (h1 + h2) / 2.0
    if math.fabs(h_delta) > 180.0:
        h_delta = h_delta - 360.0 if h2 > h1 else h_delta + 360.0
        h_avg += 180.0
    # if math.fabs(h_delta) > 180.0
    t = 1.0 - 0.17 * math.cos((h_avg - 30.0) / 180.0 * math.pi) \
            + 0.24 * math.cos((2.0 * h_avg) / 180.0 * math.pi) \
            + 0.32 * math.cos((3.0 * h_avg + 6.0) / 180.0 * math.pi) \
            - 0.20 * math.cos((4.0 * h_avg - 63.0) / 180.0 * math.pi)
    h_delta_p = 2.0 * math.sqrt(c1 * c2) * math.sin(h_delta / 360.0 * math.pi)
    s_h = 1.0 + 0.0015 * c_avg * t
    theta_delta = 30.0 * math.exp(-1.0 * math.pow((h_avg - 275) / 25.0, 2.0))
    c_avg = math.pow(c_avg, 7.0)
    r_c = 2.0 * math.sqrt(c_avg / (c_avg + math.pow(25.0, 7.0)))
    r_t = -1.0 * r_c * math.sin(2.0 * theta_delta / 180.0 * math.pi)
    deltaE = math.sqrt(math.pow(l_delta_p / s_l, 2.0) + math.pow(c_delta_p / s_c, 2.0) + \
                       math.pow(h_delta_p / s_h, 2.0) + r_t * (c_delta_p / s_c) * (h_delta_p / s_h))
    return deltaE
# def deltaE2000(lab1, lab2)

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
                lab = XYZtoLAB(RGBtoXYZ([r, g, b]))
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
        l1, a1, b1 = XYZtoLAB(RGBtoXYZ([r1, g1, b1]))
        l2, a2, b2 = XYZtoLAB(RGBtoXYZ([r2, g2, b2]))
        deltaE = deltaE2000([l1, a1, b1], [l2, a2, b2])
        maxChannel = int(max(math.fabs(r1 - r2), math.fabs(g1 - g2), math.fabs(b1 - b2)))
        euclideanDist = math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
        colorDiffs.append([rgb1, rgb2, l1, a1, b1, l2, a2, b2, deltaE, maxChannel, euclideanDist])
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


if __name__ == '__main__':
    calcColorDifference(1000)
pass # if __name__ == '__main__'
