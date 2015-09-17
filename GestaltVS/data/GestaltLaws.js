/**
 * Apply Gestalt Law of All and save result
 */
function getAllLaws(node, mergingResults) {
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
             sameImage(bgImage1, bgImage2);                                                   // Similarity - Bg
      if (!same)
        same = sameColorByCIE2000(JsColor.parseColor(bgColor1), JsColor.parseColor(bgColor2));
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

/**
 * Apply Gestalt Law of Similarity (Bg) and save result
 */
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

/**
 * Apply Gestalt Law of Similarity (text) and save result
 */
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

/**
 * Apply Gestalt Law of Similarity (size) and save result
 */
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

/**
 * Apply Gestalt Law of Common Fate and save result
 */
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

/**
 * Apply Gestalt Law of Continuity and save result
 */
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

