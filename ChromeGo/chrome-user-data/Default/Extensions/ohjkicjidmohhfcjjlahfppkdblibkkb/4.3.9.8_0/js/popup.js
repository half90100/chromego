window.addEventListener('load', function() {
    var feedHtml, wrapper, hasFeeded, feedsWrapper, figureRemind,
        todayFeeds, feedsHdHtml, listWrapper, scrollTimer;

    feedHtml = '';
    feedsHdHtml = '';
    wrapper = document.getElementById("feeds-wrapper");
    feedsHd = document.getElementById("feedsHd");
    feedItem = document.getElementById("feedsItem");
    bannerItem = document.getElementById("bannerItem")
    bannerItems = document.getElementById("bannerItems")
    var bannerItemHtml = "";

    //广告位-大广告图
    // get("push.banner", function (bannerInfo) {
    //     if (!bannerInfo) {
    //         return false;
    //     }
    //     try { bannerInfo = JSON.parse(bannerInfo); } catch(e) {}
    //     bannerItemHtml += tmpl(bannerItem.innerHTML, {title: bannerInfo.title, link: bannerInfo.link})
    // });

    //广告位-广告文字
    get("push.bannerTxt", function (bannerTxtInfo) {
        if (!bannerTxtInfo) {
            return false;
        }
        try { bannerTxtInfo = JSON.parse(bannerTxtInfo); } catch(e) {}

        bannerTxtInfo.forEach(function (banner) {
            var tmplStr;
            banner.link = (banner.link).indexOf("?") > 0 ?
                banner.link + "&keyfrom=chromepopup" :
                banner.link + "?keyfrom=chromepopup";
            tmplStr = tmpl(bannerItems.innerHTML, {banner: banner});
            bannerItemHtml += tmplStr ? tmplStr : '';
        });
        bannerItemHtml = '<li class="banner-items">' + bannerItemHtml + '</li>';

    });

    //折扣列表
    get("push.todayFeeds", function(feedJson) {
        try { todayFeeds = JSON.parse(feedJson); } catch(e) {}
        todayFeeds = todayFeeds || [];
        hasFeeded = localStorage["push.hasFeeded"];
        figureRemind = localStorage["push.figureRemind"];

        feedsHdHtml = tmpl(feedsHd.innerHTML, {updateCount: todayFeeds.length});

        feedHtml += bannerItemHtml;

        todayFeeds.forEach(function (feed) {
            var tmplStr;
            feed.link = (feed.link).indexOf("?") > 0 ?
                feed.link + "&keyfrom=chromepopup" :
                feed.link + "?keyfrom=chromepopup";
            feed.siteCss = feed.site ? 'content-from-site' : 'content-from-site-no';
            feed.sinceTime = feed.sinceTime ? feed.sinceTime : '';
            tmplStr = tmpl(feedItem.innerHTML, {feed: feed});
            feedHtml += tmplStr ? tmplStr : '';
        });

        wrapper.innerHTML = feedsHdHtml + "<ul>" + feedHtml + "</ul>";

        var orderConfigsStr = localStorage["order.configs"];
        var orderConf = JSON.parse(orderConfigsStr);

        var isshowOrderDetail = localStorage["order.isShowDetail"];
        if (isshowOrderDetail === "true" && orderConf.switchKey !== "OFF") {
            var orderDetil = document.getElementById("order-detail");
            orderDetil.className += "showLink"
        }

        chrome.browserAction.getBadgeText({}, function (digit) {
            sendLog(["action=ICO_MOD_CLICK",
                    "type=ARMANI_EXTENSION_ACTION", "digit="+(digit||0)]);
        });

        chrome.browserAction.setBadgeText({'text': ''});

        feedsWrapper = document.querySelector("#feeds-wrapper ul");
        feedsWrapper.onscroll = function () {
            if (scrollTimer) {
                return;
            }
            scrollTimer = setTimeout(function () {
                sendLog(["action=ICO_SCROLL", "type=ARMANI_EXTENSION_ACTION"]);
                clearTimeout(scrollTimer);
                scrollTimer = false;
            }, 2000);
        }

    });

}, false);

function get(key, callback) {
    setTimeout(function() {
        //console.log('数据',localStorage.getItem(key))
        callback(localStorage.getItem(key));
    }, 0);
}
