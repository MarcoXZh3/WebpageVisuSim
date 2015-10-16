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
  if (bgColor && bgColor != '' && bgColor != 'transparent' && chroma(bgColor).alpha() > 0.0)
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
 * Compare two colors to see if they are same under certain comparison scheme
 */
function sameColor(color1, color2, scheme) {
  if (color1 == color2)
    return true;
  if (color1 == 'transparent' || color2 == 'transparent')
    return false;
  var c1 = chroma(bgColor1), c2 = chroma(bgColor2);
  if (scheme == 'RGB') {
    var rgb1 = c1.rgb(), rgb2 = c2.rbg();
    return 10 > Math.sqrt(Math.pow(rgb1[0]-rgb2[0], 2) + Math.pow(rgb1[1]-rgb2[1], 2) + Math.pow(rgb1[2]-rgb2[2], 2));
  } else { // scheme is CIELAB
    var lab1 = c1.lab(), lab2 = c2.lab();
    return scheme == 'CIELAB-Standard' ?
           5.0 > DeltaE.getDeltaE00({L: lab1[0], A: lab1[1], B: lab1[2]}, {L: lab2[0], A: lab2[1], B: lab2[2]}) :
           3.3 > DeltaE.getDeltaE00({L: lab1[0], A: lab1[1], B: lab1[2]}, {L: lab2[0], A: lab2[1], B: lab2[2]});
  } // else - if (scheme == 'RGB')
} // function sameColor(color1, color2, scheme)

/**
 * Apply Gestalt Law of All and save result
 */
function getAllLaws(node, mergingResults, colorScheme, imgScheme) {
  if (node.childCount == 0)
    return ;

  var hDistances = [], sames = [];
  for (var i = 0; i < node.childCount; i++) {
    getAllLaws(node.children[i], mergingResults);
    if (i == node.childCount - 1)
      continue ;
    var child1 = node.children[i], child2 = node.children[i + 1];
    var same = (child1.height == child2.height && child1.width == child2.width);              // Similarity - Sz
    if (!same)
      same = (child1.left == child2.left || child1.top == child2.top ||                       // Continuity
              child1.right == child2.right || child1.bottom == child2.bottom);
    if (!same)
      same = (child1.css['position'] == child2.css['position']);                              // Common Fate
    if (!same) {
      var bgColor1 = child1.css['background-color'], bgImage1 = child1.css['background-image'];
      var bgColor2 = child2.css['background-color'], bgImage2 = child2.css['background-image'];
      same = (bgImage1 == 'none' && bgImage2 == 'none') || (bgImage1 == '' && bgImage2 == '') ||
             sameImage(bgImage1, bgImage2, imgScheme);                                        // Similarity - Bg
      if (!same)
        same = sameColor(bgColor1, bgColor2, colorScheme);
    } // if (!same)
    if (!same) {
      var index = 0;
      for (; index < 29; index++)
        if (child1.css[properties[23 + index]] != child2.css[properties[23 + index]])
          break ;
      same = (index >= 29 && sameColorByCIE2000(child1.css['color'], child2.css['color']));   // Similarity - Txt
    } // if (!same)
    sames.push(same);
    hDistances.push(normalizedHausdorffDistance(child1, child2));
  } // for (var i = 0; i < node.childCount; i++)

  // Check all laws
//  if(hDistances.length != node.childCount - 1)
//    console.log('error: ' + node.domXPath);
  if (hDistances.length != 0) {
    var avg = 0.0;
    for (var i = 0; i < hDistances.length; i++)
      avg += hDistances[i];
    avg /= hDistances.length;
    for (var i = 0; i < hDistances.length; i++)
      if (sames[i] || hDistances[i] <= avg)
        mergeLayerNodes(mergingResults, node.children[i], node.children[i+1]);
  } // if (hDistances.length != 0)
  else
    mergeLayerNodes(mergingResults, node.children[0]);
} // function getAllLaws(node, mergingResults)

/**
 * Apply Gestalt Law of Proximity and save result
 */
 /*
function getProximity(node, mergingResults) {
  if (node.childCount == 0)
    return ;

  var hDistances = [];
  var avg = 0.0;
  for (var i = 0; i < node.childCount; i++) {
    getProximity(node.children[i], mergingResults);
    if (i == node.childCount - 1)
      continue ;
    var hDistance = normalizedHausdorffDistance(node.children[i], node.children[i+1]);
    avg += hDistance;
    hDistances.push(hDistance);
  } // for (var i = 0; i < node.childCount; i++)
  if (hDistances.length > 0) {
    avg /= hDistances.length;
    for (var i = 0; i < hDistances.length; i++)
      if (hDistances[i] <= avg)
        mergeLayerNodes(node.children[i], node.children[i+1], mergingResults);
  } // if (hDistances.length > 0)
} // function getProximity(node, mergingResults)
*/

/**
 * Apply Gestalt Law of Similarity (Bg) and save result
 */
/*
function getSimBg(node, mergingResults) {
  if (node.childCount == 0)
    return ;

  for (var i = 0; i < node.childCount; i++) {
    if (i != 0) {
      var previous = node.children[i - 1];
      var current = node.children[i];
      var bgColor1 = previous.css['background-color'], bgColor2 = current.css['background-color'];
      var bgImage1 = previous.css['background-image'], bgImage2 = current.css['background-image'];
      if (bgImage1 != 'none' && bgImage2 != 'none')
        sameImage(bgImage1, bgImage2, function(same) {
          if (same)
            mergeLayerNodes(previous, current, mergingResults);
        }); // sameImage(bgImage1, bgImage2, function(same) {...});
      else if (bgImage1 == 'none' && bgImage2 == 'none' && sameColorByCIE2000(bgColor1, bgColor2))
        mergeLayerNodes(previous, current, mergingResults);
    } // if (i != 0)
    getSimBg(node.children[i], mergingResults);
  } // for (var i = 0; i < node.childCount; i++)
} // function getSimBg(node, mergingResults)
*/

/**
 * Apply Gestalt Law of Similarity (text) and save result
 */
/*
function getSimTxt(node, mergingResults) {
  if (node.childCount == 0)
    return ;

  for (var i = 0; i < node.childCount; i++) {
    if (i != 0) {
      var previous = node.children[i - 1];
      var current = node.children[i];
      var j = 0;
      for (; j < 29; j++)
        if (previous.css[properties[23 + j]] != current.css[properties[23 + j]])
          break ;
      if (j >= 29 && sameColorByCIE2000(previous.css['color'], current.css['color']))
        mergeLayerNodes(previous, current, mergingResults);
    } // if (i != 0)
    getSimTxt(node.children[i], mergingResults);
  } // for (var i = 0; i < node.childCount; i++)
} // function getSimTxt(node, mergingResults)
*/

/**
 * Apply Gestalt Law of Similarity (size) and save result
 */
/*
function getSimSz(node, mergingResults) {
  if (node.childCount == 0)
    return ;

  for (var i = 0; i < node.childCount; i++) {
    if (i != 0) {
      var previous = node.children[i - 1];
      var current = node.children[i];
      if (previous.height == current.height && previous.width == current.width)
        mergeLayerNodes(previous, current, mergingResults);
    } // if (i != 0)
    getSimSz(node.children[i], mergingResults);
  } // for (var i = 0; i < node.childCount; i++)
} // function getSimSz(node, mergingResults)
*/

/**
 * Apply Gestalt Law of Common Fate and save result
 */
/*
function getCommonFate(node, mergingResults) {
  if (node.childCount == 0)
    return ;

  for (var i = 0; i < node.childCount; i++) {
    if (i != 0) {
      var previous = node.children[i - 1];
      var current = node.children[i];
      if (previous.css['position'] == current.css['position'])
        mergeLayerNodes(previous, current, mergingResults);
    } // if (i != 0)
    getCommonFate(node.children[i], mergingResults);
  } // for (var i = 0; i < node.childCount; i++)
} // function getCommonFate(node, mergingResults)
*/

/**
 * Apply Gestalt Law of Continuity and save result
 */
/*
function getContinuity(node, mergingResults) {
  if (node.childCount == 0)
    return ;

  for (var i = 0; i < node.childCount; i++) {
    if (i != 0) {
      var previous = node.children[i - 1];
      var current = node.children[i];
      if (previous.left == current.left || previous.top == current.top ||
          previous.right == current.right || previous.bottom == current.bottom)
        mergeLayerNodes(previous, current, mergingResults);
    } // if (i != 0)
    getContinuity(node.children[i], mergingResults);
  } // for (var i = 0; i < node.childCount; i++)
} // function getContinuity(node, mergingResults)
*/

/**
 * Merge the two nodes into the merging result list
 * @param mergingResults  merging result list to be updated
 * @param node1           the first node to be merged
 * @param node2           the second node to be merged
 */
function mergeLayerNodes(mergingResults, node1, node2) {
  if (!node2) {
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
  for (index in mergingResults) {
    var color = chroma.random().name();
    for (mr in mergingResults[index]) {
      var domNode = mergingResults[index][mr].domNode;
      domNode.style.boxShadow = '0px 0px 3px 5px #666';
      domNode.style.backgroundColor = color;
    } // for (mr in mergingResults[index])
  } // for (index in mergingResults)
} // function updatePage(mergingResults)
