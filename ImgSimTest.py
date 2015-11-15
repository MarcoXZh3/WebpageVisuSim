'''
Created on Nov 14, 2015

@author: Marco
'''

import os, numpy, datetime, ssim, SSIM_Index
from PIL import Image, ImageOps


def openImageFromSubset(subset):
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
    return [(img, ImageOps.grayscale(Image.open(img))) for img in imgs]
pass # def openImageFromSubset(subset)

def MeanSquaredError(img1, img2):
    '''
    Mean Squared Error
    https://en.wikipedia.org/wiki/Mean_squared_error
    http://www.pyimagesearch.com/2014/09/15/python-compare-two-images/
    Assume the two images are in same size
    '''
    pass
pass # def MeanSquaredError(img1, img2)

def StructuralSimilarity(img1, img2):
    '''
    Structural Similarity Measure
    [1] Z. Wang, A. C. Bovik, H. R. Sheikh and E. P. Simoncelli. Image quality assessment: From error visibility to
        structural similarity. IEEE Transactions on Image Processing, 13(4):600--612, 2004. 
    [2] Z. Wang and A. C. Bovik. Mean squared error: Love it or leave it? - A new look at signal fidelity measures. IEEE
        Signal Processing Magazine, 26(1):98--117, 2009.
    http://www.pyimagesearch.com/2014/09/15/python-compare-two-images/
    '''
    pass
pass # def StructuralSimilarity(img1, img2)

def mse(imageA, imageB):
    # the 'Mean Squared Error' between the two images is the
    # sum of the squared difference between the two images;
    # NOTE: the two images must have the same dimension
    err = numpy.sum((imageA.astype("float") - imageB.astype("float")) ** 2)
    err /= float(imageA.shape[0] * imageA.shape[1])
    
    # return the MSE, the lower the error, the more "similar"
    # the two images are
    return err

def analyze(imgs1, imgs2):
    '''
    SSIM: http://isit.u-clermont1.fr/~anvacava/code.html
    '''
    ssims = []
    for i, (path1, img01) in enumerate(imgs1):
        for j, (path2, img02) in enumerate(imgs2):
            img1 = img01.copy()
            img2 = img02.copy()
            print i, j, path1, path2
            t0 = datetime.datetime.now()
            v = None
            try:
                width = max(img1.size[0], img2.size[0])
                height = max(img1.size[1], img2.size[1])
                if (width, height) != img1.size:
                    img1 = img1.resize((width, height))
                if (width, height) != img2.size:
                    img2 = img2.resize((width, height))
                img1 = numpy.reshape(numpy.array(img1.getdata()), (height, width))
                img2 = numpy.reshape(numpy.array(img2.getdata()), (height, width))
#                 v = ssim.compute_ssim(img1, img2)
                v = SSIM_Index.compute_ssim(img1, img2, 1)
                ssims.append(v)
            except:
                pass
            finally:
                t1 = datetime.datetime.now()
                print t1 - t0, v
            pass # try - except - finally
    pass # for - for
    for i, v in enumerate(ssims):
        print i, len(ssims), v
    return ssims
pass # def analyze(imgs1, imgs2)


if __name__ == '__main__':
    numSubsets = 2
    for i in range(numSubsets):
        subset1 = os.path.join('databases', 'Subset%02d' % (i + 1))
        imgs1 = openImageFromSubset(subset1)
        for j in range(i+1, numSubsets):
            subset2 = os.path.join('databases', 'Subset%02d' % (j + 1))
            imgs2 = openImageFromSubset(subset2)
#             for x, img in enumerate(imgs1):
#                 print x, len(imgs1), type(img[1]), img[1].size, img[0]
#             for x, img in enumerate(imgs2):
#                 print x, len(imgs1), type(img[1]), img[1].size, img[0]
            results = analyze(imgs1, imgs2)
            print results





        pass # for j in range(i+1, numSubsets)
    pass # for i in range(numSubsets)
    pass
pass # if __name__ == '__main__'
