/**
 * Find out if a DOM element is visible or not
 * @param domElement     The DOM element to be checked
 * @returns {Boolean}    True for visible while false for invisible
 */
function isNodeVisible(domElement) {
  // undefined element is invisible
  if (!domElement)
    return false;

  // If any child is visible, then visible
  var child = domElement.firstElementChild;
  while (child) {
    if (isNodeVisible(child))
      return true;
    child = child.nextElementSibling;
  } // while (child)

  // size of 0 is invisible. CSS "display" of "none" is included
  if (domElement.offsetWidth <= 0 || domElement.offsetHeight <= 0)
    return false;

  // CSS "visibility" of "hidden" is invisible. In this condition, size is not 0
  if (document.defaultView.getComputedStyle(domElement).getPropertyValue('visibility') == 'hidden')
    return false;

  // None-transparent element is visible
  var multiMedia = ['IMG', 'VIDEO', 'AUDIO', 'EMBED', 'OBJECT'];
  for (i in multiMedia) 
    if (domElement.tagName == multiMedia[i])
      return true;
  var style = document.defaultView.getComputedStyle(domElement);
  var bgColor = style.getPropertyValue('background-color').toLowerCase().trim();
  var bgImage = style.getPropertyValue('background-image').toLowerCase().trim();
  if (bgColor && bgColor != '' && !JsColor.parseColor(bgColor).isTransparent())
    return true;
  if (bgImage && bgImage != '' && bgImage != 'none')
    return true;

  return false;
} // function isNodeVisible(domElement)

/**
 * Get the XPath of a node
 * @param node           The node to be checked
 * @returns {String}     The XPath string of the node
 */
function getXPath(node) {
  if (!node.parentElement)
    return '/' + node.tagName;
  var index = 0, child = node.parentElement.firstElementChild;
  while (child !== node) {
    child = child.nextElementSibling;
    index ++;
  } // while (child !== node)
  return getXPath(node.parentElement) + '/' + node.tagName + '[' + index + ']';
} // function getXPath(node)


function screeshot(callback) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = function () {
    var canvas = document.createElement('canvas');
    // Deal with the size as follows
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    var ctx = canvas.getContext('2d');
    // Deal with the position as follows
    ctx.drawImage(this, 0, 0);
    if (!callback)
      callback(canvas.toDataURL());
  } // img.onload = function () {...}
} // function screeshot()

/**
 * Useful CSS properties
 */
var properties = [
  // Behavior
  'position',
  // Background
  'background-color',           'background-image',
  // Border
  'border-bottom-color',        'border-bottom-style',         'border-bottom-width',
  'border-left-color',          'border-left-style',           'border-left-width',
  'border-right-color',         'border-right-style',          'border-right-width',
  'border-top-color',           'border-top-style',            'border-top-width',
  'outline-color',              'outline-style',               'outline-width',
  'border-bottom-left-radius',  'border-bottom-right-radius',
  'border-top-left-radius',     'border-top-right-radius',     'box-shadow',
  // Text - paragraph
  'direction',                  'letter-spacing',              'line-height',
  'text-align',                 'text-decoration',             'text-indent',
  'text-transform',             'vertical-align',              'white-space',
  'word-spacing',               'text-overflow',               'text-shadow',
  'word-break',                 'word-wrap',
  // Text - column
  /*'column-count',             '-webkit-column-count',*/      '-moz-column-count',
  /*'column-gap',               '-webkit-column-gap',*/        '-moz-column-gap',
  /*'column-rule-color',        '-webkit-column-rule-color',*/ '-moz-column-rule-color',
  /*'column-rule-style',        '-webkit-column-rule-style',*/ '-moz-column-rule-style',
  /*'column-rule-width',        '-webkit-column-rule-width',*/ '-moz-column-rule-width',
  /*'column-width',             '-webkit-column-width',*/      '-moz-column-width',
  // Text - list
  'list-style-image',           'list-style-position',         'list-style-type',
  // Text - font
  'font-family',                'font-size',                   'font-weight',
  'font-size-adjust',// Only Firefox supports this property
  'font-style',                 'font-variant',                'color'
]; // var properties = [ ... ];

/**
 * Assume all inputs are valid
 * http://www.brucelindbloom.com/index.html?Math.html
 * RGB is sRGB
 * Illuminant D65: xr = 0.95047, yr = 1.00000, zr = 1.08883
 */
function RGBtoLAB(rgb) {
  for (c in rgb) {
    rgb[c] /= 255.0;
    rgb[c] = (rgb[c] > 0.04045) ? Math.pow((rgb[c] + 0.055)/1.055, 2.4) : rgb[c]/12.92;
  } // for (c in rgb)
  var xyz = [(0.4124564 * rgb[0] + 0.3575761 * rgb[1] + 0.1804375 * rgb[2]) / 0.95047,
             (0.2126729 * rgb[0] + 0.7151522 * rgb[1] + 0.0721750 * rgb[2]) / 1.00000,
             (0.0193339 * rgb[0] + 0.1191920 * rgb[1] + 0.9503041 * rgb[2]) / 1.08883];
  for (c in xyz)
    xyz[c] = (xyz[c] > 0.008856) ? Math.pow(xyz[c], 1.0/3.0) : (903.3 * xyz[c] + 16.0) / 116.0;
  return [116.0 * xyz[1] - 16.0, 500.0 * (xyz[0] - xyz[1]), 200.0 * (xyz[1] - xyz[2])];
} // function RGBtoLAB(rgb)

/**
 * Assume all inputs are valid
 * http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
 */
function deltaE_CIE2000(lab1, lab2) {
  var l_avg = (lab1[0] + lab2[0]) / 2.0, l_delta_p = lab2[0] - lab1[0];
  var s_l = Math.pow(l_avg - 50.0, 2.0);
  s_l = 1.0 + (0.015 * s_l) / (Math.sqrt(20.0 + s_l));
  var c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]), c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]);
  var c_avg = Math.pow((c1 + c2) / 2.0, 7.0), g = (1.0 - Math.sqrt(c_avg / (c_avg + Math.pow(25.0, 7.0)))) / 2.0;
  lab1[1] *= (1.0 + g);
  lab2[1] *= (1.0 + g);
  c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]);
  c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]);
  c_avg = (c1 + c2) / 2.0;
  var c_delta_p = c2 - c1, s_c = 1.0 + 0.045 * c_avg;
  var h1 = Math.atan2(lab1[2], lab1[1]) / Math.PI * 180.0;
  if (h1 < 0.0)
    h1 += 360.0;
  var h2 = Math.atan2(lab2[2], lab2[1]) / Math.PI * 180.0;
  if (h2 < 0.0)
    h2 += 360.0;
  var h_delta = h2 - h1, h_avg = (h1 + h2) / 2.0;
  if (Math.abs(h_delta) > 180.0) {
    h_delta = (h2 > h1) ? h_delta - 360.0 : h_delta + 360.0;
    h_avg += 180.0;
  } // if (Math.abs(h_delta) > 180.0)
  var t = 1.0 - 0.17 * Math.cos((h_avg - 30.0) / 180.0 * Math.PI)
              + 0.24 * Math.cos((2.0 * h_avg) / 180.0 * Math.PI)
              + 0.32 * Math.cos((3.0 * h_avg + 6.0) / 180.0 * Math.PI)
              - 0.20 * Math.cos((4.0 * h_avg - 63.0) / 180.0 * Math.PI);
  var h_delta_p = 2.0 * Math.sqrt(c1 * c2) * Math.sin(h_delta / 360.0 * Math.PI);
  var s_h = 1.0 + 0.0015 * c_avg * t;
  var theta_delta = 30.0 * Math.exp(-1.0 * Math.pow((h_avg - 275) / 25.0, 2.0));
  c_avg = Math.pow(c_avg, 7.0);
  var r_c = 2.0 * Math.sqrt(c_avg / (c_avg + Math.pow(25.0, 7.0)));
  var r_t = -1.0 * r_c * Math.sin(2.0 * theta_delta / 180.0 * Math.PI);
  var deltaE = Math.sqrt(Math.pow(l_delta_p / s_l, 2.0) +
                         Math.pow(c_delta_p / s_c, 2.0) +
                         Math.pow(h_delta_p / s_h, 2.0) +
                         r_t * (c_delta_p / s_c) * (h_delta_p / s_h));
  return deltaE;
} // function deltaE_CIE2000(lab1, lab2)

/**
 * Check if two RGB colors are the same after transformed into CIE2000 lAB colors
 * @param color1    {JsColor} The first color (string like "RGB(1, 2, 3)")
 * @param color2    {JsColor} The second color (string like "RGB(1, 2, 3)")
 * @returns         {Boolean} True if they are same or false if not same
 */
function sameColorByCIE2000(color1, color2) {
  if (!color1 && !color2)
    return true;
  if (!color1 || !color2)
    return false;
  var rgb1 = [color1.getRed(), color1.getGreen(), color1.getBlue()];
  var rgb2 = [color2.getRed(), color2.getGreen(), color2.getBlue()];
  return deltaE_CIE2000(RGBtoLAB(rgb1), RGBtoLAB(rgb2)) < 3.3;
} // function sameColorByCIE2000(rgb1, rgb2)

/**
 * Get the BASE64 data of an image from the URL
 * @param url       {String} URL of the image
 * @param callback  {function} Call back function that handle the BASE64 data
 */
function getBase64FromImageUrl(url, callback) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = function () {
    var canvas = document.createElement('canvas');
    // Deal with the size as follows
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext('2d');
    // Deal with the position as follows
    ctx.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL();
    callback(dataURL.replace(/^data:image\/(png|jpg);base64,/, ''));
  } // img.onload = function () {...}
} // function getBase64FromImageUrl(url, callback)

/**
 * Check if two images are the same
 * @param image1    {String} The first image's URL
 * @param image2    {String} The second image's URL
 */
function sameImage(image1, image2, callback) {
  if (image1 == image2) {
    if (callback)
      callback(true);
    return true;
  } // if (image1 == image2)

  getBase64FromImageUrl(image1, function(data) {
    var data1 = data;
    getBase64FromImageUrl(image2, function(data) {
      var data2 = data;
      var len1 = data1.length, len2 = data2.length, max_len = (len1 > len2) ? len1 : len2;
      var data12 = '';
      for (var i = 0; i < max_len; i++) {
        if (i >= len1)
          data12 += String.fromCharCode(0xFF & data2[i].charCodeAt(0));
        else if (i >= len2)
          data12 += String.fromCharCode(data1[i].charCodeAt(0) & 0xFF);
        else
          data12 += String.fromCharCode(data1[i].charCodeAt(0) & data2[i].charCodeAt(0));
      } // for (var i = 0; i < max_len; i++)
      LZMA.compress(data1, 1, function(result1) {
        len1 = result1.length;
        LZMA.compress(data2, 1, function(result2) {
          len2 = result2.length;
          LZMA.compress(data12, 1, function(result12) {
            var len12 = result12.length;
            var ncd = (len1 > len2) ? (1.0 * len12 - len2) / len1 : (1.0 * len12 - len1) / len2;
            callback(ncd == 0.0);
          }, function(percent) {});
        }, function(percent) {});
      }, function(percent) {});
    }); // getBase64FromImageUrl(image2, function(data) {...};
  }); // getBase64FromImageUrl(image1, function(data) {...};
} // function sameImage(image1, image2, callback)

/**
 * Calculate the Hausdorff distance of 2 layer tree nodes
 * @param node1    The first layer tree node
 * @param node2    The second layer tree node
 * @returns        Hausdorff distance of the 2 nodes, or null if any node is null
 */
function normalizedHausdorffDistance(node1, node2) {
  if (!node1 || !node2)
    return null;
  var hd1 = normailizedDistance_AtoB(node1, node2);
  var hd2 = normailizedDistance_AtoB(node2, node1);
  return (hd1 > hd2) ? hd1 : hd2;
} // function normalizedHausdorffDistance(node1, node2)

/**
 * Calculate the distance from node A to node B (Both layer tree nodes)
 * @param nodeA    The first layer tree node
 * @param nodeB    The second layer tree node
 * @returns        Distance from node 1 to node 2, or null if any node is null
 */
function normailizedDistance_AtoB(nodeA, nodeB) {
  var topA = nodeA.top, topB = nodeB.top;
  var leftA = nodeA.left, leftB = nodeB.left;
  var bottomA = topA + nodeA.height, bottomB = topB + nodeB.height;
  var rightA = leftA + nodeA.width, rightB = leftB + nodeB.width;

  var centerXA = nodeA.width / 2 + leftA, centerYA = nodeA.height / 2 + topA;
  var centerXB = nodeB.width / 2 + leftB, centerYB = nodeB.height / 2 + topB;

  if (leftA >= leftB && rightA <= rightB && topA >= topB && bottomA <= bottomB)
    return 0.0;                                                    // A is inside of B

  if (leftA >= leftB && rightA <= rightB)
    if (centerYA  < centerYB)
      return Math.abs(topB - topA) / nodeA.height;
    else
      return Math.abs(bottomA - bottomB) / nodeA.height;
  if (topA >= topB && bottomA <= bottomB)
    if (centerXA < centerXB)
      return Math.abs(leftB - leftA) / nodeA.width;
    else
      return Math.abs(rightA - rightB) / nodeA.width;

  var deltaX, deltaY;
  if (centerXA < centerXB)                                        // B is to the east of A
    deltaX = leftB - leftA;
  else                                                            // B is to the west of A
    deltaX = rightA - rightB;
  if (centerYA < centerYB)                                        // B is to the south of A
    deltaY = topB - topA;
  else                                                            // B is to the north of A
    deltaY = bottomA - bottomB;
  var diagonal = Math.sqrt(nodeA.width * nodeA.width + nodeA.height * nodeA.height);
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY) / diagonal;
} // function normailizedDistance_AtoB(nodeA, nodeB)

/**
 * Merge the two nodes into the merging result list
 * @param mergingResults  merging result list to be updated
 * @param node1           the first node to be merged
 * @param node2           the second node to be merged
 */
function mergeLayerNodes(mergingResults, node1, node2) {
  if (!node2) {
//    for (i in mergingResults) {
//      var list = mergingResults[i];
//      if (node1 == list[list.length - 1]) {
//        console.log('error: existing node -- ' + node2.nodeName);
//        return ;
//      } // if (node == node1)
//    } // for (i in mergingResults)
    mergingResults.push([node1]);
    return ;
  } // if (!node2)

  for (i in mergingResults) {
    var list = mergingResults[i];
    if (node1 == list[list.length - 1]) {
      list.push(node2);
      return ;
    } // for - if
  } // for (i in mergingResults)
  mergingResults.push([node1, node2]);
} // function mergeLayerNodes(mergingResults, node1, node2)

/**
 * Display the merging result: <br />
 *  -- Using CSS: background-color and box-shadow
 */
function updatePage(mergingResults) {
  for (index in mergingResults)
    for (mr in mergingResults[index]) {
      var domNode = mergingResults[index][mr].domNode;
      domNode.style.boxShadow = '0px 0px 3px 5px #666';
      domNode.style.backgroundColor = JsColor.colorNames[index % JsColor.colorNames.length];
    } // for - for
} // function updatePage(mergingResults)

