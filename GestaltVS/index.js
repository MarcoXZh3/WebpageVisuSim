const {Cc, Ci, Cu} = require('chrome');
const _ = require('sdk/l10n').get;
const data = require('sdk/self').data;
const { ToggleButton } = require('sdk/ui/button/toggle');
const panels = require('sdk/panel');
const tabs = require('sdk/tabs');
const { Hotkey } = require('sdk/hotkeys');
const { open } = require('sdk/window/utils');

const Functions = [
  {id:'LayerTree',        key:'control-alt-l',   keyText:'Ctrl + Alt + L',   separator:false},          // 1
  {id:'GestaltMerging',   key:'control-alt-g',   keyText:'Ctrl + Alt + G',   separator:false},          // 2
  {id:'BlockTree',        key:'control-alt-b',   keyText:'Ctrl + Alt + B',   separator:true},           // 3
  {id:'AnalyzePage',      key:'control-alt-a',   keyText:'Ctrl + Alt + A',   separator:false},          // 4
  {id:'BatchCrawling',    key:'control-alt-r',   keyText:'Ctrl + Alt + R',   separator:false},          // 5
]; // const Functions = [ ... ];
const {topSites, group} = require('./TopSites.js');
//const prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService)
//                                                    .getBranch('extensions.GestaltVS.');
//prefs.setCharPref('TopSites', JSON.stringify(topSites));
//var preference = JSON.parse(prefs.getCharPref('TopSites'));
var counter = 1, total = topSites.length;


const contentScripts = [
  data.url('lzma.js'),
  data.url('lzma_worker.js'),
  data.url('JsColor.js'),
  data.url('GLM_Helper.js'),
  data.url('GestaltLaws.js'),
  data.url('JsTree.js'),
  data.url('LayerTree.js'),
  data.url('BlockTree.js'),
  data.url('DomTree.js'),
  data.url('csControl.js')
]; // const contentScripts = [ ... ];


/**
 * Extension function units: button
 */
const button = ToggleButton({
  id: 'Btn-GestaltLM',
  label: _('addon_label'),
  icon: { '16': _('icon_16'), '32': _('icon_32'), '64': _('icon_64') },
  onChange: function(state) { if (state.checked)  panel.show({position: button}); }
}); // const button = ToggleButton({ ... });

/**
 * Extension function units: panel
 */
const panel = require('sdk/panel').Panel({
  contentURL: data.url('main-panel.html'),
  contentScriptFile: data.url('csControl.js'),
  onHide: function() { button.state('window', {checked: false}); },
  onShow: function() {
    var menuItems = [];
    for (i in Functions) {
      Functions[i].text = _(Functions[i].id + '_mi');
      Functions[i].img = _(Functions[i].id + '_img');
      menuItems.push(Functions[i]);
    } // for (i in Functions)
    panel.port.emit('load', menuItems);
  } // onShow: function() { ... }
}); // const panel = require('sdk/panel').Panel({ ... });

/**
 * Event Handler Registration
 */
(function register() {
  Functions.map(function(mi) {
    var handler = function() {
      panel.hide();
      if (mi.id == 'BatchCrawling')
        BatchCrawl();
      else if (mi.id == 'AnalyzePage')
        AnalyzePage(tabs.activeTab);
      else
        EventHandler(mi.id);
    }; // var handler = function() { ... };
    panel.port.on(mi.id, handler);
    Hotkey({combo:mi.key, onPress:handler});
  }); // Functions.map(function(mi) {});
})();

/**
 * Event handler of each menu item clicking
 * @param event     (<code>string</code>) The event of the caller (menu item id)
 */
const EventHandler = (event) => {
  const worker = tabs.activeTab.attach({ contentScriptFile:contentScripts });

  // Send the corresponding event to the active tab
  worker.port.emit('request-' + event, new Date().getTime());

  // Receive the response
  worker.port.on('response-' + event,  function(time, msg) {
    console.log(event + ' - ' + time + 'ms');
    open('data:text/html, <code style="overflow:auto;white-space:nowrap;">' + msg + '</code>',
         { features: {width: 800, height: 450, centerscreen: true} }
    ); // open(uri, { ... })
  }); // worker.port.on('resp-' + event, function(time, msg) { ... });

}; // function EventHandler(event)

/**
 * Event handler of each menu item clicking: BatchCrawling
 */
const BatchCrawl = () => {
  counter = 1;
  var links = [];
  for (i in topSites)
    links.push(topSites[i]);
  var urls = links.splice(0, group);
  for (i in urls)
    tabs.open({ url: urls[i], inBackground: true,
                onLoad: function(tab){try{AnalyzePage(tab, function(){tab.close();});}catch(err){tab.close();}} });
  tabs.on('close', function() {
    if (links.length <= 0)
      return ;
    var url = links.splice(0 ,1);
    tabs.open({ url: url[0], inBackground: true,
                onLoad: function(tab){try{AnalyzePage(tab, function(){tab.close();});}catch(err){tab.close();}} });
  }); // tabs.on('close', function() { ... });
}; // function BatchCrawl()

/**
 * Analyze the web page: take screenshot, and save the results
 * @param tab       (<code>Tab</code>) The tab to be screenshot
 */
const AnalyzePage = (tab, callback) => {
  const worker = tabs.activeTab.attach({contentScriptFile:contentScripts});

  // Get the web page screenshot as PNG image
  var window = require('sdk/window/utils').getMostRecentBrowserWindow();
  var canvas = window.document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  window = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation)
             .QueryInterface(Ci.nsIDocShellTreeItem).rootTreeItem
             .QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow)
             .gBrowser.browsers[tab.index].contentWindow;
  canvas.width = window.document.body.scrollWidth;
  canvas.height = window.document.body.scrollHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawWindow(window, 0, 0, canvas.width, canvas.height, '#FFF');
  var filename = tab.url.replace(/\//g, '%E2').replace(/:/g, '%3A').replace(/\?/g, '%3F');
  Cu.import('resource://gre/modules/Services.jsm');
  var fileNoExt = Services.dirsvc.get('DfltDwnld', Ci.nsIFile);
  fileNoExt.append(filename);
  Cu.import('resource://gre/modules/Task.jsm');
  Task.spawn(function () {
    Cu.import('resource://gre/modules/Downloads.jsm');
    yield Downloads.fetch(canvas.toDataURL().replace('image/png', 'image/octet-stream'), fileNoExt.path + '.png');
  }).then(null, Cu.reportError);

  // Retrieve all results and save as TXT
  worker.port.emit('request-AnalyzePage', new Date().getTime());
  worker.port.on('response-AnalyzePage', function(time, msg) {
    const {TextDecoder, TextEncoder, OS} = Cu.import('resource://gre/modules/osfile.jsm', {});
    var encoder = new TextEncoder();
    var array = encoder.encode(msg);
    var promise = OS.File.writeAtomic(fileNoExt.path + '.txt', array, {tmpPath:fileNoExt.path + '.tmp'});
    console.log(callback ? (counter++) + '/' + total + ' - ' + tab.url: 'AnalyzePage - ' + time + 'ms');
    if (callback)
      callback();
  }); // worker.port.on('response-AnalyzePage', function(time, msg) {});

}; // function AnalyzePage(tab, callback)