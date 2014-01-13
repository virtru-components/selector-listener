

var events = {};
var selectors = {};
var styles = document.createElement('style');
var keyframes = document.createElement('style');
var head = document.getElementsByTagName('head')[0];
var startNames = ['animationstart', 'oAnimationStart', 'MSAnimationStart', 'webkitAnimationStart'];
var selectorListeners = {};


var startEvent = function(event){
    event.selector = (events[event.animationName] || {}).selector;
    ((selectorListeners || {})[event.animationName] || []).forEach(function(fn){
      fn.call(this, event);
    }, this);
  };

var prefix = (function() {
   var duration = 'animation-duration: 0.01s;';
   var name = 'animation-name: SelectorListener !important;';
   var computed = window.getComputedStyle(document.documentElement, '');
   var pre = (Array.prototype.slice.call(computed).join('').match(/moz|webkit|ms/)||(computed.OLink===''&&['o']))[0];

   return {
      css: '-' + pre + '-',
      properties: '{' + duration + name + '-' + pre + '-' + duration + '-' + pre + '-' + name + '}',
      keyframes: !!(window.CSSKeyframesRule || window[('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1] + 'CSSKeyframesRule'])
   };
  })();

styles.type = keyframes.type = "text/css";
head.appendChild(styles);
head.appendChild(keyframes);


function addSelectorListener(selector, callback){
  var key = selectors[selector];

  if (key) events[key].count++;
  else {
    key = selectors[selector] = 'SelectorListener-' + new Date().getTime();
    var node = document.createTextNode('@' + (prefix.keyframes ? prefix.css : '') + 'keyframes ' + key + ' {'
      +'from { clip: rect(1px, auto, auto, auto); } to { clip: rect(0px, auto, auto, auto); }'
      + '}');
    keyframes.appendChild(node);
    styles.sheet.insertRule(selector + prefix.properties.replace(/SelectorListener/g, key), 0);
    events[key] = { count: 1, selector: selector, keyframe: node, rule: styles.sheet.cssRules[0] };
  }

  if (selectorListeners.count) selectorListeners.count++;
  else {
    selectorListeners.count = 1;
    startNames.forEach(function(name){
      window.addEventListener(name, startEvent, false);
    }, window);
  }

  (selectorListeners[key] = selectorListeners[key] || []).push(callback);
}


function removeSelectorListener(selector, fn){
  var listeners = this.selectorListeners || {},
    key = selectors[selector],
    listener = listeners[key] || [],
    index = listener.indexOf(fn);

  if (index > -1){
    var event = events[selectors[selector]];
    event.count--;
    if (!event.count){
      styles.sheet.deleteRule(styles.sheet.cssRules.item(event.rule));
      keyframes.removeChild(event.keyframe);
      delete events[key];
      delete selectors[selector];
    }

    listeners.count--;
    listener.splice(index, 1);
    if (!listeners.count) startNames.forEach(function(name){
      window.removeEventListener(name, startEvent, false);
    }, window);
  }
}



exports.addSelectorListener = addSelectorListener;
exports.removeSelectorListener = removeSelectorListener;