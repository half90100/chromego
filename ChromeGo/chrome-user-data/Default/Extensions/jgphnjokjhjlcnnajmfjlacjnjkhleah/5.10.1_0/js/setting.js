var op_map = [{
    'op': 'setStyle',
    'op_k': 'style',
    'op_v': ['top', 'bottom']
  }, // 比价工具条设置
  {
    'op': 'setTip',
    'op_k': 'show_tip',
    'op_v': ['1', '0']
  }, // 启用列表页的比价按钮
  {
    'op': 'setWishlist',
    'op_k': 'show_wishlist',
    'op_v': ['1', '0']
  }, // 在商品价格下方嵌入中间插件
  {
    'op': 'setShowPromo',
    'op_k': 'show_promo',
    'op_v': ['1', '0']
  }, // 在中间插件推荐促销活动
  {
    'op': 'sethaitao',
    'op_k': 'show_haitao',
    'op_v': ['1', '0']
  } // 海外商城单品页启用一键海淘功能
]
var browserInfo = {}

var saveSetting = function(data = null, callback = null) {
  var key = data['key'];
  browserInfo[key] = data[key]
  chrome.storage.local.set({
    'browser_setinfo': browserInfo
  });
  if (callback)
    callback()
};

function renderSetting() {
  chrome.storage.local.get('browser_setinfo', function(d) {
    if (d && d.browser_setinfo) {
      var info = d.browser_setinfo;
      browserInfo = info
      if (info.setStyle) {
        var stylestr = '.setStyle .style-' + info.setStyle;
        $('.setStyle .option div').removeClass('active')
        $(stylestr).addClass('active')
      }
      if (info.setTip === '1') {
        $('.setTip div').addClass('active')
      }
      if (info.setWishlist === '1') {
        $('.setWishlist div').addClass('active')
      }
      if (info.setShowPromo === '1') {
        $('.setShowPromo div').addClass('active')
      }
      if (info.sethaitao === '1') {
        $('.sethaitao div').addClass('active')
      }
      if (info.user_extension_id && info.version) {
        var href = "https://www.gwdang.com/brwext/suggest?refer=settingpage&v=" + info.version + "&id=" + info.user_extension_id;
        $('#suggest').attr('href', href)
      }
    }
  })
}

$(function() {
  renderSetting()
  $('.option.capsule').on('click', 'div', function() {
    var op_index = $(this).parent().data('op-index');
    var option = op_map[op_index];
    if (option) {
      var d = {
        key: option.op
      };
      d[option.op] = option.op_v[$(this).index()];
      saveSetting(d, function() {
        $("#setting-container .setting-result .result-txt .wrapper").stop().fadeIn('fast').fadeOut(5000);
        $("#setting-container .setting-result .demo-screen img").attr('src', '../images/setting/' + option.op_k + '_' + d[option.op] + '.png');
      });
    }
    $(this).addClass('active').siblings('div').removeClass('active');
  })

  $('.option.switch').on('click', function() {
    var op_index = $(this).data('op-index');
    var option = op_map[op_index];
    if (option) {
      var d = {
        key: option.op
      };
      var value = $(this).hasClass('active') ? 1 : 0;
      d[option.op] = option.op_v[value];
      saveSetting(d, function() {
        $("#setting-container .setting-result .result-txt .wrapper").stop().fadeIn('fast').fadeOut(5000);
        $("#setting-container .setting-result .demo-screen img").attr('src', '../images/setting/' + option.op_k + '_' + d[option.op] + '.png');
      });
    }
    $(this).toggleClass('active');
  })
  var setTime
  $('.copy-content').on('blur keyup paste copy cut mouseup', function() {
    clearTimeout(setTime)
    setTime = setTimeout(function() {
      $('#copy-input').val($('.copy-content').text())
    }, 100)
  })
  $('#copy-btn').on('click', function() {
    var element = $('#copy-input')[0];
    element.select();
    element.setSelectionRange(0, element.value.length);
    window.selectedText = element.value;
    var t = window.document.execCommand("copy");
    if (t) {
      $('#copy-btn').addClass('copyss').text("复制成功！")
      $('.copy-remind-tle').show().fadeOut(5000);
    }
  })
})