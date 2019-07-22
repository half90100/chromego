/******************
 * Liangnan Wu *
 * Alexa Internet *
 ******************/

function trace(msg)
{
  if ( ALX_BK_Helper.debug ) console.log( "<"+String(JSON.stringify(msg))+">" );
}

var ALX_BK_Helper = {
    prefPrefix: "extensions.alexa."
  , debug: true
  , buildEnv: function() {
    return {
        "version": ALX_BK_Helper.getVersion()
      , "aid":     ALX_BK_Helper.getPref("session", null)
      , "pid":     ALX_BK_Helper.getPid()
    }
  }
  , buildMessage: function(mType, eventName, payload, callback) {
    payload["eventName"] = eventName
    return {mType: mType, payload: payload, callback: callback, env: ALX_BK_Helper.buildEnv()};
  }
  , getPid: function() {
    return "alx"
  }
  , getVersion: function() {
    return ALX_BK_SPARKLINE.extensionObj.version;
  }
  , getMyVersion: function() {
    return ALX_BK_Helper.getPid() + "-" + ALX_BK_Helper.getVersion();
  }
  , getExtensionObj: function(infunc) {
    chrome.management.get(String(location.host), infunc);
  }
  , isTermsAccepted: function() {
    return (localStorage.privacyPolicyAccepted == "true");
  }
  , acceptTerm: function() {
    localStorage.privacyPolicyAccepted = "true";
  }
  , declineTerm: function() {
    localStorage.privacyPolicyAccepted = "false";
  }
  , getSessionPref: function(name, defValue) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name  

    if ( typeof sessionStorage[name] != "undefined") {
      var payload = JSON.parse(sessionStorage[name]);
      return payload;
    } else
      return defValue;
  }
  , setSessionPref: function(name, value) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name  
    
    sessionStorage[name] = JSON.stringify(value);
  }
  , deleteSessionPref: function(name) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name;
    
    if ( typeof sessionStorage[name] != "undefined")
      delete sessionStorage[name]; 
  }
  , getPref: function(name, defValue) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name  
    if ( typeof localStorage[name] != "undefined")
    {
      var payload = JSON.parse(localStorage[name]);
      return payload["value"]
    }
    else
      return defValue;
  }
  , setPref: function(name, value) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name;
    
    var newValue  = value;
    var oldValue  = null;
    var payload = {"value": value, "defValue": value};
    if ( typeof localStorage[name] != "undefined") {
      payload = JSON.parse(localStorage[name])
      oldValue = payload["value"]
      payload["value"] = value; 
    }
    localStorage[name] = JSON.stringify(payload);
    //ALX_BK_Helper.observe(name, newValue, oldValue); 
  }
  , deletePref: function(name) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name;
    
    if ( typeof localStorage[name] != "undefined")
      delete localStorage[name]; 
  }
  , setPrefIfUnchanged: function(name, value) {
    if ( name.indexOf( ALX_BK_Helper.prefPrefix ) != 0 )
      name = ALX_BK_Helper.prefPrefix + name;

    var payload = {"value": value, "defValue": value};
    if ( typeof localStorage[name] != "undefined") {
      payload = JSON.parse(localStorage[name])
      if ( payload.value == payload.defValue) payload.value = value;
      payload.defValue = value;
    } 

    localStorage[name] = JSON.stringify(payload);
  }
  , getRandom: function()
  {
    var rand = Math.floor( Math.random()* 1000000000000000 );
    return rand;
  }
  , getTime: function() {
    var t = new Date();
    return t.getTime();
  }
  , createRequestData: function(data_type, data_load)
  {
    var _alx_data_payload = {
      message_type:     data_type,
      message_payload:  JSON.stringify(data_load)
    };
    return _alx_data_payload
  }
  , urlReplacement(url) {
    var aid = ALX_BK_Helper.getPref("session", "");
    url = url.replace(/__AID__PLACEHOLDER__/g, encodeURIComponent(aid));
    url = url.replace(/__VERSION__PLACEHOLDER__/g, encodeURIComponent(ALX_BK_Helper.getVersion()));
    return url
  }
  , sendRequest: function(method, url, func, data, headers, isSync) {
    var xhr = new XMLHttpRequest();
    var async = true; 
    if (isSync == true)
      async = false;
      
    xhr.open(method, url, async);

    if (func)
      xhr.onreadystatechange = func;
    else
      xhr.onreadystatechange = function() {};

    if (typeof headers == "object") {
      for (var key in headers) {
        var value = headers[key];
        xhr.setRequestHeader(key, value);
      } 
    }
  
    var payload = null;
    if (typeof data == "string")
      payload = data
    xhr.send(payload)
  }
  , navigate: function(uri) {
    chrome.tabs.create({url: uri});
  }
}

function pref(prefName, prefValue)
{
  ALX_BK_Helper.setPrefIfUnchanged(prefName, prefValue)
}
