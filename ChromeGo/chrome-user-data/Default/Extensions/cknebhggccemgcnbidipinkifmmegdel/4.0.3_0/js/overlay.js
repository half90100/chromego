/******************
 * Liangnan Wu *
 * Alexa Internet *
 ******************/

var ALX_BK_SPARKLINE = {
    lastUrlRendered: null
  , lastUrlUpdated: null
  , lastTabId: null
  , extensionObj: null
  , installReason: null
  , baseUrl: "https://data.alexa.com"
  , apps: []
  , isInstalledOpened: false
  , init: function(event) {
    chrome.browserAction.setPopup({popup: "/html/popup.html"})
    ALX_BK_SPARKLINE.insertIFrame()
    
    ALX_BK_Helper.getExtensionObj(function( extensionInfo ) {
      ALX_BK_SPARKLINE.extensionObj = extensionInfo;
      ALX_BK_SPARKLINE.defaultIcon().defaultTitle()

      //chrome.webNavigation.onCompleted.addListener(ALX_BK_SPARKLINE.updateOnDOMLoad);
      chrome.tabs.onUpdated.addListener(ALX_BK_SPARKLINE.updateOnUpdate);
      chrome.tabs.onSelectionChanged.addListener(ALX_BK_SPARKLINE.updateOnSelectChange);
      chrome.windows.onFocusChanged.addListener(ALX_BK_SPARKLINE.updateOnWindowChange);
      chrome.webRequest.onCompleted.addListener(ALX_BK_SPARKLINE.naviComp, {urls: ["http://*/*", "https://*/*"], "types": ["main_frame"]});
      chrome.webRequest.onBeforeSendHeaders.addListener(ALX_BK_SPARKLINE.setHttpHeaders, {urls: ["http://*/*", "https://*/*"]}, ["requestHeaders", "blocking"]);
      chrome.runtime.onInstalled.addListener(ALX_BK_SPARKLINE.oninstalled)
    })
  }
  , oninstalled: function(details) {
    ALX_BK_SPARKLINE.installReason = details.reason
    if (details.previousVersion) {
      ALX_BK_SPARKLINE.openInstallTab()
    }
  }
  , openInstallTab: function() {
    if (!ALX_BK_Helper.isTermsAccepted()) return

    var url = null
    if (ALX_BK_SPARKLINE.installReason == "install") url = ALX_BK_Helper.getPref("install.demographics-uri", null)
    // else if (ALX_BK_SPARKLINE.installReason == "update") url = ALX_BK_Helper.getPref("install.upgrade-uri", null)
    if(url && !ALX_BK_SPARKLINE.isInstalledOpened) {
      ALX_BK_SPARKLINE.navigate(ALX_BK_Helper.urlReplacement(url))
      ALX_BK_SPARKLINE.isInstalledOpened = true
    }
  }
  , navigate: function(uri)
  {
    chrome.tabs.create({url: uri});
  }
  , formatRank: function(rank)
  {
    rank += ''; 
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(rank)) {
      rank = rank.replace(rgx, '$1' + ',' + '$2');
    }   
    return "Alexa Traffic Rank: #" + rank;
  }  
  , rank2code: function( rank )
  {
    rank = +rank;
    return rank ==      0 ? 'h' 
      : rank <=     100 ? 'x' 
      : rank <=     180 ? 'g' 
      : rank <=     320 ? 'f' 
      : rank <=     560 ? 'e' 
      : rank <=    1000 ? 'd' 
      : rank <=    1800 ? 'c' 
      : rank <=    3200 ? 'b' 
      : rank <=    5600 ? 'a' 
      : rank <=   10000 ? '9' 
      : rank <=   18000 ? '8' 
      : rank <=   32000 ? '7' 
      : rank <=   56000 ? '6' 
      : rank <=  100000 ? '5' 
      : rank <=  180000 ? '4' 
      : rank <=  320000 ? '3' 
      : rank <=  560000 ? '2' 
      : rank <= 1000000 ? '1' 
      :                   '0'
      ;   
  }
  , defaultIcon: function() {
    chrome.browserAction.setIcon({path:"/images/icon-19x19.png"});
    return this
  }
  , defaultTitle: function() {
    chrome.browserAction.setTitle({title:"No Rank Data"});
    ALX_BK_SPARKLINE.setTitleAsToolbarName(true);
    return this
  }
  , okUrl: function(url) {
    if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
      return true;

    return false;
  }
  , saveCurrentUrl: function(tab) {
    if (tab.selected) {
      ALX_BK_Helper.setSessionPref("currentUrl", tab.url);
      ALX_BK_Helper.setSessionPref("currentTabId", tab.id);
      ALX_BK_SPARKLINE.lastUrlUpdated = tab.url;
      ALX_BK_SPARKLINE.lastTabId = tab.id;
      if ( !ALX_BK_SPARKLINE.okUrl(tab.url) ) {
        ALX_BK_SPARKLINE.defaultIcon();
        ALX_BK_SPARKLINE.defaultTitle();
      }
    }
  }
  , getTab: function(tabId, callback) {
    trace("getTab")
    if (tabId)
      chrome.tabs.get(tabId, callback)
  }
  , insertIFrame: function() {
    var uri = URI(ALX_BK_SPARKLINE.baseUrl).pathname("/app/apps.html").toString();
    var $if = $("<iframe></iframe>").attr("src", uri)
    $("body").append($if);
    ALX_BK_SPARKLINE.apps.push($if)
  }
  , updateOnDOMLoad: function(loadobj) {
    if (loadobj.frameId == 0) {
      trace("updateOnDOMLoad")
      ALX_BK_SPARKLINE.preUpdate(loadobj.tabId);
    }
  }
  , updateOnUpdate: function(tabId, changeInfo, tab) {
    trace("updateOnUpdate")
    trace("updateOnUpdate:" + tab.url)
    ALX_BK_SPARKLINE.saveCurrentUrl(tab);

    if (tab.selected && changeInfo.status == "loading" && ALX_BK_SPARKLINE.okUrl(tab.url))
      ALX_BK_SPARKLINE.preUpdate(tabId);
  }
  , naviComp: function(details) {
    if (details && details.frameId == 0 && details.tabId != -1) {
      var data = ALX_BK_SPARKLINE.getPageInfo(details.tabId);
      if (data == null)
        data = {};
      if (!data.reqmeta)
        data["reqmeta"] = {};
      data["reqmeta"]["url"]        = details.url
      data["reqmeta"]["method"]     = details.method;
      data["reqmeta"]["statusCode"] = details.statusCode;
      ALX_BK_SPARKLINE.setPageInfo(details.tabId, JSON.stringify(data));
    }
  }
  , setHttpHeaders: function(details) {
    if (details && details.requestHeaders) {
      var version = ALX_BK_Helper.getMyVersion();
      var useragent_version   = "AlexaToolbar/" + version;
      details.requestHeaders.push({"name": "AlexaToolbar-ALX_NS_PH", "value": useragent_version});
    }
    return { "requestHeaders": details.requestHeaders };
  }
  , updateOnWindowChange: function(winId) {
    if (winId) {
      chrome.tabs.query({windowId: winId, windowType: "normal"}, function(tabs) {
        for(var i = 0; i < tabs.length; ++i) {
          var t = tabs[i];
          if (t.selected && ALX_BK_SPARKLINE.okUrl(t.url))
            ALX_BK_SPARKLINE.updateOnSelectChange(t.id);
        }
      });
    }
  }
  , updateOnSelectChange: function(tabId, selectInfo) {
    trace("updateOnSelectChange")
    var callback = function(t) {
      if (t && ALX_BK_SPARKLINE.lastTabId == t.id && ALX_BK_SPARKLINE.lastUrlUpdated == t.url)
        return;
      ALX_BK_SPARKLINE.saveCurrentUrl(t);
      if (ALX_BK_SPARKLINE.okUrl(t.url))
        ALX_BK_SPARKLINE.preUpdate(tabId);
    };
    ALX_BK_SPARKLINE.getTab(tabId, callback);
  }
  , preUpdate: function(tabId) {
    trace("preUpdate")
    chrome.tabs.executeScript(tabId, {file: "js/content/dc.js"});
  }
  , getPageInfo: function(tabId) {
    var name = "page_data_" + tabId;
    var data = ALX_BK_Helper.getSessionPref( name, null );
    if (data == null)
      return null;

    var data = JSON.parse(data);
    return data;
  }
  , setPageInfo: function(tabId, data) {
    if (tabId && data != null) {
      var name = "page_data_" + tabId;
      ALX_BK_Helper.setSessionPref( name, data );
    }
  }
  , setTitleAsToolbarName: function() {
    if(ALX_BK_SPARKLINE.extensionObj) chrome.browserAction.setTitle({title: ALX_BK_SPARKLINE.extensionObj.name});
  }
  , setAidIFNotExists: function(aid) {
    var key           = "session"
    var aid_in_store  = ALX_BK_Helper.getPref("session", null)
    if (!aid_in_store || aid_in_store.length == 0)
      ALX_BK_Helper.setPref("session", aid)
  }
  , setBrowserActionPage: function(data) {
    if (data.disabled) {
      ALX_BK_SPARKLINE.defaultIcon();
      ALX_BK_SPARKLINE.defaultTitle();
      return;
    }
    
    var rank = data.rank ? parseInt(data.rank) : "No Rank Data";
    var code = ALX_BK_SPARKLINE.rank2code(rank);
    var img = "/images/" + code + ".png"
    var r = ALX_BK_SPARKLINE.formatRank(rank);
    chrome.browserAction.setIcon({path:img});
    chrome.browserAction.setTitle({title:r});
  }
  , isAlexaHost: function(host)
  { return host && String(host).match(/^(?:.*\.)?alexa\.com$/i); }
  , update: function(payload) {
    if (!ALX_BK_Helper.isTermsAccepted()) return

    var pInfo = ALX_BK_SPARKLINE.getPageInfo(payload.tabId)
    if (pInfo && pInfo["reqmeta"]) payload["reqmeta"] = pInfo["reqmeta"];
    var msg   = ALX_BK_Helper.buildMessage("backendNotification", "pageturn", payload, null);
    ALX_BK_SPARKLINE.sendAppsMessage(msg)
  }
  , sendAppsMessage: function(msg) {
    $.each(ALX_BK_SPARKLINE.apps, function(i, app) {
      app.get(0).contentWindow.postMessage(msg, "*")
    })
  }
  , shutdown: function(event) {
    ALX_BK_SPARKLINE.extensionObj = null;
    return;
  }
  , scrapeContent: function(args, meta, response) {
    var msg = {
        type: "scraperScrape"
      , msgId: meta.msgId
      , payload: args.scraperSpecification
    }
    chrome.tabs.executeScript(args.externalId, { file: "js/content/libs/ScrapeLibrary.js" }, function() {
      chrome.tabs.executeScript(args.externalId, { file: "js/content/chrome/ScrapeDriver.js" }, function() {
        chrome.tabs.sendMessage(args.externalId, msg, {frameId:0}, function(ret) {
          response(ret.payload)
        })
      })
    })
  }
}

$(window).load(ALX_BK_SPARKLINE.init);
$(window).unload(ALX_BK_SPARKLINE.shutdown);

/* end
 *****/
