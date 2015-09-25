'''
Created on Sep 17, 2015

@author: MarcoXZh
'''

import os, re, random, shutil

def cleanUpScreenshots(path):
    files = os.listdir(path)
    files.sort()
    index = 0
    for f in files:
        name = f[:-4]
        if (name + '.png') in files and (name + '.txt') in files:
            continue
        os.rename(path + '/' + f, path + '/' + str(index) + f[-4:])
        index += 1
        pass 
    pass # for f in files
    print index
pass # def cleanUpScreenshots(path)

def renameFiles(path):
    files = os.listdir(path)
    files.sort()
    index = 1
    for i in range(0, len(files)):
        print '%03d%s\t%s' % (index, files[i][-4:], files[i][:-4])
        os.rename('%s/%s' % (path, files[i]),
                  '%s/%03d%s' % (path, index, files[i][-4:]))
        if i % 2 == 1:
            index += 1
        pass
    pass # for i in range(0, len(files))
pass # def renameFiles(path)

def reformatTXT(path):
    files = os.listdir(path)
    files.sort()
    for i, f in enumerate(files):
        if f[-4:] != '.txt':
            continue
        txt = open('%s/%s' % (path, f), 'r')
        lines = []
        for line in txt:
            lines.append(line.strip())
        txt.close()
        line = lines[0].replace('<br/>', '\n').replace('&nbsp;', ' ').replace('&nbsp', '')
        txt = open('%s/%s' % (path, f), 'w')
        txt.write(line)
        txt.close()
        print i
    pass # for f in files
pass # def reformatTXT(path)

def createLinkList(path):
    files = os.listdir(path)
    files.sort()
    urls = set()
    linkList = open('databases/urls.txt', 'w')
    for f in files:
        if f[-4:] == '.png':
            continue
        txt = open('%s/%s' % (path, f), 'r')
        for line in txt:
            if 'DomTree' not in line:
                continue
            linkList.write(line.split('\'')[1] + '\n')
            urls.add(line.split('\'')[1])
            break
        pass # for line in txt
        txt.close()
    pass # for f in files
    print len(urls)
    linkList.close()
pass # def createLinkList(path)

def verityName(path):
    files = os.listdir(path)
    files.sort()
    count = 0
    for f in files:
        if (f[-4:] == '.png'):
            continue
        txt = open(os.path.join(path, f))
        for line in txt:
            if line.startswith('=='):
                t = line.split('\'')[1]
                t = re.sub('/', '%E2', t)
                t = re.sub(':', '%3A', t)
                t = re.sub('\?', '%3F', t)
                if f[:-4] != t:
                    count += 1
                    print count, t, f
                    break;
#                 if name.replace('\/', '%E2').replace(':', '%3A').replace('\?', '%3F')
             
        pass # for line in txt
        txt.close()
    pass # for f in files
    print 'final verification: ', count
pass # def verityName(path)

def randomSubsets(path):
    numbers = [x+1 for x in range(500)]
    random.shuffle(numbers)
    for i in range(10):
        subset = os.path.join(path, 'Subset%02d' % (i+1))
        if not os.path.exists(subset):
            os.mkdir(subset)
        for j in range(50):
            index = i * 50 + j
            print index, numbers[index]
            shutil.copyfile(os.path.join(path, '%03d.png' % numbers[index]), \
                            os.path.join(subset, '%03d.png' % numbers[index]))
            shutil.copyfile(os.path.join(path, '%03d.txt' % numbers[index]), \
                            os.path.join(subset, '%03d.txt' % numbers[index]))
        pass # for j in range(50)
        print subset
    pass # for i in range(10)
pass # def randomSubsets(path)


if __name__ == '__main__':
    path = os.path.join(os.getcwd(), 'databases', 'Screenshots')
#     cleanUpScreenshots(path)
#     renameFiles(path)
#     createLinkList(path)
#     reformatTXT(path)
#     verityName(path)
#     randomSubsets(path)
pass # if __name__ == '__main__'
