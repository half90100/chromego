try {
  var utype = navigator.userAgent.toLowerCase();
  var url = "http://www.gwdang.com/app/extension/?browser=chrome";
  var uninstallUrl = 'http://www.gwdang.com/brwext/uninstall?browser=chrome';
  if (utype.indexOf('qqbrowser') > -1) {
    url = "http://www.gwdang.com/app/extension/?browser=qq";
    uninstallUrl = 'http://www.gwdang.com/brwext/uninstall?browser=qq';
  }
  chrome.storage.local.get('run_before', function(data) {
    if (data && data.run_before == "1") {
      return;
    } else {
      chrome.storage.local.set({
        'run_before': '1'
      });
      if (!localStorage['ran_before']) {
        localStorage['ran_before'] = '1';
        chrome.tabs.create({
          url: url
        });
      }
    }
  })

} catch (e) {};

function createUserId() {
  var time = (new Date()).getTime();
  var beforestr = '';
  var type = 'chrome';
  var str = "abcdefghij";
  if (navigator.userAgent.toLowerCase().indexOf('qqbrowser') > -1)
    type = 'qq';
  for (var i = 0; i < 3; i++) {
    beforestr = beforestr + str[parseInt(Math.random() * 10)]
  }
  var userid = type + beforestr + time;
  return userid;
};
(function() {
  var manifestData = chrome.runtime.getManifest();
  var version = manifestData && manifestData.version;
  var browserSetInfo = {
    setStyle: 'top',
    setTip: '1',
    top_fold: '0',
    bottom_fold: '0',
    setWishlist: '1',
    setShowPromo: '1',
    setInfoNum: '1',
    sethaitao: '1',
    setPage: '1',
    version: version,
    user_extension_id: createUserId(),
    localHost: chrome.extension.getURL('./')
  }
  chrome.storage.local.get('browser_setinfo', function(data) {
    if (data && data.browser_setinfo) {
      for (var pattern in browserSetInfo) {
        browserSetInfo[pattern] = data.browser_setinfo[pattern] || browserSetInfo[pattern];
      }
    }
    chrome.cookies.get({
      url: "https://browser.gwdang.com/brwext/permanent_id",
      name: "plt_user_email"
    }, function(e) {
      if (e && e.value) {
        if (e.value.indexOf('%') > -1) {
          e.value = decodeURIComponent(e.value);
        }
        browserSetInfo.email = e.value;
      }
      chrome.storage.local.set({
        browser_setinfo: browserSetInfo
      })
    })

  })
})();



chrome.runtime.onMessage.addListener(
  function(obj, sender, sendResponse) {
    switch (obj.type) {
      case "amazonTrend":
      case "aliexpress":
        requestPost(obj, function(content) {
          sendResponse(content)
        })
        break;
      case "taobaoImg":
        getImg(obj.src, function(content) {
          sendResponse(content)
        })
        break;
      case "getTaobaoTrend":
        request(obj.info, function(content) {
          sendResponse(content)
        })
        break;
      case "opentab":
        opentab()
        break;
      case "loginRender":
        loginRender()
        break;
      case "addFavorCheck":
        addFavorCheck();
        break;
      case "clearReduce":
        console.log('onMessage clearReduce')
        clearReduce()
        break;
      case "loginout":
        loginout()
        break;
      default:
        request(obj.url, function(content) {
          sendResponse(content)
        })
    }
  });

function getImg(url, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.responseType = 'blob';
  xmlhttp.addEventListener('load', function() {
    if (!xmlhttp.response) return;
    postMsg(xmlhttp.response, callback)
  })
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function buildUrl(name, callback) {
  if (!name || name == '') return;
  var y = (new Date()).getFullYear();
  var m = (new Date()).getMonth() + 1;
  var d = (new Date()).getDate();
  if (m < 10) m = '0' + m.toString()
  else m = m.toString();
  if (d < 10) d = '0' + d.toString()
  else d = d.toString();
  var datastr = 'staobaoz_' + y.toString() + m + d;
  var url = "https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=" + datastr + "&ie=utf8&tfsid=" + name + "&app=imgsearch";
  request(url, function(data) {
    var newdata = data.match(/\<script\>\s+g_page_config\s=\s(.*)/);
    if (newdata) newdata = newdata[1].match(/(\{.*\});/)
    if (newdata) newdata = newdata[1];
    callback(newdata)
  })
}

function opentab() {
  chrome.tabs.create({
    url: chrome.extension.getURL("html/setting.html")
  });
}

function postMsg(data, callback) {
  var str = "0123456789abcdefgABCDEFG";
  var imgName = "";
  for (var i = 0; i < 17; i++) {
    imgName += str.charAt(Math.round(Math.random() * 23))
  }
  var formData = new FormData();
  formData.append('imgfile', data, imgName + '.jpg');
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.addEventListener('load', function() {
    try {
      var name = JSON.parse(xmlhttp.response).name;
    } catch (e) {
      var name = "";
    }
    buildUrl(name, callback)
  })
  xmlhttp.open("POST", 'https://s.taobao.com/image', true)
  xmlhttp.send(formData);
}

function requestPost(obj, callback) {
  var info = ''
  if (obj.info) {
    info = obj.info;
    info = JSON.stringify(info)
    info = encodeURIComponent(info);
  }
  var url = obj.url;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.addEventListener('load', function() {
    callback(xmlhttp.responseText)
  })
  xmlhttp.open("POST", url, true);
  xmlhttp.send(info);
}

function request(url, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.addEventListener('load', function() {
    callback(xmlhttp.responseText)
  })
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

;
(function() {
  var blockConfig;
  request('https://browser.gwdang.com/js/block.js', function(data) {
    try {
      blockConfig = JSON.parse(data)
      if (blockConfig && blockConfig.urls && blockConfig.urls.length) {
        chrome.webRequest.onBeforeRequest.addListener(function(details) {
          for (var i = 0; i < blockConfig.urls.length; i++) {
            var urlRE = blockConfig.urls[i]
            if (new RegExp(urlRE).test(details.url)) return {
              cancel: true
            };
          }
        }, {
          urls: ["<all_urls>"]
        }, ["blocking"]);
      }
      if (blockConfig['csp-headers']) {
        chrome.webRequest.onHeadersReceived.addListener(function(details) {
          for (var i = 0; i < blockConfig['csp-headers'].length; i++) {
            var urlRE = blockConfig['csp-headers'][i]
            if (new RegExp(urlRE).test(details.url)) {
              for (var i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name.match(/(?:Content-Security-Policy|X-Content-Security-Policy|X-WebKit-CSP)/)) {
                  details.responseHeaders.splice(i, 1);
                }
              }
              return {
                responseHeaders: details.responseHeaders
              };
            }
          }
        }, {
          urls: ["<all_urls>"]
        }, ["blocking", "responseHeaders"]);
      }
    } catch (e) {}
  })
})();


function getFavor(email, pg, callback) {
  if (!email) return;
  console.log(`getFavor(${email}, ${pg})`)
  var url = "https://www.gwdang.com/window/collect?email=" + email + "&pg=" + pg + "&ps=50";
  request(url, function(data) {
    callback(data)
  })
}
var getTimes, getPg, EmailCache, favorArr = []

function editFavor(data) {
  try {
    data = JSON.parse(data)
    if (!data || data.result_code !== 1) return;
    favorArr = favorArr.concat(data.list)
    if (data.count > 50) {
      getTimes = Math.ceil(data.count / 50);
      getTimes--;
      getPg++;
      getFavor(EmailCache, getPg, editFavor2)
      getTimes--;
      getPg++;
    } else {
      calFavorReduce()
    }

  } catch (e) {}
}

function editFavor2(data) {
  try {
    if (getTimes > 0) {
      getFavor(EmailCache, getPg, editFavor2)
      getTimes--;
      getPg++;
    }
    data = JSON.parse(data)
    favorArr = favorArr.concat(data.list)
    if (getTimes === 0) {
      calFavorReduce()
    }
  } catch (e) {}
}

function loginout() {
  chrome.storage.local.get("favorData", function(data) {
    if (data.favorData) {
      let obj = {}
      obj[EmailCache] = data.favorData
      chrome.storage.local.set(obj, function() {
        chrome.storage.local.remove('favorData')
        chrome.storage.local.remove('favorList')
        EmailCache = null;
      })
    }
  })
}

function loginRender() {
  firstCheckFavor()
  chrome.cookies.get({
    url: "https://www.gwdang.com/",
    name: "plt_user_email"
  }, function(e) {
    if (e && e.value) {
      EmailCache = e.value;
      chrome.storage.local.get(EmailCache, function(data) {
        if (data[EmailCache]) {
          chrome.storage.local.get("favorData", function(data2) {
            if (!data2.favorData) {
              chrome.storage.local.set(data)
            }
          })
        }
      })
    }
  })
}

function clearReduce() {
  let fdata = {}
  console.log('clearReduce called')
  chrome.browserAction.setBadgeText({
    text: ""
  })
  localStorage.setItem("reduceNum", "0");
  chrome.storage.local.get('favorData', function(data) {
    if (data && data.favorData) {
      fdata = data.favorData;
    }
    console.log('get favor data here', fdata)
    chrome.storage.local.get('favorList', function(data2) {
      if (data2.favorList) {
        for (let i = 0; i < data2.favorList.length; i++) {
          fdata[data2.favorList[i].dp_id] = data2.favorList[i].price;
          data2.favorList[i].newreduce = "";
        }
      }
      let dp_ids = data2.favorList.map(function(v) {
        return v.dp_id;
      })
      for (let pattern in fdata) {
        if (dp_ids.indexOf(pattern) === -1) {
          delete fdata[pattern];
        }
      }
      chrome.storage.local.set({
        "favorData": fdata
      })
      console.log('setting data a', data2)
      chrome.storage.local.set(data2)
    })
    chrome.storage.local.get('remindDpIds', function(data2) {
      if (data2.remindDpIds) {
        let rsize = data2.remindDpIds.length;
        for (let i = rsize - 1; i >= 0; i--) {
          if (!fdata[data2.remindDpIds[i]]) {
            data2.remindDpIds.splice(i, 1);
          }
        }
      }
      console.log('setting data b', data2)
      chrome.storage.local.set(data2)
    })
  })
}

function calFavorReduce() {
  let reduceNum = 0;
  let remindIds = []
  if (favorArr.length === 0) return;
  let fdata = {}
  chrome.storage.local.get('favorData', function(data) {
    if (data && data.favorData) {
      fdata = data.favorData;
    }
    console.log('====================')
    console.log(fdata)
    console.log(favorArr)
    for (let i = 0; i < favorArr.length; i++) {
      if (favorArr[i].collection_price > favorArr[i].price) {
        if (!fdata[favorArr[i].dp_id] || favorArr[i].price < fdata[favorArr[i].dp_id]) {
          favorArr[i].newreduce = "newreduce";
          favorArr[i].priceDownTime = (new Date()).getTime();
          remindIds.push(favorArr[i].dp_id)
          reduceNum++
        }
        favorArr[i].reduce = (favorArr[i].collection_price - favorArr[i].price) / 100;
      }
    }
    chrome.storage.local.set({
      "favorList": favorArr
    })
    chrome.storage.local.set({
      "favorData": fdata
    })
    console.log('favorList:', favorArr)
    console.log('favorData:', fdata)
    sendNotifacation(reduceNum, remindIds)

  })
}

function checkFavor() {
  console.log('checkFavor called')
  favorArr = []
  var forbidF = localStorage.getItem("forbidFavor");
  if (forbidF) return;
  localStorage.setItem("checkTime", new Date().getTime());
  chrome.cookies.get({
    url: "https://www.gwdang.com/",
    name: "plt_user_email"
  }, function(e) {
    if (e && e.value) {
      EmailCache = e.value;
      getFavor(e.value, 1, editFavor)
      getPg = 1;
    }
  })
}

function addFavorCheck() {
  let time = Number(localStorage.getItem("checkTime"))
  if (new Date().getTime() - time > 20000) {
    checkFavor()
  } else {
    setTimeout(function() {
      checkFavor()
    }, 20000)
  }
}

function firstCheckFavor() {
  chrome.storage.local.get('firstCheck', function(data) {
    if (!data.firstCheck) {
      chrome.storage.local.set({
        "firstCheck": new Date().getTime()
      })
      addFavorCheck()
    }
  })
}

function sendChromeNotification(id, content) {
  try {
    chrome.notifications.create(id, content)
  } catch (e) {}
}

function sendNotifacation(num, remindIds) {
  console.log(`send notification ${num}`)
  let size = remindIds.length;
  chrome.storage.local.get('remindDpIds', function(data) {
    if (data && data.remindDpIds) {
      for (let i = size - 1; i >= 0; i--) {
        if (data.remindDpIds.indexOf(remindIds[i]) > -1) {
          remindIds.splice(i, 1);
          num--
        }
      }
    } else {
      data.remindDpIds = []
    }
    if (num > 0) {
      let reducenum = localStorage.getItem("reduceNum") || "0";
      reducenum = Number(reducenum);
      console.log('reduce num: ', reducenum)
      let num2 = num + reducenum;
      chrome.browserAction.setBadgeText({
        text: num2.toString()
      })
      localStorage.setItem("reduceNum", num2.toString());
      sendChromeNotification(new Date().getTime().toString(), {
        type: "basic",
        title: "降价提醒",
        message: "您收藏的商品有" + num + "件降价哦",
        iconUrl: '../images/icon128.png'
      })
      let newArr = data.remindDpIds.concat(remindIds)
      chrome.storage.local.set({
        remindDpIds: newArr
      })
    }
  })
}

function getOnOffInfo() {
  var url = "https://cdn.gwdang.com/js/winFavorOnOff.json"
  request(url, function(data) {
    if (data && typeof data === "string") {
      try {
        data = JSON.parse(data)
        if (data && data.turnOff) {
          localStorage.setItem("forbidFavor", "1");
        } else {
          localStorage.removeItem("forbidFavor");
        }
      } catch (e) {}
    }
  })
}


chrome.alarms.onAlarm.addListener(function(alarm) {
  switch (alarm.name) {
    case "checkFavor":
      checkFavor()
      break;
    case "onOff":
      getOnOffInfo()
      break;
  }
})
chrome.alarms.create('checkFavor', {
  periodInMinutes: 8 // 本来是8
})
chrome.alarms.create('onOff', {
  periodInMinutes: 4
})



/*添加卸载时候的请求*/
chrome.runtime.setUninstallURL(uninstallUrl);