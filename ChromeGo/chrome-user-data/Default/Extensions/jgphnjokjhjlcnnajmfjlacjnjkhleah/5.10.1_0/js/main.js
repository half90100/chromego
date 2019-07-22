var dpIds = [];

function loadScript(url) {
  var s, head;
  s = document.createElement("script");
  s.type = "text/javascript";
  s.charset = "utf-8";
  s.src = chrome.extension.getURL(url);
  head = document.getElementsByTagName('head')[0];
  head.appendChild(s);
}

function sendMsg(url, callback) {
  chrome.runtime.sendMessage(url, function(response) {
    callback(response)
  });
}

function insertDom(text, dom) {
  var ss = document.createElement("a");
  ss.id = "gwd_myDiv";
  if (dom) ss.id = dom;
  ss.style.display = 'none';
  ss.innerText = text;
  head = document.getElementsByTagName('body')[0];
  head.appendChild(ss);
}

function zrequest(info) {
  var price_host = document.location.host;
  var price_url = document.location.href;
  var re_id = price_url.match(/(?:dp|product)\/([0-9a-zA-Z]+)/);
  var imgsrc = getSrc()
  var pid = "4ada9238-f88b-4b3c-87b4-a66ec58586ef";
  if (location.host == 'www.amazon.co.jp' || location.host == 'www.amazon.de')
    pid = "24aaee4d-6c09-45a9-ac30-f985dc7f376c";
  var reqUrl = "http://js.client.walatao.com/v9/svr/report_price_goods.php?pid=" + pid + "&vi=2.2.0.33&bw=guge&tpbg_uid=0&fh=" + price_host.replace('.', '_')


  var pageinfo = {
    "stock": "",
    "info": {
      "price": 0,
      "url": price_url,
      "uniq": {
        "id": re_id && re_id[1],
        "name": encodeURIComponent(info.name || ''),
        "param": "[]"
      },
      "prodpics": [imgsrc],
      "weight": "",
      "symbol": "$",
      "nowprice": info.price || 0
    },
    "ac_price": info.price || 0
  }
  var sitePatterns = {
    'amazon.com': '$',
    'amazon.de': 'EUR',
    'amazon.co.jp': '￥',
    '6pm': '$'
  };

  if (price_host.indexOf('amazon') > -1) {
    for (var pattern in sitePatterns) {
      if (price_host.indexOf(pattern) > -1)
        pageinfo['symbol'] = sitePatterns[pattern];
    }
  }
  var obj = {
    type: 'amazonTrend',
    info: pageinfo,
    url: reqUrl
  }
  sendMsg(obj, insertDom);
}

/*taobao img*/
function downloadImg(src) {
  if (!src) return;
  var obj = {
    src: src,
    type: 'taobaoImg'
  }
  sendMsg(obj, function(data) {
    if (!data || data != '') {
      insertDom(data, 'gwd_img_info')
      var evt = document.createEvent('CustomEvent')
      evt.initCustomEvent('gwd_content', true, true, {
        type: 'getTaobaoImgInfo',
        value: '1'
      })
      document.dispatchEvent(evt)
    }
  })
}
/*taobao img end*/

/*taobao uniqpid*/
function runTaobaoUniq(nid, uniqid) {
  var url = 'https://s.taobao.com/search?type=samestyle&app=i2i&rec_type=1&uniqpid=' + uniqid + '&nid=' + nid;
  var obj = {
    type: 'taobaoUniq',
    url: url
  }
  sendMsg(obj, function(data) {
    if (!data || data != '') {
      var newdata = data.match(/\<script\>\s+g_page_config\s=\s(.*)/);
      if (newdata) newdata = newdata[1].match(/(\{.*\});/)
      if (newdata) newdata = newdata[1];
      insertDom(newdata, 'gwd_uniq_info')
      var evt = document.createEvent('CustomEvent')
      evt.initCustomEvent('gwd_content', true, true, {
        type: 'getTaobaouniq',
        value: '1'
      })
      document.dispatchEvent(evt)
    }
  })
}
/*taobao uniqpid end*/

function dispatch(b, c) {
  var evt = document.createEvent('CustomEvent')
  evt.initCustomEvent('gwd_content', true, true, {
    type: b,
    value: c
  })
  document.dispatchEvent(evt)
}

/*storeCurrency*/
function setStoreRate(currency) {
  chrome.storage.local.set({
    'currency': currency
  })
}

function setStorages(k, v) {
  var obj = {}
  chrome.storage.local.get('browser_setinfo', function(d) {
    if (d && d.browser_setinfo) {
      d.browser_setinfo[k] = v;
      obj = d.browser_setinfo
    }
    chrome.storage.local.set({
      'browser_setinfo': obj
    })
  })

}

function getStoreRate() {
  chrome.storage.local.get('currency', function(info) {
    if (info)
      dispatch('getStoreRate', info)
  })
}
/*storeCurrency end*/

/*window getCookie*/
function getCookie() {
  var info = {};
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    if (cookies[i].indexOf('plt_user_email') > -1) {
      info['email'] = decodeURIComponent(cookies[i].split('=')[1]);
    }
    if (cookies[i].indexOf('plt_user_nickname') > -1) {
      info['name'] = document.querySelector('#login_status span a.orange') && document.querySelector('#login_status span a.orange').innerText;
    }
    if (cookies[i].indexOf('plt_user_id') > -1) {
      info['id'] = decodeURIComponent(cookies[i].split('=')[1]);
    }
  }
  if (info['email'] && info['name'])
    chrome.storage.local.set({
      'user_info': JSON.stringify(info)
    })
}
/*getCookie end*/

function renderDom() {
  if (location.href.match(/\.pdf/))
    return;
  var s = document.createElement('script');
  s.charset = 'utf-8';
  s.src = chrome.extension.getURL('js/btype.js');
  document.head && document.head.appendChild(s);
}

document.addEventListener('gwd_extension', function(e) {
  switch (e.detail.type) {

    case "browser_setinfo":
      chrome.storage.local.get('browser_setinfo', function(data) {
        if (data && data.browser_setinfo) {
          dispatch('browser_setinfo', data.browser_setinfo);
        } else {
          dispatch('browser_setinfo', {
            type: 'browser_setinfo'
          });
        }
      });
      break;
    case "getTaobaoImgInfo":
      downloadImg(e.detail.src);
      break;
    case "getAmazonPriceTrend":
      var info = e.detail.info;
      try {
        if (info != '') info = JSON.parse(info)
        else info = {}
      } catch (e) {
        info = {}
      }
      zrequest(info)
      break;
    case "getTaobaouniq":
      var info = e.detail.info;
      try {
        if (info != '') {
          info = JSON.parse(info)
          runTaobaoUniq(info.nid, info.uniqid)
        }
      } catch (e) {}
      break;
    case "setStoreRate":
      setStoreRate(e.detail.info)
      break;
    case "getStoreRate":
      getStoreRate()
      break;
    case "aliexpress":
      sendMsg(e.detail, function(data) {
        dispatch('aliexpress', data)
      })
      break;
    case "opentab":
      sendMsg(e.detail, function(data) {})
      break;
    case "commonReq":
      sendMsg(e.detail, function(data) {
        dispatch('commonReq' + e.detail.id, data)
      })
      break;
    case "setStorage":
      setStorages(e.detail.key, e.detail.value)
      break;
    case "getTaobaoTrend":
      sendMsg(e.detail, function(data) {
        chrome.storage.local.set({
          'priceTrend': data
        })
        dispatch('getTaobaoTrend', data)
      });
      break;
    case "addFavorCheck":
      sendMsg(e.detail, function(data) {})
      break;
  }
});
setTimeout(function() {
  getCookie()
}, 100);
renderDom();

loadScript("js/chrome.js");