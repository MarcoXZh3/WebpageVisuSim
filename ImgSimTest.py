'''
Created on Nov 14, 2015

@author: Marco
'''

import os, numpy, datetime, cv2, ssim
from PIL import Image, ImageOps


def openImageFromSubset(subset):
    '''
    Open a subset, return the paths and "Image" object of all image files
    '''
    imgs = os.listdir(subset)
    index = 0
    while index < len(imgs):
        if not imgs[index].endswith('.png'):
            imgs.pop(index)
            index -= 1
        else:
            imgs[index] = os.path.join(subset, imgs[index])
        index += 1
    pass # while index < len(imgs)
    imgs.sort()
    return [(img, Image.open(img)) for img in imgs]
pass # def openImageFromSubset(subset)

def calcSMSE(imageA, imageB):
    '''
    Mean Squared Error:
    https://en.wikipedia.org/wiki/Mean_squared_error

    Reference:
    http://www.pyimagesearch.com/2014/09/15/python-compare-two-images/
    '''
    # the 'Mean Squared Error' between the two images is the
    # sum of the squared difference between the two images;
    # NOTE: the two images must have the same dimension
    img1 = imageA.copy()
    img2 = imageB.copy()
    width = max(img1.size[0], img2.size[0])
    height = max(img1.size[1], img2.size[1])
    if (width, height) != img1.size:
        img1 = img1.resize((width, height))
    if (width, height) != img2.size:
        img2 = img2.resize((width, height))
    img1.save('databases/tmp1.png')
    img2.save('databases/tmp2.png')
    img1 = cv2.imread('databases/tmp1.png')
    img2 = cv2.imread('databases/tmp2.png')
    err = numpy.sum((img1.astype("float") - img2.astype("float")) ** 2)
    err /= float(img1.shape[0] * img1.shape[1])
    # return the MSE, the lower the error, the more "similar"
    # the two images are
    return err
pass # def calcSMSE(imageA, imageB)

def calcSSIM(imageA, imageB):
    '''
    Structural Similarity Measure:
    [1] Z. Wang, A. C. Bovik, H. R. Sheikh and E. P. Simoncelli. Image quality assessment: From error visibility to
        structural similarity. IEEE Transactions on Image Processing, 13(4):600--612, 2004. 
    [2] Z. Wang and A. C. Bovik. Mean squared error: Love it or leave it? - A new look at signal fidelity measures. IEEE
        Signal Processing Magazine, 26(1):98--117, 2009.

    Reference -- ssim:
    http://isit.u-clermont1.fr/~anvacava/code.html
    '''
    try:
        img1 = ImageOps.grayscale(Image.open(imageA)).copy()
        img2 = ImageOps.grayscale(Image.open(imageB)).copy()
        width = max(img1.size[0], img2.size[0])
        height = max(img1.size[1], img2.size[1])
        if (width, height) != img1.size:
            img1 = img1.resize((width, height))
        if (width, height) != img2.size:
            img2 = img2.resize((width, height))
        img1 = numpy.reshape(numpy.array(img1.getdata()), (height, width))
        img2 = numpy.reshape(numpy.array(img2.getdata()), (height, width))
        return ssim.compute_ssim(img1, img2)
    except:
        return None
pass # def calcSSIM(imageA, imageB)


if __name__ == '__main__':
    numSubsets = 10
    for i in range(numSubsets):
        imgs = openImageFromSubset(os.path.join('databases', 'Subset%02d' % (i + 1)))
        f = open(os.path.join('databases', 'ssim-results%02d.txt' % (i+1)), 'w')
        f.close()
        for x in range(len(imgs)):
            for y in range(x+1, len(imgs)):
                path1, img1 = imgs[x]
                path2, img2 = imgs[y]
                print 'subset:', i+1, '--', x+1, y+1, path1, path2

                # Calculate MSE
                vMSE = calcSMSE(img1, img2)
                print vMSE
                f = open(os.path.join('databases', 'mse-results%02d.txt' % (i+1)), 'a')
                strMSE = 'None' if vMSE is None else '%.4f' % vMSE
                f.write('i=%03d\tj=%03d\timg1=%-28s\timg2=%-28s\tmse=%s\n' % \
                        (x, y, path1, path2, strMSE))
                f.close()
                continue

                # Calculate SSIM
                vSSIM = calcSSIM(img1, img2)
                print vSSIM
                f = open(os.path.join('databases', 'ssim-results%02d.txt' % (i+1)), 'a')
                strSSIM = 'None' if vSSIM is None else '%.4f' % vSSIM
                f.write('i=%03d\tj=%03d\timg1=%-28s\timg2=%-28s\tssim=%s\n' % \
                        (x, y, path1, path2, strSSIM))
                f.close()

        pass # for -for
    pass # for i in range(numSubsets)
pass # if __name__ == '__main__'
