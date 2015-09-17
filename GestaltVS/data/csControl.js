/**
 * Register event handlers to the menu items
 */
self.port.on('load', function(menuItems) {
  // Setup menu items
  while (document.body.firstElementChild)
    document.body.removeChild(document.body.firstElementChild);
  menuItems.map(function(mi) {
    var li = document.createElement('li');
    li.id = 'li-' + mi.id.toLowerCase();
    document.body.appendChild(li);

    // Menu item interface
    var img = document.createElement('img');
    img.id = 'img-' + mi.id.toLowerCase();
    img.src = mi.img;
    li.appendChild(img);
    var span = document.createElement('span');
    span.id = 'span-' + mi.id.toLowerCase();
    span.innerHTML = mi.text;
    li.appendChild(span);
    var code = document.createElement('code');
    code.innerHTML = mi.keyText;
    li.appendChild(code);
    var hr = document.createElement('hr');
    hr.className = mi.separator ? 'mi-sept' : ''
    document.body.appendChild(hr);

    // Menu item event handler
    li.onclick = function() {
      self.port.emit(mi.id);
    }; // li.onclick = function() { ... };
  }); // menuItems.map(function(mi) {});
}); // self.port.on('load', function(menuItems) {});


/**
 * Register event handlers of the menu item - "LayerTree"
 */
self.port.on('request-LayerTree', function(startTime) {
  var layerTree = new LayerTree(new LayerTreeNode(document.body, document.body.tagName), document.URL);
  self.port.emit('response-LayerTree', new Date().getTime() - startTime, layerTree.toString());
}); // self.port.on('request-LayerTree', function(startTime) { ... });

/**
 * Register event handlers of the menu item - "GestaltMerging"
 */
self.port.on('request-GestaltMerging', function(startTime) {
  var layerTree = new LayerTree(new LayerTreeNode(document.body, document.body.tagName), document.URL),
      mergingResults = [];
  getAllLaws(layerTree.root, mergingResults);
  updatePage(mergingResults);
  var str = '';
  for (i in mergingResults) {
  for (j in mergingResults[i])
    str += mergingResults[i][j].toString() + '<br/>';
  str += '<br/>';
  } // for (i in mergingResults)
  self.port.emit('response-GestaltMerging', new Date().getTime() - startTime, str);
}); // self.port.on('request-GestaltMerging', function(startTime) { ... });

/**
 * Register event handlers of the menu item - "BlockTree"
 */
self.port.on('request-BlockTree', function(startTime) {
  var layerTree = new LayerTree(new LayerTreeNode(document.body, document.body.tagName), document.URL),
      mergingResults = [];
  getAllLaws(layerTree.root, mergingResults);
  updatePage(mergingResults);
  var blockTree = new BlockTree(new BlockTreeNode([layerTree.root], '/[BODY]'), document.URL);
  blockTree.buildUpTree(mergingResults);
  self.port.emit('response-BlockTree', new Date().getTime() - startTime, blockTree.toString());
}); // self.port.on('request-BlockTree', function(startTime) { ... });

/**
 * Register event handlers of the menu item - "AnalyzePage"
 */
self.port.on('request-AnalyzePage', function(startTime) {
  var domTree = new DomTree(new DomTreeNode(document.body), document.URL);
  var layerTree = new LayerTree(new LayerTreeNode(document.body, document.body.tagName), document.URL);
  var mergingResults = [];
  getAllLaws(layerTree.root, mergingResults);
  var str = '';
  for (i in mergingResults) {
  for (j in mergingResults[i])
    str += mergingResults[i][j].toString() + '<br/>';
  str += '<br/>';
  } // for (i in mergingResults)
  var blockTree = new BlockTree(new BlockTreeNode([layerTree.root], '/[BODY]'), document.URL);
  blockTree.buildUpTree(mergingResults);
  str = [str, domTree.toString(), layerTree.toString(), blockTree.toString()].join('<br/><br/><br/><br/><br/>');
  self.port.emit('response-AnalyzePage', new Date().getTime() - startTime, str);
}); // self.port.on('request-AnalyzePage', function(startTime) { ... });
