// Date: 2015-05-19
// @description: 价格历史canvas展示逻辑
// @author: dun

/*jshint unused: false, eqnull:false, browser: true, nomen: true, indent: 4, maxlen: 80, strict: true, curly: true */
/*global youdao: true, $: true, _: true */

// DEBUG MODE
/*jshint devel: true */
// define(function (require, exports, module) {
//     'use strict';

    // var imgPath = location.protocol=='https:' ? '/*<%=imgPath%>*/'.replace(/shared\./gi, 'shared-https.') : '/*<%=imgPath%>*/';
    // var cuImage = location.protocol + imgPath + 'canvas-cu.png';
    var imgPath,cuImage;
    var cache = {};
    var AUTOW, AUTOH;
    var AUTOWN = 45;
    var AUTOHN = 20;
    var tmplToolTip = $('#canvas-tpl').html();

    var priceCanvas = {
        requestAFrame : (function () {
            return (window.requestAnimationFrame && window.requestAnimationFrame.bind(window)) ||
                (window.webkitRequestAnimationFrame && window.webkitRequestAnimationFrame.bind(window)) ||
                (window.mozRequestAnimationFrame && window.mozRequestAnimationFrame.bind(window)) ||
                (window.oRequestAnimationFrame && window.oRequestAnimationFrame.bind(window)) ||
                function (callback) {
                    return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
                };
        })(),

        cancelAFrame : (function () {
            return (window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window)) ||
                (window.webkitCancelAnimationFrame && window.webkitCancelAnimationFrame.bind(window)) ||
                (window.mozCancelAnimationFrame && window.mozCancelAnimationFrame.bind(window)) ||
                (window.oCancelAnimationFrame && window.oCancelAnimationFrame.bind(window)) ||
                function (id) {
                    window.clearTimeout(id);
                };
        })(),
            //根据价格历史的最大与最小值计算价格走势的等分点
            priceAverage: function (maxpri, minpri) {
                //当价格平稳没有最低价格时,最低价格为最高价格
                if (minpri === undefined) {
                    minpri = maxpri;
                }
                var priceRange = priceCanvas.SUB(maxpri, minpri);
                var PriceDigits;
                //判断商品价格是否平稳
                if (priceRange !== 0) {
                    //判断价格整数位
                    if(priceRange < 1) {
                        PriceDigits = 0
                    } else {
                        PriceDigits = Math.round(priceRange).toString().length;
                    }
                    switch (PriceDigits) {
                        case 0:
                            var countPriceRange = Math.ceil(priceRange * 2 * 10) / 10;
                            var showPriceRange = countPriceRange;
                            var showMaxPrice = Math.ceil((maxpri + Math.round(((showPriceRange - priceRange) / 2) * 10) / 10) * 10) / 10;
                            while(showMaxPrice <= maxpri) {
                                showMaxPrice = priceCanvas.Add(showMaxPrice, 0.1);
                                showPriceRange = priceCanvas.Add(showPriceRange, 0.1);
                            }
                            while(priceCanvas.SUB(showMaxPrice,showPriceRange) >= minpri) {
                                showPriceRange = priceCanvas.Add(showPriceRange, 0.1);
                            }
                            var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange, true);
                            break;
                        case 1:
                            var countPriceRange = Math.ceil( priceRange * (11 / 8) );
                            var showPriceRange = countPriceRange;
                            var showMaxPrice = Math.ceil(maxpri + Math.ceil((showPriceRange - priceRange) / 2));
                            //对展示的最高价格进行处理
                            while(priceCanvas.SUB(showMaxPrice, countPriceRange) >= minpri){
                                showMaxPrice --;
                            }
                            while(showMaxPrice  <= maxpri){
                                showMaxPrice ++;
                                showPriceRange ++;
                            }
                            if (showPriceRange === 11 || showPriceRange === 7 || showPriceRange === 13 || showPriceRange === 17){
                                showPriceRange++;
                            }
                            var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange);
                            break;
                        case 2:
                            var countPriceRange = Math.ceil( priceRange * (11 / 8) );
                            var showPriceRange = Math.ceil(countPriceRange / Math.pow(10, PriceDigits - 1)) * Math.pow(10, PriceDigits - 1);
                            var showMaxPrice = Math.ceil(Math.ceil((maxpri + (showPriceRange - priceRange) / 2) / 5)) * 5;
                            //对展示的最高价格进行处理
                            var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange, false, minpri);
                            break;
                        case 3:
                            var countPriceRange = Math.round( priceRange * (11 / 8) );
                            var showPriceRange = Math.ceil(countPriceRange / Math.pow(10, PriceDigits - 1)) * Math.pow(10, PriceDigits - 1);
                            var showMaxPrice = Math.round((maxpri + (showPriceRange - priceRange) / 2) / 50) * 50;
                            var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange);
                            break;
                        default :
                            var countPriceRange = Math.round( priceRange * (11 / 8) );
                            var showPriceRange = Math.ceil(countPriceRange / Math.pow(10, PriceDigits - 1)) * Math.pow(10, PriceDigits - 1);
                            var showMaxPrice = Math.round((maxpri + (showPriceRange - priceRange) / 2) /(5 * Math.pow(10, PriceDigits - 2))) * ( 5 * Math.pow(10, PriceDigits - 2));
                            var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange);
                    }
                    return priceAverageArr.reverse();
                } else {
                    if (maxpri >= 1) {
                        var PriceDigits =  Math.ceil(maxpri).toString().length;
                        var showMaxPrice = Math.round(maxpri / Math.pow(10, PriceDigits - 1)) * Math.pow(10, PriceDigits - 1) * 2;
                        var showPriceRange = showMaxPrice;
                        var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange);
                    } else {
                        var showMaxPrice = Math.ceil(maxpri * 2 * 10) / 10;
                        //对展示的最高价格进行处理
                        if (showMaxPrice === 0.7) showMaxPrice = 0.8;
                        if (showMaxPrice === 1.1) showMaxPrice = 1.2;
                        if (showMaxPrice === 1.3 && showMaxPrice === 1.4) showMaxPrice = 1.5;
                        if (showMaxPrice > 1.5 && showMaxPrice < 2) showMaxPrice = 2;
                        var showPriceRange = showMaxPrice;
                        var priceAverageArr = priceCanvas.priceEqual(showMaxPrice, showPriceRange, true);
                    }
                    return priceAverageArr.reverse();
                }
                
            },
            //根据图表中的最高价格和范围获取符合展示要求的等分点
            priceEqual: function  (MaxPri, Range, decimals, minpri) {
                var priceEqualArr = [],
                    n = 3;
                decimals = decimals ? decimals : false;
                //判断价格轴是否处理为小数形式
                if(Range < 3 || decimals === true) {
                    decimals = true
                }
                //判断价格轴是否已小数的形式处理
                if (decimals === false) {
                    while ((Range % n) !== 0 && n >= 3 && n <= 7 ) {
                        n++;
                    }
                    var priceEqual_n = Range / n;
                    var priceEqual = MaxPri;
                    priceEqualArr.push(MaxPri);
                    for (var i = 1; i <= n ; i++) {
                        priceEqual = priceEqual - priceEqual_n;
                        priceEqualArr.push(priceEqual);
                    }

                    // 手动修复，当纵轴的最小价格还大于最小价格时纵轴再加一个值
                    if(priceEqual > minpri){
                        priceEqual -= priceEqual_n;
                        priceEqualArr.push(priceEqual);
                    }
                } else {
                    n = 7
                    var decimalsRange = Range * 10;
                    while ((decimalsRange % n) !== 0 && n >= 3 && n <= 7 ) {
                        n--;
                    }
                    var priceEqual_n = (decimalsRange / n) / 10;
                    var priceEqual = MaxPri;
                    priceEqualArr.push(MaxPri);
                    for (var i = 1; i <= n ; i++) {
                        priceEqual = priceCanvas.SUB(priceEqual,priceEqual_n);
                        priceEqualArr.push(priceEqual);
                    }
                }
                priceEqualArr.reverse();
                return priceEqualArr;
            },
            //精确减法,避免JS浮点数运算bug
            SUB: function (arg1, arg2) {
                var r1, r2, m, n;
                try {
                    r1 = arg1.toString().split(".")[1].length;
                } catch (e) {
                    r1 = 0;
                }
                try {
                    r2 = arg2.toString().split(".")[1].length;
                } catch (e) {
                    r2 = 0;
                }
                m = Math.pow(10, Math.max(r1, r2)); 
                n = (r1 >= r2) ? r1 : r2;//动态控制精度长度
                return parseFloat(((arg1 * m - arg2 * m) / m).toFixed(n));
            },
            Add: function (arg1,arg2){ 
                var r1, r2, m; 
                try {
                    r1 = arg1.toString().split(".")[1].length
                } catch(e) {
                    r1 = 0
                }
                try {
                    r2 = arg2.toString().split(".")[1].length
                } catch(e) { 
                    r2 = 0
                } 
                m = Math.pow(10, Math.max(r1, r2)); 
                return (arg1 * m + arg2 * m) / m; 
            },
            //将时间区间的n等份的间隔天数
            daysAverage: function (oldTime, newTime, n) {
                //计算两个日期的差值
                function compareDate(date1, date2) {
                    //判断是否为闰年
                    function isLeapYear(year) {
                        if (year % 4 == 0 && ((year % 100 != 0) || (year % 400 == 0))) {
                            return true;
                        }
                        return false;
                    }
                    //判断前后两个日期
                    function validatePeriod (fyear, fmonth, fday, byear, bmonth, bday) {
                        if(fyear < byear){
                            return true;
                        } else if (fyear == byear) {
                            if(fmonth < bmonth){
                                return true;
                            } else if (fmonth == bmonth) {
                                if(fday <= bday){
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                    var regexp=/^(\d{1,4})[-|\.]{1}(\d{1,2})[-|\.]{1}(\d{1,2})$/;
                    var monthDays=[0,3,0,1,0,1,0,0,1,0,0,1];
                    regexp.test(date1);
                    var date1Year=RegExp.$1;
                    var date1Month=RegExp.$2;
                    var date1Day=RegExp.$3;

                    regexp.test(date2);
                    var date2Year=RegExp.$1,
                        date2Month=RegExp.$2,
                        date2Day=RegExp.$3;

                    if(validatePeriod(date1Year, date1Month, date1Day, date2Year, date2Month, date2Day)){
                        var firstDate = new Date(date1Year, date1Month, date1Day);
                        var secondDate = new Date(date2Year, date2Month, date2Day);

                        var result = Math.floor((secondDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
                         for(var j = date1Year; j <= date2Year; j++){
                             if(isLeapYear(j)){
                                 monthDays[1]=2;
                             }else{
                                 monthDays[1]=3;
                             }
                             for(var i = date1Month - 1; i < date2Month; i++){
                                 result = result- monthDays[i];
                             }
                         }
                         return result;
                    } else {
                        //第一个时间必须小于第二个时间
                        return;
                    }
                }

                var days = compareDate(oldTime, newTime);
                return days / n;
            },
            //计算初始时间与最终时间之间的间隔点，n为间隔点
            daysRange: function (oldTime, newTime, n){
                // 对Date的扩展，将 Date 转化为指定格式的String
                // 月(M)、日(d)可以用 1-2 个占位符，
                // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
                // (new Date()).Format("yyyy-MM-dd ") ==> 2015-05-08
                // (new Date()).Format("yyyy-M-d ")      ==> 2015-5-8
                Date.prototype.Format = function(fmt) { //author: meizz
                  var o = {   
                    "M+" : this.getMonth()+1,                 //月
                    "d+" : this.getDate()                    //日
                  };
                  if(/(y+)/.test(fmt))   
                    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
                  for(var k in o)   
                    if(new RegExp("("+ k +")").test(fmt))   
                  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                  return fmt;
                }
                var daysRangeArr = [],
                    daysInterval = this.daysAverage(oldTime, newTime, n),
                    oldTime = (new Date(oldTime)).getTime(),
                    newTime = (new Date(newTime)).getTime(),
                    timeInterval = 24 * 60 * 60 * 1000;
                daysRangeArr.push((new Date(newTime)).Format("M-dd"));

                for (var i = 1; i < n; i++) {
                    var tempTime = newTime;
                    var dateInterval = (parseInt(i * daysInterval)) * timeInterval;
                    tempTime = tempTime - dateInterval; 
                    daysRangeArr.push((new Date(tempTime)).Format("M-dd"));
                }
                daysRangeArr.push((new Date(oldTime)).Format("M-dd"));
                return daysRangeArr;
            },
            //两个日期之间间隔天数计算,startDate和endDate是2015-05-18格式  
            timeDiff: function (startDate, endDate){
               var startDateArr = startDate.split("-");
               //转换为05-18-2025格式
               var startDateMs = new Date(startDateArr[1] + '/' + startDateArr[2] + '/' + startDateArr[0]);
               var endDateArr = endDate.split("-");
               var endDateMs = new  Date(endDateArr[1] + '/' + endDateArr[2] + '/' + endDateArr[0])
               return parseInt(Math.abs(startDateMs - endDateMs) / 1000 / 60 / 60 /24);
            },
            //二分法,返回value在arr中的数组下标
            binarySearch: function (value, arr, startIndex, endIndex) {
                if (!value|| !(arr instanceof Array)) return;
                var len = arr.length,
                    startIndex = typeof startIndex === "number" ? startIndex : 0,
                    endIndex = typeof endIndex === "number" ? endIndex : len - 1,
                    midIndex = Math.floor((startIndex + endIndex) / 2),
                    midval = arr[midIndex];
                if (startIndex > endIndex) return startIndex - 1;
                if (midval === value){
                    return midIndex;
                } else if (midval > value) {
                    return priceCanvas.binarySearch(value, arr, startIndex, midIndex - 1);
                } else {
                    return priceCanvas.binarySearch(value, arr, midIndex + 1, endIndex);
                }
            },
            //价格历史点curveCanvas中的坐标计算
            priceCurveCoords: function (priceHistoryData) {
                //价格历史坐标图展示的时间范围
                var list       = priceHistoryData.list,
                    showMinPri = priceHistoryData.showMinPrice,
                    // curTime    = priceHistoryData.curTime,
                    startTime  = priceHistoryData.startTime;
                // priceHistoryData.showTimeRange = priceCanvas.timeDiff(priceHistoryData.startTime, priceHistoryData.curTime);
                priceHistoryData.showTimeRange = priceCanvas.timeDiff(priceHistoryData.startTime, priceHistoryData.list[priceHistoryData.list.length-1].time);
                var listCoords = [];
                $.each(list, function(n) {
                    var thisTimeRange = priceCanvas.timeDiff(startTime, this.time);
                    //历史点的时间、价格坐标
                    var TimeCoord = Math.round((priceCanvas.timeDiff(startTime, this.time) / priceHistoryData.showTimeRange) * AUTOW);
                    var priceCoord = - Math.round(((this.price - showMinPri) / priceHistoryData.showPriceRange) * AUTOH);
                    listCoords.push([TimeCoord, priceCoord]);

                    //获取最高低价格的纵轴坐标
                    if (this.price === priceHistoryData.priceMax) {
                        priceHistoryData.priceMaxCoord = priceCoord;
                    }
                    if (priceHistoryData && priceHistoryData.priceMin && this.price === priceHistoryData.priceMin) {
                        priceHistoryData.priceMinCoord = priceCoord;
                    }
                    if (thisTimeRange !== priceHistoryData.showTimeRange) {
                        if (list.length !== n + 1) {
                            //历史点前一个像素坐标
                            var TimeCoordN = Math.round((priceCanvas.timeDiff(startTime, list[n + 1].time) / priceHistoryData.showTimeRange) * AUTOW) - 1;
                            listCoords.push([TimeCoordN, priceCoord]);
                        } else {
                            //当前日期下没有历史点是默认的坐标
                            listCoords.push([AUTOW, priceCoord]);
                        }
                    }
                });
                return listCoords;
            },

            //促销list坐标计算
            promotionCoords: function (promotionlist,priceHistory) {

                //促销list坐标图展示的时间范围
                var showMinPri  = priceHistory.showMinPrice,
                    curTime     = priceHistory.curTime,
                    startTime   = priceHistory.startTime,
                    HistoryList = priceHistory.list,
                    priceList   = [],
                    timeList    = [];
                $.each(HistoryList, function() {
                    priceList.push(this.price);
                    var date = this.time.replace(/-0/g,"-").split("-");;
                    timeList.push(Date.UTC(date[0],date[1],date[2]));
                });

                var listCoords = [];
                var priceunitSymbol = cache.data.thisPrice.priceunitSymbol;
                $.each(priceHistory.list, function(n) {
                    var list = {};
                    var thisTime = this.time.replace(/-0/g,"-").split("-");
                    var thisDate = Date.UTC(thisTime[0],thisTime[1],thisTime[2]);
                    list.start = this.time;
                    list.price =  this.price;
                    list.priceunitSymbol = priceunitSymbol;
                    list.pro = false;
                    list.X = Math.round((priceCanvas.timeDiff(startTime, this.time) / priceHistory.showTimeRange) * AUTOW);
                    list.Y = - Math.round(((list.price - showMinPri) / priceHistory.showPriceRange) * AUTOH);
                    listCoords.push(list);
                });

                if(promotionlist && promotionlist.length){
                    $.each(promotionlist, function(n) {
                        var promotionInfo = {};
                        var thisTime = this.start.replace(/-0/g,"-").split("-");
                        var thisDate = Date.UTC(thisTime[0],thisTime[1],thisTime[2]);
                        var priceSub = priceCanvas.binarySearch(thisDate,timeList);
                        promotionInfo.price = priceList[priceSub];

                        //历史点的时间、价格坐标
                        promotionInfo.X = Math.round((priceCanvas.timeDiff(startTime, this.start) / priceHistory.showTimeRange) * AUTOW);
                        promotionInfo.Y = - Math.round(((promotionInfo.price - showMinPri) / priceHistory.showPriceRange) * AUTOH);
                        promotionInfo.discount = this.promoDiscount
                        promotionInfo.info = this.info;
                        promotionInfo.name = this.name;
                        promotionInfo.start = this.start;
                        promotionInfo.pro = true;
                        promotionInfo.priceunitSymbol = priceunitSymbol;
                        listCoords.push(promotionInfo);
                    });
                }
                return listCoords;
            },

            //canvas中水平虚线的绘制方法,无CoordX参数时,虚线默认展示最值虚线 
            //canvasObj是DOM中canvas元素、dashLen是虚线段最小长度
            //存在CoordX参数时,虚线展示的是价格历史虚线
            drawDashLine: function (canvasObj, coordY, dashLen, coordX) {
                //coordX1,coordX2分别表示最值虚线起点与终点的时间轴坐标
                if(coordX === undefined) {
                    var coordX1 = -2, coordX2 = AUTOW+2;
                } else {
                    var coordX1 = 0, coordX2 = coordX;
                }

                var dashLen = (dashLen === undefined ? 5 : dashLen);
                var xWidth = coordX2 - coordX1; //得到横向的宽度;
                var yHeight = 0; //最值虚线纵向高度默认为0;
                var numDashes = Math.floor(Math.sqrt(xWidth * xWidth + yHeight * yHeight) / dashLen); 
                //利用正切获取斜边的长度除以虚线长度，得到要分为多少段;
                for(var i=0; i < numDashes; i++){
                    if(i % 2 === 0){
                        canvasObj.moveTo(coordX1 + (xWidth/numDashes) * i, coordY + (yHeight/numDashes) * i); 
                        //有了横向宽度和多少段，得出每一段是多长，起点 + 每段长度 * i = 要绘制的起点；
                   } else {
                        canvasObj.lineTo(coordX1 + (xWidth/numDashes) * i, coordY + (yHeight/numDashes) * i);
                    }
                }
                canvasObj.stroke();
            },
            drawTooltipPoint: function(domSelector, x, y){
                var canvas = $(domSelector).find('[note-type=tooltip-pointe]').get(0);
                var context = canvas.getContext("2d");

                context.fillStyle = "#ffffff";
                context.beginPath();
                context.arc(x,y,5,0,Math.PI*2,true); //Math.PI*2是JS计算方法，是圆
                context.closePath();
                context.fill();

                context.fillStyle = "#FE5B4C";
                context.beginPath();
                context.arc(x,y,3,0,Math.PI*2,true); //Math.PI*2是JS计算方法，是圆
                context.closePath();
                context.fill();
            },
            clearTooltipPoint:function(domSelector){
                var canvas = $(domSelector).find('[note-type=tooltip-pointe]').get(0);
                var context = canvas.getContext("2d");

                context.clearRect(0, 0, parseInt(AUTOW+AUTOWN+5), parseInt(AUTOH+AUTOHN));
            },
            chooseBestPromotion: function(promotionCoords, domSelector){
                var len = promotionCoords.length,
                    arr = [], obj={}, proarr = [],
                    _list, _list2,
                    axisCanvas = $(domSelector).find('.hui-history-curve').get(0);
                var newImg = new Image();
                //newImg.src = cuImage;


                for(var i=0; i < len; i++){
                    _list = promotionCoords[i];
                    if(!_list.pro){
                        if(!obj[_list.X+'|'+_list.Y]){
                            obj[_list.X+'|'+_list.Y] = true;
                            arr.push(_list);
                        }
                    }else{
                        for(var j=0; j < len; j++){
                            _list2 = promotionCoords[j];
                            //如果_list2的折扣更多就替换_list,对比出最大促销
                            if((_list.X==_list2.X && _list.Y == _list2.Y) && ( (!_list.discount && _list2.discount) || (_list.discount && _list2.discount && (_list.discount > _list2.discount))) ){
                                _list = _list2;
                            }
                        }
                        //如果数组中没有或者有但不是促销
                        if(!obj[_list.X+'|'+_list.Y] || (obj[_list.X+'|'+_list.Y] && _list.pro)){
                            obj[_list.X+'|'+_list.Y] = true;
                            arr.push(_list);
                            proarr.push(_list);
                        }
                    }
                }

                //在促销图标图片loaded后，在点上添加图标
                newImg.onload = function () {
                    var axisContent = axisCanvas.getContext('2d');
                    for(var k=0; k < proarr.length; k++){
                        if(proarr[k].pro){
                            axisContent.drawImage(newImg, proarr[k].X - 8, proarr[k].Y - 22);
                        }
                    }
                };
                return arr;
            },

            /*
            *关闭加强区提示tip
            * */
            closeCollectionWelcome :function(domSelector){
                //发log
                var logAction = domSelector== '#hui-history-canvas' ? 'BAR_HISTORY_MOD_HOVER_PROMOREC_HOVER' : 'PLUGIN_HISTORY_MOD_HOVER_PROMOREC_HOVER';
                this.sendLog(logAction);

                if(cache.localConf.closedBefore){
                    return false;
                }else{
                    msg.send('closeCollectionWelcome');
                }
            },

            sendLog: function (logAction, logType) {
                if (!!!logType) {
                    logType =  "ARMANI_EXTENSION_POPUP";
                }
                if (cache.fn && cache.fn.sendLog && util.isFunction(cache.fn.sendLog)) {
                    var logDiv = document.createElement('div');
                    cache.fn.sendLog(logAction, logDiv, logType);
                    logDiv = null;
                }
            },
            /*
            * 初始化价格点，促销点tooltip
            * @domSelector 父元素
            * @promotionCoords array 各个点数组
            * */
            initTooltip:function(domSelector,promotionCoords){
                var self = this,
                    $canvasEle = $(domSelector).find('[note-type=tooltip-pointe]');
                if(!promotionCoords || promotionCoords.length == 0){
                    return;
                }
                var pointLists = self.chooseBestPromotion(promotionCoords,domSelector);
                /*
                * 获取最接近鼠标x的时间点
                */
                function binarySearch(items, value){
                    var _list = items[0],
                        returnPoint = null,
                        newPoor, oldPoor, yPoor;
                    for(var i=0; i<items.length; i++){
                        oldPoor = Math.abs(_list.X - value.X);
                        newPoor = Math.abs(items[i].X - value.X);
                        yPoor = Math.abs(items[i].Y - value.Y);

                        // oldPoor > newPoor 用于判断鼠标 x 离哪个点 x 更近；假如相等的时候取促销的那个点； 当 hover 的是第一个价格点附近不用判断直接返回
                        if((oldPoor > newPoor)||(oldPoor == newPoor && (items[i].pro || (i == 0 && oldPoor < 5)))){
                            _list = items[i];
                            if(yPoor<6 && newPoor < 10){
                                returnPoint = _list;
                            }
                        }
                    }
                    return returnPoint;
                } 
                var _timeer;

                // 鼠标移动到线上点
                $canvasEle.bind('mousemove',function(e){
                    if($(domSelector).find('.canvas-tooltip').is(':animated')){
                        return;
                    }
                    var offset = $(this).offset();
                    var relativeX = e.pageX - offset.left,
                        relativeY = e.pageY - offset.top,
                        pointX, pointY,
                        html,
                        $canvasTooltip;
                    console.log(relativeX,"xxxxxxx");

                    // 45,160是 canvas 离父级元素的边距
                    var nowPoint = binarySearch(pointLists, {X:parseInt(relativeX-AUTOWN), Y:parseInt(relativeY-AUTOH)});
                    console.log(nowPoint,"now point");
                    if(!nowPoint){
                        return false;
                    }
                    pointX = nowPoint.X + AUTOWN;
                    pointY = nowPoint.Y + AUTOH;
                    if(_timeer){
                        clearTimeout(_timeer);
                    }
                    _timeer = setTimeout(function(){
                        self.clearTooltipPoint(domSelector);
                        self.drawTooltipPoint(domSelector,pointX,pointY);

                        html = _.template(tmplToolTip)(nowPoint);

                        $canvasTooltip = $(domSelector).find('.canvas-tooltip');

                        if($canvasTooltip.length == 0){
                            $(domSelector).append(html);
                            $canvasTooltip = $(domSelector).find('.canvas-tooltip');
                            $canvasTooltip.css({
                                left:pointX - 127,
                                top:pointY + 12
                            },100).fadeIn('fast');
                        }else{
                            $canvasTooltip.html($(html).html());
                            if(relativeX<135){
                                $('.canvas-tooltip').addClass('right');
                                $canvasTooltip.animate({
                                    left:pointX,
                                    top:pointY + 12
                                },100);
                            }else {
                                $('.canvas-tooltip').removeClass('right');
                                $canvasTooltip.animate({
                                    left:pointX - 127,
                                    top:pointY + 12
                                },100);
                            }


                        }

                        $(domSelector).css('cursor','pointer');

                        $canvasTooltip.show();

                    },20);
                });
                $canvasEle.bind('mouseleave',function(e){
                    if($(e.toElement).hasClass('canvas-tooltip')){
                        return false;
                    }
                    if(_timeer){
                        clearTimeout(_timeer);
                    }
                    $(domSelector).css('cursor','auto').find('.canvas-tooltip').fadeOut('fast');
                    self.clearTooltipPoint(domSelector);
                });
            },
            //价格历史list最值计算
            mostPriceInit: function(priceList) {
                var priceLength = priceList.length;
                if (priceLength >= 2) {
                    var priceArr = [],
                        priceIndex = 0;
                    while(priceLength--){
                        priceArr.push(priceList[priceIndex].price)
                        priceIndex++;
                    }
                    priceArr.sort(function(a, b){return a > b ? 1 : -1});
                    cache.data.priceHistoryData.priceMax = priceArr.pop();
                    //当价格平稳则不存在最小值
                    if (priceArr.length > 0 && priceArr[0] !== cache.data.priceHistoryData.priceMax) {
                        cache.data.priceHistoryData.priceMin = priceArr[0];
                    }
                }
            },
            timerAnimationFrame: null,
            //价格历史Canvas实现逻辑
            init: function (domSelector, data, triggerEle, beginAnimte) {
                if(!$(domSelector).length) return;
                var self = this;
                var $mod = $(domSelector);
                cache.data = data;
                var priceHistoryData = cache.data.priceHistoryData;

                // var winW = $(window).width();

                var winW = 390;
                if (winW <= 640) {
                    AUTOW = winW - 120;
                } else if (winW < 1000) {
                    AUTOW = 520;
                } else {
                    AUTOW = 670;
                }
                AUTOH = AUTOW / 2; //高度
                // AUTOH = AUTOW / 2  + 10; //高度
                var historytmpl = '<canvas class="hui-history-axis" width="' + parseInt(AUTOW+AUTOWN+5) + '" height="' + parseInt(AUTOH+AUTOHN) + '"></canvas><canvas class="hui-history-curve" width="' + parseInt(AUTOW+AUTOWN+5) + '" height="' + parseInt(AUTOH+AUTOHN) + '"></canvas><canvas class="hui-history-canvas-tooltip" note-type="tooltip-pointe" width="' + parseInt(AUTOW+AUTOWN+5) + '" height="' + parseInt(AUTOH+AUTOHN) + '"></canvas><div class="hui-history-labels"><div class="hui-history-time-axis"></div><div class="hui-history-price-axis"></div></div><div class="hui-history-most-price"></div>';

                $mod.width(parseInt(AUTOW+AUTOWN+35)).height(parseInt(AUTOH+AUTOHN+5)).html(historytmpl);

                //根据价格list计算价格历史最值
                if (!priceHistoryData.priceMax) {
                    self.mostPriceInit(priceHistoryData.list);
                }

                //axisCanvas主要负责价格历史坐标轴的绘制
                var axisCanvas = $mod.find('.hui-history-axis').get(0);
                var itemAUTOW = parseInt(AUTOW / 6); //每一个格子宽度
                if (axisCanvas.getContext) {
                    var axis = axisCanvas.getContext('2d');
                    axis.beginPath();
                    //绘制横轴时间轴线（竖线）
                    axis.translate(parseInt(AUTOWN+0.5), 0.5); //偏移
                    axis.strokeStyle = "#DEDEDE";
                    axis.lineWidth = 1;
                    axis.moveTo(0, -2);
                    axis.lineTo(0, AUTOH+2);
                    axis.stroke();
                    axis.closePath();
                    axis.beginPath();
                    axis.strokeStyle = "#efefef";
                    axis.moveTo(itemAUTOW, 0);
                    axis.lineTo(itemAUTOW, AUTOH);
                    axis.stroke();
                    axis.moveTo(itemAUTOW*2, 0);
                    axis.lineTo(itemAUTOW*2, AUTOH);
                    axis.stroke();
                    axis.moveTo(itemAUTOW*3, 0);
                    axis.lineTo(itemAUTOW*3, AUTOH);
                    axis.stroke();
                    axis.moveTo(itemAUTOW*4, 0);
                    axis.lineTo(itemAUTOW*4, AUTOH);
                    axis.stroke();
                    axis.moveTo(itemAUTOW*5, 0);
                    axis.lineTo(itemAUTOW*5, AUTOH);
                    axis.stroke();
                    axis.moveTo(AUTOW, 0);
                    axis.lineTo(AUTOW, AUTOH);
                    axis.stroke();
                    
                    //时间轴线横轴轴坐标位置定义（X轴上的日期值）
                    var timeLabelLocation = [ itemAUTOW*6+25,  itemAUTOW*5+25,  itemAUTOW*4+25,  itemAUTOW*3+25, itemAUTOW*2+25, itemAUTOW+25, 35]; //位置
                    var daysRangeArr = self.daysRange(priceHistoryData.startTime, priceHistoryData.list[priceHistoryData.list.length-1].time, 6); //数据
                    // var daysRangeArr = self.daysRange(priceHistoryData.startTime, priceHistoryData.curTime, 6); //数据
                    var historyCanvaseTime = "";
                    $.each(_.zip(daysRangeArr, timeLabelLocation), function(n, arr){
                        historyCanvaseTime += '<div class="hui-history-time-label-pc" style="left:' + arr[1] + 'px;">' + arr[0] + '</div>';
                    });

                    $mod.find(".hui-history-time-axis").html(historyCanvaseTime);
                    
                    //价格轴线纵轴价格
                    var priceAverageArr = self.priceAverage(priceHistoryData.priceMax, priceHistoryData.priceMin);
                    
                    //价格轴线纵轴坐标位置定义,根据轴线数量对应数组中的项
                    var priceAxisCoord = [
                        [0, parseInt(AUTOH/2), AUTOH], 
                        [0, parseInt(AUTOH/3), parseInt(AUTOH/3*2), AUTOH], 
                        [0, parseInt(AUTOH/4), parseInt(AUTOH/2), parseInt(AUTOH/4*3), AUTOH], 
                        [0, parseInt(AUTOH/5), parseInt(AUTOH/5*2), parseInt(AUTOH/5*3), parseInt(AUTOH/5*4), AUTOH], 
                        [0, parseInt(AUTOH/6), parseInt(AUTOH/3), parseInt(AUTOH/2), parseInt(AUTOH/6*4), parseInt(AUTOH/6*5), AUTOH], 
                        [0, parseInt(AUTOH/7), parseInt(AUTOH/7*2), parseInt(AUTOH/7*3), parseInt(AUTOH/7*4), parseInt(AUTOH/7*5), parseInt(AUTOH/7*6), AUTOH]];

                    //价格标签纵轴坐标位置定义,根据轴线数量对应数组中的项
                    var priceLabelLocation = [
                        [-6, parseInt(AUTOH/2)-10, AUTOH-10], 
                        [-6, parseInt(AUTOH/3)-8, parseInt(AUTOH/3*2)-8, AUTOH-8], 
                        [-6, parseInt(AUTOH/4)-8, parseInt(AUTOH/2)-8, parseInt(AUTOH/4*3)-8, AUTOH-8], 
                        [-6, parseInt(AUTOH/5)-8, parseInt(AUTOH/5*2)-8, parseInt(AUTOH/5*3)-8, parseInt(AUTOH/5*4)-8, AUTOH-8], 
                        [-6, parseInt(AUTOH/6)-8, parseInt(AUTOH/3)-8, parseInt(AUTOH/2)-8, parseInt(AUTOH/6*4)-8, parseInt(AUTOH/6*5)-8, AUTOH-8], 
                        [-6, parseInt(AUTOH/7)-8, parseInt(AUTOH/7*2)-8, parseInt(AUTOH/7*3)-8, parseInt(AUTOH/7*4)-8, parseInt(AUTOH/7*5)-8, parseInt(AUTOH/7*6)-8, AUTOH-8]];
                    var priceLabelLength = priceAverageArr.length;
                    var priceLabeSub     = priceLabelLength - 3;
                    priceAxisCoord = priceAxisCoord[priceLabeSub];
                    
                    priceLabelLocation = priceLabelLocation[priceLabeSub];
                    var historyCanvasePrice = ""; 
                    // 将价格轴标签值、价格标签位置、价格轴线位置对应组合为数组项,迭代绘制

                    $.each(_.zip(priceAverageArr, priceLabelLocation, priceAxisCoord), function(n, arr){
                        if (arr[0] >= 0) {
                            historyCanvasePrice += '<div class="hui-history-price-label" style="top:' + arr[1] + 'px;">' + arr[0] + '</div>';
                        }
                        //最下面价格轴线颜色较深应分别处理
                        if(n !== priceLabelLength -1) {
                            axis.moveTo(-1, arr[2]);
                            axis.lineTo(AUTOW+2, arr[2]);
                            axis.stroke();
                        } else {
                            axis.closePath();
                            axis.beginPath();
                            axis.strokeStyle = "#DEDEDE";
                            axis.moveTo(-2, arr[2]);
                            axis.lineTo(AUTOW+2, arr[2]);
                            axis.stroke();
                        }
                        axis.closePath();
                    });
                    //价格标签list的内容;
                    $mod.find(".hui-history-price-axis").html(historyCanvasePrice);
                }

                // 最高价与最低价展示
                // 计算最高、低价标签的展示位置,并插入到canvas展示右侧;
                var showMaxPrice = priceHistoryData.showMaxPrice = priceAverageArr[0];
                var showMinPrice = priceHistoryData.showMinPrice = priceAverageArr.pop();
                priceHistoryData.showPriceRange = self.SUB(showMaxPrice,showMinPrice);
                var maxPriceLabel = Math.round(((showMaxPrice - priceHistoryData.priceMax) / priceHistoryData.showPriceRange) * AUTOH) - 12;

                // 最高价标签
                var mostPriceHtml = '<dl style="top:' + maxPriceLabel + 'px;"><dd>' + priceHistoryData.priceMax +'</dd></dl>';


                // 最低价标签
                if(priceHistoryData && priceHistoryData.priceMin) {

                    var minPriceLabel = Math.round(((showMaxPrice - priceHistoryData.priceMin) / priceHistoryData.showPriceRange) * AUTOH) -4;

                    mostPriceHtml += '<dl style="top:' + minPriceLabel + 'px;"><dd>' + priceHistoryData.priceMin +'</dd></dl>';
                }
                $mod.find(".hui-history-most-price").html(mostPriceHtml);

                //价格历史点curveCanvas中的坐标计算
                var listCoords = self.priceCurveCoords(priceHistoryData);
                var firstDrawLine = true,
                    progress = 0,
                    progressDots = 0;


                //价格历史曲线绘制
                function renderJiageLine(){
                    if(!firstDrawLine){
                        return false;
                    }else{
                        firstDrawLine = false;
                    }

                    //价格曲线、最值价格虚线、价格补充虚线在curveCanvas中绘制
                    var curveCanvas = $mod.find('.hui-history-curve').get(0),
                        historyCurve;

                    if (curveCanvas.getContext) {

                        //将价格历史list价格和时间转化为历史曲线坐标点
                        historyCurve = curveCanvas.getContext('2d');
                        historyCurve.translate(parseInt(AUTOWN+0.5), parseInt(AUTOH+0.5));

                        render();
                    }
                    function render(){
                        progressDots = Math.ceil( progress * listCoords.length ); // 递加数字
                        var progressFragment = ( progress * listCoords.length ) - Math.floor( progress * listCoords.length );

                        var nowPrice,           // 当前价格
                            nowPriceCoord,      // 最后价格点
                            nowPriceLabel,      // 当前价格 top 值
                            diffMax,            // 最高价到当前价标签 top 差值
                            diffMin,            // 最低价到当前价标签 top 差值
                            historyStartCoord;  // 价格历史起点前一个像素的时间轴坐标

                        // 首先清空画布
                        historyCurve.clearRect(-2, 0, parseInt(AUTOW+AUTOWN+7), parseInt(-AUTOH-AUTOHN));

                        //当存在最低价格时,绘制最值虚线
                        if(priceHistoryData && priceHistoryData.priceMin) {

                            // 绘制最值虚平行线
                            historyCurve.lineWidth = 1;
                            historyCurve.strokeStyle = "#cccccc";
                            self.drawDashLine(historyCurve, priceHistoryData.priceMaxCoord, 2);
                            self.drawDashLine(historyCurve, priceHistoryData.priceMinCoord, 2);
                            historyCurve.closePath();

                            // 绘制最后价格点的虚平行线
                            nowPrice = priceHistoryData.list[priceHistoryData.list.length - 1].price;
                            if (nowPrice !== priceHistoryData.priceMax && nowPrice !== priceHistoryData.priceMin) {

                                //当前价展示标签
                                nowPriceLabel = Math.round(((showMaxPrice - nowPrice) / priceHistoryData.showPriceRange) * AUTOH) - 9;
                                if($mod.find(".hui-history-most-price dl.can-append").length == 0){

                                    // 处理右侧展示价格标签重合的情况
                                    diffMax = maxPriceLabel - nowPriceLabel;
                                    diffMin = minPriceLabel - nowPriceLabel
                                    if(Math.abs(diffMax) < 19){
                                        nowPriceLabel += 10 + diffMax

                                    }else if(Math.abs(diffMin) < 19){
                                        nowPriceLabel -= 10 - diffMin

                                    }
                                    $mod.find(".hui-history-most-price").append('<dl style="top:' + nowPriceLabel + 'px;" class="can-append"><dd >' + nowPrice +'</dd></dl>');
                                }

                                //绘制当前价格虚平行线
                                nowPriceCoord = listCoords[listCoords.length - 1];
                                historyCurve.beginPath();
                                historyCurve.lineWidth = 1;
                                historyCurve.strokeStyle = "#cccccc";
                                self.drawDashLine(historyCurve, nowPriceCoord[1], 4);
                                historyCurve.closePath();

                            } else if (nowPrice === priceHistoryData.priceMin) {
                                $mod.find("#lastLow").css({"color":"red"});
                            }
                        }

                        //当价格历史时间区间小于三个月时,价格走势展示虚线
                        if(self.timeDiff(priceHistoryData.startTime, priceHistoryData.list[0].time) > 0) {

                            // 价格历史起点前一个像素的时间轴坐标
                            historyStartCoord = listCoords[0][0] + 2;

                            historyCurve.beginPath();
                            historyCurve.strokeStyle = "#FE5B4C";
                            self.drawDashLine(historyCurve, listCoords[0][1], 2, historyStartCoord);
                            historyCurve.closePath();
                        }

                        // 价格曲线的绘制
                        historyCurve.save();
                        historyCurve.beginPath();
                        historyCurve.translate(-0.5, -0.5);
                        historyCurve.strokeStyle = "#FE5B4C";
                        historyCurve.lineWidth = 2;
                        $.each(listCoords, function(n) {
                            if( n <= progressDots) {
                                var px = n === 0 ? listCoords[0][0] : listCoords[n-1][0],
                                    py = n === 0 ? listCoords[0][0] : listCoords[n-1][1],
                                    x = this[0],
                                    y = this[1];

                                if( n === progressDots ) {
                                    x = px + ( ( x - px ) * progressFragment );
                                    y = py + ( ( y - py ) * progressFragment );
                                }

                                // canvas 绘制线条第一点时使用moveTo()方法;
                                if (n === 0) {
                                    historyCurve.moveTo(x, y);
                                } else {
                                    historyCurve.lineTo(x, y);
                                }
                            }
                        });
                        historyCurve.stroke();
                        historyCurve.restore();

                        // 递增
                        progress += ( 1 - progress ) * 0.05;
                        var promotionCoords;
                        if(progressDots < listCoords.length){
                            self.timerAnimationFrame = self.requestAFrame(render);
                        }else{
                            self.cancelAFrame(self.timerAnimationFrame);
                            promotionCoords = self.promotionCoords(cache.data.promotionHistory,priceHistoryData);
                            self.initTooltip(domSelector,promotionCoords);
                        }
                    }

                }

                // 通过 hover 事件动态绘制价格曲线
                $(document).undelegate(triggerEle,'mouseenter');
                var timeer_jiage;
                $(document).delegate(triggerEle,'mouseenter',function(event){
                    event.stopPropagation();
                    if(timeer_jiage){
                        clearTimeout(timeer_jiage);
                    }
                    timeer_jiage = setTimeout(function(){
                        renderJiageLine();
                    },300)
                }).delegate(triggerEle,'mouseleave',function(){
                    if(timeer_jiage){
                        clearTimeout(timeer_jiage);
                    }
                });

                // 不需要 hover 直接运行
                if(beginAnimte){
                    self.cancelAFrame(self.timerAnimationFrame);
                    renderJiageLine();
                }
            }
    };
    // var data = $('[data-json]').data('json');
    // priceCanvas.init('#hui-plughistory-canvas', data, '#hui-plugin-history', true);

window.priceCanvas = priceCanvas;
//     return priceCanvas;
// });