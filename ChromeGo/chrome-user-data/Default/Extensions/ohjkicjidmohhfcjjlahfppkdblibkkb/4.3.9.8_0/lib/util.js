(function ($) {

    var toStr = Object.prototype.toString;
    var _ = $._;

    /**
     * util类，其中包含了一些常用的方法，比如判断类型的isString/Fuction/Array
     *
     * @class util
     */
    var util = {
        mode: document.compatMode,

        /**
         * 判断是否是字符串
         *
         * @method isString
         * @param {Object} 需要判断的参数
         * @return {Bool}  如果是则返回true
         */
        isString: function (str) {
            return toStr.call(str) === "[object String]";
        },

        /**
         * 判断是否是函数
         *
         * @method isFunction
         * @param {Object} 需要判断的参数
         * @return {Bool}  如果是则返回true
         */
        isFunction: function (fn) {
            return toStr.call(fn) === "[object Function]";
        },

        /**
         * 判断是否是数组
         *
         * @method isArray
         * @param {Object} 需要判断的参数
         * @return {Bool}  如果是则返回true
         */
        isArray: function (arr) {
            return toStr.call(arr) === "[object Array]";
        },

        /**
         * 判断元素是否存在数组中
         *
         * @method isInArray
         * @param {Array} 需要判断的数组
         * @param {Object} 需要判断的元素
         * @return {Bool}  如果是则返回true
         */
        isInArray: function (arr, ele) {
            var i;
            if (!this.isArray(arr)) {
                return false;
            }

            for (i = 0; i < arr.length; i++) {

                if (arr[i] == ele) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 判断元素是否存在数组中
         * @method delRepetitionArray
         * @param {Array} 需要判断的数组
         * @return {Array}  返回去重后的数组
         */
        delRepetitionArray: function (arr) {
            var res = [arr[0]],
                len = arr.length;
            for(var i = 1; i < len; i++){
                var repeat = false;
                for(var j = 0; j < res.length; j++){
                    if(arr[i] == res[j]){
                        repeat = true;
                        break;
                    }
                }
                if(!repeat){
                    res.push(arr[i]);
                }
            }
            return res;
        },

        /**
         * 判断是否是空对象
         *
         * @method isEmptyObject
         * @param {Object} 需要判断的对象
         * @return {Bool}  如果是则返回true
         */
        isEmptyObject: function (obj) {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        },

        getNumberLength: function (num) {
            if (isNaN(num)) {
                return 0;
            }
            num = num < 0 ? -num : num;
            return Math.floor(Math.log(num) / Math.log(10)) + 1;
        },

        /**
         * 去空格
         *
         * @method trim
         * @return {String} 待去空格文字
         */
        trim: function (text) {
            return (text || "").replace(/^\s+|\s+$/g, "");
        },

        /**
         * 将json转换成字符串，如果没有指定分隔符，那么默认就是以&分隔，
         * 并且json对为等号相连
         *
         * @method jsonToStr
         * @param {JSON} 需要转换的json
         * @param {String} 分隔符
         * @return {String} 转换后的字符串
         */
        jsonToStr: function (oParam, x) {
            var pa = [];
            var k;

            if (!x) {
                x = '&';
            }
            for (k in oParam) {
                if (oParam.hasOwnProperty(k)) {
                    pa.push(k + '=' + oParam[k]);
                }
            }
            return pa.join(x);
        },

        /**
         * 这个是JSONP拼接url用到的方法，这个方法还提供了encodeURI的功能
         *
         * @method comboParams
         * @param {JSON} 需要拼接的JSON
         * @return {String} 拼接后的字符串
         */
        comboParams: function (oParam) {
            var pa = [];
            var k;

            for (k in oParam) {
                if (oParam.hasOwnProperty(k)) {
                    if (k === 'jsonp') {
                        pa.unshift(k + '=' + encodeURIComponent(oParam[k]));
                    } else {
                        pa.push(k + '=' + encodeURIComponent(oParam[k]));
                    }
                }
            }
            pa.push('t=' + (+new Date()));
            return pa.join('&');
        },

        /**
         * 获得模块的名称
         *
         * @method getModName
         * @param {String} 模块参数名
         * @return {String} 模块名
         */
        getModName: function (modNS) {

            if (util.isString(modNS)) {
                var name_list = modNS.split('.');
                return name_list[name_list.length - 1];
            }
        },

        /**
         * 将URI转换成json串
         *
         * @method urlToJson
         * @param {String} 待转换的url
         * @param {String} 默认是以&为标志进行转换
         * @return {Object} 转换后的json串
         */
        urlToJson: function (url, x) {
            var obj = {},
                options = url;
            var i, len;

            if (!x) {
                x = '&';
            }

            options = options.replace(/^[?]{1}|[#]{1}$/g, '').split(x);
            for (i = 0, len = options.length; i < len; i++) {

                var e = options[i].split('=');
                if (e[0].length === 0) continue;
                obj[e[0]] = e.length === 1 ? '': e[1];
            }
            return obj;
        },

        /**
         * check whether flash has been installed and flash version
         *
         * return json:
         * {
         *         hasFlash : true/false,
         *         version : [11,1,102]
         * }
         *
         * @method checkFlash
         * @return {JSON}  {hasFlash : true/false,version : [11,1,102]}
         */
        checkFlash: function () {
            var isIE = (navigator.appVersion.indexOf('MSIE') >= 0);
            var hasFlash = true;
            var version = [0, 0, 0];
            var swf;
            var d;
            // check ie browser whether flash has been installed and flash version
            if (isIE) {
                try {
                    swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                    if (swf) {
                        d = swf.GetVariable('$version'); // d = 'WIN 11,1,102,55'
                        if (d) {
                            d = d.split(' ')[1].split(',');
                            version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                        }
                    } else {
                        hasFlash = false;
                    }
                } catch(e) {
                    hasFlash = false;
                }
            } else {
                //  check chrome and firefox browser whether flash has been installed and flash version
                swf = navigator.plugins['Shockwave Flash'];
                if (!swf) {
                    hasFlash = false;
                } else {
                    // flash installed and get the version
                    d = swf.description;
                    if (d) { // d='Shockwave Flash 11.1 r102'
                        d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                        version[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                        version[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                        version[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
                    }
                }
            }
            return {
                'hasFlash': hasFlash,
                'version': version
            }; //json object
        },

        /**
         * 得到一个map里面的area相对于map的位置和,每个area的高和宽
         *
         * @method getCoordsPosition
         * @param {Array} area的coords属性，然后split(",")得到的数组
         * @public
         * @return {Object} dimension.left:area相对于对于map的left值;dimension.top:
         *                   area相对于map的top值;dimension.width,dimension.height;
         *
         */
        getCoordsPosition: function (coordsArray) {
            var maxX, maxY, minX, minY, areaWidth, areaHeight;
            var i, coords;
            var dimension = {};
            coords = _.map(coordsArray, function (coord) {
                if (coord < 0) {
                    return 0;
                }
                return coord;
            });
            //get the left  and top  of the area
            maxX = minX = parseInt(coords[0], 10);
            maxY = minY = parseInt(coords[1], 10);

            //If the area is polygen, we must get
            //the maxX and maxY.
            for (i = 0; i < coords.length; i += 2) {
                var xx = parseInt(coords[i], 10);
                var yy = parseInt(coords[i + 1], 10);

                if (xx > maxX) {
                    maxX = xx;
                }

                if (xx < minX) {
                    minX = xx;
                }

                if (yy > maxY) {
                    maxY = yy;
                }

                if (yy < minY) {
                    minY = yy;
                }
            }

            areaWidth = maxX - minX;
            areaHeight = maxY - minY;

            dimension.left = minX;
            dimension.top = minY;
            dimension.width = parseInt(areaWidth, 10);
            dimension.height = parseInt(areaHeight, 10);

            return dimension;

        },

        /***
         * set the feature code .
         * St.  setFtCode('000100',0,true)  return '100100'
         *         setFtCode('000100',2,true)  return '001100'
         *         setFtCode('100100',0,false)  return '000100'
         *         action {true : write, false : add }
         */
        setFtCode: function (ftCode, num, flag, action) {
            if (num < 0) {
                return ftCode;
            }

            var arrA = [],
                arrB = ftCode.split(''),
                len = Math.max(arrB.length, num);
            var i, len;

            for (i = 0; i < len; i++) {
                arrA.push(arrB[i] || 0);
            }

            arrA[num - 1] = action ? flag : parseInt(arrA[num - 1], 10) + flag;

            return arrA.join('');
        },
        /**
         * 这是一个对象a标签中URL带一个参数情况下，URL后的参数以&连接错误的判断和修改。
         *
         * @method filtraUrlFormat
         * @param {obj} obj为a标签的jQuery对象list
         * @public
         */
        filtraUrlFormat: function (obj) {
            obj.each(function() {
                var dataListUrl = $(this).attr("href");
                if(dataListUrl.indexOf("?") === -1){
                    var dataListUrl = dataListUrl.replace("&","?");
                    $(this).attr("href",dataListUrl);
                }
            });
        },

        /***
         * 将 html 字符转为实体，避免影响到 html
         *
         * @method escapeHtml
         * @param html 传入字符串
         * @return {string}
         *
         * xx&xx> => xx&amp;xx&gt;
         *
         */
        escapeHtml: function (html) {
            var entityMap = {
                escape: {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }
            };
            var escapeStr,
                _arr = [],
                entityReg;
            for(var key in entityMap.escape){
                _arr.push(key);
            }
            escapeStr = _arr.join('|');
            entityReg = new RegExp('[' + escapeStr + ']','g');

            if (typeof html !== 'string') return '';
            return html.replace(entityReg, function(match) {
                return entityMap.escape[match]
            })
        }

    };

   window.util = util;

}(window.$));