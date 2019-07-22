;(function(){
'use strict';

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    throwError()
    return
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  function throwError () {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.exts = [
    '',
    '.js',
    '.json',
    '/index.js',
    '/index.json'
 ];

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  for (var i = 0; i < 5; i++) {
    var fullPath = path + require.exts[i];
    if (require.modules.hasOwnProperty(fullPath)) return fullPath;
    if (require.aliases.hasOwnProperty(fullPath)) return require.aliases[fullPath];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {

  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' === path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }
  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throwError()
    return
  }
  require.aliases[to] = from;

  function throwError () {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' === c) return path.slice(1);
    if ('.' === c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = segs.length;
    while (i--) {
      if (segs[i] === 'deps') {
        break;
      }
    }
    path = segs.slice(0, i + 2).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("smzdm_pro/source/main.js", function(exports, require, module){
/**
 * 插件入口
 */

// 插件相关
// 兼容搜狗浏览器
var brow = ',se-extension,chrome-extension,mxaddon-pkg'
if(brow.indexOf(location.href.split('://')[0]) > 0){
	// 寻找view文件夹，与html同名的js
	require('./view/' + location.href.split('/').reverse()[0].split('.html')[0])
}
// 脚本嵌入
else{
	// 加载content
	require('./view/content')
}

});
require.register("smzdm_pro/source/config/config.js", function(exports, require, module){
/**
 * 配置文件
 * @author s
 * @date   2014/07/01
 * @time   11:00
 */

var DBoy = require('../src/core/DBoy')  

// 插件信息
var app = {
        api: "https://api.smzdm.com/v1", 
        version: "2.4.6.0",
        channel: ['empty','youhui','shaiwu','jingyan','faxian','haitao','news','yuanchuang','wiki'],
        variety: {post:'youhui', os:'shaiwu', exp:'jingyan', news:'news', ht:'haitao',yc:'yuanchuang'}, // 添加收藏频道的重定向
        tny: '5Rkl*dIw76uq3$3',
        port: 9271,
        port2: 8091,
        census: function(medium,term,content){
            var key = 'Push'
              , brow = DBoy.unit.browType()
            for(var i in brow){
                if(brow[i]) key = i
            }
            return "utm_source="+ key + "&utm_medium=" + medium + "&utm_campaign=" + term + "&utm_Content=" + content
        }
    },
    // 请求地址
    url = {
        special        : function(){return spliceUrl("/filter/tags?type=home")}, // 特色标签
        category       : function(){return spliceUrl("/filter/categories/")}, // 分类
        push_post      : function(){return spliceUrl("/youhui/push_posts/")}, // 推送
        login          : function(){return spliceUrl("/user/login/")}, // 登录
        userinfo       : function(){return spliceUrl("/user/info/")}, // 用户信息
        getfav         : function(){return spliceUrl("/user/favorites/")}, // 获取收藏
        captcha        : function(){return spliceUrl("/user/captcha/?lang=en&flag=login")}, // 验证码
        addfav         : function(){return spliceUrl("/user/favorites/create/")},// 添加收藏
        delfav         : function(){return spliceUrl("/user/favorites/destroy/")},// 删除收藏
        report         : function(){return spliceUrl("/user/feedback")},// 插件回复
        VERSIONUPDATE  : "http://res.smzdm.com/extension/chrome/json/updata.json", // 版本更新日志
		searchword     : function(){return spliceUrl("/util/search/search_word")}
    },

    // 推送相关
    pull = {
        start:true,
        loopTime:30 // 推送请求时间
    },

    // 日志配置 
    log = {
        
    }


/**
 * 拼接url
 */
function spliceUrl(str){
    var str = app.api + str
    if(str.indexOf('?') > 0){
        str += '&'
    }else{
        str += '?'
    }
    str += 'f=chrome&'
    if(DBoy.local('s')) str += 's=' + DBoy.local('s') + '&'
    //console.log('config/config:spliceUrl', str)
    return str
}

module.exports = {
    app:app,
    url:url,
    pull:pull,
    log:log
}
});
require.register("smzdm_pro/source/lib/avalon.js", function(exports, require, module){
//==================================================
// avalon.mobile 1.3.2 2014.7.25，mobile 注意： 只能用于IE10及高版本的标准浏览器
//==================================================
var DOC = document
var prefix = "ms-"
var expose = Date.now()
var subscribers = "$" + expose
var window = this || (0, eval)('this')
var otherRequire = window.require
var otherDefine = window.define
var stopRepeatAssign = false
var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
var rcomplextype = /^(?:object|array)$/
var rwindow = /^\[object (Window|DOMWindow|global)\]$/
var oproto = Object.prototype
var ohasOwn = oproto.hasOwnProperty
var serialize = oproto.toString
var ap = Array.prototype
var aslice = ap.slice
var Registry = {} //将函数曝光到此对象上，方便访问器收集依赖
var head = DOC.head //HEAD元素
var root = DOC.documentElement
var hyperspace = DOC.createDocumentFragment()
var cinerator = DOC.createElement("div")
var class2type = {}
"Boolean Number String Function Array Date RegExp Object Error".replace(rword, function(name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
})

function noop() {
}

function log(a) {
    // if (avalon.config.debug) {
        console.log(a)
    // }
}

/*********************************************************************
 *                 命名空间与工具函数                                 *
 **********************************************************************/
window.avalon = function(el) { //创建jQuery式的无new 实例化结构
    return new avalon.init(el)
}
avalon.init = function(el) {
    this[0] = this.element = el
}
avalon.fn = avalon.prototype = avalon.init.prototype

/*取得目标类型*/
function getType(obj) { //
    if (obj == null) {
        return String(obj)
    }
    // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
    return typeof obj === "object" || typeof obj === "function" ?
            class2type[serialize.call(obj)] || "object" :
            typeof obj
}
avalon.type = getType
avalon.isWindow = function(obj) {
    return rwindow.test(serialize.call(obj))
}

/*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/

avalon.isPlainObject = function(obj) {
    return !!obj && typeof obj === "object" && Object.getPrototypeOf(obj) === oproto
}

avalon.mix = avalon.fn.mix = function() {
    var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false

    // 如果第一个参数为布尔,判定是否深拷贝
    if (typeof target === "boolean") {
        deep = target
        target = arguments[1] || {}
        i++
    }

    //确保接受方为一个复杂的数据类型
    if (typeof target !== "object" && getType(target) !== "function") {
        target = {}
    }

    //如果只有一个参数，那么新成员添加于mix所在的对象上
    if (i === length) {
        target = this
        i--
    }

    for (; i < length; i++) {
        //只处理非空参数
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name]
                copy = options[name]

                // 防止环引用
                if (target === copy) {
                    continue
                }
                if (deep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false
                        clone = src && Array.isArray(src) ? src : []

                    } else {
                        clone = src && avalon.isPlainObject(src) ? src : {}
                    }

                    target[name] = avalon.mix(deep, clone, copy)
                } else if (copy !== void 0) {
                    target[name] = copy
                }
            }
        }
    }
    return target
}

function resetNumber(a, n, end) { //用于模拟slice, splice的效果
    if ((a === +a) && !(a % 1)) { //如果是整数
        if (a < 0) { //范围调整为 [-a, a]
            a = a * -1 >= n ? 0 : a + n
        } else {
            a = a > n ? n : a
        }
    } else {
        a = end ? n : 0
    }
    return a
}

function oneObject(array, val) {
    if (typeof array === "string") {
        array = array.match(rword) || []
    }
    var result = {},
            value = val !== void 0 ? val : 1
    for (var i = 0, n = array.length; i < n; i++) {
        result[array[i]] = value
    }
    return result
}
avalon.mix({
    rword: rword,
    subscribers: subscribers,
    version: 1.31,
    ui: {},
    models: {},
    log: log,
    noop: noop,
    error: function(str, e) { //如果不用Error对象封装一下，str在控制台下可能会乱码
        throw new (e || Error)(str)
    },
    oneObject: oneObject,
    /* avalon.range(10)
     => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     avalon.range(1, 11)
     => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     avalon.range(0, 30, 5)
     => [0, 5, 10, 15, 20, 25]
     avalon.range(0, -10, -1)
     => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
     avalon.range(0)
     => []*/
    range: function(start, end, step) { // 用于生成整数数组
        step || (step = 1)
        if (end == null) {
            end = start || 0
            start = 0
        }
        var index = -1,
                length = Math.max(0, Math.ceil((end - start) / step)),
                result = Array(length)
        while (++index < length) {
            result[index] = start
            start += step
        }
        return result
    },
    slice: function(nodes, start, end) {
        return aslice.call(nodes, start, end)
    },
    contains: function(a, b) {
        return a.contains(b)
    },
    eventHooks: {},
    bind: function(el, type, fn, phase) {
        var hooks = avalon.eventHooks
        var hook = hooks[type]
        if (typeof hook === "object") {
            type = hook.type
            if (hook.deel) {
                fn = hook.deel(el, fn)
            }
        }
        el.addEventListener(type, fn, !!phase)
        return fn
    },
    unbind: function(el, type, fn, phase) {
        var hooks = avalon.eventHooks
        var hook = hooks[type]
        if (typeof hook === "object") {
            type = hook.type
        }
        el.removeEventListener(type, fn || noop, !!phase)
    },
    css: function(node, name, value) {
        if (node instanceof avalon) {
            node = node[0]
        }
        var prop = /[_-]/.test(name) ? camelize(name) : name
        name = avalon.cssName(prop) || prop
        if (value === void 0 || typeof value === "boolean") { //获取样式
            var fn = cssHooks[prop + ":get"] || cssHooks["@:get"]
            var val = fn(node, name)
            return value === true ? parseFloat(val) || 0 : val
        } else if (value === "") { //请除样式
            node.style[name] = ""
        } else { //设置样式
            if (value == null || value !== value) {
                return
            }
            if (isFinite(value) && !avalon.cssNumber[prop]) {
                value += "px"
            }
            fn = cssHooks[prop + ":set"] || cssHooks["@:set"]
            fn(node, name, value)
        }
    },
    each: function(obj, fn) {
        if (obj) { //排除null, undefined
            var i = 0
            if (isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    fn(i, obj[i])
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        fn(i, obj[i])
                    }
                }
            }
        }
    },
    getWidgetData: function(elem, prefix) {
        var raw = avalon(elem).data()
        var result = {}
        for (var i in raw) {
            if (i.indexOf(prefix) === 0) {
                result[i.replace(prefix, "").replace(/\w/, function(a) {
                    return a.toLowerCase()
                })] = raw[i]
            }
        }
        return result
    },
    parseJSON: JSON.parse,
    Array: {
        /*只有当前数组不存在此元素时只添加它*/
        ensure: function(target, item) {
            if (target.indexOf(item) === -1) {
                target.push(item)
            }
            return target
        },
        /*移除数组中指定位置的元素，返回布尔表示成功与否*/
        removeAt: function(target, index) {
            return !!target.splice(index, 1).length
        },
        /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
        remove: function(target, item) {
            var index = target.indexOf(item)
            if (~index)
                return avalon.Array.removeAt(target, index)
            return false
        }
    }
})
/*生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript*/
function generateID() {
    return "avalon" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
function isArrayLike(obj) {
    if (obj && typeof obj === "object") {
        var n = obj.length,
                str = serialize.call(obj)
        if (/(Array|List|Collection|Map|Arguments)\]$/.test(str)) {
            return true
        } else if (str === "[object Object]" && (+n === n && !(n % 1) && n >= 0)) {
            return true //由于ecma262v5能修改对象属性的enumerable，因此不能用propertyIsEnumerable来判定了
        }
    }
    return false
}
avalon.isArrayLike = isArrayLike
/*视浏览器情况采用最快的异步回调*/
avalon.nextTick = window.setImmediate ? setImmediate.bind(window) : function(callback) {
    setTimeout(callback, 0)
}
if (!root.contains) { //safari5+是把contains方法放在Element.prototype上而不是Node.prototype
    Node.prototype.contains = function(arg) {
        return !!(this.compareDocumentPosition(arg) & 16)
    }
}

/*********************************************************************
 *                           modelFactory                              *
 **********************************************************************/
//avalon最核心的方法的两个方法之一（另一个是avalon.scan），返回一个ViewModel(VM)
var VMODELS = avalon.vmodels = {}
avalon.define = function(id, factory) {
    if (VMODELS[id]) {
        log("warning: " + id + " 已经存在于avalon.vmodels中")
    }
    var scope = {
        $watch: noop
    }
    factory(scope) //得到所有定义
    var model = modelFactory(scope) //偷天换日，将scope换为model
    stopRepeatAssign = true
    factory(model)
    stopRepeatAssign = false
    model.$id = id
    return VMODELS[id] = model
}

function modelFactory(scope, model) {
    if (Array.isArray(scope)) {
        var arr = scope.concat() //原数组的作为新生成的监控数组的$model而存在
        scope.length = 0
        var collection = Collection(scope)
        collection.push.apply(collection, arr)
        return collection
    }
    if (typeof scope.nodeType === "number") {
        return scope
    }
    var vmodel = {} //要返回的对象
    model = model || {} //放置$model上的属性
    var accessingProperties = {} //监控属性
    var normalProperties = {} //普通属性
    var computedProperties = [] //计算属性
    var watchProperties = arguments[2] || {} //强制要监听的属性
    var skipArray = scope.$skipArray //要忽略监控的属性
    for (var i = 0, name; name = skipProperties[i++]; ) {
        delete scope[name]
        normalProperties[name] = true
    }
    if (Array.isArray(skipArray)) {
        for (var i = 0, name; name = skipArray[i++]; ) {
            normalProperties[name] = true
        }
    }
    for (var i in scope) {
        accessorFactory(i, scope[i], model, normalProperties, accessingProperties, computedProperties, watchProperties)
    }
    vmodel = Object.defineProperties(vmodel, descriptorFactory(accessingProperties)) //生成一个空的ViewModel
    for (var name in normalProperties) {
        vmodel[name] = normalProperties[name]
    }
    watchProperties.vmodel = vmodel
    vmodel.$model = model
    vmodel.$events = {}
    vmodel.$id = generateID()
    vmodel.$accessors = accessingProperties
    vmodel[subscribers] = []
    for (var i in Observable) {
        vmodel[i] = Observable[i]
    }
    Object.defineProperty(vmodel, "hasOwnProperty", {
        value: function(name) {
            return name in vmodel.$model
        },
        writable: false,
        enumerable: false,
        configurable: true
    })
    for (var i = 0, fn; fn = computedProperties[i++]; ) { //最后强逼计算属性 计算自己的值
        Registry[expose] = fn
        fn()
        collectSubscribers(fn)
        delete Registry[expose]
    }
    return vmodel
}
var skipProperties = String("$id,$watch,$unwatch,$fire,$events,$model,$skipArray,$accessors," + subscribers).match(rword)

var isEqual = Object.is || function(v1, v2) {
    if (v1 === 0 && v2 === 0) {
        return 1 / v1 === 1 / v2
    } else if (v1 !== v1) {
        return v2 !== v2
    } else {
        return v1 === v2;
    }
}

function safeFire(a, b, c, d) {
    if (a.$events) {
        Observable.$fire.call(a, b, c, d)
    }
}

function descriptorFactory(obj) {
    var descriptors = {}
    for (var i in obj) {
        descriptors[i] = {
            get: obj[i],
            set: obj[i],
            enumerable: true,
            configurable: true
        }
    }
    return descriptors
}
//循环生成访问器属性需要的setter, getter函数（这里统称为accessor）
function accessorFactory(name, val, model, normalProperties, accessingProperties, computedProperties, watchProperties) {
    model[name] = val
    // 如果是元素节点 或者 在全局的skipProperties里 或者在当前的$skipArray里
    // 或者是以$开头并又不在watchPropertie里，这些属性是不会产生accessor
    if (normalProperties[name] || (val && val.nodeType) || (name.charAt(0) === "$" && !watchProperties[name])) {
        return normalProperties[name] = val
    }
    // 此外， 函数也不会产生accessor
    var valueType = getType(val)
    if (valueType === "function") {
        return normalProperties[name] = val
    }
    //总共产生三种accessor
    var accessor, oldArgs
    if (valueType === "object" && typeof val.get === "function" && Object.keys(val).length <= 2) {
        var setter = val.set,
                getter = val.get
        //第1种对应计算属性， 因变量，通过其他监控属性触发其改变
        accessor = function(newValue) {
            var vmodel = watchProperties.vmodel
            var value = model[name],
                    preValue = value
            if (arguments.length) {
                if (stopRepeatAssign) {
                    return
                }
                if (typeof setter === "function") {
                    var backup = vmodel.$events[name]
                    vmodel.$events[name] = [] //清空回调，防止内部冒泡而触发多次$fire
                    setter.call(vmodel, newValue)
                    vmodel.$events[name] = backup
                }
                if (!isEqual(oldArgs, newValue)) {
                    oldArgs = newValue
                    newValue = model[name] = getter.call(vmodel) //同步$model
                    withProxyCount && updateWithProxy(vmodel.$id, name, newValue) //同步循环绑定中的代理VM
                    notifySubscribers(accessor) //通知顶层改变
                    safeFire(vmodel, name, newValue, preValue) //触发$watch回调
                }
            } else {
                if (avalon.openComputedCollect) { // 收集视图刷新函数
                    collectSubscribers(accessor)
                }
                newValue = model[name] = getter.call(vmodel)
                if (!isEqual(value, newValue)) {
                    oldArgs = void 0
                    safeFire(vmodel, name, newValue, preValue)
                }
                return newValue
            }
        }
        computedProperties.push(accessor)
    } else if (rcomplextype.test(valueType)) {
        //第2种对应子ViewModel或监控数组 
        accessor = function(newValue) {
            var realAccessor = accessor.$vmodel,
                    preValue = realAccessor.$model
            if (arguments.length) {
                if (stopRepeatAssign) {
                    return
                }
                if (!isEqual(preValue, newValue)) {
                    newValue = accessor.$vmodel = updateVModel(realAccessor, newValue, valueType)
                    var fn = rebindings[newValue.$id]
                    fn && fn() //更新视图
                    var parent = watchProperties.vmodel
                    model[name] = newValue.$model //同步$model
                    notifySubscribers(realAccessor) //通知顶层改变
                    safeFire(parent, name, model[name], preValue) //触发$watch回调
                }
            } else {
                collectSubscribers(realAccessor) //收集视图函数
                return realAccessor
            }
        }
        accessor.$vmodel = val.$model ? val : modelFactory(val, val)
        model[name] = accessor.$vmodel.$model
    } else {
        //第3种对应简单的数据类型，自变量，监控属性
        accessor = function(newValue) {
            var preValue = model[name]
            if (arguments.length) {
                if (!isEqual(preValue, newValue)) {
                    model[name] = newValue //同步$model
                    var vmodel = watchProperties.vmodel
                    withProxyCount && updateWithProxy(vmodel.$id, name, newValue) //同步循环绑定中的代理VM
                    notifySubscribers(accessor) //通知顶层改变
                    safeFire(vmodel, name, newValue, preValue) //触发$watch回调
                }
            } else {
                collectSubscribers(accessor) //收集视图函数
                return preValue
            }
        }
        model[name] = val
    }
    accessor[subscribers] = [] //订阅者数组
    accessingProperties[name] = accessor
}
//ms-with, ms-repeat绑定生成的代理对象储存池
var withProxyPool = {}
var withProxyCount = 0
var rebindings = {}

function updateWithProxy($id, name, val) {
    var pool = withProxyPool[$id]
    if (pool && pool[name]) {
        pool[name].$val = val
    }
}

function updateVModel(a, b, valueType) {
    //a为原来的VM， b为新数组或新对象
    if (valueType === "array") {
        if (!Array.isArray(b)) {
            return a //fix https://github.com/RubyLouvre/avalon/issues/261
        }
        var bb = b.concat()
        a.clear()
        a.push.apply(a, bb)
        return a
    } else {
        var iterators = a[subscribers] || []
        if (withProxyPool[a.$id]) {
            withProxyCount--
            delete withProxyPool[a.$id]
        }
        var ret = modelFactory(b)
        rebindings[ret.$id] = function(data) {
            while (data = iterators.shift()) {
                (function(el) {
                    if (el.type) {
                        avalon.nextTick(function() {
                            el.rollback && el.rollback()
                            bindingHandlers[el.type](el, el.vmodels)
                        })
                    }
                })(data)
            }
            delete rebindings[ret.$id]
        }
        return ret
    }
}

/*********************************************************************
 *                       配置模块                                   *
 **********************************************************************/

function kernel(settings) {
    for (var p in settings) {
        if (!ohasOwn.call(settings, p))
            continue
        var val = settings[p]
        if (typeof kernel.plugins[p] === "function") {
            kernel.plugins[p](val)
        } else if (typeof kernel[p] === "object") {
            avalon.mix(kernel[p], val)
        } else {
            kernel[p] = val
        }
    }
    return this
}
var openTag, closeTag, rexpr, rexprg, rbind, rregexp = /[-.*+?^${}()|[\]\/\\]/g
/*将字符串安全格式化为正则表达式的源码 http://stevenlevithan.com/regex/xregexp/*/
function escapeRegExp(target) {
    return (target + "").replace(rregexp, "\\$&")
}
var plugins = {
    loader: function(builtin) {
        window.define = builtin ? innerRequire.define : otherDefine
        window.require = builtin ? innerRequire : otherRequire
    },
    interpolate: function(array) {
        openTag = array[0]
        closeTag = array[1]
        if (openTag === closeTag) {
            avalon.error("openTag!==closeTag", SyntaxError)
        } else if (array + "" === "<!--,-->") {
            kernel.commentInterpolate = true
        } else {
            var test = openTag + "test" + closeTag
            cinerator.innerHTML = test
            if (cinerator.innerHTML !== test && cinerator.innerHTML.indexOf("&lt;") >= 0) {
                avalon.error("此定界符不合法", SyntaxError)
            }
            cinerator.innerHTML = ""
        }
        var o = escapeRegExp(openTag),
                c = escapeRegExp(closeTag)
        rexpr = new RegExp(o + "(.*?)" + c)
        rexprg = new RegExp(o + "(.*?)" + c, "g")
        rbind = new RegExp(o + ".*?" + c + "|\\sms-")
    }
}
kernel.debug = true
kernel.plugins = plugins
kernel.plugins['interpolate'](["{{", "}}"])
kernel.paths = {}
kernel.shim = {}
kernel.maxRepeatSize = 100
avalon.config = kernel

/*********************************************************************
 *                           DOM API的高级封装                        *
 **********************************************************************/
function outerHTML() {
    return new XMLSerializer().serializeToString(this)
}
function enumerateNode(node, targetNode) {
    if (node && node.childNodes) {
        var nodes = node.childNodes
        for (var i = 0, el; el = nodes[i++]; ) {
            if (el.tagName) {
                var svg = document.createElementNS(svgns,
                        el.tagName.toLowerCase())
                // copy attrs
                ap.forEach.call(el.attributes, function(attr) {
                    svg.setAttribute(attr.name, attr.value)
                })
                // 递归处理子节点
                enumerateNode(el, svg)
                targetNode.appendChild(svg)
            }
        }
    }
}


/*转换为连字符线风格*/
function hyphen(target) {
    return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
}
/*转换为驼峰风格*/
function camelize(target) {
    if (target.indexOf("-") < 0 && target.indexOf("_") < 0) {
        return target //提前判断，提高getStyle等的效率
    }
    return target.replace(/[-_][^-_]/g, function(match) {
        return match.charAt(1).toUpperCase()
    })
}

var rnospaces = /\S+/g

avalon.fn.mix({
    hasClass: function(cls) {
        var el = this[0] || {} //IE10+, chrome8+, firefox3.6+, safari5.1+,opera11.5+支持classList,chrome24+,firefox26+支持classList2.0
        return el.nodeType === 1 && el.classList.contains(cls)
    },
    toggleClass: function(value, stateVal) {
        var state = stateVal,
                className, i = 0
        var classNames = value.match(rnospaces) || []
        var isBool = typeof stateVal === "boolean"
        var node = this[0] || {}, classList
        if (classList = node.classList) {
            while ((className = classNames[i++])) {
                state = isBool ? state : !classList.contains(className)
                classList[state ? "add" : "remove"](className)
            }
        }
        return this
    },
    attr: function(name, value) {
        if (arguments.length === 2) {
            this[0].setAttribute(name, value)
            return this
        } else {
            return this[0].getAttribute(name)
        }
    },
    data: function(name, value) {
        name = "data-" + hyphen(name || "")
        switch (arguments.length) {
            case 2:
                this.attr(name, value)
                return this
            case 1:
                var val = this.attr(name)
                return parseData(val)
            case 0:
                var ret = {}
                ap.forEach.call(this[0].attributes, function(attr) {
                    if (attr) {
                        name = attr.name
                        if (!name.indexOf("data-")) {
                            name = camelize(name.slice(5))
                            ret[name] = parseData(attr.value)
                        }
                    }
                })
                return ret
        }
    },
    removeData: function(name) {
        name = "data-" + hyphen(name)
        this[0].removeAttribute(name)
        return this
    },
    css: function(name, value) {
        if (avalon.isPlainObject(name)) {
            for (var i in name) {
                avalon.css(this, i, name[i])
            }
        } else {
            var ret = avalon.css(this, name, value)
        }
        return ret !== void 0 ? ret : this
    },
    position: function() {
        var offsetParent, offset,
                elem = this[0],
                parentOffset = {
                    top: 0,
                    left: 0
                };
        if (!elem) {
            return
        }
        if (this.css("position") === "fixed") {
            offset = elem.getBoundingClientRect()
        } else {
            offsetParent = this.offsetParent() //得到真正的offsetParent
            offset = this.offset() // 得到正确的offsetParent
            if (offsetParent[0].tagName !== "HTML") {
                parentOffset = offsetParent.offset()
            }
            parentOffset.top += avalon.css(offsetParent[0], "borderTopWidth", true)
            parentOffset.left += avalon.css(offsetParent[0], "borderLeftWidth", true)
        }
        return {
            top: offset.top - parentOffset.top - avalon.css(elem, "marginTop", true),
            left: offset.left - parentOffset.left - avalon.css(elem, "marginLeft", true)
        }
    },
    offsetParent: function() {
        var offsetParent = this[0].offsetParent || root
        while (offsetParent && (offsetParent.tagName !== "HTML") && avalon.css(offsetParent, "position") === "static") {
            offsetParent = offsetParent.offsetParent
        }
        return avalon(offsetParent || root)
    },
    bind: function(type, fn, phase) {
        if (this[0]) { //此方法不会链
            return avalon.bind(this[0], type, fn, phase)
        }
    },
    unbind: function(type, fn, phase) {
        if (this[0]) {
            avalon.unbind(this[0], type, fn, phase)
        }
        return this
    },
    val: function(value) {
        var node = this[0]
        if (node && node.nodeType === 1) {
            var get = arguments.length === 0
            var access = get ? ":get" : ":set"
            var fn = valHooks[getValType(node) + access]
            if (fn) {
                var val = fn(node, value)
            } else if (get) {
                return (node.value || "").replace(/\r/g, "")
            } else {
                node.value = value
            }
        }
        return get ? val : this
    }
})

"add,remove".replace(rword, function(method) {
    avalon.fn[method + "Class"] = function(cls) {
        var el = this[0]
        //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
        if (cls && typeof cls === "string" && el && el.nodeType == 1) {
            cls.replace(rnospaces, function(c) {
                el.classList[method](c)
            })
        }
        return this
    }
})

if (root.dataset) {
    avalon.data = function(name, val) {
        var dataset = this[0].dataset
        switch (arguments.length) {
            case 2:
                dataset[name] = val
                return this
            case 1:
                val = dataset[name]
                return parseData(val)
            case 0:
                var ret = {}
                for (var name in dataset) {
                    ret[name] = parseData(dataset[name])
                }
                return ret
        }
    }
}
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/

function parseData(data) {
    try {
        data = data === "true" ? true :
                data === "false" ? false :
                data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? JSON.parse(data) : data
    } catch (e) {
    }
    return data
}
avalon.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
}, function(method, prop) {
    avalon.fn[method] = function(val) {
        var node = this[0] || {}, win = getWindow(node),
                top = method === "scrollTop"
        if (!arguments.length) {
            return win ? win[prop] : node[method]
        } else {
            if (win) {
                win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop())
            } else {
                node[method] = val
            }
        }
    }
})


function getWindow(node) {
    return node.window && node.document ? node : node.nodeType === 9 ? node.defaultView : false
}
//=============================css相关==================================
var cssHooks = avalon.cssHooks = {}
var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"]
var cssMap = {
    "float": "cssFloat",
    background: "backgroundColor"
}
avalon.cssNumber = oneObject("columnCount,order,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom")

avalon.cssName = function(name, host, camelCase) {
    if (cssMap[name]) {
        return cssMap[name]
    }
    host = host || root.style
    for (var i = 0, n = prefixes.length; i < n; i++) {
        camelCase = camelize(prefixes[i] + name)
        if (camelCase in host) {
            return (cssMap[name] = camelCase)
        }
    }
    return null
}
cssHooks["@:set"] = function(node, name, value) {
    node.style[name] = value
}

cssHooks["@:get"] = function(node, name) {
    if (!node || !node.style) {
        throw new Error("getComputedStyle要求传入一个节点 " + node)
    }
    var ret, styles = getComputedStyle(node, null)
    if (styles) {
        ret = styles.getPropertyValue(name)
        if (ret === "") {
            ret = node.style[name] //其他浏览器需要我们手动取内联样式
        }
    }
    return ret
}
cssHooks["opacity:get"] = function(node) {
    var ret = cssHooks["@:get"](node, "opacity")
    return ret === "" ? "1" : ret
}

"top,left".replace(rword, function(name) {
    cssHooks[name + ":get"] = function(node) {
        var computed = cssHooks["@:get"](node, name)
        return /px$/.test(computed) ? computed :
                avalon(node).position()[name] + "px"
    }
})
var cssShow = {
    position: "absolute",
    visibility: "hidden",
    display: "block"
}
var rdisplayswap = /^(none|table(?!-c[ea]).+)/

function showHidden(node, array) {
    //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
    if (node.offsetWidth <= 0) { //opera.offsetWidth可能小于0
        var styles = getComputedStyle(node, null)
        if (rdisplayswap.test(styles["display"])) {
            var obj = {
                node: node
            }
            for (var name in cssShow) {
                obj[name] = styles[name]
                node.style[name] = cssShow[name]
            }
            array.push(obj)
        }
        var parent = node.parentNode
        if (parent && parent.nodeType == 1) {
            showHidden(parent, array)
        }
    }
}

"Width,Height".replace(rword, function(name) {
    var method = name.toLowerCase(),
            clientProp = "client" + name,
            scrollProp = "scroll" + name,
            offsetProp = "offset" + name
    cssHooks[method + ":get"] = function(node, which, override) {
        var boxSizing = "content-box"
        if (typeof override === "string") {
            boxSizing = override
        }
        which = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"]
        switch (boxSizing) {
            case "content-box":
                return node["client" + name] - avalon.css(node, "padding" + which[0], true) -
                        avalon.css(node, "padding" + which[1], true)
            case "padding-box":
                return node["client" + name]
            case "border-box":
                return node["offset" + name]
            case "margin-box":
                return node["offset" + name] + avalon.css(node, "margin" + which[0], true) +
                        avalon.css(node, "margin" + which[1], true)
        }
    }
    cssHooks[method + "&get"] = function(node) {
        var hidden = [];
        showHidden(node, hidden);
        var val = cssHooks[method + ":get"](node)
        for (var i = 0, obj; obj = hidden[i++]; ) {
            node = obj.node
            for (var n in obj) {
                if (typeof obj[n] === "string") {
                    node.style[n] = obj[n]
                }
            }
        }
        return val;
    }
    avalon.fn[method] = function(value) {
        var node = this[0]
        if (arguments.length === 0) {
            if (node.setTimeout) { //取得窗口尺寸,IE9后可以用node.innerWidth /innerHeight代替
                //https://developer.mozilla.org/en-US/docs/Web/API/window.innerHeight
                return node["inner" + name]
            }
            if (node.nodeType === 9) { //取得页面尺寸
                var doc = node.documentElement
                //FF chrome    html.scrollHeight< body.scrollHeight
                //IE 标准模式 : html.scrollHeight> body.scrollHeight
                //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp])
            }
            return cssHooks[method + "&get"](node)
        } else {
            return this.css(method, value)
        }
    }
    avalon.fn["inner" + name] = function() {
        return cssHooks[method + ":get"](this[0], void 0, "padding-box")
    }
    avalon.fn["outer" + name] = function(includeMargin) {
        return cssHooks[method + ":get"](this[0], void 0, includeMargin === true ? "margin-box" : "border-box")
    }
})
avalon.fn.offset = function() { //取得距离页面左右角的坐标
    var node = this[0], box = {
        left: 0,
        top: 0
    }
    if (!node || !node.tagName || !node.ownerDocument) {
        return box
    }
    var doc = node.ownerDocument,
            root = doc.documentElement,
            win = doc.defaultView
    if (!root.contains(node)) {
        return box
    }
    if (node.getBoundingClientRect !== void 0) {
        box = node.getBoundingClientRect()
    }
    return {
        top: box.top + win.pageYOffset - root.clientTop,
        left: box.left + win.pageXOffset - root.clientLeft
    }
}
//=============================val相关=======================

function getValType(el) {
    var ret = el.tagName.toLowerCase()
    return ret === "input" && /checkbox|radio/.test(el.type) ? "checked" : ret
}
var valHooks = {
    "select:get": function(node, value) {
        var option, options = node.options,
                index = node.selectedIndex,
                one = node.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0
        for (; i < max; i++) {
            option = options[i]
            //旧式IE在reset后不会改变selected，需要改用i === index判定
            //我们过滤所有disabled的option元素，但在safari5下，如果设置select为disable，那么其所有孩子都disable
            //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
            if ((option.selected || i === index) && !option.disabled) {
                value = option.value
                if (one) {
                    return value
                }
                //收集所有selected值组成数组返回
                values.push(value)
            }
        }
        return values
    },
    "select:set": function(node, values, optionSet) {
        values = [].concat(values) //强制转换为数组
        for (var i = 0, el; el = node.options[i++]; ) {
            if ((el.selected = values.indexOf(el.value) >= 0)) {
                optionSet = true
            }
        }
        if (!optionSet) {
            node.selectedIndex = -1
        }
    }
}

/************************************************************************
 *                                parseHTML                                 *
 ****************************************************************************/
var rtagName = /<([\w:]+)/,
        //取得其tagName
        rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        scriptTypes = oneObject("text/javascript", "text/ecmascript", "application/ecmascript", "application/javascript", "text/vbscript"),
        //需要处理套嵌关系的标签
        rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/
//parseHTML的辅助变量
var tagHooks = new function() {
    avalon.mix(this, {
        option: DOC.createElement("select"),
        thead: DOC.createElement("table"),
        td: DOC.createElement("tr"),
        area: DOC.createElement("map"),
        tr: DOC.createElement("tbody"),
        col: DOC.createElement("colgroup"),
        legend: DOC.createElement("fieldset"),
        "*": DOC.createElement("div")
    })
    this.optgroup = this.option
    this.tbody = this.tfoot = this.colgroup = this.caption = this.thead
    this.th = this.td
}

avalon.clearHTML = function(node) {
    node.textContent = ""
    return node
}
var script = DOC.createElement("script")
avalon.parseHTML = function(html) {
    if (typeof html !== "string") {
        html = html + ""
    }
    html = html.replace(rxhtml, "<$1></$2>").trim()
    if (deleteRange.createContextualFragment && !rnest.test(html) && !/<script/i.test(html)) {
        var range = DOC.createRange()
        range.selectNodeContents(root)
        return range.createContextualFragment(html)
    }
    var fragment = hyperspace.cloneNode(false)
    var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase()
    if (!(tag in tagHooks)) {
        tag = "*"
    }
    var parent = tagHooks[tag]
    parent.innerHTML = html
    var els = parent.getElementsByTagName("script"),
            firstChild, neo
    if (els.length) { //使用innerHTML生成的script节点不会发出请求与执行text属性
        for (var i = 0, el; el = els[i++]; ) {
            if (!el.type || scriptTypes[el.type]) { //如果script节点的MIME能让其执行脚本
                neo = script.cloneNode(false) //FF不能省略参数
                ap.forEach.call(el.attributes, function(attr) {
                    if (attr) {
                        neo[attr.name] = attr.value //复制其属性
                    }
                })
                neo.text = el.text //必须指定,因为无法在attributes中遍历出来
                el.parentNode.replaceChild(neo, el) //替换节点
            }
        }
    }
    while (firstChild = parent.firstChild) { // 将wrapper上的节点转移到文档碎片上！
        fragment.appendChild(firstChild)
    }
    return fragment
}
avalon.innerHTML = function(node, html) {
    if (!/<script/i.test(html) && !rnest.test(html)) {
        node.innerHTML = html
    } else {
        var a = this.parseHTML(html)
        this.clearHTML(node).appendChild(a)
    }
}
/*********************************************************************
 *                           Observable                                 *
 **********************************************************************/
var Observable = {
    $watch: function(type, callback) {
        if (typeof callback === "function") {
            var callbacks = this.$events[type]
            if (callbacks) {
                callbacks.push(callback)
            } else {
                this.$events[type] = [callback]
            }
        } else { //重新开始监听此VM的第一重简单属性的变动
            this.$events = this.$watch.backup
        }
        return this
    },
    $unwatch: function(type, callback) {
        var n = arguments.length
        if (n === 0) { //让此VM的所有$watch回调无效化
            this.$watch.backup = this.$events
            this.$events = {}
        } else if (n === 1) {
            this.$events[type] = []
        } else {
            var callbacks = this.$events[type] || []
            var i = callbacks.length
            while (~--i < 0) {
                if (callbacks[i] === callback) {
                    return callbacks.splice(i, 1)
                }
            }
        }
        return this
    },
    $fire: function(type) {
        var bubbling = false, broadcast = false
        if (type.match(/^bubble!(\w+)$/)) {
            bubbling = type = RegExp.$1
        } else if (type.match(/^capture!(\w+)$/)) {
            broadcast = type = RegExp.$1
        }
        var events = this.$events
        var callbacks = events[type] || []
        var all = events.$all || []
        var args = aslice.call(arguments, 1)
        for (var i = 0, callback; callback = callbacks[i++]; ) {
            callback.apply(this, args)
        }
        for (var i = 0, callback; callback = all[i++]; ) {
            callback.apply(this, arguments)
        }
        var element = events.element
        if (element) {
            var detail = [type].concat(args)
            if (bubbling) {
                W3CFire(element, "dataavailable", detail)
            } else if (broadcast) {
                var alls = []
                for (var i in avalon.vmodels) {
                    var v = avalon.vmodels[i]
                    if (v && v.$events && v.$events.element) {
                        var node = v.$events.element;
                        if (avalon.contains(element, node) && element !== node) {
                            alls.push(v)
                        }
                    }
                }
                alls.forEach(function(v) {
                    v.$fire.apply(v, detail)
                })
            }
        }
    }
}

/*********************************************************************
 *                         依赖收集与触发                             *
 **********************************************************************/

function registerSubscriber(data, val) {
    Registry[expose] = data //暴光此函数,方便collectSubscribers收集
    avalon.openComputedCollect = true
    var fn = data.evaluator
    if (fn) { //如果是求值函数
        if (data.type === "duplex") {
            data.handler()
        } else {
            try {
                data.handler(fn.apply(0, data.args), data.element, data)
            } catch (e) {
                delete data.evaluator
                if (data.nodeType === 3) {
                    if (kernel.commentInterpolate) {
                        data.element.replaceChild(DOC.createComment(data.value), data.node)
                    } else {
                        data.node.data = openTag + data.value + closeTag
                    }
                }
                console.log(e)
                log("warning:evaluator of [" + data.value + "] throws error!")
            }
        }
    } else { //如果是计算属性的accessor
        data()
    }
    avalon.openComputedCollect = false
    delete Registry[expose]
}
/*收集依赖于这个访问器的订阅者*/
function collectSubscribers(accessor) {
    if (Registry[expose]) {
        var list = accessor[subscribers]
        list && avalon.Array.ensure(list, Registry[expose]) //只有数组不存在此元素才push进去
    }
}
/*通知依赖于这个访问器的订阅者更新自身*/
function notifySubscribers(accessor) {
    var list = accessor[subscribers]
    if (list && list.length) {
        var args = aslice.call(arguments, 1)
        for (var i = list.length, fn; fn = list[--i]; ) {
            var el = fn.element
            if (el && !ifSanctuary.contains(el) && (!root.contains(el))) {
                list.splice(i, 1)
                log("debug: remove " + fn.name)
            } else if (typeof fn === "function") {
                fn.apply(0, args) //强制重新计算自身
            } else if (fn.getter) {
                fn.handler.apply(fn, args) //强制重新计算自身
            } else {
                fn.handler(fn.evaluator.apply(0, fn.args || []), el, fn)
            }
        }
    }
}


/*********************************************************************
 *                            扫描系统                                *
 **********************************************************************/
avalon.scan = function(elem, vmodel) {
    elem = elem || root
    var vmodels = vmodel ? [].concat(vmodel) : []
    scanTag(elem, vmodels)
}

//http://www.w3.org/TR/html5/syntax.html#void-elements
var stopScan = oneObject("area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,noscript,script,style,textarea".toUpperCase())

/*确保元素的内容被完全扫描渲染完毕才调用回调*/
function checkScan(elem, callback) {
    var innerHTML = NaN,
            id = setInterval(function() {
                var currHTML = elem.innerHTML
                if (currHTML === innerHTML) {
                    clearInterval(id)
                    callback()
                } else {
                    innerHTML = currHTML
                }
            }, 15)
}


function scanTag(elem, vmodels, node) {
    //扫描顺序  ms-skip(0) --> ms-important(1) --> ms-controller(2) --> ms-if(10) --> ms-repeat(100) 
    //--> ms-if-loop(110) --> ms-attr(970) ...--> ms-each(1400)-->ms-with(1500)--〉ms-duplex(2000)垫后        
    var a = elem.getAttribute(prefix + "skip")
    var b = elem.getAttributeNode(prefix + "important")
    var c = elem.getAttributeNode(prefix + "controller")
    if (typeof a === "string") {
        return
    } else if (node = b || c) {
        var newVmodel = VMODELS[node.value]
        if (!newVmodel) {
            return
        }
        //ms-important不包含父VM，ms-controller相反
        vmodels = node === b ? [newVmodel] : [newVmodel].concat(vmodels)
        elem.removeAttribute(node.name) //removeAttributeNode不会刷新[ms-controller]样式规则
        elem.classList.remove(node.name)
        newVmodel.$events.element = elem
        elem.addEventListener("dataavailable", function(e) {
            if (typeof e.detail === "object" && elem !== e.target) {
                newVmodel.$fire.apply(newVmodel, e.detail)
            }
        })
    }
    scanAttr(elem, vmodels) //扫描特性节点
}

function scanNodes(parent, vmodels) {
    var node = parent.firstChild
    while (node) {
        var nextNode = node.nextSibling
        var nodeType = node.nodeType
        if (nodeType === 1) {
            scanTag(node, vmodels) //扫描元素节点
        } else if (nodeType === 3 && rexpr.test(node.data)) {
            scanText(node, vmodels) //扫描文本节点
        } else if (kernel.commentInterpolate && nodeType === 8 && !rexpr.test(node.nodeValue)) {
            scanText(node, vmodels) //扫描注释节点
        }
        node = nextNode
    }
}

function scanText(textNode, vmodels) {
    var bindings = []
    if (textNode.nodeType === 8) {
        var leach = []
        var value = trimFilter(textNode.nodeValue, leach)
        var token = {
            expr: true,
            value: value
        }
        if (leach.length) {
            token.filters = leach
        }
        var tokens = [token]
    } else {
        tokens = scanExpr(textNode.data)
    }
    if (tokens.length) {
        for (var i = 0, token; token = tokens[i++]; ) {
            var node = DOC.createTextNode(token.value) //将文本转换为文本节点，并替换原来的文本节点
            if (token.expr) {
                var filters = token.filters
                var binding = {
                    type: "text",
                    node: node,
                    nodeType: 3,
                    value: token.value,
                    filters: filters
                }
                if (filters && filters.indexOf("html") !== -1) {
                    avalon.Array.remove(filters, "html")
                    binding.type = "html"
                    binding.replaceNodes = [node]
                    if (!filters.length) {
                        delete bindings.filters
                    }
                }
                bindings.push(binding) //收集带有插值表达式的文本
            }
            hyperspace.appendChild(node)
        }
        textNode.parentNode.replaceChild(hyperspace, textNode)
        if (bindings.length)
            executeBindings(bindings, vmodels)
    }
}

var rmsAttr = /ms-(\w+)-?(.*)/
var priorityMap = {
    "if": 10,
    "repeat": 90,
    "widget": 110,
    "each": 1400,
    "with": 1500,
    "duplex": 2000,
    "on": 3000
}

var ons = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scroll,submit")

function scanAttr(elem, vmodels) {
    var attributes = elem.attributes
    var bindings = [],
            msData = {},
            match
    for (var i = 0, attr; attr = attributes[i++]; ) {
        if (attr.specified) {
            if (match = attr.name.match(rmsAttr)) {
                //如果是以指定前缀命名的
                var type = match[1]
                var param = match[2] || ""
                msData[attr.name] = attr.value
                if (ons[type]) {
                    param = type
                    type = "on"
                }
                if (typeof bindingHandlers[type] === "function") {
                    var binding = {
                        type: type,
                        param: param,
                        element: elem,
                        name: match[0],
                        value: attr.value,
                        priority: type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
                    }
                    if (type === "if" && param === "loop") {
                        binding.priority += 100
                    }
                    if (vmodels.length) {
                        bindings.push(binding)
                        if (type === "widget") {
                            elem.msData = elem.msData || msData
                        }
                    }
                }
            }
        }
    }
    if (msData["ms-checked"] && msData["ms-duplex"]) {
        log("warning!一个元素上不能同时定义ms-checked与ms-duplex")
    }
    bindings.sort(function(a, b) {
        return a.priority - b.priority
    })
    var firstBinding = bindings[0] || {}
    switch (firstBinding.type) {
        case "if":
        case "repeat":
        case "widget":
            executeBindings([firstBinding], vmodels)
            break
        default:
            executeBindings(bindings, vmodels)
            if (!stopScan[elem.tagName] && rbind.test(elem.innerHTML + elem.textContent)) {
                scanNodes(elem, vmodels) //扫描子孙元素
            }
            break;
    }
    if (elem.patchRepeat) {
        elem.patchRepeat()
        elem.patchRepeat = null
    }
}

function executeBindings(bindings, vmodels) {
    for (var i = 0, data; data = bindings[i++]; ) {
        data.vmodels = vmodels
        bindingHandlers[data.type](data, vmodels)
        if (data.evaluator && data.name) { //移除数据绑定，防止被二次解析
            //chrome使用removeAttributeNode移除不存在的特性节点时会报错 https://github.com/RubyLouvre/avalon/issues/99
            data.element.removeAttribute(data.name)
        }
    }
    bindings.length = 0
}

var rfilters = /\|\s*(\w+)\s*(\([^)]*\))?/g,
        r11a = /\|\|/g,
        r11b = /U2hvcnRDaXJjdWl0/g,
        rlt = /&lt;/g,
        rgt = /&gt;/g
function trimFilter(value, leach) {
    if (value.indexOf("|") > 0) { // 抽取过滤器 先替换掉所有短路与
        value = value.replace(r11a, "U2hvcnRDaXJjdWl0") //btoa("ShortCircuit")
        value = value.replace(rfilters, function(c, d, e) {
            leach.push(d + (e || ""))
            return ""
        })
        value = value.replace(r11b, "||") //还原短路与
    }
    return value
}

function scanExpr(str) {
    var tokens = [],
            value, start = 0,
            stop

    do {
        stop = str.indexOf(openTag, start)
        if (stop === -1) {
            break
        }
        value = str.slice(start, stop)
        if (value) { // {{ 左边的文本
            tokens.push({
                value: value,
                expr: false
            })
        }
        start = stop + openTag.length
        stop = str.indexOf(closeTag, start)
        if (stop === -1) {
            break
        }
        value = str.slice(start, stop)
        if (value) { //处理{{ }}插值表达式
            var leach = []
            value = trimFilter(value, leach)
            tokens.push({
                value: value,
                expr: true,
                filters: leach.length ? leach : void 0
            })
        }
        start = stop + closeTag.length
    } while (1)
    value = str.slice(start)
    if (value) { //}} 右边的文本
        tokens.push({
            value: value,
            expr: false
        })
    }

    return tokens
}
/*********************************************************************
 *                          编译模块                                   *
 **********************************************************************/
var keywords =
        // 关键字
        "break,case,catch,continue,debugger,default,delete,do,else,false" + ",finally,for,function,if,in,instanceof,new,null,return,switch,this" + ",throw,true,try,typeof,var,void,while,with"

        // 保留字
        + ",abstract,boolean,byte,char,class,const,double,enum,export,extends" + ",final,float,goto,implements,import,int,interface,long,native" + ",package,private,protected,public,short,static,super,synchronized" + ",throws,transient,volatile"

        // ECMA 5 - use strict
        + ",arguments,let,yield"

        + ",undefined"
var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g
var rsplit = /[^\w$]+/g
var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g')
var rnumber = /\b\d[^,]*/g
var rcomma = /^,+|,+$/g
var cacheVars = createCache(512)
var getVariables = function(code) {
    code = "," + code.trim()
    if (cacheVars[code]) {
        return cacheVars[code]
    }
    var match = code
            .replace(rrexpstr, "")
            .replace(rsplit, ",")
            .replace(rkeywords, "")
            .replace(rnumber, "")
            .replace(rcomma, "")
            .split(/^$|,+/)
    var vars = [],
            unique = {}
    for (var i = 0; i < match.length; ++i) {
        var variable = match[i]
        if (!unique[variable]) {
            unique[variable] = vars.push(variable)
        }
    }
    return cacheVars(code, vars)
}
/*添加赋值语句*/
function addAssign(vars, scope, name, duplex) {
    var ret = [],
            prefix = " = " + name + "."
    for (var i = vars.length, prop; prop = vars[--i]; ) {
        if (scope.hasOwnProperty(prop)) {
            ret.push(prop + prefix + prop)
            if (duplex === "duplex") {
                vars.get = name + "." + prop
            }
            vars.splice(i, 1)
        }
    }
    return ret

}

function uniqVmodels(arr) {
    var uniq = {}
    return arr.filter(function(el) {
        if (!uniq[el.$id]) {
            uniq[el.$id] = 1
            return true
        }
    })
}

/*创建具有一定容量的缓存体*/
function createCache(maxLength) {
    var keys = []

    function cache(key, value) {
        if (keys.push(key) > maxLength) {
            delete cache[keys.shift()]
        }
        return cache[key] = value;
    }
    return cache;
}
var cacheExprs = createCache(256)
//根据一段文本与一堆VM，转换为对应的求值函数及匹配的VM(解释器模式)
var rduplex = /\w\[.*\]|\w\.\w/
var rproxy = /(\$proxy\$[a-z]+)\d+$/

function parseExpr(code, scopes, data, four) {
    var dataType = data.type
    var filters = dataType === "html" || dataType === "text" ? data.filters : ""
    var exprId = scopes.map(function(el) {
        return el.$id.replace(rproxy, "$1")
    }) + code + dataType + filters
    var vars = getVariables(code).concat(),
            assigns = [],
            names = [],
            args = [],
            prefix = ""
    //args 是一个对象数组， names 是将要生成的求值函数的参数
    scopes = uniqVmodels(scopes)
    for (var i = 0, sn = scopes.length; i < sn; i++) {
        if (vars.length) {
            var name = "vm" + expose + "_" + i
            names.push(name)
            args.push(scopes[i])
            assigns.push.apply(assigns, addAssign(vars, scopes[i], name, four))
        }
    }
    if (!assigns.length && four === "duplex") {
        return
    }
    //---------------args----------------
    if (filters) {
        args.push(avalon.filters)
    }
    data.args = args
    //---------------cache----------------
    var fn = cacheExprs[exprId] //直接从缓存，免得重复生成
    if (fn) {
        data.evaluator = fn
        return
    }
    var prefix = assigns.join(", ")
    if (prefix) {
        prefix = "var " + prefix
    }
    if (filters) { //文本绑定，双工绑定才有过滤器
        code = "\nvar ret" + expose + " = " + code
        var textBuffer = [],
                fargs
        textBuffer.push(code, "\r\n")
        for (var i = 0, fname; fname = data.filters[i++]; ) {
            var start = fname.indexOf("(")
            if (start !== -1) {
                fargs = fname.slice(start + 1, fname.lastIndexOf(")")).trim()
                fargs = "," + fargs
                fname = fname.slice(0, start).trim()
            } else {
                fargs = ""
            }
            textBuffer.push(" if(filters", expose, ".", fname, "){\n\ttry{\nret", expose,
                    " = filters", expose, ".", fname, "(ret", expose, fargs, ")\n\t}catch(e){} \n}\n")
        }
        code = textBuffer.join("")
        code += "\nreturn ret" + expose
        names.push("filters" + expose)
    } else if (dataType === "duplex") { //双工绑定
        var _body = "'use strict';\nreturn function(vvv){\n\t" +
                prefix +
                ";\n\tif(!arguments.length){\n\t\treturn " +
                code +
                "\n\t}\n\t" + (!rduplex.test(code) ? vars.get : code) +
                "= vvv;\n} "
        try {
            fn = Function.apply(noop, names.concat(_body))
            data.evaluator = cacheExprs(exprId, fn)
        } catch (e) {
            log("debug: parse error," + e.message)
        }
        return
    } else if (dataType === "on") { //事件绑定
        code = code.replace("(", ".call(this,")
        if (four === "$event") {
            names.push(four)
        }
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
        var lastIndex = code.lastIndexOf("\nreturn")
        var header = code.slice(0, lastIndex)
        var footer = code.slice(lastIndex)
        code = header + "\nif(avalon.openComputedCollect) return ;" + footer
    } else { //其他绑定
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
    }
    try {
        fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
        data.evaluator = cacheExprs(exprId, fn)
    } catch (e) {
        log("debug: parse error," + e.message)
    } finally {
        vars = textBuffer = names = null //释放内存
    }
}

/*parseExpr的智能引用代理*/
function parseExprProxy(code, scopes, data, tokens) {
    if (Array.isArray(tokens)) {
        var array = tokens.map(function(token) {
            var tmpl = {}
            return token.expr ? parseExpr(token.value, scopes, tmpl) || tmpl : token.value
        })
        data.evaluator = function() {
            var ret = ""
            for (var i = 0, el; el = array[i++]; ) {
                ret += typeof el === "string" ? el : el.evaluator.apply(0, el.args)
            }
            return ret
        }
        data.args = []
    } else {
        parseExpr(code, scopes, data, tokens)
    }
    if (data.evaluator) {
        data.handler = bindingExecutors[data.handlerName || data.type]
        data.evaluator.toString = function() {
            return data.type + " binding to eval(" + code + ")"
        }
        //方便调试
        //这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
        //将它移出订阅者列表
        registerSubscriber(data)
    }
}
avalon.parseExprProxy = parseExprProxy
/*********************************************************************
 *绑定模块（实现“操作数据即操作DOM”的关键，将DOM操作放逐出前端开发人员的视野，让它交由框架自行处理，开发人员专致于业务本身） *                                 *
 **********************************************************************/
var cacheDisplay = oneObject("a,abbr,b,span,strong,em,font,i,kbd", "inline")
avalon.mix(cacheDisplay, oneObject("div,h1,h2,h3,h4,h5,h6,section,p", "block"))

/*用于取得此类标签的默认display值*/
function parseDisplay(nodeName, val) {
    nodeName = nodeName.toLowerCase()
    if (!cacheDisplay[nodeName]) {
        var node = DOC.createElement(nodeName)
        root.appendChild(node)
        val = getComputedStyle(node, null).display
        root.removeChild(node)
        cacheDisplay[nodeName] = val
    }
    return cacheDisplay[nodeName]
}
avalon.parseDisplay = parseDisplay
var supportDisplay = (function(td) {
    return getComputedStyle(td, null).display == "table-cell"
})(DOC.createElement("td"))
var rdash = /\(([^)]*)\)/
head.insertAdjacentHTML("afterBegin", '<style id="avalonStyle">.avalonHide{ display: none!important }</style>')
var getBindingCallback = function(elem, name, vmodels) {
    var callback = elem.getAttribute(name)
    if (callback) {
        for (var i = 0, vm; vm = vmodels[i++]; ) {
            if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                return vm[callback]
            }
        }
    }
}
var cacheTmpls = avalon.templateCache = {}
var ifSanctuary = DOC.createElement("div")
var rwhitespace = /^\s+$/
//这里的函数每当VM发生改变后，都会被执行（操作方为notifySubscribers）
var bindingExecutors = avalon.bindingExecutors = {
    "attr": function(val, elem, data) {
        var method = data.type,
                attrName = data.param

        function scanTemplate(text) {
            if (loaded) {
                text = loaded.apply(elem, [text].concat(vmodels))
            }
            avalon.innerHTML(elem, text)
            scanNodes(elem, vmodels)
            rendered && checkScan(elem, function() {
                rendered.call(elem)
            })
        }

        if (method === "css") {
            avalon(elem).css(attrName, val)
        } else if (method === "attr") {
            // ms-attr-class="xxx" vm.xxx="aaa bbb ccc"将元素的className设置为aaa bbb ccc
            // ms-attr-class="xxx" vm.xxx=false  清空元素的所有类名
            // ms-attr-name="yyy"  vm.yyy="ooo" 为元素设置name属性
            var toRemove = (val === false) || (val === null) || (val === void 0)
            if (toRemove) {
                elem.removeAttribute(attrName)
            } else {
                elem.setAttribute(attrName, val)
            }
        } else if (method === "include" && val) {
            var vmodels = data.vmodels
            var rendered = getBindingCallback(elem, "data-include-rendered", vmodels)
            var loaded = getBindingCallback(elem, "data-include-loaded", vmodels)

            if (data.param === "src") {
                if (cacheTmpls[val]) {
                    scanTemplate(cacheTmpls[val])
                } else {
                    var xhr = new window.XMLHttpRequest
                    xhr.onload = function() {
                        var s = xhr.status
                        if (s >= 200 && s < 300 || s === 304) {
                            scanTemplate(cacheTmpls[val] = xhr.responseText)
                        }
                    }
                    xhr.open("GET", val, true)
                    xhr.withCredentials = true
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                    xhr.send(null)
                }
            } else {
                //IE系列与够新的标准浏览器支持通过ID取得元素（firefox14+）
                //http://tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
                var el = val && val.nodeType == 1 ? val : DOC.getElementById(val)
                avalon.nextTick(function() {
                    scanTemplate(el.innerText || el.innerHTML)
                })
            }
        } else {
            elem[method] = val
        }
    },
    "class": function(val, elem, data) {
        var $elem = avalon(elem),
                method = data.type
        if (method === "class" && data.param) { //如果是旧风格
            $elem.toggleClass(data.param, !!val)
        } else {
            var toggle = data._evaluator ? !!data._evaluator.apply(elem, data._args) : true
            var className = data._class || val
            switch (method) {
                case "class":
                    if (toggle && data.oldClass) {
                        $elem.removeClass(data.oldClass)
                    }
                    $elem.toggleClass(className, toggle)
                    data.oldClass = className
                    break;
                case "hover":
                case "active":
                    if (!data.init) {
                        if (method === "hover") { //在移出移入时切换类名
                            var event1 = "mouseenter",
                                    event2 = "mouseleave"
                        } else { //在聚焦失焦中切换类名
                            elem.tabIndex = elem.tabIndex || -1
                            event1 = "mousedown", event2 = "mouseup"
                            $elem.bind("mouseleave", function() {
                                toggle && $elem.removeClass(className)
                            })
                        }
                        $elem.bind(event1, function() {
                            toggle && $elem.addClass(className)
                        })
                        $elem.bind(event2, function() {
                            toggle && $elem.removeClass(className)
                        })
                        data.init = 1
                    }
                    break;
            }
        }
    },
    "data": function(val, elem, data) {
        var key = "data-" + data.param
        if (val && typeof val === "object") {
            elem[key] = val
        } else {
            elem.setAttribute(key, String(val))
        }
    },
    "checked": function(val, elem, data) {
        var name = data.type;
        if (name === "enabled") {
            elem.disabled = !val
        } else {
            var propName = name === "readonly" ? "readOnly" : name
            elem[propName] = !!val
        }
    },
    "repeat": function(method, pos, el) {
        if (method) {
            var data = this
            var group = data.group
            var pp = data.startRepeat && data.startRepeat.parentNode
            if (pp) { //fix  #300 #307
                data.parent = pp
            }
            var parent = data.parent
            var proxies = data.proxies
            var transation = hyperspace.cloneNode(false)
            var spans = []
            var lastFn = {}
            if (method === "del" || method === "move") {
                var locatedNode = getLocatedNode(parent, data, pos)
            }
            switch (method) {
                case "add":
                    //在pos位置后添加el数组（pos为数字，el为数组）
                    var arr = el
                    var last = data.getter().length - 1
                    for (var i = 0, n = arr.length; i < n; i++) {
                        var ii = i + pos
                        var proxy = getEachProxy(ii, arr[i], data, last)
                        proxies.splice(ii, 0, proxy)
                        lastFn = shimController(data, transation, spans, proxy)
                    }
                    locatedNode = getLocatedNode(parent, data, pos)
                    lastFn.node = locatedNode
                    lastFn.parent = parent
                    parent.insertBefore(transation, locatedNode)
                    for (var i = 0, node; node = spans[i++]; ) {
                        scanTag(node, data.vmodels)
                    }
                    spans = null
                    break
                case "del": //将pos后的el个元素删掉(pos, el都是数字)
                    var removed = proxies.splice(pos, el)
                    for (var i = 0, proxy; proxy = removed[i++]; ) {
                        recycleEachProxy(proxy)
                    }
                    expelFromSanctuary(removeView(locatedNode, group, el))
                    break
                case "index": //将proxies中的第pos个起的所有元素重新索引（pos为数字，el用作循环变量）
                    var last = proxies.length - 1
                    for (; el = proxies[pos]; pos++) {
                        el.$index = pos
                        el.$first = pos === 0
                        el.$last = pos === last
                    }
                    break
                case "clear":
                    if (data.startRepeat) {
                        while (true) {
                            var node = data.startRepeat.nextSibling
                            if (node && node !== data.endRepeat) {
                                transation.appendChild(node)
                            } else {
                                break
                            }
                        }
                    } else {
                        transation = parent
                    }
                    expelFromSanctuary(transation)
                    proxies.length = 0
                    break
                case "move": //将proxies中的第pos个元素移动el位置上(pos, el都是数字)
                    var t = proxies.splice(pos, 1)[0]
                    if (t) {
                        proxies.splice(el, 0, t)
                        transation = removeView(locatedNode, group)
                        locatedNode = getLocatedNode(parent, data, el)
                        parent.insertBefore(transation, locatedNode)
                    }
                    break
                case "set": //将proxies中的第pos个元素的VM设置为el（pos为数字，el任意）
                    var proxy = proxies[pos]
                    if (proxy) {
                        proxy[proxy.$itemName] = el
                    }
                    break
                case "append": //将pos的键值对从el中取出（pos为一个普通对象，el为预先生成好的代理VM对象池）
                    var pool = el
                    var callback = getBindingCallback(data.callbackElement, "data-with-sorted", data.vmodels)
                    var keys = []
                    for (var key in pos) { //得到所有键名
                        if (pos.hasOwnProperty(key)) {
                            keys.push(key)
                        }
                    }
                    if (callback) { //如果有回调，则让它们排序
                        var keys2 = callback.call(parent, keys)
                        if (keys2 && Array.isArray(keys2) && keys2.length) {
                            keys = keys2
                        }
                    }
                    for (var i = 0, key; key = keys[i++]; ) {
                        lastFn = shimController(data, transation, spans, pool[key])
                    }
                    lastFn.parent = parent
                    lastFn.node = data.endRepeat || null
                    parent.insertBefore(transation, lastFn.node)
                    for (var i = 0, el; el = spans[i++]; ) {
                        scanTag(el, data.vmodels)
                    }
                    spans = null
                    break
            }
            iteratorCallback.call(data, arguments)
        }
    },
    "html": function(val, elem, data) {
        val = val == null ? "" : val
        if (!elem) {
            elem = data.element = data.node.parentNode
        }
        if (data.replaceNodes) {
            var fragment, nodes
            if (val.nodeType === 11) {
                fragment = val
            } else if (val.nodeType === 1 || val.item) {
                nodes = val.nodeType === 1 ? val.childNodes : val.item ? val : []
                fragment = hyperspace.cloneNode(true)
                while (nodes[0]) {
                    fragment.appendChild(nodes[0])
                }
            } else {
                fragment = avalon.parseHTML(val)
            }
            var replaceNodes = avalon.slice(fragment.childNodes)
            elem.insertBefore(fragment, data.replaceNodes[0] || null)
            for (var i = 0, node; node = data.replaceNodes[i++]; ) {
                elem.removeChild(node)
            }
            data.replaceNodes = replaceNodes
        } else {
            avalon.innerHTML(elem, val)
        }
        avalon.nextTick(function() {
            scanNodes(elem, data.vmodels)
        })
    },
    "if": function(val, elem, data) {
        var placehoder = data.placehoder
        if (val) { //插回DOM树
            if (!data.msInDocument) {
                data.msInDocument = true
                try {
                    placehoder.parentNode.replaceChild(elem, placehoder)
                } catch (e) {
                    log("debug: ms-if " + e.message)
                }
            }
            if (rbind.test(elem.outerHTML.replace(rlt, "<").replace(rgt, ">"))) {
                scanAttr(elem, data.vmodels)
            }
        } else { //移出DOM树，放进ifSanctuary DIV中，并用注释节点占据原位置
            if (data.msInDocument) {
                data.msInDocument = false
                elem.parentNode.replaceChild(placehoder, elem)
                placehoder.elem = elem
                ifSanctuary.appendChild(elem)
            }
        }
    },
    "on": function(callback, elem, data) {
        var fn = data.evaluator
        var args = data.args
        var vmodels = data.vmodels
        if (!data.hasArgs) {
            callback = function(e) {
                return fn.apply(0, args).call(this, e)
            }
        } else {
            callback = function(e) {
                return fn.apply(this, args.concat(e))
            }
        }
        elem.$vmodel = vmodels[0]
        elem.$vmodels = vmodels
        data.param = data.param.replace(/-\d+$/, "") // ms-on-mousemove-10
        if (typeof data.specialBind === "function") {
            data.specialBind(elem, callback)
        } else {
            var removeFn = avalon.bind(elem, data.param, callback)
        }
        data.rollback = function() {
            if (typeof data.specialUnbind === "function") {
                data.specialUnbind()
            } else {
                avalon.unbind(elem, data.param, removeFn)
            }
        }
        data.evaluator = data.handler = noop
    },
    "text": function(val, elem, data) {
        val = val == null ? "" : val //不在页面上显示undefined null
        var node = data.node
        if (data.nodeType === 3) { //绑定在文本节点上
            try {//IE对游离于DOM树外的节点赋值会报错
                node.data = val
            } catch (e) {
            }
        } else { //绑定在特性节点上
            if (!elem) {
                elem = data.element = node.parentNode
            }
            elem.textContent = val
        }
    },
    "visible": function(val, elem, data) {
        elem.style.display = val ? data.display : "none"
    },
    "widget": noop
}
//这里的函数只会在第一次被扫描后被执行一次，并放进行对应VM属性的subscribers数组内（操作方为registerSubscriber）
var bindingHandlers = avalon.bindingHandlers = {
    //这是一个字符串属性绑定的范本, 方便你在title, alt,  src, href, include, css添加插值表达式
    //<a ms-href="{{url.hostname}}/{{url.pathname}}.html">
    "attr": function(data, vmodels) {
        var text = data.value.trim(),
                simple = true
        if (text.indexOf(openTag) > -1 && text.indexOf(closeTag) > 2) {
            simple = false
            if (rexpr.test(text) && RegExp.rightContext === "" && RegExp.leftContext === "") {
                simple = true
                text = RegExp.$1
            }
        }
        data.handlerName = "attr" //handleName用于处理多种绑定共用同一种bindingExecutor的情况
        parseExprProxy(text, vmodels, data, (simple ? null : scanExpr(data.value)))
    },
    //根据VM的属性值或表达式的值切换类名，ms-class="xxx yyy zzz:flag" 
    //http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
    "class": function(data, vmodels) {
        var oldStyle = data.param,
                text = data.value,
                rightExpr
        data.handlerName = "class"
        if (!oldStyle || isFinite(oldStyle)) {
            data.param = "" //去掉数字
            var noExpr = text.replace(rexprg, function(a) {
                return Math.pow(10, a.length - 1) //将插值表达式插入10的N-1次方来占位
            })
            var colonIndex = noExpr.indexOf(":") //取得第一个冒号的位置
            if (colonIndex === -1) { // 比如 ms-class="aaa bbb ccc" 的情况
                var className = text
            } else { // 比如 ms-class-1="ui-state-active:checked" 的情况 
                className = text.slice(0, colonIndex)
                rightExpr = text.slice(colonIndex + 1)
                parseExpr(rightExpr, vmodels, data) //决定是添加还是删除
                if (!data.evaluator) {
                    log("debug: ms-class '" + (rightExpr || "").trim() + "' 不存在于VM中")
                    return false
                } else {
                    data._evaluator = data.evaluator
                    data._args = data.args
                }
            }
            var hasExpr = rexpr.test(className) //比如ms-class="width{{w}}"的情况
            if (!hasExpr) {
                data._class = className
            }
            parseExprProxy("", vmodels, data, (hasExpr ? scanExpr(className) : null))
        } else if (data.type === "class") {
            parseExprProxy(text, vmodels, data)
        }
    },
    "checked": function(data, vmodels) {
        data.handlerName = "checked"
        parseExprProxy(data.value, vmodels, data)
    },
    "duplex": function(data, vmodels) {
        var elem = data.element,
                tagName = elem.tagName
        if (typeof duplexBinding[tagName] === "function") {
            data.changed = getBindingCallback(elem, "data-duplex-changed", vmodels) || noop
            //由于情况特殊，不再经过parseExprProxy
            parseExpr(data.value, vmodels, data, "duplex")
            if (data.evaluator && data.args) {
                var form = elem.form
                if (form && form.msValidate) {
                    form.msValidate(elem)
                }
                data.bound = function(type, callback) {
                    elem.addEventListener(type, callback)
                    var old = data.rollback
                    data.rollback = function() {
                        elem.removeEventListener(type, callback)
                        old && old()
                    }
                }
                duplexBinding[elem.tagName](elem, data.evaluator.apply(null, data.args), data)
            }
        }
    },
    "repeat": function(data, vmodels) {
        var type = data.type,
                list
        parseExpr(data.value, vmodels, data)
        if (type !== "repeat") {
            log("warning:建议使用ms-repeat代替ms-each, ms-with, ms-repeat只占用一个标签并且性能更好")
        }
        var elem = data.callbackElement = data.parent = data.element //用于判定当前元素是否位于DOM树
        data.getter = function() {
            return this.evaluator.apply(0, this.args || [])
        }
        data.proxies = []
        var freturn = true
        try {
            list = data.getter()
            if (rcomplextype.test(getType(list))) {
                freturn = false
            }
        } catch (e) {
        }
        var template = hyperspace.cloneNode(false)
        if (type === "repeat") {
            var startRepeat = DOC.createComment("ms-repeat-start")
            var endRepeat = DOC.createComment("ms-repeat-end")
            data.element = data.parent = elem.parentNode
            data.startRepeat = startRepeat
            data.endRepeat = endRepeat
            elem.removeAttribute(data.name)
            data.parent.replaceChild(endRepeat, elem)
            data.parent.insertBefore(startRepeat, endRepeat)
            template.appendChild(elem)
        } else {
            var node
            while (node = elem.firstChild) {
                if (node.nodeType === 3 && rwhitespace.test(node.data)) {
                    elem.removeChild(node)
                } else {
                    template.appendChild(node)
                }
            }
        }
        data.template = template
        data.rollback = function() {
            bindingExecutors.repeat.call(data, "clear")
            var endRepeat = data.endRepeat
            var parent = data.parent
            parent.insertBefore(data.template, endRepeat || null)
            if (endRepeat) {
                parent.removeChild(endRepeat)
                parent.removeChild(data.startRepeat)
                data.element = data.callbackElement
            }
        }
        var arr = data.value.split(".") || []
        if (arr.length > 1) {
            arr.pop()
            var n = arr[0]
            for (var i = 0, v; v = vmodels[i++]; ) {
                if (v && v.hasOwnProperty(n) && v[n][subscribers]) {
                    v[n][subscribers].push(data)
                    break
                }
            }
        }
        if (freturn) {
            return
        }
        data.callbackName = "data-" + type + "-rendered"
        data.handler = bindingExecutors.repeat
        data.$outer = {}
        var check0 = "$key",
                check1 = "$val"
        if (Array.isArray(list)) {
            check0 = "$first"
            check1 = "$last"
        }
        for (var i = 0, p; p = vmodels[i++]; ) {
            if (p.hasOwnProperty(check0) && p.hasOwnProperty(check1)) {
                data.$outer = p
                break
            }
        }
        node = template.firstChild
        data.fastRepeat = !!node && node.nodeType === 1 && template.lastChild === node && !node.attributes["ms-controller"] && !node.attributes["ms-important"]
        list[subscribers] && list[subscribers].push(data)
        if (!Array.isArray(list) && type !== "each") {
            var pool = withProxyPool[list.$id]
            if (!pool) {
                withProxyCount++
                pool = withProxyPool[list.$id] = {}
                for (var key in list) {
                    if (list.hasOwnProperty(key) && key !== "hasOwnProperty") {
                        (function(k, v) {
                            pool[k] = createWithProxy(k, v, {})
                            pool[k].$watch("$val", function(val) {
                                list[k] = val //#303
                            })
                        })(key, list[key])
                    }
                }
            }
            data.handler("append", list, pool)
        } else {
            data.handler("add", 0, list)
        }
    },
    "html": function(data, vmodels) {
        parseExprProxy(data.value, vmodels, data)
    },
    "if": function(data, vmodels) {
        var elem = data.element
        elem.removeAttribute(data.name)
        if (!data.placehoder) {
            data.msInDocument = data.placehoder = DOC.createComment("ms-if")
        }
        data.vmodels = vmodels
        parseExprProxy(data.value, vmodels, data)
    },
    "on": function(data, vmodels) {
        var value = data.value,
                four = "$event"
        if (value.indexOf("(") > 0 && value.indexOf(")") > -1) {
            var matched = (value.match(rdash) || ["", ""])[1].trim()
            if (matched === "" || matched === "$event") { // aaa() aaa($event)当成aaa处理
                four = void 0
                value = value.replace(rdash, "")
            }
        } else {
            four = void 0
        }
        data.hasArgs = four
        parseExprProxy(value, vmodels, data, four)
    },
    "visible": function(data, vmodels) {
        var elem = data.element
        if (!supportDisplay && !root.contains(elem)) { //fuck firfox 全家！
            var display = parseDisplay(elem.tagName)
        }
        display = display || avalon(elem).css("display")
        data.display = display === "none" ? parseDisplay(elem.tagName) : display
        parseExprProxy(data.value, vmodels, data)
    },
    "widget": function(data, vmodels) {
        var args = data.value.match(rword)
        var elem = data.element
        var widget = args[0]
        if (args[1] === "$" || !args[1]) {
            args[1] = widget + setTimeout("1")
        }
        data.value = args.join(",")
        var constructor = avalon.ui[widget]
        if (typeof constructor === "function") { //ms-widget="tabs,tabsAAA,optname"
            vmodels = elem.vmodels || vmodels
            var optName = args[2] || widget //尝试获得配置项的名字，没有则取widget的名字
            for (var i = 0, v; v = vmodels[i++]; ) {
                if (v.hasOwnProperty(optName) && typeof v[optName] === "object") {
                    var nearestVM = v
                    break
                }
            }
            if (nearestVM) {
                var vmOptions = nearestVM[optName]
                vmOptions = vmOptions.$model || vmOptions
                var id = vmOptions[widget + "Id"]
                if (typeof id === "string") {
                    args[1] = id
                }
            }
            var widgetData = avalon.getWidgetData(elem, args[0]) //抽取data-tooltip-text、data-tooltip-attr属性，组成一个配置对象
            data[widget + "Id"] = args[1]
            data[widget + "Options"] = avalon.mix({}, constructor.defaults, vmOptions || {}, widgetData)
            elem.removeAttribute("ms-widget")
            var vmodel = constructor(elem, data, vmodels) || {} //防止组件不返回VM
            data.evaluator = noop
            elem.msData["ms-widget-id"] = vmodel.$id || ""
            if (vmodel.hasOwnProperty("$init")) {
                vmodel.$init()
            }
            if (vmodel.hasOwnProperty("$remove")) {
                var offTree = function() {
                    vmodel.$remove()
                    elem.msData = {}
                    delete VMODELS[vmodel.$id]
                }
                if (supportMutationEvents) {
                    elem.addEventListener("DOMNodeRemoved", function(e) {
                        if (e.target === this && !this.msRetain &&
                                //#441 chrome浏览器对文本域进行Ctrl+V操作，会触发DOMNodeRemoved事件
                                (window.chrome ? this.tagName === "INPUT" && this.relatedNode.nodeType === 1 : 1)) {
                            offTree()
                        }
                    })
                } else {
                    elem.offTree = offTree
                    launchImpl(elem)
                }
            }
        } else if (vmodels.length) { //如果该组件还没有加载，那么保存当前的vmodels
            elem.vmodels = vmodels
        }
    }

}
var supportMutationEvents = DOC.implementation.hasFeature("MutationEvents", "2.0")

//============================   class preperty binding  =======================
"hover,active".replace(rword, function(method) {
    bindingHandlers[method] = bindingHandlers["class"]
})
"with,each".replace(rword, function(name) {
    bindingHandlers[name] = bindingHandlers.repeat
})
//============================= boolean preperty binding =======================
"disabled,enabled,readonly,selected".replace(rword, function(name) {
    bindingHandlers[name] = bindingHandlers.checked
})
bindingHandlers.data = bindingHandlers.text = bindingHandlers.html
//============================= string preperty binding =======================
//与href绑定器 用法差不多的其他字符串属性的绑定器
//建议不要直接在src属性上修改，这样会发出无效的请求，请使用ms-src
"title,alt,src,value,css,include,href".replace(rword, function(name) {
    bindingHandlers[name] = bindingHandlers.attr
})
//============================= model binding =======================
//将模型中的字段与input, textarea的value值关联在一起
var duplexBinding = bindingHandlers.duplex
//如果一个input标签添加了model绑定。那么它对应的字段将与元素的value连结在一起
//字段变，value就变；value变，字段也跟着变。默认是绑定input事件，
duplexBinding.INPUT = function(element, evaluator, data) {
    var fixType = data.param,
            bound = data.bound,
            type = element.type,
            $elem = avalon(element),
            firstTigger = false,
            composing = false,
            callback = function(value) {
                firstTigger = true
                data.changed.call(this, value)
            },
            compositionStart = function() {
                composing = true
            },
            compositionEnd = function() {
                composing = false
            },
            //当value变化时改变model的值
            updateVModel = function() {
                if (composing)
                    return
                var val = element.oldValue = element.value
                if ($elem.data("duplex-observe") !== false) {
                    evaluator(val)
                    callback.call(element, val)
                }
            }

    //当model变化时,它就会改变value的值
    data.handler = function() {
        var curValue = evaluator()
        if (curValue !== element.value) {
            element.value = curValue
        }
    }
    if (type === "checkbox" && fixType === "radio") {
        type = "radio"
    }
    if (type === "radio") {
        data.handler = function() {
            element.oldChecked = element.checked = /bool|text/.test(fixType) ? evaluator() + "" === element.value : !!evaluator()
        }
        updateVModel = function() {
            if ($elem.data("duplex-observe") !== false) {
                var val = element.value
                if (fixType === "text") {
                    evaluator(val)
                } else if (fixType === "bool") {
                    val = val === "true"
                    evaluator(val)
                } else {
                    val = !element.oldChecked
                    evaluator(val)
                    element.checked = val
                }
                callback.call(element, val)
            }
        }
        bound(fixType ? "change" : "mousedown", updateVModel)
    } else if (type === "checkbox") {
        updateVModel = function() {
            if ($elem.data("duplex-observe") !== false) {
                var method = element.checked ? "ensure" : "remove"
                var array = evaluator()
                if (Array.isArray(array)) {
                    avalon.Array[method](array, element.value)
                } else {
                    avalon.error("ms-duplex位于checkbox时要求对应一个数组")
                }
                callback.call(element, array)
            }
        }
        data.handler = function() {
            var array = [].concat(evaluator()) //强制转换为数组
            element.checked = array.indexOf(element.value) >= 0
        }
        bound("change", updateVModel)
    } else {
        var event = element.attributes["data-duplex-event"] || element.attributes["data-event"] || {}
        event = event.value
        if (event === "change") {
            bound("change", updateVModel)
        } else {
            bound("input", updateVModel)
            bound("compositionstart", compositionStart)
            bound("compositionend", compositionEnd)
        }
    }
    element.oldValue = element.value
    element.onTree = onTree
    launch(element)
    registerSubscriber(data)
    var timer = setTimeout(function() {
        if (!firstTigger) {
            callback.call(element, element.value)
        }
        clearTimeout(timer)
    }, 31)
}
var TimerID, ribbon = [],
        launch = noop

function W3CFire(el, name, detail) {
    var event = DOC.createEvent("Events")
    event.initEvent(name, true, true)
    if (detail) {
        event.detail = detail
    }
    el.dispatchEvent(event)
}
function onTree() { //disabled状态下改动不触发inout事件
    if (!this.disabled && this.oldValue !== this.value) {
        W3CFire(this, "input")
    }
}

function ticker() {
    for (var n = ribbon.length - 1; n >= 0; n--) {
        var el = ribbon[n]
        if (avalon.contains(root, el)) {
            el.onTree && el.onTree()
        } else if (!el.msRetain) {
            el.offTree && el.offTree()
            ribbon.splice(n, 1)
        }
    }
    if (!ribbon.length) {
        clearInterval(TimerID)
    }
}

function launchImpl(el) {
    if (ribbon.push(el) === 1) {
        TimerID = setInterval(ticker, 30)
    }
}

function newSetter(newValue) {
    oldSetter.call(this, newValue)
    if (newValue !== this.oldValue) {
        W3CFire(this, "input")
    }
}
try {
    var inputProto = HTMLInputElement.prototype
    var oldSetter = Object.getOwnPropertyDescriptor(inputProto, "value").set //屏蔽chrome, safari,opera
    Object.defineProperty(inputProto, "value", {
        set: newSetter,
        configurable: true
    })
} catch (e) {
    launch = launchImpl
}
duplexBinding.SELECT = function(element, evaluator, data) {
    var $elem = avalon(element)

    function updateVModel() {
        if ($elem.data("duplex-observe") !== false) {
            var val = $elem.val() //字符串或字符串数组
            if (val + "" !== element.oldValue) {
                evaluator(val)
                element.oldValue = val + ""
            }
            data.changed.call(element, val)
        }
    }
    data.handler = function() {
        var curValue = evaluator()
        curValue = curValue && curValue.$model || curValue
        curValue = Array.isArray(curValue) ? curValue.map(String) : curValue + ""
        if (curValue + "" !== element.oldValue) {
            $elem.val(curValue)
            element.oldValue = curValue + ""
        }
    }
    data.bound("change", updateVModel)
    var innerHTML = NaN
    var id = setInterval(function() {
        var currHTML = element.innerHTML
        if (currHTML === innerHTML) {
            clearInterval(id)
            //先等到select里的option元素被扫描后，才根据model设置selected属性  
            registerSubscriber(data)
        } else {
            innerHTML = currHTML
        }
    }, 20)
}
duplexBinding.TEXTAREA = duplexBinding.INPUT
//========================= event binding ====================
var eventHooks = avalon.eventHooks
//针对firefox, chrome修正mouseenter, mouseleave(chrome30+)
if (!("onmouseenter" in root)) {
    avalon.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(origType, fixType) {
        eventHooks[origType] = {
            type: fixType,
            deel: function(elem, fn) {
                return function(e) {
                    var t = e.relatedTarget
                    if (!t || (t !== elem && !(elem.compareDocumentPosition(t) & 16))) {
                        delete e.type
                        e.type = origType
                        return fn.call(elem, e)
                    }
                }
            }
        }
    })
}
//针对IE9+, w3c修正animationend
avalon.each({
    AnimationEvent: "animationend",
    WebKitAnimationEvent: "webkitAnimationEnd"
}, function(construct, fixType) {
    if (window[construct] && !eventHooks.animationend) {
        eventHooks.animationend = {
            type: fixType
        }
    }
})
if (document.onmousewheel === void 0) {
    /* IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
     firefox DOMMouseScroll detail 下3 上-3
     firefox wheel detlaY 下3 上-3
     IE9-11 wheel deltaY 下40 上-40
     chrome wheel deltaY 下100 上-100 */
    eventHooks.mousewheel = {
        type: "DOMMouseScroll",
        deel: function(elem, fn) {
            return function(e) {
                e.wheelDelta = e.detail > 0 ? -120 : 120
                Object.defineProperty(e, "type", {
                    value: "mousewheel"
                })
                fn.call(elem, e)
            }
        }
    }
}
/*********************************************************************
 *          监控数组（与ms-each, ms-repeat配合使用）                 *
 **********************************************************************/

function Collection(model) {
    var array = []
    array.$id = generateID()
    array[subscribers] = []
    array.$model = model
    array.$events = {}
    array._ = modelFactory({
        length: model.length
    })
    array._.$watch("length", function(a, b) {
        array.$fire("length", a, b)
    })
    for (var i in Observable) {
        array[i] = Observable[i]
    }
    avalon.mix(array, CollectionPrototype)
    return array
}


var _splice = ap.splice
var CollectionPrototype = {
    _splice: _splice,
    _add: function(arr, pos) {
        var oldLength = this.length
        pos = typeof pos === "number" ? pos : oldLength
        var added = []
        for (var i = 0, n = arr.length; i < n; i++) {
            added[i] = convert(arr[i])
        }
        _splice.apply(this, [pos, 0].concat(added))
        notifySubscribers(this, "add", pos, added)
        if (!this._stopFireLength) {
            return this._.length = this.length
        }
    },
    _del: function(pos, n) {
        var ret = this._splice(pos, n)
        if (ret.length) {
            notifySubscribers(this, "del", pos, n)
            if (!this._stopFireLength) {
                this._.length = this.length
            }
        }
        return ret
    },
    push: function() {
        ap.push.apply(this.$model, arguments)
        var n = this._add(arguments)
        notifySubscribers(this, "index", n > 2 ? n - 2 : 0)
        return n
    },
    pushArray: function(array) {
        return this.push.apply(this, array)
    },
    unshift: function() {
        ap.unshift.apply(this.$model, arguments)
        var ret = this._add(arguments, 0) //返回长度
        notifySubscribers(this, "index", arguments.length)
        return ret
    },
    shift: function() {
        var el = this.$model.shift()
        this._del(0, 1)
        notifySubscribers(this, "index", 0)
        return el //返回被移除的元素
    },
    pop: function() {
        var el = this.$model.pop()
        this._del(this.length - 1, 1)
        return el //返回被移除的元素
    },
    splice: function(a, b) {
        // 必须存在第一个参数，需要大于-1, 为添加或删除元素的基点
        a = resetNumber(a, this.length)
        var removed = _splice.apply(this.$model, arguments),
                ret = [], change
        this._stopFireLength = true //确保在这个方法中 , $watch("length",fn)只触发一次
        if (removed.length) {
            ret = this._del(a, removed.length)
            change = true
        }
        if (arguments.length > 2) {
            this._add(aslice.call(arguments, 2), a)
            change = true
        }
        this._stopFireLength = false
        this._.length = this.length
        if (change) {
            notifySubscribers(this, "index", 0)
        }
        return ret //返回被移除的元素
    },
    contains: function(el) { //判定是否包含
        return this.indexOf(el) !== -1
    },
    size: function() { //取得数组长度，这个函数可以同步视图，length不能
        return this._.length
    },
    remove: function(el) { //移除第一个等于给定值的元素
        return this.removeAt(this.indexOf(el))
    },
    removeAt: function(index) { //移除指定索引上的元素
        return index >= 0 ? this.splice(index, 1) : []
    },
    clear: function() {
        this.$model.length = this.length = this._.length = 0 //清空数组
        notifySubscribers(this, "clear", 0)
        return this
    },
    removeAll: function(all) { //移除N个元素
        if (Array.isArray(all)) {
            all.forEach(function(el) {
                this.remove(el)
            }, this)
        } else if (typeof all === "function") {
            for (var i = this.length - 1; i >= 0; i--) {
                var el = this[i]
                if (all(el, i)) {
                    this.splice(i, 1)
                }
            }
        } else {
            this.clear()
        }
    },
    ensure: function(el) {
        if (!this.contains(el)) { //只有不存在才push
            this.push(el)
        }
        return this
    },
    set: function(index, val) {
        if (index >= 0) {
            var valueType = getType(val)
            if (val && val.$model) {
                val = val.$model
            }
            var target = this[index]
            if (valueType === "object") {
                for (var i in val) {
                    if (target.hasOwnProperty(i)) {
                        target[i] = val[i]
                    }
                }
            } else if (valueType === "array") {
                target.clear().push.apply(target, val)
            } else if (target !== val) {
                this[index] = val
                this.$model[index] = val
                notifySubscribers(this, "set", index, val)
            }
        }
        return this
    }
}
"sort,reverse".replace(rword, function(method) {
    CollectionPrototype[method] = function() {
        var aaa = this.$model,
                bbb = aaa.slice(0),
                sorted = false
        ap[method].apply(aaa, arguments) //先移动model
        for (var i = 0, n = bbb.length; i < n; i++) {
            var a = aaa[i],
                    b = bbb[i]
            if (!isEqual(a, b)) {
                sorted = true
                var index = bbb.indexOf(a, i)
                var remove = this._splice(index, 1)[0]
                var remove2 = bbb.splice(index, 1)[0]
                this._splice(i, 0, remove)
                bbb.splice(i, 0, remove2)
                notifySubscribers(this, "move", index, i)
            }
        }
        bbb = void 0
        if (sorted) {
            notifySubscribers(this, "index", 0)
        }
        return this
    }
})

function convert(val) {
    var type = getType(val)
    if (rcomplextype.test(type)) {
        val = val.$id ? val : modelFactory(val, val)
    }
    return val
}

//============ each/repeat/with binding 用到的辅助函数与对象 ======================
/*得到某一元素节点或文档碎片对象下的所有注释节点*/
var queryComments = function(parent) {
    var tw = DOC.createTreeWalker(parent, NodeFilter.SHOW_COMMENT, null, null),
            comment, ret = []
    while (comment = tw.nextNode()) {
        ret.push(comment)
    }
    return ret
}
var deleteRange = DOC.createRange()

/*将通过ms-if移出DOM树放进ifSanctuary的元素节点移出来，以便垃圾回收*/

function expelFromSanctuary(parent) {
    var comments = queryComments(parent)
    for (var i = 0, comment; comment = comments[i++]; ) {
        if (comment.nodeValue == "ms-if") {
            cinerator.appendChild(comment.elem)
        }
    }
    while (comment = parent.firstChild) {
        cinerator.appendChild(comment)
    }
    cinerator.innerHTML = ""
}

function iteratorCallback(args) {
    var callback = getBindingCallback(this.callbackElement, this.callbackName, this.vmodels)
    if (callback) {
        var parent = this.parent
        checkScan(parent, function() {
            callback.apply(parent, args)
        })
    }
}

//为ms-each, ms-with, ms-repeat要循环的元素外包一个msloop临时节点，ms-controller的值为代理VM的$id
function shimController(data, transation, spans, proxy) {
    var tview = data.template.cloneNode(true)
    var id = proxy.$id
    var span = tview.firstChild
    if (!data.fastRepeat) {
        span = DOC.createElement("msloop")
        span.style.display = "none"
        span.appendChild(tview)
    }
    span.setAttribute("ms-controller", id)
    spans.push(span)
    transation.appendChild(span)
    proxy.$outer = data.$outer
    VMODELS[id] = proxy

    function fn() {
        delete VMODELS[id]
        data.group = 1
        if (!data.fastRepeat) {
            data.group = span.childNodes.length
            span.parentNode.removeChild(span)
            while (span.firstChild) {
                transation.appendChild(span.firstChild)
            }
            if (fn.node !== void 0) {
                fn.parent.insertBefore(transation, fn.node)
            }
        }
    }
    return span.patchRepeat = fn
}
// 取得用于定位的节点。在绑定了ms-each, ms-with属性的元素里，它的整个innerHTML都会视为一个子模板先行移出DOM树，
// 然后如果它的元素有多少个（ms-each）或键值对有多少双（ms-with），就将它复制多少份(多少为N)，再经过扫描后，重新插入该元素中。
// 这时该元素的孩子将分为N等分，每等份的第一个节点就是这个用于定位的节点，
// 方便我们根据它算出整个等分的节点们，然后整体移除或移动它们。

function getLocatedNode(parent, data, pos) {
    if (data.startRepeat) {
        var ret = data.startRepeat,
                end = data.endRepeat
        pos += 1
        for (var i = 0; i < pos; i++) {
            ret = ret.nextSibling
            if (ret == end)
                return end
        }
        return ret
    } else {
        return parent.childNodes[data.group * pos] || null
    }
}

function removeView(node, group, n) {
    var length = group * (n || 1)
    var view = hyperspace //.cloneNode(false)//???
    while (--length >= 0) {
        var nextSibling = node.nextSibling
        view.appendChild(node)
        node = nextSibling
        if (!node) {
            break
        }
    }
    return view
}


// 为ms-each, ms-repeat创建一个代理对象，通过它们能使用一些额外的属性与功能（$index,$first,$last,$remove,$key,$val,$outer）
var watchEachOne = oneObject("$index,$first,$last")

function createWithProxy(key, val, $outer) {
    var proxy = modelFactory({
        $key: key,
        $outer: $outer,
        $val: val
    }, 0, {
        $val: 1,
        $key: 1
    })
    proxy.$id = "$proxy$with" + Math.random()
    return proxy
}
var eachProxyPool = []
function getEachProxy(index, item, data, last) {
    var param = data.param || "el", proxy
    var source = {
        $remove: function() {
            return data.getter().removeAt(proxy.$index)
        },
        $itemName: param,
        $index: index,
        $outer: data.$outer,
        $first: index === 0,
        $last: index === last
    }
    source[param] = item
    for (var i = 0, n = eachProxyPool.length; i < n; i++) {
        var proxy = eachProxyPool[i]
        if (proxy.hasOwnProperty(param)) {
            for (var i in source) {
                proxy[i] = source[i]
            }
            eachProxyPool.splice(i, 1)
            return proxy
        }
    }
    var type = avalon.type(item)
    if (type === "object" || type === "function") {
        source.$skipArray = [param]
    }
    proxy = modelFactory(source, 0, watchEachOne)
    proxy.$id = "$proxy$" + data.type + Math.random()
    return proxy
}
function recycleEachProxy(proxy) {
    var obj = proxy.$accessors, name = proxy.$itemName;
    ["$index", "$last", "$first"].forEach(function(prop) {
        obj[prop][subscribers].length = 0
    })
    if (proxy[name][subscribers]) {
        proxy[name][subscribers].length = 0;
    }
    if (eachProxyPool.unshift(proxy) > kernel.maxRepeatSize) {
        eachProxyPool.pop()
    }
}
/*********************************************************************
 *                  文本绑定里默认可用的过滤器                        *
 **********************************************************************/
var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim
var raimg = /^<(a|img)\s/i
var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g
var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig
var rjavascripturl = /\s+(src|href)(?:=("javascript[^"]*"|'javascript[^']*'))?/ig
var rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
var rnoalphanumeric = /([^\#-~| |!])/g;

var filters = avalon.filters = {
    uppercase: function(str) {
        return str.toUpperCase()
    },
    lowercase: function(str) {
        return str.toLowerCase()
    },
    truncate: function(target, length, truncation) {
        //length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
        length = length || 30
        truncation = truncation === void(0) ? "..." : truncation
        return target.length > length ? target.slice(0, length - truncation.length) + truncation : String(target)
    },
    sanitize: window.toStaticHTML ? toStaticHTML.bind(window) : function(str) {
        return str.replace(rscripts, "").replace(ropen, function(a, b) {
            if (raimg.test(a)) {
                a = a.replace(rjavascripturl, " $1=''")//移除javascript伪协议//移除javascript伪协议
            }
            return a.replace(ron, " ").replace(/\s+/g, " ")//移除onXXX事件
        })
    },
    camelize: camelize,
    escape: function(html) {
        //将字符串经过 html 转义得到适合在页面中显示的内容, 例如替换 < 为 &lt 
        return String(html).
                replace(/&/g, '&amp;').
                replace(rsurrogate, function(value) {
                    var hi = value.charCodeAt(0)
                    var low = value.charCodeAt(1)
                    return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
                }).
                replace(rnoalphanumeric, function(value) {
                    return '&#' + value.charCodeAt(0) + ';'
                }).
                replace(/</g, '&lt;').
                replace(/>/g, '&gt;')
    },
    currency: function(number, symbol) {
        symbol = symbol || "\uFFE5"
        return symbol + avalon.filters.number(number)
    },
    number: function(number, decimals, dec_point, thousands_sep) {
        //与PHP的number_format完全兼容
        //number    必需，要格式化的数字
        //decimals  可选，规定多少个小数位。
        //dec_point 可选，规定用作小数点的字符串（默认为 . ）。
        //thousands_sep 可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
        // http://kevin.vanzonneveld.net
        number = (number + "").replace(/[^0-9+\-Ee.]/g, "")
        var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                sep = thousands_sep || ",",
                dec = dec_point || ".",
                s = "",
                toFixedFix = function(n, prec) {
                    var k = Math.pow(10, prec)
                    return "" + Math.round(n * k) / k
                }
        // Fix for IE parseFloat(0.55).toFixed(0) = 0 
        s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split('.')
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
        }
        if ((s[1] || "").length < prec) {
            s[1] = s[1] || ""
            s[1] += new Array(prec - s[1].length + 1).join("0")
        }
        return s.join(dec)
    }
}
/*
 'yyyy': 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
 'yy': 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
 'y': 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
 'MMMM': Month in year (January-December)
 'MMM': Month in year (Jan-Dec)
 'MM': Month in year, padded (01-12)
 'M': Month in year (1-12)
 'dd': Day in month, padded (01-31)
 'd': Day in month (1-31)
 'EEEE': Day in Week,(Sunday-Saturday)
 'EEE': Day in Week, (Sun-Sat)
 'HH': Hour in day, padded (00-23)
 'H': Hour in day (0-23)
 'hh': Hour in am/pm, padded (01-12)
 'h': Hour in am/pm, (1-12)
 'mm': Minute in hour, padded (00-59)
 'm': Minute in hour (0-59)
 'ss': Second in minute, padded (00-59)
 's': Second in minute (0-59)
 'a': am/pm marker
 'Z': 4 digit (+sign) representation of the timezone offset (-1200-+1200)
 format string can also be one of the following predefined localizable formats:
 
 'medium': equivalent to 'MMM d, y h:mm:ss a' for en_US locale (e.g. Sep 3, 2010 12:05:08 pm)
 'short': equivalent to 'M/d/yy h:mm a' for en_US locale (e.g. 9/3/10 12:05 pm)
 'fullDate': equivalent to 'EEEE, MMMM d,y' for en_US locale (e.g. Friday, September 3, 2010)
 'longDate': equivalent to 'MMMM d, y' for en_US locale (e.g. September 3, 2010
 'mediumDate': equivalent to 'MMM d, y' for en_US locale (e.g. Sep 3, 2010)
 'shortDate': equivalent to 'M/d/yy' for en_US locale (e.g. 9/3/10)
 'mediumTime': equivalent to 'h:mm:ss a' for en_US locale (e.g. 12:05:08 pm)
 'shortTime': equivalent to 'h:mm a' for en_US locale (e.g. 12:05 pm)
 */
new function() {
    function toInt(str) {
        return parseInt(str, 10)
    }

    function padNumber(num, digits, trim) {
        var neg = ""
        if (num < 0) {
            neg = "-"
            num = -num
        }
        num = "" + num
        while (num.length < digits)
            num = "0" + num
        if (trim)
            num = num.substr(num.length - digits)
        return neg + num
    }

    function dateGetter(name, size, offset, trim) {
        return function(date) {
            var value = date["get" + name]()
            if (offset > 0 || value > -offset)
                value += offset
            if (value === 0 && offset === -12) {
                value = 12
            }
            return padNumber(value, size, trim)
        }
    }

    function dateStrGetter(name, shortForm) {
        return function(date, formats) {
            var value = date["get" + name]()
            var get = (shortForm ? ("SHORT" + name) : name).toUpperCase()
            return formats[get][value]
        }
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset()
        var paddedZone = (zone >= 0) ? "+" : ""
        paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2)
        return paddedZone
    }
    //取得上午下午

    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1]
    }
    var DATE_FORMATS = {
        yyyy: dateGetter("FullYear", 4),
        yy: dateGetter("FullYear", 2, 0, true),
        y: dateGetter("FullYear", 1),
        MMMM: dateStrGetter("Month"),
        MMM: dateStrGetter("Month", true),
        MM: dateGetter("Month", 2, 1),
        M: dateGetter("Month", 1, 1),
        dd: dateGetter("Date", 2),
        d: dateGetter("Date", 1),
        HH: dateGetter("Hours", 2),
        H: dateGetter("Hours", 1),
        hh: dateGetter("Hours", 2, -12),
        h: dateGetter("Hours", 1, -12),
        mm: dateGetter("Minutes", 2),
        m: dateGetter("Minutes", 1),
        ss: dateGetter("Seconds", 2),
        s: dateGetter("Seconds", 1),
        sss: dateGetter("Milliseconds", 3),
        EEEE: dateStrGetter("Day"),
        EEE: dateStrGetter("Day", true),
        a: ampmGetter,
        Z: timeZoneGetter
    }
    var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,
            NUMBER_STRING = /^\d+$/
    var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/
    // 1        2       3         4          5          6          7          8  9     10      11

    function jsonStringToDate(string) {
        var match
        if (match = string.match(R_ISO8601_STR)) {
            var date = new Date(0),
                    tzHour = 0,
                    tzMin = 0,
                    dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear,
                    timeSetter = match[8] ? date.setUTCHours : date.setHours
            if (match[9]) {
                tzHour = toInt(match[9] + match[10])
                tzMin = toInt(match[9] + match[11])
            }
            dateSetter.call(date, toInt(match[1]), toInt(match[2]) - 1, toInt(match[3]))
            var h = toInt(match[4] || 0) - tzHour
            var m = toInt(match[5] || 0) - tzMin
            var s = toInt(match[6] || 0)
            var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000)
            timeSetter.call(date, h, m, s, ms)
            return date
        }
        return string
    }
    var rfixFFDate = /^(\d+)-(\d+)-(\d{4})$/
    var rfixIEDate = /^(\d+)\s+(\d+),(\d{4})$/
    filters.date = function(date, format) {
        var locate = filters.date.locate,
                text = "",
                parts = [],
                fn, match
        format = format || "mediumDate"
        format = locate[format] || format
        if (typeof date === "string") {
            if (NUMBER_STRING.test(date)) {
                date = toInt(date)
            } else {
                var trimDate = date.trim()
                if (trimDate.match(rfixFFDate) || trimDate.match(rfixIEDate)) {
                    date = RegExp.$3 + "/" + RegExp.$1 + "/" + RegExp.$2
                }
                date = jsonStringToDate(date)
            }
            date = new Date(date)
        }
        if (typeof date === "number") {
            date = new Date(date)
        }
        if (getType(date) !== "date") {
            return
        }
        while (format) {
            match = DATE_FORMATS_SPLIT.exec(format)
            if (match) {
                parts = parts.concat(match.slice(1))
                format = parts.pop()
            } else {
                parts.push(format)
                format = null
            }
        }
        parts.forEach(function(value) {
            fn = DATE_FORMATS[value]
            text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'")
        })
        return text
    }
    var locate = {
        AMPMS: {
            0: "上午",
            1: "下午"
        },
        DAY: {
            0: "星期日",
            1: "星期一",
            2: "星期二",
            3: "星期三",
            4: "星期四",
            5: "星期五",
            6: "星期六"
        },
        MONTH: {
            0: "1月",
            1: "2月",
            2: "3月",
            3: "4月",
            4: "5月",
            5: "6月",
            6: "7月",
            7: "8月",
            8: "9月",
            9: "10月",
            10: "11月",
            11: "12月"
        },
        SHORTDAY: {
            "0": "周日",
            "1": "周一",
            "2": "周二",
            "3": "周三",
            "4": "周四",
            "5": "周五",
            "6": "周六"
        },
        fullDate: "y年M月d日EEEE",
        longDate: "y年M月d日",
        medium: "yyyy-M-d ah:mm:ss",
        mediumDate: "yyyy-M-d",
        mediumTime: "ah:mm:ss",
        "short": "yy-M-d ah:mm",
        shortDate: "yy-M-d",
        shortTime: "ah:mm"
    }
    locate.SHORTMONTH = locate.MONTH
    filters.date.locate = locate
}
/*********************************************************************
 *                      AMD Loader                                   *
 **********************************************************************/

var innerRequire
var modules = avalon.modules = {
    "ready!": {
        exports: avalon
    },
    "avalon": {
        exports: avalon,
        state: 2
    }
}

new function() {
    var loadings = [] //正在加载中的模块列表
    var factorys = [] //储存需要绑定ID与factory对应关系的模块（标准浏览器下，先parse的script节点会先onload）
    var basepath

    function cleanUrl(url) {
        return (url || "").replace(/[?#].*/, "")
    }
    plugins.js = function(url, shim) {
        var id = cleanUrl(url)
        if (!modules[id]) { //如果之前没有加载过
            modules[id] = {
                id: id,
                exports: {}
            }
            if (shim) { //shim机制
                innerRequire(shim.deps || "", function() {
                    loadJS(url, id, function() {
                        modules[id].state = 2
                        if (shim.exports)
                            modules[id].exports = typeof shim.exports === "function" ?
                                    shim.exports() : window[shim.exports]
                        innerRequire.checkDeps()
                    })
                })
            } else {
                loadJS(url, id)
            }
        }
        return id
    }
    plugins.css = function(url) {
        var id = url.replace(/(#.+|\W)/g, "") ////用于处理掉href中的hash与所有特殊符号
        if (!DOC.getElementById(id)) {
            var node = DOC.createElement("link")
            node.rel = "stylesheet"
            node.href = url
            node.id = id
            head.insertBefore(node, head.firstChild)
        }
    }
    plugins.css.ext = ".css"
    plugins.js.ext = ".js"

    plugins.text = function(url) {
        var xhr = new XMLHttpRequest
        var id = url.replace(/[?#].*/, "")
        modules[id] = {}
        xhr.onload = function() {
            modules[id].state = 2
            modules[id].exports = xhr.responseText
            innerRequire.checkDeps()
        }
        xhr.onerror = function() {
            avalon.error(url + " 对应资源不存在或没有开启 CORS")
        }
        xhr.open("GET", url, true)
        xhr.withCredentials = true
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
        xhr.send()
        return id
    }
    //http://www.html5rocks.com/zh/tutorials/webcomponents/imports/
    if ('import' in DOC.createElement("link")) {
        plugins.text = function(url) {
            var id = url.replace(/[?#].*/, "")
            modules[id] = {}
            var link = DOC.createElement("link")
            link.rel = "import"
            link.href = url
            link.onload = function() {
                modules[id].state = 2
                var content = this["import"]
                if (content) {
                    modules[id].exports = content.documentElement.outerHTML
                    avalon.require.checkDeps()
                }
                onerror(0, content)
            }

            function onerror(a, b) {
                b && avalon.error(url + "对应资源不存在或没有开启 CORS")
                setTimeout(function() {
                    head.removeChild(link)
                })
            }
            link.onerror = onerror
            head.appendChild(link)
            return id
        }
    }

    var cur = getCurrentScript(true)
    if (!cur) { //处理window safari的Error没有stack的问题
        cur = avalon.slice(document.scripts).pop().src
    }
    var url = cleanUrl(cur)
    basepath = kernel.base = url.slice(0, url.lastIndexOf("/") + 1)

    function getCurrentScript(base) {
        // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
        var stack
        try {
            a.b.c() //强制报错,以便捕获e.stack
        } catch (e) { //safari的错误对象只有line,sourceId,sourceURL
            stack = e.stack
        }
        if (stack) {
            /**e.stack最后一行在所有支持的浏览器大致如下:
             *chrome23:
             * at http://113.93.50.63/data.js:4:1
             *firefox17:
             *@http://113.93.50.63/query.js:4
             *opera12:http://www.oldapps.com/opera.php?system=Windows_XP
             *@http://113.93.50.63/data.js:4
             *IE10:
             *  at Global code (http://113.93.50.63/data.js:4:1)
             *  //firefox4+ 可以用document.currentScript
             */
            stack = stack.split(/[@ ]/g).pop() //取得最后一行,最后一个空格或@之后的部分
            stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, "") //去掉换行符
            return stack.replace(/(:\d+)?:\d+$/i, "") //去掉行号与或许存在的出错字符起始位置
        }
        var nodes = (base ? DOC : head).getElementsByTagName("script") //只在head标签中寻找
        for (var i = nodes.length, node; node = nodes[--i]; ) {
            if ((base || node.className === subscribers) && node.readyState === "interactive") {
                return node.className = node.src
            }
        }
    }

    function checkCycle(deps, nick) {
        //检测是否存在循环依赖
        for (var id in deps) {
            if (deps[id] === "司徒正美" && modules[id].state !== 2 && (id === nick || checkCycle(modules[id].deps, nick))) {
                return true
            }
        }
    }

    function checkDeps() {
        //检测此JS模块的依赖是否都已安装完毕,是则安装自身
        loop: for (var i = loadings.length, id; id = loadings[--i]; ) {
            var obj = modules[id],
                    deps = obj.deps
            for (var key in deps) {
                if (ohasOwn.call(deps, key) && modules[key].state !== 2) {
                    continue loop
                }
            }
            //如果deps是空对象或者其依赖的模块的状态都是2
            if (obj.state !== 2) {
                loadings.splice(i, 1) //必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它
                fireFactory(obj.id, obj.args, obj.factory)
                checkDeps() //如果成功,则再执行一次,以防有些模块就差本模块没有安装好
            }
        }
    }


    function checkFail(node, onError) {
        var id = cleanUrl(node.src) //检测是否死链
        node.onload = node.onerror = null
        if (onError) {
            setTimeout(function() {
                head.removeChild(node)
            })
            log("debug: 加载 " + id + " 失败" + onError + " " + (!modules[id].state))
        } else {
            return true
        }
    }
    var rdeuce = /\/\w+\/\.\./

    function loadResources(url, parent, ret, shim) {
        //1. 特别处理mass|ready标识符
        if (url === "ready!" || (modules[url] && modules[url].state === 2)) {
            return url
        }
        //2.  处理text!  css! 等资源
        var plugin
        url = url.replace(/^\w+!/, function(a) {
            plugin = a.slice(0, -1)
            return ""
        })
        plugin = plugin || "js"
        plugin = plugins[plugin] || noop
        //3. 转化为完整路径
        if (typeof kernel.shim[url] === "object") {
            shim = kernel.shim[url]
        }
        if (kernel.paths[url]) { //别名机制
            url = kernel.paths[url]
        }
        //4. 补全路径
        if (/^(\w+)(\d)?:.*/.test(url)) {
            ret = url
        } else {
            parent = parent.substr(0, parent.lastIndexOf('/'))
            var tmp = url.charAt(0)
            if (tmp !== "." && tmp !== "/") { //相对于根路径
                ret = basepath + url
            } else if (url.slice(0, 2) === "./") { //相对于兄弟路径
                ret = parent + url.slice(1)
            } else if (url.slice(0, 2) === "..") { //相对于父路径
                ret = parent + "/" + url
                while (rdeuce.test(ret)) {
                    ret = ret.replace(rdeuce, "")
                }
            } else if (tmp === "/") {
                ret = parent + url //相对于兄弟路径
            } else {
                avalon.error("不符合模块标识规则: " + url)
            }
        }
        //5. 补全扩展名
        url = cleanUrl(ret)
        var ext = plugin.ext
        if (ext) {
            if (url.slice(0 - ext.length) !== ext) {
                ret += ext
            }
        }
        //6. 缓存处理
        if (kernel.nocache) {
            ret += (ret.indexOf("?") === -1 ? "?" : "&") + Date.now()
        }
        return plugin(ret, shim)
    }

    function loadJS(url, id, callback) {
        //通过script节点加载目标模块
        var node = DOC.createElement("script")
        node.className = subscribers //让getCurrentScript只处理类名为subscribers的script节点
        node.onload = function() {
            var factory = factorys.pop()
            factory && factory.delay(id)
            if (callback) {
                callback()
            }
            log("debug: 已成功加载 " + url)
        }

        node.onerror = function() {
            checkFail(node, true)
        }
        node.src = url //插入到head的第一个节点前，防止IE6下head标签没闭合前使用appendChild抛错
        head.appendChild(node) //chrome下第二个参数不能为null
        log("debug: 正准备加载 " + url) //更重要的是IE6下可以收窄getCurrentScript的寻找范围
    }

    innerRequire = avalon.require = function(list, factory, parent) {
        // 用于检测它的依赖是否都为2
        var deps = {},
                // 用于保存依赖模块的返回值
                args = [],
                // 需要安装的模块数
                dn = 0,
                // 已安装完的模块数
                cn = 0,
                id = parent || "callback" + setTimeout("1")
        parent = parent || basepath
        String(list).replace(rword, function(el) {
            var url = loadResources(el, parent)
            if (url) {
                dn++

                if (modules[url] && modules[url].state === 2) {
                    cn++
                }
                if (!deps[url]) {
                    args.push(url)
                    deps[url] = "司徒正美" //去重
                }
            }
        })
        modules[id] = {//创建一个对象,记录模块的加载情况与其他信息
            id: id,
            factory: factory,
            deps: deps,
            args: args,
            state: 1
        }
        if (dn === cn) { //如果需要安装的等于已安装好的
            fireFactory(id, args, factory) //安装到框架中
        } else {
            //放到检测列队中,等待checkDeps处理
            loadings.unshift(id)
        }
        checkDeps()
    }

    /**
     * 定义模块
     * @param {String} id ? 模块ID
     * @param {Array} deps ? 依赖列表
     * @param {Function} factory 模块工厂
     * @api public
     */
    innerRequire.define = function(id, deps, factory) { //模块名,依赖列表,模块本身
        var args = avalon.slice(arguments)

        if (typeof id === "string") {
            var _id = args.shift()
        }
        if (typeof args[0] === "function") {
            args.unshift([])
        } //上线合并后能直接得到模块ID,否则寻找当前正在解析中的script节点的src作为模块ID
        //现在除了safari外，我们都能直接通过getCurrentScript一步到位得到当前执行的script节点，
        //safari可通过onload+delay闭包组合解决
        var name = modules[_id] && modules[_id].state >= 1 ? _id : cleanUrl(getCurrentScript())
        if (!modules[name] && _id) {
            modules[name] = {
                id: name,
                factory: factory,
                state: 1
            }
        }
        factory = args[1]
        factory.id = _id //用于调试
        factory.delay = function(d) {
            args.push(d)
            var isCycle = true
            try {
                isCycle = checkCycle(modules[d].deps, d)
            } catch (e) {
            }
            if (isCycle) {
                avalon.error(d + "模块与之前的模块存在循环依赖，请不要直接用script标签引入" + d + "模块")
            }
            delete factory.delay //释放内存
            innerRequire.apply(null, args) //0,1,2 --> 1,2,0
        }

        if (name) {
            factory.delay(name, args)
        } else { //先进先出
            factorys.push(factory)
        }
    }
    innerRequire.define.amd = modules

    function fireFactory(id, deps, factory) {
        for (var i = 0, array = [], d; d = deps[i++]; ) {
            array.push(modules[d].exports)
        }
        var module = Object(modules[id]),
                ret = factory.apply(window, array)
        module.state = 2
        if (ret !== void 0) {
            modules[id].exports = ret
        }
        return ret
    }
    innerRequire.config = kernel
    innerRequire.checkDeps = checkDeps
}
/*********************************************************************
 *                    DOMReady                                         *
 **********************************************************************/

function fireReady() {
    modules["ready!"].state = 2
    innerRequire.checkDeps()
    fireReady = noop //隋性函数，防止IE9二次调用_checkDeps
}

if (DOC.readyState === "complete") {
    setTimeout(fireReady) //如果在domReady之外加载
} else {
    DOC.addEventListener("DOMContentLoaded", fireReady)
    window.addEventListener("load", fireReady)
}
avalon.ready = function(fn) {
    innerRequire("ready!", fn)
}
avalon.config({
    loader: false
})
var msSelector = "[ms-controller],[ms-important]"
avalon.ready(function() {
    var elems = DOC.querySelectorAll(msSelector),
            nodes = []
    for (var i = 0, elem; elem = elems[i++]; ) {
        if (!elem.__root__) {
            var array = elem.querySelectorAll(msSelector)
            for (var j = 0, el; el = array[j++]; ) {
                el.__root__ = true
            }
            nodes.push(elem)
        }
    }
    for (var i = 0, elem; elem = nodes[i++]; ) {
        avalon.scan(elem)
    }
})

/**
 http://www.cnblogs.com/henryzhu/p/mvvm-1-why-mvvm.ht
 http://dev.oupeng.com/wp-content/uploads/20131109-kennyluck-optimizing-js-games.html#controls-slide
 */
module.exports = avalon
});
require.register("smzdm_pro/source/lib/jquery.js", function(exports, require, module){
/*!
 * jQuery JavaScript Library v2.1.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-05-01T17:11Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get jQuery
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a jQuery-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android < 4.0, iOS < 6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v1.10.19
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-04-18
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== strundefined && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare,
		doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", function() {
				setDocument();
			}, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", function() {
				setDocument();
			});
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select msallowclip=''><option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowclip^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android < 4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Math.random();
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android < 4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



/*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	// Support: Windows Web Apps (WWA)
	// `name` and `type` need .setAttribute for WWA
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE9-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome < 28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE 9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE 9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Support: IE >= 9
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Support: IE >= 9
		// Fix Cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit
					// jQuery.merge because push.apply(_, arraylike) throws
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit
					// jQuery.merge because push.apply(_, arraylike) throws
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Fixes #12346
					// Support: Webkit, IE
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optmization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') in IE9, see #12537
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due to missing dependency),
				// remove it.
				// Since there are no other hooks for marginRight, remove the whole object.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.

			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {
				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {
				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// Work around by temporarily setting element display to inline-block
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS 5.1, Android 4.x, Android 2.3
	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
	support.checkOn = input.value !== "";

	// Must access the parent to make an option select properly
	// Support: IE9, IE10
	support.optSelected = opt.selected;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Check if an input maintains its value after becoming a radio
	// Support: IE9, IE10
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// We assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

});
require.register("smzdm_pro/source/src/core/main.js", function(exports, require, module){
/**
 * 数据处理核心
 * @author s
 * @data   2014/06/30
 * @time   16:00
 */

var DBoy = {};


/**
 * 扩展接口
 */
DBoy.extend = function() {
    var options , name, src, copy, copyIsArray, clone
      , target = arguments[0] || {}
      , i = 1, length = arguments.length
      , deep = false

    // 如果第一个参数为布尔,判定是否深拷贝
    if (typeof target === "boolean") {
        deep = target
        target = arguments[1] || {}
        i++
    }

    //确保接受方为一个复杂的数据类型
    if (typeof target !== "object" && DBoy.type(target) !== "function") {
        target = {}
    }

    //如果只有一个参数，那么新成员添加于mix所在的对象上
    if (i === length) {
        target = this
        i--
    }

    for (; i < length; i++) {
        //只处理非空参数
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name]
                copy = options[name]

                // 防止环引用
                if (target === copy) {
                    continue
                }
                if (deep && copy && (DBoy.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false
                        clone = src && Array.isArray(src) ? src : []

                    } else {
                        clone = src && DBoy.isPlainObject(src) ? src : {}
                    }

                    target[name] = DBoy.extend(deep, clone, copy)
                } else if (copy !== void 0) {
                    target[name] = copy
                }
            }
        }
    }
    return target
}

var class2type = {}
  , toString = class2type.toString

DBoy.extend({
    // 异常报告日志
    error:function(msg){
        // todo: 记录日志内容
        console.error(msg)
    },

    // 纯粹空函数
    noop:function() {},

    // 判断为函数
    isFunction:function(obj){
        return DBoy.type(obj) === "function"
    },

    // 判断数组
    isArray: Array.isArray,

    // 判断对象
    isObject:function(obj){
        return obj instanceof Object
    },

    // 判断纯粹的的js对象
    isPlainObject:function(obj){
        return !!obj && typeof obj === "object" && Object.getPrototypeOf(obj) === Object.prototype
    },

    // 判断空对象
    isEmptyObject:function(obj){
        for(var name in obj) {
            return false;
        }
        return true;
    },

    // 读取类型
    type:function(obj){
        if (obj == null) {
            return obj + ""
        }
        // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj
    },

    // 遍历,支持伪数组
    each:function(obj, fn){
        if (obj) { //排除null, undefined
            var i = 0
            if (isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    fn(i, obj[i])
                }
            }
            else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        fn(i, obj[i])
                    }
                }
            }
        }
    },

    // 添加到数组
    inArray:function( elem, arr, i ) {
        return arr == null ? -1 : indexOf.call( arr, elem, i );
    },

    // 去空格
    trim:function( text ) {
        return text == null ?
            "" :
            ( text + "" ).replace( rtrim, "" );
    },

    // 定时循环
    loop:function(time,callback){
        // 先执行一次
        callback && callback()

        var __loop = function(timeer){
            clearTimeout(timeer)
            
            timeer = setTimeout(function(){
                callback && callback()
                __loop(timeer)
            },time * 1000)
        }

        __loop(null)

    },

    // 将对象拆分为键值对
    toHash:function(obj, target){
        target || (target = obj)

        var keys = [] , vals = [] , newObj = {}, v;

        for (var key in target) {
            if (hasOwnProperty.call(target, key) && obj[key] !== undefined) {
                v = newObj[key] = obj[key];
                keys.push(key);

                if (target[key] === 'JSON'){
                    v = JSON.stringify(v)
                }
                vals.push(v);
            }
        }
        
        return {keys: keys, values: vals, obj: newObj};
    },
    
    // 去重
    unique:function(arr) {
        var ret = []
        var hash = {}

        for (var i = 0; i < arr.length; i++) {
            var item = JSON.stringify(arr[i])
            var key = typeof(arr[i]) + item

            if (hash[key] !== 1) {
                ret.push(JSON.parse(item))
                hash[key] = 1
            }
        }

        return ret
    },
	
	//md5加密
	md5:function(s){
		
		 
		var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
		var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */
		
		function core_md5(x, len)
		{
		  /* append padding */
		  x[len >> 5] |= 0x80 << ((len) % 32);
		  x[(((len + 64) >>> 9) << 4) + 14] = len;
		
		  var a =  1732584193;
		  var b = -271733879;
		  var c = -1732584194;
		  var d =  271733878;
		
		  for(var i = 0; i < x.length; i += 16)
		  {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
		
			a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
			d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
			b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
			d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
			c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
			d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
			d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
		
			a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
			d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
			c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
			b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
			d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
			c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
			d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
			c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
			a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
			d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
			c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
			b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
		
			a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
			d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
			b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
			d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
			c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
			d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
			a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
			d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
			b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
		
			a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
			d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
			c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
			d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
			d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
			a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
			d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
			b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
		
			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		  }
		  return Array(a, b, c, d);
		
		}
		
		/*
		 * These functions implement the four basic operations the algorithm uses.
		 */
		function md5_cmn(q, a, b, x, s, t)
		{
		  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
		}
		function md5_ff(a, b, c, d, x, s, t)
		{
		  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		function md5_gg(a, b, c, d, x, s, t)
		{
		  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		function md5_hh(a, b, c, d, x, s, t)
		{
		  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
		}
		function md5_ii(a, b, c, d, x, s, t)
		{
		  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
		}
		
		
		
		/*
		 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
		 * to work around bugs in some JS interpreters.
		 */
		function safe_add(x, y)
		{
		  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		  return (msw << 16) | (lsw & 0xFFFF);
		}
		
		/*
		 * Bitwise rotate a 32-bit number to the left.
		 */
		function bit_rol(num, cnt)
		{
		  return (num << cnt) | (num >>> (32 - cnt));
		}
		
		/*
		 * Convert a string to an array of little-endian words
		 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
		 */
		function str2binl(str)
		{
		  var bin = Array();
		  var mask = (1 << chrsz) - 1;
		  for(var i = 0; i < str.length * chrsz; i += chrsz)
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
		  return bin;
		}
		 
		
		/*
		 * Convert an array of little-endian words to a hex string.
		 */
		function binl2hex(binarray)
		{
		  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		  var str = "";
		  for(var i = 0; i < binarray.length * 4; i++)
		  {
			str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
				   hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
		  }
		  
		  return str;
		}
		

		return binl2hex(core_md5(str2binl(s), s.length * chrsz));    //返回MD5加密的结果

	}
})

// 遍历并记录对象类型
DBoy.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i,name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
})

/**
 * 判断类数组
 */
function isArrayLike(obj){
    if (obj && typeof obj === "object") {
        var n = obj.length
          , str = Object.prototype.toString.call(obj)

        if (/(Array|List|Collection|Map|Arguments)\]$/.test(str)) {
            return true
        }
        else if (str === "[object Object]" && (+n === n && !(n % 1) && n >= 0)) {
            return true //由于ecma262v5能修改对象属性的enumerable，因此不能用propertyIsEnumerable来判定了
        }
    }
    return false
}

module.exports = DBoy;
});
require.register("smzdm_pro/source/src/core/node.js", function(exports, require, module){
/**
 * dom 监听
 * by kerring
 */

var $ = require('../../lib/jquery')
  , ex = require('./notice')
  , config = require('../../config/config')

var Node = function(el){
    return document.querySelectorAll(el)
}

/**
 * 填充模板
 */
Node.fill = function(el,url,callback){
	
	
    // 判断该页面是否符合嵌入标准
    if(Node.inEmbed()){
        // todo:el可能为多个
        // todo:支持对象直接传入元素
        var target = $(el)// 获取目标元素

        // todo:未知错误，传输过程中jquery对象丢失变成string
        if(typeof target[0] === 'string'){
            target = $(target[0])
        }

        if(target.length > 0){
            // 获取模板元素
            $.ajax({
                url: ex.url(url),
                type: "GET",
                dataType: "html",
            }).done(function(temp) {

                // 在目标元素之后添加模板
                target.after(temp)
                callback && callback();
            })
        }
    }
}

/**
 * 判断是否符合填充规范
 */
Node.inEmbed = function(){
    var flag = false
      , json = config.embedJson
      , href = window.location.href

    for(var k in json){
        if(href.indexOf(k) > -1){
            flag = true
        }
    }
    return flag
}

/**
 * 监听数据变化并触发
 * 一组元素可能有并联关系，任何数据触发变化时
 * 重新获取改组所有数据
 */
Node.ListenerDataChange = function(el, obj, callback){
    for(var key in obj){
        var $element = $(obj[key].el)
          , func = function(d){
                var result = Node.parseModel(obj)
                callback && callback(result)
            }

        // 监听元素改变
        $element.on('change',func)

        // el为空时默认body监听
        $(el || document.body).on({
            'DOMCharacterDataModified':func,
            'DOMSubtreeModified':func
        })
    }
    // 首次加载
    callback && callback(obj)
}

/**
 * 监听页面变化
 */
Node.onChange = function(el, callback){
    var timer
      , func = function(){
            clearTimeout(timer)
            timer = setTimeout(function(){
                callback && callback()
            },1)
        }
    // el为空时默认body监听
    $(el || document.body).on({
        'DOMCharacterDataModified':func,
        'DOMSubtreeModified':func
    })
    $('body').on('change', el, func)
    // 首次加载
    // func()
}

/**
 * 解析对象
 * 多个元素时获取能搜到的元素并封装回对象
 */
Node.parseModel = function(obj){

    // 遍历对象
    for(var key in obj){
        var element = obj[key].el && obj[key].el.selector || obj[key]

        // 如果存在多个元素
        if(Array.isArray(element)){
            
            // 遍历元素
            for(var i = 0, len = element.length; i < len; i++){
                // 如果取到元素
                if($(element[i]).length > 0){
                    element = element[i]
                    break
                }
            }
        }
        // 获取元素的text值
        // todo:添加get、set
        obj[key] = {
            el:$(element),
            val:$(element).text()
        }
    }
    return obj
}

/**
 * 模型工厂
 */
Node.modelFactory = function(data){
    // for(var k in data){
    //     data[k] = data[k].val
    // }
    // todo:封装set/get
    return data
}


/**
 * 抓取页面数据
 */
Node.spider = function(obj,callback){
    var el  = ''

    if(typeof arguments[0] === 'string'){
        el = arguments[0]
        obj = arguments[1]
        callback = arguments[2]
    }
    
    var model = Node.parseModel(obj)

    // 监听数据变化
    Node.ListenerDataChange(el, model, function(data){
        callback && callback(Node.modelFactory(data))
    })
}


module.exports = Node;
});
require.register("smzdm_pro/source/src/core/pull.js", function(exports, require, module){
/**
 * 轮询请求
 * @author s
 * @date   2014/06/01
 * @time   24:00
 */
var pull = function(url, args, callback, config){
	var loopTime   = config.time  || 5000// 循环请求间隔
	  , firstTime  = config.first || 0   // 初次访问时间

	// 如果没有请求参数
	if(isFunc(arguments[1])){
		callback = args
		config   = arguments[2]
	}

	// 循环请求，只有当请求完结后才会进行下一次计时
	function loop(){
		avalon.get(url, args, function(data){
			callback(data)
			setTimeout(function(){
				loop()
			},loopTime)
		})
		// todo:请求出错时挂起
	}

	// 初次请求计时
	setTimeout(function(){
		loop()
	},firstTime);
}

module.exports = pull
});
require.register("smzdm_pro/source/src/core/DBoy.js", function(exports, require, module){
/**
 * 数据处理主函数
 */


var DBoy = require('./main') // 数据核心
require('./ajax')            // 扩展ajax
require('./storage')         // 扩展本地存储
require('./database')        // 扩展数据库

DBoy.extend({
    unit  : require('./unit')          // 工具函数模块
})

module.exports = DBoy;
});
require.register("smzdm_pro/source/src/core/emitter.js", function(exports, require, module){
/**
 * 观察者
 * @author s
 * @date   2014/06/19
 * @time   10:00
 */
var slice = [].slice


function Emitter (ctx) {
    this._ctx = ctx || this
}

var EmitterProto = Emitter.prototype

EmitterProto.on = function (event, fn) {
    this._cbs = this._cbs || {}
    ;(this._cbs[event] = this._cbs[event] || [])
        .push(fn)
    return this
}

EmitterProto.once = function (event, fn) {
    var self = this
    this._cbs = this._cbs || {}

    function on () {
        self.off(event, on)
        fn.apply(this, arguments)
    }

    on.fn = fn
    this.on(event, on)
    return this
}

EmitterProto.off = function (event, fn) {
    this._cbs = this._cbs || {}

    // all
    if (!arguments.length) {
        this._cbs = {}
        return this
    }

    // specific event
    var callbacks = this._cbs[event]
    if (!callbacks) return this

    // remove all handlers
    if (arguments.length === 1) {
        delete this._cbs[event]
        return this
    }

    // remove specific handler
    var cb
    for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i]
        if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1)
            break
        }
    }
    return this
}

/**
 *  The internal, faster emit with fixed amount of arguments
 *  using Function.call
 */
EmitterProto.emit = function (event, a, b, c) {
	
	
    this._cbs = this._cbs || {}
    var callbacks = this._cbs[event]
	

    if (callbacks) {
        callbacks = callbacks.slice(0)
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(this._ctx, a, b, c)
        }
    }

	return this
}

/**
 *  The external emit using Function.apply
 */
EmitterProto.applyEmit = function (event) { 
    this._cbs = this._cbs || {}
    var callbacks = this._cbs[event], args

    if (callbacks) {
        callbacks = callbacks.slice(0)
        args = slice.call(arguments, 1)
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].apply(this._ctx, args)
        }
    }

    return this
}

module.exports = Emitter
});
require.register("smzdm_pro/source/src/core/route.js", function(exports, require, module){
/*********************************
 * @short 路由功能
 * @desc 解析请求地址导向真实地址
 *********************************/
var DBoy = require('./DBoy')

var Route = function(url){
    var a = document.createElement("a");
    a.href = url;

    // 原始地址 http://www.baidu.com/s?ie=utf-8&bs=protocol&f=8&rsv_bp=1&wd=hostname&rsv_sug3=2&rsv_sug4=168&rsv_sug1=3&rsv_n=2&inputT=1366
    this.source = url
    // 协议地址 http
    this.protocol = a.protocol.replace(":", "")
    // 主机地址 www.baidu.com
    this.host = a.hostname
	
	
    // 域名地址
    this.domain = a.hostname.split('.')[a.hostname.split('.').length - 2]
    // 接口地址 8080
    this.port = a.port
    // 参数 ?ie=utf-8&bs=protocol&f=8&rsv_bp=1&wd=hostname&rsv_sug3=2&rsv_sug4=168&rsv_sug1=3&rsv_n=2&inputT=1366
    this.query = a.search
    // 参数对象 Object {ie: "utf-8", bs: "protocol", f: "8", rsv_bp: "1", wd: "hostname"…}
    this.params = (function() {
        var ret = {}
          , seg = a.search.replace(/^\?/, "").split("&")
          , s;
        
        for (var i = 0, l = seg.length; i < l; i++) {
            if (!seg[i]) {
                continue;
            }
            s = seg[i].split("=");
            ret[s[0]] = s[1];
        }
        return ret;
    })()
    // 文件地址 s
    this.file = (a.pathname.match(/\/([^\/?#]+)$/i) || [ , "" ])[1]
    // 哈希地址
    this.hash = a.hash.replace("#", "")
    // 文件路径 /s
    this.path = a.pathname.replace(/^([^\/])/, "/$1")
    // 相对路径 /s?ie=utf-8&bs=protocol&f=8&rsv_bp=1&wd=hostname&rsv_sug3=2&rsv_sug4=168&rsv_sug1=3&rsv_n=2&inputT=1366
    this.relative = (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [ , "" ])[1]
    // 段落 ["s"]
    this.segments = a.pathname.replace(/^\//, "").split("/")
    // 是否配置参数
    this.isConf = (function(){
        try{
            //require('../../config/mall/' + a.hostname.split('.')[a.hostname.split('.').length - 2])
            return true
        }catch(e){
            if(e) return false
        }
    })() 
	
	
}

var RouteProto = Route.prototype



module.exports = Route;
});
require.register("smzdm_pro/source/src/core/unit.js", function(exports, require, module){
/**
 * 通用工具
 * by kerring
 */


var Unit = {}

Unit.url = function(url){
    return chrome.extension.getURL(url)
}
/**
 * 创建页面
 * href:
   1、'' 字符串url
   2、object    对象
        {
            url:'', 字符串url
            update: 需要更新的tabid
        }
   callback:
   1、callback
   2、boolean, callback
 */
Unit.goto = function(href, callback){

	
    var me = this
    // 兼容遨游
    if (require('./ext')['open']) {
        require('./ext').goto(href, callback)
        return false
    }
    var arg = arguments
      , open_back = localStorage.getItem('open_back') || 'on'
      , opt = {
        url: href,
        selected: open_back == 'off'
    }
    // 激活
    if( typeof arg[1] === 'boolean' ){
        if(open_back == 'on') opt['selected'] = false
        
        if(arg[1] == true) opt['selected'] = true
        else opt['selected'] = false
        
        callback = arg[2] || function(){}
    }
    // 更新
	
	
	
	
    if( typeof arg[0] === 'object' ){
        opt['url'] = arg[0]['url']
        
			
		
        if( parseInt(arg[0]['update']) > 0 ){
            var tabid = parseInt(arg[0]['update'])
            
            chrome.tabs.query({
                status: 'complete'
            }, function(tabs){
                for (var a = null, t = 0; t < tabs.length; t++) {
                    if (tabs[t].id == tabid) {
                        a = tabs[t].id;
                        break
                    }
                }
                if(a){
                    chrome.tabs.update(a, {
                        url: arg[0]['url'],
                        active: !0
                    }, callback)
                }
                else{
                    chrome.tabs.create(opt, callback)
                }
                return
            })
        }
        else{
            chrome.tabs.create(opt, callback)
        }
    }
    else{
        chrome.tabs.create(opt, callback)
    }
}

// 浏览器判断
Unit.browType = function(){
    var Sys = {}
    var ua = navigator.userAgent.toLowerCase()
    var s
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] :
    (s = ua.match(/opr\/([\d.]+)/)) ? Sys.opera = s[1] :
    (s = ua.match(/se ([\d.]+)/)) ? Sys.se = s[1] :
    (s = ua.match(/maxthon\/([\d.]+)/)) ? Sys.maxthon = s[1] :
    (s = ua.match(/bidubrowser\/([\d.]+)/)) ? Sys.baidu = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : 0
    return Sys
}

// 获取浏览器版本号
Unit.getBrowserVersion = function(){
    return ((window.navigator.userAgent).split('/'))[3].split('.')[2];
}
 
Unit.timeFormat = function(time, fmt){
    var o = {
        "M+" : time.getMonth()+1,
        "d+" : time.getDate(),
        "h+" : time.getHours(),
        "m+" : time.getMinutes(),
        "s+" : time.getSeconds(),
        "q+" : Math.floor((time.getMonth()+3)/3),
        "S"  : time.getMilliseconds()
    }

    if(/(y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, (time.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt))   
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)))
    }

    return fmt;
}

Unit.timestamp = function(time, tzone) {
    if(time) {
        var t = time.match(/((\d{4})\D(\d\d)\D(\d\d))(\s(\d\d)\D(\d\d)\D(\d\d))?/) || [];
        if(t[8]) time = new Date(t[2], t[3]-1, t[4], t[6], t[7], t[8]);
        else if(t[4]) time = new Date(t[2], t[3]-1, t[4]);
        else return 0;
    }

    return Math.round((time||new Date()).getTime()/1000)+(tzone||8)*3600;
}

Unit.getTime = function(beginTime) {
    var endTime = new Date().getTime()
      , secondNum = parseInt((endTime-beginTime)/1000)
      , nTime

    if(secondNum>=0 && secondNum<120){
        return '刚刚';
    }
    else if (secondNum>=120 && secondNum<3600){
        return parseInt(secondNum/60) + '分钟前';
    }
    else if (secondNum>=3600 && secondNum<3600*15){
        return parseInt(secondNum/3600) + '小时前';
    }
    else{
        var tm       = new Date(beginTime)
          , ny       = ''
          , month    = tm.getMonth() > 9 ? tm.getMonth()+1 : '0'+(tm.getMonth()+1)
          , date     = tm.getDate() > 9 ? tm.getDate() : '0'+tm.getDate()
          , hour     = tm.getHours() > 9 ? tm.getHours() : '0'+tm.getHours()
          , minutes  = tm.getMinutes() > 9 ? tm.getMinutes() : '0'+tm.getMinutes()
          , seconds  = tm.getSeconds() > 9 ? tm.getSeconds() : '0'+tm.getSeconds();

        if(tm.getFullYear() < new Date().getFullYear()){
            ny = tm.getFullYear() + ' ';
        }

        return ny + month + '-' + date + ' ' + hour + ':' + minutes;
    }
}

Unit.time_range = function (beginTime, endTime, nowTime) {
    var strb  = beginTime.split(":")
      , stre  = endTime.split(":")
      , strn  = nowTime.split(":")

    if (strb.length != 2 || stre.length != 2 || stre.length != 2){return false;}
    
    var b = new Date()
      , e = new Date()
      , n = new Date()

    b.setHours(strb[0]); b.setMinutes(strb[1]);
    e.setHours(stre[0]); e.setMinutes(stre[1]);
    n.setHours(strn[0]); n.setMinutes(strn[1]);

    if (b.getTime() < e.getTime() && (n.getTime() > b.getTime() && n.getTime() < e.getTime())) {
        return true;
    }
    else if (b.getTime() > e.getTime() && (n.getTime() > b.getTime() || n.getTime() < e.getTime())) {
        return true;
    }
    else{
        return false;//不在区间内
    }
}


Unit.parseURI = function(url) {
    url = url || location.href;
    var param = {}, pos = url.indexOf('?');
    if(pos != -1) {
        url = url.substr(pos+1).split('&');
        for(var i = 0; i < url.length; i++) {
            pos = url[i].split('=');
            param[pos[0]] = unescape(pos[1]);
        }
    }
    return param;
}

Unit.array_intersect = function(a, b){
    var ai = 0,
        bi = 0;

    var result = new Array();
    while (ai < a.length && bi < b.length) {
        if (parseInt(a[ai]) < parseInt(b[bi])) {
            ai++;
        } else if (parseInt(a[ai]) > parseInt(b[bi])) {
            bi++;
        } else {
            result.push(parseInt(a[ai]));
            ai++;
            bi++;
        }
    }
    return result;
}


Unit.enCode = function(txt){
    var monyer = new Array();var i,s;
    for(i=0;i<txt.length;i++) monyer+="\\"+txt.charCodeAt(i).toString(8); 
    return monyer;
}

Unit.deCode = function(txt){
    var monyer = new Array();var i;
    var s=txt.split("\\");
    for(i=1;i<s.length;i++) monyer+=String.fromCharCode(parseInt(s[i],8));
    return monyer;
}

Unit.removeHTML = function(str){
    str = str.replace(/<\/?[^>]+>/g,'');
    str = str.replace(/[ | ]*\n/g,'');
    str = str.replace(/\n[\s| | ]*\r/g,'');
    str = str.replace(/ /ig,'');
    str = str.replace(/&nbsp;/ig,'');
    str = str.replace(/&amp;/ig,'');
    return str;
}

Unit.loadFile = function(url, type, onload){
    var domscript = type == 'js' ? document.createElement('script') : document.createElement('link');
    if(type == 'js'){
        domscript.src = url;
        domscript.charset = 'utf-8';
    }else if(type == 'css'){
        domscript.href = url;
        domscript.rel = 'stylesheet';
        domscript.type = 'text/css';
    }
    if(onload){
        domscript.onloadDone = false;
        domscript.onload = onload;
        domscript.onreadystatechange = function () {
            if ("loaded" === domscript.readyState && domscript.onloadDone) {
                domscript.onloadDone = true;
                domscript.onload();
                domscript.removeNode(true);
            }
        };
    }
    try{
        document.getElementsByTagName('head')[0].appendChild(domscript);
    }
    catch(e){
        
    }
    
}

/**
 * 空函数
 * 用于初始化
 */
Unit.noop = function(){}

/**
 * 构建hash对象
 * 无原型链对象
 */
Unit.createHash = function () {
    return Object.create(null);
}

/**
 * 判断空对象
 */
Unit.isEmptyObject = function( obj ) { 
    for(var name in obj) { 
        return false; 
    }
    return true; 
}

/**
 * 获取uuid
 */
Unit.uuid = function(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 首字母大写，其余字母小写
 */
Unit.toFirstLowerCase = function(str){
    var reg = /\b(\w)|\s(\w)/g
    str = str.toLowerCase()
    return str.replace(reg,function(m){return m.toUpperCase()})
}

// 转化为插件内部链接地址
Unit.toUrl = function(url){
    return chrome.extension.getURL(url)
}



/**
 * 解析通配符
 */
Unit.wildcard = function(pattern){
    var result = "";// 返回结果，增加起始标记

    // 拼接字符串
    for(var i = 0, l = pattern.length; i < l; i++){
        
        var ch = pattern.charAt(i)
        // 遇到特殊符号增加转义符
        if(metaSearch(ch)){
            result += "\\" + ch;
            continue;
        }
        // 遇到通配符解析为正则
        else{
            switch (ch) {
                case '*':
                    result += ".*";
                    break;
                case '?':
                    result += ".{0,1}";
                    break;
                default:
                    result += ch;
            }
        }
    }

    // 输出正则
    return result;
}




/**
 * 判断特殊符号
 */
function metaSearch(ch){
    var charActers = ['$', '^', '[', ']', '(', ')', '{', '}', '', '+', '.', '\\','\/'];

    for(var metaCh in charActers){
        if(ch == charActers[metaCh] ){
            return true;
        }
    }
    return false;
}

module.exports = Unit

});
require.register("smzdm_pro/source/src/core/callbacks.js", function(exports, require, module){
/**
 * 回调队列
 * @author s
 * @date   2014/06/30
 * @time   13:40
 */

var DBoy = require('./main')

// Create a collection of callbacks to be fired in a sequence, with configurable behaviour
// Option flags:
//   - once: Callbacks fired at most one time.
//   - memory: Remember the most recent context and arguments
//   - stopOnFalse: Cease iterating over callback list
//   - unique: Permit adding at most one instance of the same callback
var Callbacks = function(options) {
    options = options || {}

    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
        fire = function(data) {
            memory = options.memory && data
            fired = true
            firingIndex = firingStart || 0
            firingStart = 0
            firingLength = list.length
            firing = true
            for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
                if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                    memory = false
                    break
                }
            }
            firing = false
            if (list) {
                if (stack) stack.length && fire(stack.shift())
                else if (memory) list.length = 0
                else Callbacks.disable()
            }
        },

        Callbacks = {
            add: function() {
                if (list) {
                    var start = list.length,
                        add = function(args) {
                            DBoy.each(args, function(_, arg){
                                if (typeof arg === "function") {
                                    if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                                }
                                else if (arg && arg.length && typeof arg !== 'string') add(arg)
                            })
                        }
                    add(arguments)
                    if (firing) firingLength = list.length
                    else if (memory) {
                        firingStart = start
                        fire(memory)
                    }
                }
                return this
            },
            remove: function() {
                if (list) {
                    DBoy.each(arguments, function(_, arg){
                        var index
                        while ((index = DBoy.inArray(arg, list, index)) > -1) {
                            list.splice(index, 1)
                            // Handle firing indexes
                            if (firing) {
                                if (index <= firingLength) --firingLength
                                if (index <= firingIndex) --firingIndex
                            }
                        }
                    })
                }
                return this
            },
            has: function(fn) {
                return !!(list && (fn ? DBoy.inArray(fn, list) > -1 : list.length))
            },
            empty: function() {
                firingLength = list.length = 0
                return this
            },
            disable: function() {
                list = stack = memory = undefined
                return this
            },
            disabled: function() {
                return !list
            },
            lock: function() {
                stack = undefined;
                if (!memory) Callbacks.disable()
                return this
            },
            locked: function() {
                return !stack
            },
            fireWith: function(context, args) {
                if (list && (!fired || stack)) {
                    args = args || []
                    args = [context, args.slice ? args.slice() : args]
                    if (firing) stack.push(args)
                    else fire(args)
                }
                return this
            },
            fire: function() {
                return Callbacks.fireWith(this, arguments)
            },
            fired: function() {
                return !!fired
            }
        }

    return Callbacks
}

module.exports = Callbacks
});
require.register("smzdm_pro/source/src/core/deferred.js", function(exports, require, module){
/**
 * 异步任务
 * @author s
 * @date   2014/06/30
 * @time   13:10
 */

var DBoy  = require('./main')
var Callbacks = require('./callbacks')

var slice = Array.prototype.slice

function Deferred(func) {
    var tuples = [
        // action, add listener, listener list, final state
        [ "resolve", "done", Callbacks({once:1, memory:1}), "resolved" ],
        [ "reject", "fail", Callbacks({once:1, memory:1}), "rejected" ],
        [ "notify", "progress", Callbacks({memory:1}) ]
    ],
    state = "pending",
    promise = {
        state: function() {
            return state
        },
        always: function() {
            deferred.done(arguments).fail(arguments)
            return this
        },
        then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
            return Deferred(function(defer){
                DBoy.each(tuples, function(i, tuple){
                    var fn = DBoy.isFunction(fns[i]) && fns[i]
                    deferred[tuple[1]](function(){
                        var returned = fn && fn.apply(this, arguments)
                        if (returned && DBoy.isFunction(returned.promise)) {
                            returned.promise()
                                .done(defer.resolve)
                                .fail(defer.reject)
                                .progress(defer.notify)
                        } else {
                            var context = this === promise ? defer.promise() : this,
                                    values = fn ? [returned] : arguments
                            defer[tuple[0] + "With"](context, values)
                        }
                    })
                })
                fns = null
            }).promise()
        },

        promise: function(obj) {
            return obj != null ? DBoy.extend( obj, promise ) : promise
        }
    },
    deferred = {}

    DBoy.each(tuples, function(i, tuple){
        var list = tuple[2],
            stateString = tuple[3]

        promise[tuple[1]] = list.add

        if (stateString) {
            list.add(function(){
                state = stateString
            }, tuples[i^1][2].disable, tuples[2][2].lock)
        }

        deferred[tuple[0]] = function(){
            deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
            return this
        }
        deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
}

DBoy.when = function(sub) {
    var resolveValues = slice.call(arguments),
    len = resolveValues.length,
    i = 0,
    remain = len !== 1 || (sub && DBoy.isFunction(sub.promise)) ? len : 0,
    deferred = remain === 1 ? sub : Deferred(),
    progressValues, progressContexts, resolveContexts,
    updateFn = function(i, ctx, val){
        return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
                deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
                deferred.resolveWith(ctx, val)
            }
        }
    }

    if (len > 1) {
        progressValues = new Array(len)
        progressContexts = new Array(len)
        resolveContexts = new Array(len)
        for ( ; i < len; ++i ) {
            if (resolveValues[i] && DBoy.isFunction(resolveValues[i].promise)) {
                resolveValues[i].promise()
                    .done(updateFn(i, resolveContexts, resolveValues))
                    .fail(deferred.reject)
                    .progress(updateFn(i, progressContexts, progressValues))
            } else {
                --remain
            }
        }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
}

module.exports = Deferred
});
require.register("smzdm_pro/source/src/core/cookie.js", function(exports, require, module){
/**
 * cookie
 */

var cookie = {}

cookie.on = function(evt,callback){
    chrome.cookies[evt].addListener(callback)
}

cookie.get = function(arg,callback){
    chrome.cookies.getAll(arg,function(d){
        callback && callback(d && d.length > 0 ? d[0].value : null)
    })
}

module.exports = cookie
});
require.register("smzdm_pro/source/src/core/notice.js", function(exports, require, module){
/**
 * 通知
 * by kerring
 */

var DBoy = require("./DBoy")

var noticeArray = []; // 消息集合

module.exports = {
    demo: {
        msg_id: 0,
        url:"/html/notification.html",
        type: "basic",
        title:'品牌消费第一站',
        message:'“什么值得买”是一个中立的，致力于帮助广大网友买到更有性价比网购产品的推荐类博客。“什么值得买”的目的是在帮助网友控制网 购的风险的同时，尽可能的向大家介绍高性价比的网购产品，让大家买着不心疼，花钱等于省钱。同时希望大家在满足自身需求的基础上理性消费，享受特价的同时尽量少的占用其他人机会和资源。',
       // link1:'http://www.smzdm.com?utm_source=chrome&utm_medium=Push&utm_campaign=articlespopup&utm_Content= ',
	    link1:'http://www.smzdm.com',
        link2:'msg_id'
    },
    on: function(callback){
        if (require('./ext')['open']) return false
        var me = this
          , cli = function(tag, index){
            var notice = me.findNotice(tag)
            //if(tag.indexOf('demo') === -1){
                callback(notice, index)
            //} 
        }
        me.onNotifyClick(cli)
        me.onNotifyButtonClick(cli)  
    },
    /**
     * 桌面消息提示
     * 目前两种接口入参不同，需要修改
     */
    notice:function(obj){

		// console.log('弹窗提醒：notice_cache===',localStorage.getItem("notice_cache"));
		//console.log("require('./ext')['open']",require('./ext')['open']);
        if (require('./ext')['open']) return require('./ext').notice(obj)  
		
        var self = this 
          , obj = obj || {}
          , notiId = (new Date()).getTime()// 消息累加id 
          , option = {
                type     : obj.type    || "list",
                title    : obj.title   || '',   
                message  : obj.message.substr(0,60) || '',
                iconUrl  : obj.iconUrl || '/assets/img/logo128.png',
                items    : obj.items   || [],
                buttons  : []
            }
          
          , time = new Date().getHours() + ':' + new Date().getMinutes()       
          , time1 = DBoy.local('item_time1') || 0
          , time2 = DBoy.local('item_time2') || 0
          , ontime = (DBoy.local('noti_time') == 'on' && DBoy.unit.time_range(time1, time2, time)) ? true : false; 
		  
        
        option.buttons[0] = { title: '查看详情 >', iconUrl: "/assets/img/arrow.png" }
		
        // 增加登录后收藏铵钮 by 14.12.29
		// 暂时取消弹框加入收藏功能
       	/*
			if(DBoy.clocal('ctoken') && (obj.msg_id != 0)){
				option.buttons[1] = { title: '加入收藏 >', iconUrl: "/assets/img/favorite.png" }
			}
		*/
		
        // 适配opera不支持铵钮
        if( DBoy.unit.browType()['opera'] ){
            delete option['buttons']
        }
        // 适配搜狗不支持list类型通知
        else if( DBoy.unit.browType()['se'] ){
            option['type'] = 'basic'
        }
		
		
        // console.log("time",DBoy.unit.time_range(time1, time2, time));
        if (ontime == false && DBoy.local('noti_desktop') == 'on'){
			
			
            // 旧版chrome
            if(DBoy.unit.getBrowserVersion() < 1460){
				
				
                // todo:封装为对象
                // 创建消息
                noticeArray[notiId] = webkitNotifications.createHTMLNotification(obj.url);
                // 当消息显示时
                noticeArray[notiId].ondisplay = function(event){
                  var self = this
                    
                    // 经过设定时间后，销毁
                    setTimeout(function(){
                        self.cancel();
                    }, 30000);
                }
                // 显示消息
                noticeArray[notiId].show();
            }
            // chrome 22+
            if(chrome.notifications){
				
				
				
                if(obj.msg_id === 0){
                    notiId += "demo"
                }
				

				// 创建消息
				chrome.notifications.create('smzdm_notice_' + notiId, option, function(id){
					if(chrome.runtime.lastError){
						console.log(chrome.runtime.lastError)
					}
					var data = {
						tag: id,
						link1: obj.link1,
						link2: obj.link2,
						msg_id: obj.msg_id,
						priority: 2, // 优先级，超过0可堆叠
						isClickable: false,
						variety: obj.variety
					}
					setTimeout(function(){
						chrome.notifications.clear(id,function(d){
							console.log('clear ', id)
						})
					},8000)
					self.save(data)
				})
			
				
            }
            // chrome 22-
            else{
				
				
                if(obj.msg_id === 0){
                    notiId += "demo"
                }
                noiceArray[notiId] = window.webkitNotifications.createNotification((obj.iconUrl || '/assets/img/logo_64.png'), obj.title.substr(0,40), obj.message.substr(0,40) + '...')
                noticeArray[notiId].onclick = function(){
                    DBoy.unit.goto(obj.link1)
                }
                noticeArray[notiId].show()
                noticeArray[notiId].ondisplay = function(){
                    var self = this;
                    setTimeout(function(){
                        self.cancel();
                    }, 8000)
                }
            }

            if (DBoy.local('noti_sound') == 'on'){
                new Audio("/assets/notify.mp3").play();
            }
        }
    },

    // 设置图标显示文字
    setBadge:function(text){
        if (require('./ext')['open']) return require('./ext').setBadge(text)
        chrome.browserAction.setBadgeText({text: text})
    },

    // 监听弹窗点击
    onNotifyClick:function(callback){
        chrome.notifications && chrome.notifications.onClicked.addListener(callback)
    },

    // 监听弹窗按钮点击
    onNotifyButtonClick:function(callback){
        chrome.notifications && chrome.notifications.onButtonClicked.addListener(callback)
    },

    // 22+版内核需要缓存通知进行点击监听
    save: function(data){
		
        // 获取消息数组
        var noticeArray = JSON.parse(DBoy.local('notice_array')) || []
	   
        // 存放新消息
        noticeArray.push(data)
        // 更新消息数组
        DBoy.local('notice_array',JSON.stringify(noticeArray))
		
    },

    // 缓存通知提取
    findNotice: function(tag){
        var noticeArray = JSON.parse(DBoy.local('notice_array'))
        for(var key in noticeArray){
            if(noticeArray[key].tag === tag){
                return noticeArray[key]
            }
        }
    },

    // 清空通知(只能在新通知弹出前清空老数据，需要增加PC休眠唤醒时清空已存的通知)
    clearNotify: function(){
        // 兼容遨游
        if(DBoy.unit.browType()['maxthon']) return false
        if(chrome.notifications.getAll){
            chrome.notifications.getAll(function(array){
                for(var tag in array){
                    chrome.notifications.clear(tag,function(tag){
                        console.log('clear tag',tag)
                    })
                }
            })
        }
    }
}

});
require.register("smzdm_pro/source/src/core/database.js", function(exports, require, module){
/**
 * websql数据库
 * @author z,s
 * @date   2014/07/14
 * @time   17:00
 */

var DBoy = require('./main')

var DB;// 数据库对象

var _support = !!(window.openDatabase);

/**
 * 连接数据库
 */
var _connect = function(shortName,version,displayName,maxSize){
    if(!_support){ return; }
    
    try{
        DB = DB || openDatabase(shortName,version,displayName,maxSize);
    }
    catch(e){
        console.log(e);
    }
}

/**
 * 创建数据表对象
 */
var _defineModel = function(tableName, fields, options){
    return new Model(tableName, fields, options)
}

/**
 * 执行sql命令
 */
var executeSql = function(tx, sql, params, success, error) {

    if (DBoy.isObject(tx) && ('executeSql' in tx)) {
        tx.executeSql(sql, params, function(tx, result) {
            success && success(tx, result);
        }, function(tx, e) {
            error && error(tx, e);
        })
    }
    else {
        DB.transaction(function(tx) {
            executeSql(tx, sql, params, success, error);
        })
    }
}

/**
 * 删除表
 */
var _drop = function(tableName, success, error) {
    var sql = "DROP TABLE IF EXISTS `" + tableName + "`";
    
    executeSql(null, sql, [], function(tx, result) {
        success && success(tx, result);
    }, function(tx, e) {
        error && error(tx, e);
    })
};

/**
 * 数据库操作对象
 */
function Model(tableName, fields, options) {
    options || (options = {});
    
    this.tableName = tableName;
    this.fields    = fields;
    
    var columns = []
      , self = this
      , sql = "", name

    for (name in fields) {
        columns.push("`" + name + "` " + fields[name]);
    }

    sql = "CREATE TABLE IF NOT EXISTS `" + tableName + "` (" + columns.join(", ") + ")";
    
    executeSql(null, sql, [], function(tx){
        
        var index = options.index
          , addIndexsql = ''

        if (index && DBoy.isObject(index)) {
            for (var i in index) {
                addIndexsql =  "CREATE INDEX IF NOT EXISTS " + i + " ON `" + self.tableName + "` (" + index[i] + ")"; 
                executeSql(tx, addIndexsql, []);
            }
        }
    })
}



var ModelProto = Model.prototype

/**
 * 检索某属性
 */
ModelProto.getter = function(){
    var fields = this.fields
      , newObj = {};

    for (var name in fields) {
        if(hasOwnProperty.call(fields, name) && obj[name] !== undefined){
            newObj[name] = obj[name]
        }
    }

    return newObj
}

/**
 * 解析结果值
 */
ModelProto._dealResult = function(rows) {
    var result = []
      , fields = this.fields
      , item, obj;

    if (rows.length > 0) {
        for (var i = 0, l = rows.length; i < l; i++) {
            item = rows.item(i);
            obj = {};
            for (var key in item) {
                obj[key] = fields[key] === 'JSON' ? JSON.parse(item[key] || '""') : item[key];
            }
            result.push(obj);
        }
    }
    
    return result;
}

/**
 * 根据条件查询数据
 */
ModelProto.query = function(keys, conditions, success, error, tx){
    var self = this
      , con = []
      , sql = ""

    for (var k in conditions) {
        con.push(k.toUpperCase() + ' ' + conditions[k]);
    }

    if (keys === ''){
        keys = '*'
    }

    sql = "SELECT " + keys + " FROM `" + this.tableName + "` " + con.join(" ");

    executeSql(tx, sql, [], function(tx, result) {
        success && success(tx, self._dealResult(result.rows));
    }, function(tx, e) {
        error && error(tx, e);
    })
}

/**
 * 查询全部内容
 */
ModelProto.queryAll = function(success, error, tx) {
    this.query('*', {}, success, error, tx);
}

/**
 * 插入单条数据
 */
ModelProto.insert = function(obj, success, error, tx) {
    var val = []
      , data = DBoy.toHash(obj, this.fields)
    
    var keys = data.keys.map(function(k) {
            val.push('?');
            return "`" + k +"`"; 
        })
      , sql = "INSERT INTO `" + this.tableName + "` (" + keys.join(", ") + ") VALUES (" + val.join(", ") + ")"
    
    executeSql(tx, sql, data.values, function(tx, result) {
        success && success(tx, result);
    }, function(tx, e) {
        error && error(tx, e);
    })
}

/**
 * 插入多条数据
 */
ModelProto.insertAll = function(ary, success, error, tx, i){
    var self = this;

    if (i === undefined){
        i = 0
    }
    if (i === ary.length) {
        success && success(tx)
        return;
    }
    
    
    this.insert(ary[i], function(tx) {
        self.insertAll(ary, success, error, tx, i + 1);
    }, function(tx, e) {
        error && error(tx, e);
    }, tx);
}

/**
 * 更新数据
 */
ModelProto.update = function(obj, success, error, tx) {
    var data = DBoy.toHash(obj.data, this.fields)
      , sql = "", set = [];

    data.keys.forEach(function(k, i) {
        set.push("`" + k + "` = ?");
    })

    
    sql = "UPDATE `" + this.tableName + "` SET " + set.join(", ") + " WHERE " + obj.where;

    executeSql(tx, sql, data.values, function(tx, result) {
        success && success(tx, result);
    }, function(tx, e) {
        error && error(tx, e);
    })
}

/**
 * 没有创建有就更新
 */
ModelProto.upsert = function(obj, success, error, tx) {
    var self = this
      , sql = "SELECT id FROM `" + this.tableName + "` WHERE id = ?"; 
      
    executeSql(tx, sql, [obj.id], function(tx, result) {
        if (result.rows.length > 0) {
          self.update(obj, success, error, tx);
        }
        else {
          self.insert(obj ,success, error, tx);
        }
    }, function(tx, e) {
        error && error(tx, e);
    });
}

/**
 * 删除表
 */
ModelProto.drop = function(success, error) {
    _drop(this.tableName, success, error);
},
  
/**
 * 删除数据
 */
ModelProto.destroy = function(conditions, success, error, tx) {
    var self = this, con = [];

    if (typeof conditions === 'object') {
        for (var k in conditions) {
            con.push(k.toUpperCase() + ' ' + conditions[k]);
        }
    }
    else {
        con.push('WHERE id=' + conditions);
    }

    var sql = "DELETE FROM `" + this.tableName + "` "+ con.join(' ');
    
    executeSql(tx, sql, [], function(tx, result) {
        success && success(tx, result);
    }, function(tx, e) {
        error && error(tx, e);
    })
}

/**
 * 清空数据库
 */
ModelProto.clear = function(success, error, tx) {
    var sql = "DELETE FROM `" + this.tableName + "` ";
    executeSql(tx, sql, [], function(tx, result) {
        success && success(tx, result)
    }, function(tx, e) {
        error && error(tx, e)
    })
}


DBoy.db = {
    support: _support,
    connect: _connect,
    define: _defineModel,
    drop: _drop,
    query: executeSql
}


module.exports = Model
});
require.register("smzdm_pro/source/src/core/storage.js", function(exports, require, module){
/**
 * 本地存储
 * @author s
 * @date   2014/06/30
 * @time   16:30
 */
var DBoy = require('./main')


DBoy.extend({
    // 永久本地存储
    local: function (key, val) {
        if (require('./ext')['open']) {
            console.log('执行本地存储');
            return require('./ext').local(key, val)
        }
        // 其它浏览器
        if (!(typeof val === 'undefined')) {
            var userinfo_token = localStorage.getItem("save_login_state");
            if (userinfo_token !== 'false') {   //已经是登录状态
                var _key = key !== 'ctoken' && key !== 'messagesNum' && key !== 'smzdm_identity' && key !== 'scrollTop' && key !== 'last_msg_id' && key !== 'last_msg_date' && key !== 's';
                if (_key) {
                    //已经登录过了（点击设置的时候）
                    var options = {};
                    options['f'] = 'chrome';
                    options['token'] = localStorage.getItem('user_name');   //传输用户信息的taken
                    options[key] = val;
                    DBoy.post('http://api.smzdm.com/v1/util/update/is_chrome', options, function (data) {
                    });
                }
            }
            return localStorage.setItem(key, val)
        }
        return localStorage.getItem(key)
    },
    // 通话本地存储
    session: function () {
        if (!(typeof val === 'undefined')) {
            return sessionStorage.setItem(key, val)
        }
        return sessionStorage.getItem(key)
    },
    // 默认保存2分钟
    clocal: function (name, value, args) {


        var me = this
            , newT = {val: false, t: false, e: false} // 值|保存时间|过期时间
            , e = (args && args.day > 0) ? (args.day * 86400000) : 120000
            , t = new Date().getTime()

        if (value != undefined) {
            newT.val = value
            newT.t = t
            newT.e = e
            me.local(name, JSON.stringify(newT))
            return false
        }

        if (!me.local(name)) return false

        var old = JSON.parse(me.local(name))
        if ((t - old.t) >= old.e) {
            me.local(name, JSON.stringify(newT))
        }
        return JSON.parse(me.local(name)).val
    }
})

module.exports = {}

});
require.register("smzdm_pro/source/src/core/ajax.js", function(exports, require, module){
/**
 * ajax
 *
 * @author s
 * @date   2014/06/30
 * @time   11:20
 */
var DBoy = require('./main')
var Deferred = require('./deferred')
var emitter = new (require('./emitter'))
var new_url = window.location.href
// newurl.indexOf("https") > -1

var key,
    name,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/

// trigger a custom event and return false if it was cancelled
function triggerAndReturn(context, eventName, data) {
    emitter.emit(eventName, data)
}

// trigger an Ajax "global" event
function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || window.document, eventName, data)
}

// Number of active Ajax requests
DBoy.active = 0

function ajaxStart(settings) {
    if (settings.global && DBoy.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
}
function ajaxStop(settings) {
    if (settings.global && !(--DBoy.active)) triggerGlobal(settings, null, 'ajaxStop')
}

// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
        return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
}
function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
}
// type: "timeout", "error", "abort", "parsererror"
function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
}
// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
}

// Empty function, used as default callback
function empty() {
}

DBoy.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
        return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
}

function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
            mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
            xmlTypeRE.test(mime) && 'xml' ) || 'text'
}

function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
}

// serialize payload and append it to the URL for GET requests
function serializeData(options) {
    if (options.processData && options.data && DBoy.type(options.data) != "string")
        options.data = DBoy.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
        options.url = appendQuery(options.url, options.data), options.data = undefined
}

DBoy.ajax = function (options) {


    var settings = DBoy.extend({}, options || {})
        , deferred = Deferred && Deferred()
    for (key in DBoy.ajaxSettings) if (settings[key] === undefined) settings[key] = DBoy.ajaxSettings[key]


    ajaxStart(settings)


    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
        RegExp.Ajax2 != window.location.host
    //新增判断支持 xtq
    if (new_url.indexOf("https") > -1) {
        settings.url = settings.url.replace('http://dcc.smzdm.com', 'https://dcc.smzdm.com')
    } else {
        if (!settings.url) settings.url = window.location.toString()
    }

    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())


    var dataType = settings.dataType
        , mime = settings.accepts[dataType]
        , headers = { }
        , setHeader = function (name, value) {
            headers[name.toLowerCase()] = [name, value]
        }
        , protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.Ajax1 : window.location.protocol
        , xhr = settings.xhr()
        , nativeSetHeader = xhr.setRequestHeader
        , abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
        xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
        setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            xhr.onreadystatechange = empty
            clearTimeout(abortTimeout)
            var result, error = false
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                result = xhr.responseText

                try {
                    // http://perfectionkills.com/global-eval-what-are-the-options/
//                    if (dataType == 'script')    (1,eval)(result)
//                    else
                    if (dataType == 'xml')  result = xhr.responseXML
                    else if (dataType == 'json') result = blankRE.test(result) ? null : DBoy.parseJSON(result)
                } catch (e) {
                    error = e
                }

                if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
                else ajaxSuccess(result, xhr, settings, deferred)
            } else {
                ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
            }
        }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort()
        ajaxError(null, 'abort', xhr, settings, deferred)
        return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true


    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
    }, settings.timeout)

    // avoid sending empty string (#319)


    xhr.send(settings.data ? settings.data : null)


    return xhr
}

// handle optional data/success arguments
function parseArguments(url, data, success, dataType) {
    if (DBoy.isFunction(data)) dataType = success, success = data, data = undefined
    if (!DBoy.isFunction(success)) dataType = success, success = undefined
    return {
        url: url, data: data, success: success, dataType: dataType
    }
}

DBoy.get = function (/* url, data, success, dataType */) {
    return DBoy.ajax(parseArguments.apply(null, arguments))
}

DBoy.post = function (/* url, data, success, dataType */) {


    var options = parseArguments.apply(null, arguments)


    options.type = 'POST'


    return DBoy.ajax(options)
}

DBoy.getJSON = function (/* url, data, success */) {
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return DBoy.ajax(options)
}

DBoy.getDOM = function (/* url, data, success */) {
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'html'
    return DBoy.ajax(options)
}

var escape = encodeURIComponent

function serialize(params, obj, traditional, scope) {
    var type, array = DBoy.isArray(obj), hash = DBoy.isPlainObject(obj)
    DBoy.each(obj, function (key, value) {
        type = DBoy.type(value)
        if (scope) key = traditional ? scope :
            scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
        // handle data in serializeArray() format
        if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
        else if (type == "array" || (!traditional && type == "object"))
            serialize(params, value, traditional, key)
        else params.add(key, value)
    })
}

DBoy.param = function (obj, traditional) {
    var params = []
    params.add = function (k, v) {
        this.push(escape(k) + '=' + escape(v))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
}

// 服务器数据转化为js对象
DBoy.parseJSON = function (data) {
    return JSON.parse(data + "");
}

module.exports = DBoy.ajax
});
require.register("smzdm_pro/source/src/core/ext.js", function(exports, require, module){
/**
 * 扩展集合
 */

var exts = {
    'maxthon': new (require('../ext/maxthon'))
}
var curExt = function(){
    for(var i in exts){
        if(exts[i]['open'] === false) {
            continue
        }else{
            return exts[i]
        }
    }
    return false
} 

module.exports = curExt() 

});
require.register("smzdm_pro/source/src/data/filter.js", function(exports, require, module){
/**
 * 过滤器
 * @author s
 * @date   2014/06/01
 * @time   24:00
 */
var Filter = function(){
	// 封装并添加数据(当前时间)
	// 获取相关数据(用户信息)
	// 异步提交到服务器
	// todo:存放到不可见空间，当bg通知时发送到服务器
}

// 添加
Filter.add = function(){
	
}

// 推送到服务器
Filter.push = function(){
	
}

module.exports = Filter
});
require.register("smzdm_pro/source/src/data/b6.js", function(exports, require, module){
module.exports = function() {
	// private property
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
 
	// private method for UTF-8 encoding
	var _utf8_encode = function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
		return utftext;
	}
 
	// private method for UTF-8 decoding
	var _utf8_decode = function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
 
	// public method for encoding
	this.ec = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}
 
	// public method for decoding
	this.dc = function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}
}

});
require.register("smzdm_pro/source/src/data/auto.js", function(exports, require, module){
/**
 * 全局插件,主要为页面数据交互
 * by kerring 14.11.28
 */

var emitter = new (require('../core/emitter'))

// 脚印功能
var footmark = {
	init: function(){
		console.log('src/data/auto:footmark run')
		emitter.on('footmark_curUrl', function(data){
			console.log('src/data/auto:curUrl',data)
		})
	}
}

// 全局控制器
var auto = {
	init: function(options){
		footmark.init()
	}
}

module.exports = auto
});
require.register("smzdm_pro/source/src/data/cart.js", function(exports, require, module){
/**
 * 购物车数据(同步、异步)
 * by kerring 14.12.3
 */

var $ = require('../../lib/jquery')

var cart = {
	init: function(options){
		console.log('src/data/cart:init', options)
	}
}

module.exports = cart
});
require.register("smzdm_pro/source/src/data/favorites.js", function(exports, require, module){
/**
 * 收藏夹
 * by kerring
 */

var DBoy = require('../core/DBoy')
  , Message = require('./message')
  , config = require('../../config/config')

var Favorites = {}
Favorites.resultvalue = function(obj,callback){
	
    DBoy.post(config.url.delfav(),{token:DBoy.clocal('ctoken'), id: obj.id, type: obj.type},function(data){
											
					if(data.error_code > 0){
						return false;
					}
					//var count = parseInt(DBoy.cookie('smzdm-fav')) - 1 || 0;
					//if(count < 0){
					//    count = 0
					//}
					//DBoy.cookie('smzdm-fav', count)
					//data.num = count
					callback(data)
					
   })
};
Favorites.getlist = function(type,callback){
	
	
    DBoy.post(
        config.url.getfav(),
        {token:DBoy.clocal('ctoken'),  f:'chrome',  type:type, 'limit':10, 'offset':0, 'get_total':1},
        function(data) {
			

            if (data.error_code > 0 ){
                return false;
            }
			
            DBoy.each(data.data.rows, function(i,item){
                var param = ""
                item.fade = false
                
				if(item.article_url){ 
					// 拼接连字符
					if(item.article_url.indexOf("?") > -1){
						param = "&" + config.app.census('Push','Shoucang','Articles')
					}else{
						param = "?" + config.app.census('Push','Shoucang','Articles')
					}
					// 拼接特殊参数
					item.article_url += param
				}
            })
            // 
            // data.num = parseInt(data.data.total);
			
			
			
            callback(data)
        }
    )
}

/**
 * 添加商品到收藏
 */
Favorites.add = function(obj,callback){

    DBoy.post(
        config.url.addfav(), 
        {token:DBoy.clocal('ctoken'),id:obj.msg_id, type:obj.type},
        function(data){

            if(data.error_code > 0){
                return callback(data)
            }
			
            // Message.remove(obj.msg_id) // 收藏后删除websql数据 此功能关闭 by kerring 15.1.5
            //刷新列表  Message.upCount()
            // DBoy.cookie('smzdm-fav', parseInt(DBoy.cookie('smzdm-fav')) + 1)

            callback && callback(data)
        }
    );
}


/**
 * 取消收藏弹框
 */
Favorites.cancel_alert = function(obj,callback,test){
	
	//创建弹框
	var alert_box = document.createElement('div');
	alert_box.id = 'alert-box';
	alert_box.innerHTML  = '<span id="close-btn">×</span>';
	alert_box.innerHTML += '<div class="alert-test">' + test + '</div>';
	alert_box.innerHTML += '<div class="btn-group"><span id="_yes">确定</span><span id="_no">取消</span></div>';
	
	//创建遮罩
	var alert_mask= document.createElement('div');
	alert_mask.id = 'alert-mask';
	
	document.body.appendChild(alert_mask);
	document.body.appendChild(alert_box);
	//绑订事件
	
	
	
	document.getElementById('_yes').onclick = function(){
		document.getElementById('alert-mask').remove();
		document.getElementById('alert-box').remove();
		//执行数据传输
		Favorites.resultvalue(obj,callback);
	}
	document.getElementById('_no').onclick = document.getElementById('close-btn').onclick  =  function(){
		document.getElementById('alert-mask').remove();
		document.getElementById('alert-box').remove();
	}
	
}




/**
 * 删除收藏
 */
Favorites.remove = function(obj,callback){
	//取消收藏之前弹窗确认
	Favorites.cancel_alert(obj,callback,'您确定取消收藏吗？');
	
}


Favorites.getNav = function(){
    return [
        {
            id:'youhui',
            title:'优惠',
            url:'http://www.smzdm.com/youhui',
			submenu:false
        },{
            id:'haitao',
            title:'海淘',
            url:'http://haitao.smzdm.com' ,
			submenu:false
        },{
            id:'faxian',
            title:'发现',
            url:'http://fx.smzdm.com',
			submenu:false
        },{
            id:'yuanchuang',
            title:'原创',
            url:'http://post.smzdm.com',
			submenu:false
        },{
            id:'news',
            title:'资讯',
            url:'http://news.smzdm.com',
			submenu:false
        },{
            id:'zhongce_false',
            title:'众测',
            url:'http://test.smzdm.com',
			submenu:{
				subone:{
					id:'test',
					title:'众测报告',
					url:'http://test.smzdm.com'
				},
				subtwo:{
					id:'pingce',
					title:'众测产品',
					url:'http://test.smzdm.com'
				}
			}
        },{
            id:'wiki_false',
            title:'百科',
            url:'http://wiki.smzdm.com',
			submenu:{
				subone:{
					id:'wiki', 
					title:'百科商品',
					url:'http://wiki.smzdm.com'
				},
				subtwo:{
					id:'wiki_topic',
					title:'百科话题',
					url:'http://wiki.smzdm.com'
				}
			}
        }
    ]
}

module.exports = Favorites;

});
require.register("smzdm_pro/source/src/data/message.js", function(exports, require, module){
/**
 * 推送数据
 * by kerring
 */

var DBoy = require('../core/DBoy')
    , config = require('../../config/config')
    , emitter = new (require('../core/emitter'))
    , Options = require('./options')
    , noti = require('../core/notice')
    , $ = require('../../lib/jquery')
    , io = require('./io');


// 数据库操作对象
var messageDB;
var Message = function () {
}

// 初始化消息库(打开浏览器时)
Message.init = function () {

    // 创建事件
    Message.onPull()
    // 监听数量变化
    Message.onNumber(function (num) {
        noti.setBadge(num)
    })
    // 创建数据对象管理
    messageDB = Message.create()
    // 更新内容
    Message.update()
    // 每隔30秒执行一次请求
    /*DBoy.loop(5, function () {
        Message.fill()
    })*/
}

// 重置
Message.reset = function () {
    // 销毁数据库
    Message.destroy(function () {
        // 初始化流程
        Message.init()
    })
}

// 销毁数据库
Message.destroy = function (callback) {
    DBoy.db.drop("messages", callback)
}

// 创建消息数据表
Message.create = function () {
    // 连接数据库
    DBoy.db.connect('smzdm_db', "1.1.1", 'SMZDM messages DB', 2 * 1024 * 1024);
    // 创建数据对象
    var messageManage = DBoy.db.define("messages", {
        msg_id: "TEXT PRIMARY KEY",
        msg_title: "TEXT",
        msg_desc: "TEXT",
        msg_url: "TEXT",
        msg_type: "TEXT",
        msg_picurl: "TEXT",
        msg_date: "TEXT",
        msg_buyurl: "TEXT",
        msg_fav: "INTEGER",
        msg_top: "INTEGER",
        msg_mall: "TEXT",
        msg_variety: "TEXT",
        msg_detail: "TEXT"
    })
    return messageManage
}

// 更新内容
Message.update = function () {
    // 旧库升级
    Message.backward()
    // 更新数量
    Message.upCount()
    // 清空通知记录
    DBoy.local('notice_array', "[]")
}

// 旧库升级
Message.backward = function () {
    messageDB.query("", {where: "msg_detail<>''", limit: 1}, '', function (tx, error) {
        if (error) {
            DBoy.db.query('', 'ALTER TABLE messages ADD msg_detail text');
        }
    });
    /*
    messageDB.destroy({
        where: 'msg_fav=0 and msg_id like "99___"'
    });
    */
}

// 清空内容
Message.clear = function (callback) {
    messageDB.clear(function () {
        callback && callback()
    })
}

// 更新数量
Message.upCount = function () {
    messageDB.queryAll(function (tx, data) {
        var numObj = {
            message_all: 0,// 全部消息
            message_all_unread: 0,// 未读消息
            message_fav: 0,// 全部收藏
            message_fav_unread: 0 // 未读收藏
        }
        for (var i = 0; i < data.length; i++) {
            var msg = data[i]
            if (msg.msg_fav == 0) {

                numObj.message_all++;
                if (msg.msg_top == 0) {
                    numObj.message_all_unread++;
                }
            }
            else {
                numObj.message_fav++;
                if (msg.msg_top == 0) {
                    numObj.message_fav_unread++;
                }
            }
        }
        // 触发消息数量变化事件
        emitter.emit('numberChange', numObj)
    })
}

// 清空超额消息
Message.limit = function (count) {
    // 清空消息
    messageDB.destroy({
        where: "msg_id in (select msg_id from messages where msg_fav=0 order by msg_date desc limit " + count + ",100000)"
    })
}

// 获取全部消息
Message.fill = function (callback) {
    var time = DBoy.local('last_msg_date') || 1; // 获取最后更新时间
    // 更新版接api需要初次缓存参数 by kerring 10.27
    // 请求数据

    DBoy.get(config.url.push_post(), {lasttime: time}, function (d) {

        // 无数据退出
        if (d.error_code != 0 || d.data.length <= 0) {
            console.log('src/data/message:fill error')
            return false
        }
        // 保存s
        if (!DBoy.local('s')){
            DBoy.local('s', d.s);
        }
        // 进入插入流程

        Message.insert(d.data)
    })
}

// 插入表
Message.insert = function (data) {
    // 过滤可插入数据
    // alert('获取推送接口数据');
    Message.insertFilter(DBoy.unique(data), function (array) {
        // 执行插入操作
        messageDB.insertAll(array, function (tx) {
            // 删除超额数据
            Message.limit(Options.getLimit())
            // 更新数量
            Message.upCount()
            // 更新最后更新时间和当前id
            Message.saveNotice(array.slice(-1)[0])
            // 通知插入结束
            // alert ('已插入本地数据库，开始通知')
            emitter.emit("inserted", array)
        })
    })
}

// 插表前非法数据过滤
Message.insertFilter = function (array, callback) {

    var last_msg_id = DBoy.local('last_msg_id')
        , last_msg_date = DBoy.local('last_msg_date') || 1
        , result = []
    DBoy.each(array, function (i, msg) {
        var sql = "msg_id=" + msg.msg_id + " ORDER BY msg_date desc"
        // 如果对象不是已记录的最后一项
        if (msg.msg_id != last_msg_id && msg.msg_date > last_msg_date && messageDB) {
            // 检测是否存储在库里
            messageDB.query("*", {where: sql, limit: 1}, function (tx, data) {
                // console.log('判断是否符合设置页面的接收规则', msg);
                // alert('执行')
                msg.msg_desc = encodeURI(msg.msg_desc);
                msg.msg_title = encodeURI(msg.msg_title);
                if(!!Message.pullFilter(msg,2)){
                    // alert('符合条件')
                    // alert(data.length)
                    if (!data.length) {
                        // 重置内容
                        msg.msg_title = msg.msg_title
                        msg.msg_desc = msg.msg_desc
                        msg.msg_fav = 0
                        msg.msg_top = 0
                        msg.msg_variety = msg.msg_type
                        msg.msg_type = msg.msg_categories
                        msg.msg_detail = msg.msg_detail ? encodeURI(msg.msg_detail) : ''
                        // 存储到变量
                        result.push(msg)
                        // alert('添加成功');
                    }
                    // 当循环结束
                }
                // alert('长度' + array.length + '=' + i)
                if (i == array.length - 1) {
                    // 返回数据
                    // alert('返回数据')
                    callback && callback(result)
                }
            })
        }
    })
}

// 标记已读
Message.isRead = function (id) {
    var numObj = DBoy.parseJSON(DBoy.local('messagesNum'))
    numObj.message_all_unread -= 1
    if (numObj.message_all_unread < 0) {
        numObj.message_all_unread = 0
    }
    emitter.emit('numberChange', numObj)
    if (messageDB != undefined) {
        messageDB.update({
            data: {msg_top: 1},
            where: "msg_id = " + id
        })
    }
}

// 消息数量变化监听
Message.onNumber = function (callback) {
    var result = ""
    emitter.on('numberChange', function (numObj) {
        result = numObj.message_all_unread || ""
        // 存储全部消息数量
        DBoy.local('messagesNum', JSON.stringify(numObj))
        // 注意，返回值必须为string
        callback && callback(result.toString())
    })
}

// 老版本浏览器内核使用html弹通知在此取出数据
Message.getNotification = function (id, callback) {
    var messageDB = Message.create()
    messageDB.query("*", {
        where: 'msg_id=' + id + ' ORDER BY msg_date desc'
    }, function (tx, data) {
        callback && callback(data[0])
    })
}

// 保存消息信息
Message.saveNotice = function (notice) {
    if (undefined == notice) return false
    DBoy.local('last_msg_id', notice.msg_id);
    DBoy.local('last_msg_date', notice.msg_date);
}

// 删除消息信息
Message.remove = function (id) {
    messageDB.destroy({
        where: "msg_id=" + id
    })
}


//获取cookie方法
Message.getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

//================== 整理推送列表 ======================
Message.getFill = function (callback) {
    messageDB = messageDB || Message.create();

    messageDB.query("*", {
        where: 'msg_fav = 0 ORDER BY msg_date desc'
    }, function (tx, data) {

        var array = []
        for (var i = 0, l = data.length; i < l; i++) {
            var msg = {}, meta = ''
                // 晒物经验资讯不显示直达链接
                , type = false

            DBoy.each(data[i], function (k, v) {

                if (k == 'msg_picurl') { // 图片统一字段
                    msg['img'] = v || '/assets/img/logo128.png'
                }
                else if (k == 'msg_title') { // 切分标题名称和价格

                    //按照全角空格拆分
                    var title = decodeURI(v);

                    if (title.indexOf('　') > -1) {
                        //有价格的情况下
                        msg.title = title.substring(0, title.lastIndexOf('　'));         //获取最后一个空格前面的内容
                        msg.price = title.replace(msg.title, '').replace('　', '');       //获取最后一个空格后面的内容
                    } else {
                        //没有价格
                        msg.title = title
                        msg.price = ''
                    }

                }
                else if (k == 'msg_detail') { // 晒物经验资讯显示的信息
                    var json = (v != '') ? JSON.parse(decodeURI(v)) : {}
                    for (var i in json) {
                        if (i != 'id') {
                            msg[i] = json[i]
                        }
                    }
                    // 显示相关标签
                    if (msg['tag_str'] && msg['tag_str'] != '') {
                        var tags = msg['tag_str'].split(',')
                            , tag = []
                        if (tags.length > 0) {
                            for (var i in tags) {
                                var el = $(tags[i])
                                tag.push({
                                    data: el.attr('data') + '?' + config.app.census('Push', 'Tixing', 'Articles'),
                                    html: el.html()
                                })
                            }
                        }
                        msg['tag_str'] = tag.length > 0 ? tag : false
                    }
                    // 显示作者
                    msg['display_name'] && (meta = msg['display_name'])
                    // 显示新闻标签
                    msg['name'] && (meta = msg['name'])
                    // 提取商家链接
                    msg['mall_link'] && (msg['mall_link'] = msg['mall_link'] + '?' + config.app.census('Push', 'Tixing', 'Mall'))
                }
                else if (k == 'msg_mall')   // 显示商家覆盖msg_detail信息
                    meta = (v != null && v != 'undefined') ? v : meta
                else if (k == 'msg_buyurl') { // 其它信息调整


                    msg['btnurl'] = (v.indexOf("?") > -1) ? (v + config.app.census('Push', 'Tixing', 'Articles')) : (v + '?' + config.app.census('Push', 'Tixing', 'Articles'));


                    //没有链接网址则不显示直达链接按钮
                    var cache_buyurl = msg['btnurl'].replace('?utm_source=chrome&utm_medium=Push&utm_campaign=Tixing&utm_Content=Articles', '');
                    //console.log(cache_buyurl);
                    if (cache_buyurl == '') {
                        msg['btnurl'] = false
                    }

                }
                else if (k == 'msg_date')
                    msg['time'] = DBoy.unit.getTime(parseInt(v) * 1000)
                else if (k == 'msg_url')
                    msg['url'] = (v.indexOf("?") > -1) ? (v + config.app.census('Push', 'Tixing', 'Articles')) : (v + '?' + config.app.census('Push', 'Tixing', 'Articles'))
                else msg[k.replace('msg_', '')] = v // 默认字段还原

                msg.fade = false
                msg.meta = meta


            })


            //根据cookie值的存在与否变更收藏按钮的状态
            if (Message.getCookie('product' + msg['id'])) {
                msg.fav = true
            }

            array.push(msg)

        }

        // 修改数量后 才返回内容
        Message.onNumber(function () {
            callback && callback(array, JSON.parse(DBoy.local('messagesNum')))
        })

        Message.upCount()

        // 修改数据
        messageDB.update({
            data: {msg_top: 1},
            where: "msg_fav=0"
        })
    });
}

//==================== 通知 =======================
Message.onPull = function () {
    // 当添加结束时
    emitter.on('inserted', function (array) {
        // 滚动条归0
        DBoy.local("scrollTop", 0)
        // 清空所有弹出消息
        noti.clearNotify()
        // 通知推出
        var e = function () {
            var num = 0, msg

            // alert(array.join(''));
            //  console.log('array=',array);

            DBoy.each(array.reverse(), function (i, item) {

                //通知标题拆分为标题和价格
                var old_title = decodeURI(item.msg_title);
                var cache_title = old_title.substring(0, old_title.lastIndexOf(' '));
                var cache_price = old_title.replace(cache_title, '');
                var option_title = cache_title + '　' + cache_price;

                item.msg_title = encodeURI(option_title);

                //item.msg_title = item.msg_iconUrl;
                // alert(num);
                // alert(msg = Message.pullFilter(item));


                if ((num < 3) && (msg = Message.pullFilter(item))) {
                    num = num + 1

                    //如果本地缓存中 notice_cache 的值为 off ，则不弹出提醒窗口
                    // console.log(localStorage.getItem("notice_cache"));
                    var nc = localStorage.getItem("notice_cache");
                    if (nc&&nc.indexOf('off') > -1) {
                        return false;
                    }
                    // alert('通知!!!');
                    noti.notice(msg)

                }

            })

        };
        // 对获取设置页变量的测试，没获取到时需要重复测试，直到成功为止 by kerring
        var test = function () {
            var d = DBoy.local('pushCategory')
            if (!d) {
                setTimeout(function () {
                    test()
                }, 1000)
            } else {
                console.log('循环');
                e();
            }
        }
        test()
    })
}

// 过滤不通知数据
Message.pullFilter = function (msg) {
    // alert('msg');
    var is_1 = false // 特色
        , is_2 = false, is_location, is_categories // 品类
        , item_location = "cn;global" // 默认地域
        , categories = [], all_categories = [], default_categories = [], location_categories = []
        , item_categories = [], item_defaults = [], item_locations = []
        , da = {} // 临时数据
        , ext = function (msg) {
        var link1 = msg.msg_url
            , link2 = msg.msg_buyurl
        return {
            url: '/html/notification.html?msg_id=' + msg.msg_id,
            msg_id: msg.msg_id,
            //title: DBoy.unit.removeHTML(decodeURI(msg.msg_title)).substring(0,90),
            title: decodeURI(msg.msg_title).substring(0, 90),    //没有过滤html标签
            iconUrl: msg.msg_picurl,
            message: DBoy.unit.removeHTML(decodeURI(msg.msg_desc?msg.msg_desc:'')).substring(0, 120),
            items: [
                {title: '', message: DBoy.unit.removeHTML(decodeURI(msg.msg_desc).substring(0, 120))}
            ],
            link1: (link1.indexOf('?') > 1) ? (link1 + config.app.census('Push', 'articlespopup', '')) : (link1 + '?' + config.app.census('Push', 'articlespopup', '')),
            link2: (link2.indexOf('?') > 1) ? (link2 + config.app.census('Push', 'articlespopup', '')) : (link2 + '?' + config.app.census('Push', 'articlespopup', '')),
            variety: msg.msg_variety
        }
    }
    // ===== 强制推送
    if (msg.push_type && msg.push_type === '2') {
        // alert('强推');
        return ext(msg);
        return false;
    }
    // ===== 每日精选
    if (msg.push_type && msg.push_type === '3' && (DBoy.local('noti_cat_88888') === 'on')) {
        // alert('精选');
        return ext(msg);
        return false;
    }
    // ===== 关键字订阅
    var keyword = DBoy.local('push_keyword') ? DBoy.local('push_keyword').replace(/，/g, ',').split(',') : []
    for (var i = 0; i < keyword.length; i++) {
        if ((keyword[i] != '') && (decodeURI(msg.msg_title).indexOf(keyword[i]) > -1)) {
            // alert('关键字');
            // alert(decodeURI(msg.msg_title));
            return ext(msg);
            return false;
        }
    }
    // 整理获取的分类
    categories = msg.msg_categories.split(",").sort(function compare(a, b) {
        // alert('整理获取的分类');
        return a - b;
    })
    for (var i = 0, l = categories.length; i < l; i++) {
        if (categories[i] === "") categories.splice(i, 1)
    }
    // 整理本地所有分类
    da = JSON.parse(DBoy.local('pushCategory'))
    for (var i in da) all_categories[i] = da[i].id
    da = JSON.parse(DBoy.local('pushSpecial'))
    for (var i in da) default_categories[i] = da[i].id
    location_categories = JSON.parse(DBoy.local('location_cls'))
    // 交集(分类 特色 地域)
    item_categories = DBoy.unit.array_intersect(categories, all_categories.sort(function compare(a, b) {
        return a - b;
    })),
        item_defaults = DBoy.unit.array_intersect(categories, default_categories.sort(function compare(a, b) {
            return a - b;
        })),
        item_locations = DBoy.unit.array_intersect(categories, location_categories.sort(function compare(a, b) {
            return a - b;
        }));
    // 特色推荐推送
    is_1 = (item_defaults.length > 0 && (DBoy.local('noti_cat_' + item_defaults[0]) === "on")) ? true : false
    // 地域
    if (item_locations.length > 0) {
        if (item_locations[0] == '3535') item_location = "cn"
        if (item_locations[0] == '8296') item_location = "global"
        is_location = (DBoy.local('item_location').indexOf(item_location) >= 0) ? true : false
    }
    // 晒物经验无地域分类需要推送
    var variety = {post: false, os: true, exp: true, news: true, ht: false}
    if (variety[msg.msg_type] == true) is_location = true

    // console.log(DBoy.local('item_location'))
    // console.log(item_location)
    // console.log(msg.msg_type)
    // console.log(is_location)

    // 类别
    is_categories = ((item_categories.length > 0) && (DBoy.local('noti_cat_' + item_categories[0]) === "on")) ? true : false
    is_2 = (is_location && is_categories) ? true : false
    // ===== 推送
    if (is_1 || is_2) {
        // console.log('特色or分类');
        // alert('推送');
        return ext(msg);
        return false;
    }
    // alert('不推');
    // console.log('不推')
}

var time = DBoy.local('last_msg_date');
if(!time){
    Message.fill();
}

io.onmessage = function(res) {
    if(res.data.items&&res.data.items.length>0){
        var items = res.data.items;
        var msgList = [];
        for(var v=0;v<items.length;v++){
            var content = items[v].content;
            msgList.push(content);
            DBoy.local('s', content.msg_date);
        }
        Message.insert(msgList)
    }
}

io.fillMsg = function () {
    Message.fill();
}
io.initSocket();


module.exports = Message;

});
require.register("smzdm_pro/source/src/data/io.js", function(exports, require, module){
// var socket = require('../../lib/io')
var DBoy = require('../core/DBoy');
var io = {};
var ws = null;

var serverUrl = 'wss://tuisong.smzdm.com/connect';

var connectTimeout = false;
var lockReconnect = false;  //避免ws重复连接
io.fillMsg = null;
io.initSocket = function () {
    ws = new WebSocket(serverUrl);
    connectTimeout = setTimeout((function (ws) {
        return function () {
            if(ws.readyState != WebSocket.OPEN){
                ws.close();
            }
        }
    })(ws),15000)
    // 收到服务端消息
    ws.onmessage = function (msgStr) {
        var msg = JSON.parse(msgStr.data);
        if (msg.type && msg.type === "PONG") {
            heartCheck.reset().start();
            return;
        }
        if (io.onmessage && typeof io.onmessage === 'function') {
            io.onmessage(msg);
        }
    };


    // 建立连接
    ws.onopen = function (event) {
        heartCheck.reset().start();
        console.log('open success!')
        ws.send('{"type":"JOIN","data":{"room":"chrome-plugin"}}')
    };

    // 异常
    ws.onerror = function (event) {
        console.log('onerror')
        reconnect();
    };
    ws.onclose = function () {
        console.log('onclose')
        reconnect();
    };
};


function reconnect() {
    console.log('reconnect');
    if (lockReconnect) return;
    lockReconnect = true;
    setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
        io.initSocket();
        lockReconnect = false;
    }, 10000);
    io.fillMsg();
}

//心跳检测
var heartCheck = {
    timeout: 50000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function () {
        var self = this;
        this.timeoutObj = setTimeout(function () {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            ws.send('{"type": "PING"}');
            self.serverTimeoutObj = setTimeout(function () {//如果超过一定时间还没重置，说明后端主动断开了
                ws.close();     //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            }, 5000)
        }, this.timeout)
    }
};


module.exports = io;
});
require.register("smzdm_pro/source/src/data/options.js", function(exports, require, module){
/*
 * 设置模型
 * by kerring
 */

var DBoy = require('../core/DBoy')
  , emitter = new (require('../core/emitter'))
  , url = require('../../config/config').url

var Options = {}
// 配置初始化
Options.init = function(){
	console.log('初始化');	
    emitter.on('insertPush',function(){
        emitter.emit('inited')
    })
    require('../core/ext') // 初始化其它浏览器扩展
    Options.insertBase()   // 插入基本设置
    Options.insertKey()    // 插入关键字
    Options.insertPush()   // 插入推送设置
    Options.setExtype()    // 更新类型
}


// 版本初始化
Options.base = function(callback){	
    var me = this
    me.getDetails(function(data){
        var nowVersion = data.version // 当前版本号
          , oldVersion = me.getVersion() ? me.getVersion().toString() : ''// 已记录版本号
          , isNotVersion = oldVersion === null
          , isDifVersion = nowVersion != oldVersion
        console.log("初始化")
        console.log("记录版本:", oldVersion)
        console.log("当前版本:", nowVersion)
        console.log("无记录版本信息", isNotVersion)
        console.log("与记录版本不同", isDifVersion)
        //当版本号不同时,  如果没有版本号 或 非补丁版本更新时才触发
        if( isDifVersion && isNotVersion || (nowVersion.length < 3) || (nowVersion.substr(0, 3) != oldVersion.substr(0, 3)) ){
            console.log('版本号更新 ', nowVersion)
            Options.setVersion(nowVersion) // 记录版本
            emitter.on('inited',function(){
                console.log('插件增加更新标记')
                DBoy.local('options_update_run','true')
                if(require('../core/ext')['open']){
                    var ext = require('../core/ext')
                    ext.openOption()
                    return false
                }
                DBoy.unit.goto('html/options.html',true)
            })
        }
        callback && callback()
    })
}

/**
 * 插入基本设置
 */
Options.insertBase = function(obj){
    // 桌面提醒
    DBoy.local('noti_desktop', DBoy.local('noti_desktop') || 'on');
    // 声音提醒
    DBoy.local('noti_sound', DBoy.local('noti_sound') || 'on');
    // 安静时间
    DBoy.local('noti_time',DBoy.local('noti_time') || 'off')
    DBoy.local('item_time1',DBoy.local('item_time1') || '23:00')
    DBoy.local('item_time2',DBoy.local('item_time2') || '7:00')
    // 信息保留条数
    DBoy.local('message_limit',DBoy.local('message_limit') || '100')
    // 所在地
    DBoy.local('location_cls', JSON.stringify(["3535", "8296"]));
    DBoy.local('item_location', DBoy.local('item_location') || 'cn;global');
    // 链接打开方式
    DBoy.local('open_back', DBoy.local('open_back') || 'on');
}


/**
 * 插入推送设置
 */
Options.insertPush = function(obj){
		
    // 每日精选
    DBoy.local('noti_cat_88888',DBoy.local('noti_cat_88888')||'on')
    // 其他
    // DBoy.local('noti_cat_99999',DBoy.local('noti_cat_99999')||'on')
    // 特色标签
    Options.insertSpecial(function(){
        // 商品分类
        Options.insertCategory(function(){
            // 遍历localStorage
            for(var key in localStorage){
                var isNoti = key.indexOf("noti_cat_") > -1
                  , categoryCount = 0, isNotCategory = false
                  , specialCount = 0, isNotSpecial = false
                  , isNotOther = (key !== "noti_cat_88888") //(key !== "noti_cat_99999") &&
                  , cateArray = JSON.parse(DBoy.local("pushCategory"))
                  , specArray = JSON.parse(DBoy.local("pushSpecial"))

                if(isNoti && isNotOther){
                    var id = key.split("_")[2]
                    for (var i = 0, l = cateArray.length; i < l; i++) {
                        if(cateArray[i].id == id){
                            categoryCount++
                        }
                    }
                    for (var j = 0, m = specArray.length; j < m; j++) {
                        if(specArray[j].id == id){
                            specialCount++
                        }
                    }
                    if(categoryCount == 0){
                        isNotCategory = true
                    }
                    if(specialCount == 0){
                        isNotSpecial = true
                    }
                    // 如果不是分类也不是特色
                    // 判断为旧项，直接删除
                    if(isNotCategory && isNotSpecial){
                        // 删除该内容
                        localStorage.removeItem(key)
                    }
                }
            }
            // 触发事件
            emitter.emit('insertPush')
        })
    })
}

/**
 * 插入关键字
 */
Options.insertKey = function(obj){
    DBoy.local('push_keyword', DBoy.local('push_keyword') ||'')
}


/**
 * 插入特色标签
 */
Options.insertSpecial = function(callback){
    // 获取数据
    DBoy.get(url.special(), function(result){
        if(result.error_code == 0){
            var array = []
            // 遍历返回值
            DBoy.each(result.data.rows, function(i, data){
                // 获取原始存储内容
                var val = DBoy.local('noti_cat_' + data.id) || 'on'
                // 存储
                DBoy.local('noti_cat_' + data.id, val);
                array.push(data)
            })
            // 存储所有id
            DBoy.local('pushSpecial', JSON.stringify(array));

        }
        callback && callback()
    })
}

/**
 * 插入商品分类
 */
Options.insertCategory = function(callback){
    // 获取数据
    DBoy.get(url.category(), function(result){
        if(result.error_code == 0){
            var array = []
            // 遍历返回值
            DBoy.each(result.data.rows, function(i, data){
                // 获取原始存储内容
                var val = DBoy.local('noti_cat_' + data.id) || 'on'
                // 存储
                DBoy.local('noti_cat_' + data.id, val);
                array.push(data)
            })
            // 存储所有id
            DBoy.local('pushCategory', JSON.stringify(array));
        }

        callback && callback()
    })
}

// 获取插件信息
Options.getDetails = function(callback){
    if (require('../core/ext')['open']) {
        return require('../core/ext').getDetails(callback)
    }
    callback && callback(chrome.app.getDetails())
}

// 获得版本号
Options.getVersion = function(){
    return DBoy.local('version')
}

// 设置版本号 设置更新状态
Options.setVersion = function(val){
    DBoy.local('version', val)
    DBoy.local('options_update_run', 'true')
}

/**
 * 设置插件版本类型
 */
Options.setExtype = function(){
    Options.getDetails(function(val){
        var manifest = { 
//            type: (!val.content_scripts) ? 1 : 2, //1标准版，2专业版   (从manifest.json中查找有没有content_scripts属性)
			  type: 1, //因为标准版在商品详细页面底部增加了相关信息功能，需要content_scripts字段，所以暂时取消用content_scripts来区分版本
            name: val.name
        }
        DBoy.local('manifest', JSON.stringify(manifest));
    })
}

/**
 * 设置静音开始时间
 */
Options.setBeginTime = function(val){
    DBoy.local('item_time1', val)
}

/**
 * 设置静音结束时间
 */
Options.setClosureTime = function(val){
    DBoy.local('item_time2', val)
}

/**
 * 设置存储数据最大条数
 */
Options.setLimit = function(val){
    DBoy.local('message_limit', val)
}

/**
 * 获取存储数据最大条数
 */
Options.getLimit = function(){
    return DBoy.local('message_limit')
}

/**
 * 设置地区
 */
Options.setLocation = function(val){
    // cn;global
    DBoy.local("item_location", val);
}

/**
 * 获取地区
 */
Options.getLocation = function(){
    return DBoy.local("item_location")
}

/**
 * 设置更新状态
 */
Options.setUpdateStatus = function(status){
    DBoy.local('options_update_run', status ? 'true' : 'false')
}

/**
 * 读取更新状态
 */
Options.getUpdateStatus = function(){
    return DBoy.local('options_update_run')
}

/**
 * 获取基本设置项目
 */
Options.getBase = function(){
    return {
        desktop:DBoy.local('noti_desktop'),
        muteTime:DBoy.local('noti_time'),
        beginTime:DBoy.local('item_time1'),
        closureTime:DBoy.local('item_time2'),
        sound:DBoy.local('noti_sound'),
        count:DBoy.local('message_limit'),
        locus:DBoy.local('item_location'),
        open_back:DBoy.local('open_back')
    }
}

/**
 * 设置基本项目
 */
Options.setBase = function(item){
    var val = DBoy.local(item) == 'on'  ? 'off' : 'on'
    DBoy.local(item,val);
}

/**
 * 获取推送设置项目和值
 */
Options.getPush = function(){
    var carray = JSON.parse(DBoy.local('pushCategory')) || []
      , sarray = JSON.parse(DBoy.local('pushSpecial')) || []
      , result = {specialList:[],categoryList:[]}

    for (var i = 0, slen = sarray.length; i < slen; i++) {
        result.specialList.push({
            id:sarray[i].id,
            title:sarray[i].title,
            value:DBoy.local('noti_cat_' + sarray[i].id)
        })
    }

    for (var j = 0, clen = carray.length; j < clen; j++) {
        result.categoryList.push({
            id:carray[j].id,
            title:carray[j].title,
            value:DBoy.local('noti_cat_' + carray[j].id)
        })
    }

    return result;
}

/**
 * 修改推送
 */
Options.changePull = function(el){
    var val = el.value == 'on' ? 'off' : 'on'
    el.value = val
    DBoy.local('noti_cat_' + el.id, val)
}

/**
 * 设置关键字
 */
Options.setKeyword = function(val){
    DBoy.local('push_keyword', val)
}

/**
 * 获取关键字
 */
Options.getKeyword = function(){
    return DBoy.local('push_keyword')
}

/**
 * 报告问题
 */
Options.reportSub = function(obj, callback){
    DBoy.post(url.report(), obj, function(data){ 
        console.log(data);
        callback && callback();
    })
}

/**
 * 获取每日精选状态
 */
Options.getBasic = function(){
    return DBoy.local('noti_cat_88888')
}

/**
 * 修改每日精选状态
 */
Options.changeBasic = function(){
    var val = DBoy.local('noti_cat_88888') == 'on' ? 'off' : 'on'
    DBoy.local('noti_cat_88888',val)
    return val
}

/**
 * 获取其他状态
 */
Options.getOther = function(){
    return DBoy.local('noti_cat_99999')
}

/**
 * 修改其他状态
 */
Options.changeOther = function(){
    var val = DBoy.local('noti_cat_99999') == 'on' ? 'off' : 'on'
    DBoy.local('noti_cat_99999',val)
    return val
}

module.exports = Options;







});
require.register("smzdm_pro/source/src/data/user.js", function(exports, require, module){
/**
 * 用户模型
 * by kerring
 */

var config = require('../../config/config')
  , DBoy = require('../core/DBoy')

var User = {}

/**
 * 登录
 */
 
 
User.login = function(obj,callback){
    var me = this
    DBoy.post(
        config.url.login(),
        {user_login: obj.username, user_pass: obj.password, captcha: obj.checkcode},
        function(data) {
			
            if (data.error_code > 0) {
                callback(data);
                return ;
            }
			
			//保存登录状态到本地
			localStorage.setItem("save_login_state",'true');
			//保存用户信息的token到本地
			localStorage.setItem("user_name",data.data.token);
			
            DBoy.clocal('ctoken', data.data.token, {day:(obj.isSave*29)})
            me.getInfo(callback)
        }
    )
}

User.getInfo = function(callback){
    DBoy.post(
        config.url.userinfo(),
        {token: DBoy.clocal('ctoken')},
        function(data){
			
            if (data.error_code > 0) {
                callback(data)
                return
            }
			
            var d = data.data
            DBoy.local('smzdm_identity', d.meta.is_editor,false)
            callback(d)
        }
    )
}

/**
 * 本地登录
 */
User.localLogin = function(callback){
    var me = this
      , token = DBoy.clocal('ctoken') ? DBoy.clocal('ctoken') : false
    
    if( !token ) {
        me.logout()
        return false
    }

    me.getInfo(function(d){
        callback && callback({
            nickname: d.display_name,
            isSignIn: d.checkin.web_has_checkin
        })
    })
}

/**
 * 退出登录
 */
User.logout = function(callback){
    //DBoy.get(logoutUrl,function(){
        DBoy.local('smzdm_identity', false, false)
        DBoy.clocal('ctoken', false)
        callback && callback()
		
		//修改本地的登录状态以及用户信息的token
		localStorage.setItem("save_login_state",'false');
		localStorage.setItem("user_name",'');
		
    //})
}

module.exports = User;

});
require.register("smzdm_pro/source/src/ext/maxthon.js", function(exports, require, module){
/**
 * 遨游扩展兼容
 */

var DBoy = require("../core/DBoy")
  , unit = DBoy.unit

var maxthon = function(){
    if(!unit.browType()['maxthon']) return false
    if(maxthon.unique !== undefined) return maxthon.unique
    this.init()
    maxthon.unique = this
}
maxthon.prototype = {
    open: false
    , init: function(){
        var me = this
        console.log('src/core/ext:init')
        me.open = true
        me.rt = window.external.mxGetRuntime()
    }
    , popup: function(notify){
        var me = this
        me.setBadge('')
        me.rt.onAppEvent = function (obj) {
            if (!obj.action || obj.action.type !== 'panel') {
                return;
            }
            if (obj.type === 'ACTION_SHOW') {
                notify.fill()
            }
            if (obj.type === 'ACTION_HIDE') {
                notify.page = 1
                me.setBadge('')
            }
        }
    }
    /**
     * 设置图标显示文字
     */
    , setBadge:function(text){
        var me = this
          , text = parseInt(text)
        if( text > 0){
            me.rt.icon.showBadge(text)
        }else{
            me.rt.icon.showBadge('')
        }
    }
    , goto: function(href, callback){
        var me = this
          , arg = arguments
          , mxTabs = me.rt.create('mx.browser.tabs')
          , callback = callback || function(){}
          , open_back = me.local('open_back') || 'on'
          , opt = {
            url: (href.indexOf('option') > 0) ? (me.rt.getPrivateUrl()+'html/options.html') : href,
            activate: open_back == 'off'
        }
        if( typeof arg[1] === 'boolean' ){
            if(open_back == 'on') opt['activate'] = false

            if(arg[1] == true) opt['activate'] = true
            else opt['activate'] = false

            callback = arg[2] || function(){}
        }
        mxTabs.newTab(opt, callback)
    }
    , getDetails: function(callback){
        DBoy.getJSON('../def.json',function(data){
            callback(data[0])
        })
    }
    , local: function(key,val){
        var me = this
        if(!(typeof val === 'undefined')){
            return me.rt.storage.setConfig(key,val)
        }
        return me.rt.storage.getConfig(key)
    }
    , openOption: function(){
        var me = this
        me.goto(me.rt.getPrivateUrl() + 'html/options.html')
    }
    /**
     * 桌面消息提示
     * 目前两种接口入参不同，需要修改
     */
    , notice:function(obj){
        var self = this
          , obj = obj || {}
          , time = new Date().getHours() + ':' + new Date().getMinutes()
          , time1 = self.local('item_time1') || 0
          , time2 = self.local('item_time2') || 0
          , ontime = (self.local('noti_time') == 'on' && DBoy.unit.time_range(time1, time2, time)) ? true : false

        if (ontime == false && self.local('noti_desktop') == 'on'){ 
            self.notModel().create(
                obj.title.substr(0,40),
                {icon: obj.iconUrl || chrome.extension.getURL('assets/img/logo_64.png'), body: obj.message.substr(0, 95) || ""},
                {'click': function(){
                    // 修改已读状态
                    require('../data/message').isRead(obj.msg_id)
                    // 跳转页面
                    self.goto(obj.link1)
                    this.close()
                }}, 5000
            )
            if (self.local('noti_sound') == 'on'){
                new Audio(self.rt.getPrivateUrl() + "/assets/notify.mp3").play();
            }
        }
    }
    // 通知模型
    , notModel : function(){
        var mxNotify = {}
        if ('Notification' in window && 'permission' in Notification) {	//case 1. w3c 最新版
            mxNotify = {
                'isSupport': true,
                //granted, denied, default
                'permission': Notification.permission,
                'requestPermission': function(callback) {
                    if (this.permission === 'default') {//未设置
                        Notification.requestPermission(function(permission) {
                                this.permission = permission;
                                if (callback) {
                                    callback(permission);
                                }
                            }.bind(this));
                    } else {
                        if (callback) {
                            callback(this.permission);
                        }
                    }
                },
                'create': function(title, options, evtFuncs, hideDelay, callback) {
                    if (this.permission === 'granted') {//同意
                        notifyMe(title, options, evtFuncs, hideDelay, callback);
                    } else if (this.permission === 'denied') {//拒绝
                        if (callback) {
                            callback('denied');
                        }
                        return;
                    } else {//default, 未设置
                        this.requestPermission(function (permission) {
                            if (permission === 'granted') {
                                notifyMe(title, options, evtFuncs, hideDelay, callback);
                            } else {
                                if (callback) {
                                    callback(permission);
                                }
                            }
                        });
                    }
                    function notifyMe(title, options, evtFuncs, hideDelay, callback) {
                        var Notifier = new Notification(title, options);
                        var notifierTimer = null;
                        if (evtFuncs) {
                            var eventType;
                            for (eventType in evtFuncs) {
                                Notifier.addEventListener(eventType, evtFuncs[eventType], false);
                            }
                        }
                        if (hideDelay) {
                            notifierTimer = setTimeout(function () {
                                    Notifier.close();
                                }, hideDelay);
                        }
                        if (callback) {
                            callback(Notifier, notifierTimer);
                        }
                    }
                }
            }
        } else if ('webkitNotifications' in window) {//case 2. 旧版本
            mxNotify = {
                'isSupport': true,
                //granted, denied, default
                'permission': ((function(){
                        var Notifications = window.webkitNotifications;
                        var permission = Notifications.checkPermission();
                        if (permission === 0) {//同意
                            return 'granted';
                        } else if (permission === 2) {//拒绝
                            return 'deined';
                        } else {
                            return 'default';
                        }
                    })()),
                'requestPermission': function(callback) {
                    if (this.permission === 'default') {
                        var Notifications = window.webkitNotifications;
                        Notifications.requestPermission(function () {
                                var permission = Notifications.checkPermission();
                                if (permission === 0) {//同意
                                    this.permission = 'granted';
                                    if (callback) {
                                        callback('granted');
                                    }
                                } else if (permission === 2) {//拒绝
                                    this.permission = 'deined';
                                    if (callback) {
                                        callback('denied');
                                    }
                                } else {//1, 未设置
                                    this.permission = 'default';
                                    if (callback) {
                                        callback('default');
                                    }
                                }
                            }.bind(this));
                    } else {
                        if (callback) {
                            callback(this.permission);
                        }
                    }
                },
                'create': function(title, options, evtFuncs, hideDelay, callback) {
                    var Notifications = window.webkitNotifications;
                    if (this.permission === 'granted') {//同意
                        notifyMe(title, options, evtFuncs, hideDelay, callback);
                    } else if (this.permission === 'denied') {//拒绝
                        if (callback) {
                            callback('denied');
                        }
                        return;
                    } else {//default, 未设置
                        this.requestPermission(function (permission) {
                            if (permission === 'granted') {
                                notifyMe(title, options, evtFuncs, hideDelay, callback);
                            }
                        });
                    }
                    function notifyMe(title, options, evtFuncs, hideDelay, callback) {
                        if (!options) {
                            options = {};
                        }
                        var Notifier = Notifications.createNotification(options.icon||'', title, options.body||title);
                        var notifierTimer = null;
                        if ('tag' in options) {
                            Notifier.replaceId = options.tag;
                        }
                        if ('dir' in options) {
                            Notifier.dir = options.dir;
                        }
                        if ('lang' in options) {
                            Notifier.lang = options.lang;
                        }
                        Notifier.show();
                        if (evtFuncs) {
                            var eventType;
                            for (eventType in evtFuncs) {
                                Notifier.addEventListener(eventType, evtFuncs[eventType], false);
                            }
                        }
                        if (hideDelay) {
                            notifierTimer = setTimeout(function () {
                                    Notifier.cancel();
                                }, hideDelay);
                        }
                        if (callback) {
                            callback(Notifier, notifierTimer);
                        }
                    }
                }
            }
        } else {//不支持
            mxNotify = {
                'isSupport': false,
                'permission': 'denied',
                'requestPermission': function(callback) {
                    if (callback) {
                        callback('unsupported');
                    }
                },
                'create': function(title, options, evtFuncs, hideDelay, callback) {
                    if (callback) {
                        callback('unsupported');
                    }
                }
            }
        }
        return mxNotify
    }
}

module.exports = maxthon

});
require.register("smzdm_pro/source/src/log/main.js", function(exports, require, module){
/**
 * 日志核心类
 * @author s
 * @date   2014/07/14
 * @time   11:00
 */
// todo:日志对象创建
// todo:日志对象存储

var Logger  = require('./logger');
var Routine = require('./routine');
var option  = require('./config/config').log;


Logger.config(option)
Logger.onError()// 监听全局错误


module.exports = Logger;
});
require.register("smzdm_pro/source/src/log/logger.js", function(exports, require, module){
/**
 * 日志核心类
 * @author s
 * @date   2014/07/14
 * @time   11:00
 */
// todo:日志对象创建
// todo:日志对象存储

var LogModel = require('./model');
var log = new LogModel();

var Logger = {}
  , _option = null

/**
 * 日志配置
 */
Logger.config = function(option){
	_option = option
}

/**
 * 提示性信息
 */
Logger.info = function(msg){
    console.log(msg)
    log.save("info", msg)
}

/**
 * 异常性信息
 */
Logger.debug = function(msg){
    console.debug(msg)
    log.save('bug', msg)
}

/**
 * 错误性信息
 */
Logger.error = function(msg){
    console.error(msg)
    log.save('error', msg)
}

module.exports = Logger;
});
require.register("smzdm_pro/source/src/log/model.js", function(exports, require, module){
/**
 * 日志对象
 * @author s
 * @date   2014/07/14
 * @time   11:00
 */
var DBoy = require('./src/data/main');

var LogModel = function(){
    
}

/**
 * 判断是否存在
 */
LogModel.hasModel = function(){
    return DBoy.local("smzdm_log") !== null
}

var LogModelProto = LogModel.prototype

/**
 * 保存
 */
LogModelProto.save = function(type,msg){
    var info = this.create()
      , time = (new Date()).getTime()

    // todo:使用者信息
    
    // 封装数据
    info[time] = {type:type,msg:msg}

    // 更新内容
    this.update(info)
}

/**
 * 创建
 */
LogModelProto.create = function(){
    // 如果存在，获取已存内容
    if(LogModel.hasModel()){
        return DBoy.parseJSON(DBoy.local("smzdm_log"))
    }

    // 否则返回空对象
    return {}
}

/**
 * 更新
 */
LogModelProto.update = function(info){
    DBoy.local("smzdm_log",JSON.stringify(info))
}

/**
 * 清空内容
 */
LogModelProto.clear = function(){
    DBoy.local("smzdm_log","{}")
}

module.exports = LogModel;
});
require.register("smzdm_pro/source/src/log/routine.js", function(exports, require, module){
/**
 * 运行时监控
 * @author s
 * @date   2014/07/14
 * @time   11:00
 */

var Logger = require('./logger'); 

/**
 * 运行时监控
 */
Logger.routine = function(callback){
    try{
        callback()
    }
    catch(e){
        Logger.error(e)
    }
}

/**
 * 异常监听
 */
Logger.onError = function(callback){
	window.onerror = function(e){
		Logger.error(e)
		callback && callback(e)
	}
}

module.exports = Logger;
});
require.register("smzdm_pro/source/plug/dialog.js", function(exports, require, module){
/**
 * 嵌入弹出域
 * @author s
 * @data   2014/06/17
 * @time   17:00
 */
var $ = require('../lib/jquery')

/**
 * 入口函数
 * @param tager    目标元素
 * @param config   配置参数
 * @param callback 回调函数
 */
var Dialog = function(tager, config, callback){
    return new Dialog.init(tager, callback, config)
}


/**
 * 初始化
 */
Dialog.init = function(tager, callback, config){

    this.$tager = $(tager)// 目标元素
    
    // 配置参数
    this.config = {
        left   : config.left || 0,
        top    : config.top || 0,
        rex    : config.rex,
        ignore : config.ignore
    }


    this.onEvent(callback)

    return this.$tager
}

Dialog.init.prototype = Dialog.proto = Dialog.prototype

/**
 * 绑定事件
 */
Dialog.proto.onEvent = function(callback){
    var dialog = this

    $(document.body).on('mouseenter',this.$tager.selector,function(e){
        var $el = $(this)

        


        // 这里的this是目标元素dom
        var $tip = dialog.__getElement($el)


        if($tip && $tip.length){
            

            // 忽略ignore列表中的元素
            if(dialog.config.ignore && $el.parents(dialog.config.ignore).length){
                console.log('=======================================================')
                console.log($el,dialog.config.ignore,$el.parents(dialog.config.ignore))
                console.log('=======================================================')
                return;
            }

            //todo:特殊处理所有相关元素全部隐藏
            $('[data-highcharts-chart]').hide()

            // 显示内容
            $tip.show()

            // 设置位置
            Dialog.position($el, $tip, dialog.config)

            // 执行回调
            callback && callback('show',$tip)

            // 绑定一次性事件
            // 当鼠标离开时
            $tip.one('mouseleave',function(e){

                // 隐藏自己
                $tip.hide()

                // 执行回调
                callback && callback('hide',$tip)
            })
        }
    })
}

/**
 * 获取元素
 */
Dialog.proto.__getElement = function($el){

    var id = Dialog.filter($el.attr('href'), this.config.rex)

    if(id){
        return $('#ext-trend-' + id[1])
    }
}

/**
 * 计算位置
 */
Dialog.position = function(tager, tip, config){
    var left = 0, top = 0
      , tager = tager.children().length ? tager.children() : tager


    // 如果 元素位置 + 元素宽度 + 弹框宽度 < 浏览器宽度
    if(tager.offset().left + tager.outerWidth() + 260 + config.left < $(document.body).outerWidth()){
        // 在右边弹出
        left = tager.offset().left + tager.outerWidth() + config.left

        
    }
    else{
        // 在左边弹出
        left = tager.offset().left - tip.outerWidth() - config.left

    }

    // console.log("显示器",$(document.body).outerWidth())
    // console.log("元素位置",tager.offset().left)
    // console.log("元素宽度",tager.outerWidth())
    // console.log("弹框宽度",tip.outerWidth())
     

    // 元素高度小于目标区域高度
    if(tip.outerHeight() < tager.outerHeight()){
        top = tager.offset().top + (tager.outerHeight() / 2) + config.top
    }

    else{
        // 高度取目标高度 + 偏移高度
        top = tager.offset().top + config.top
    }


    // 显示当前选中的对应弹框
    tip.offset({
        left : left,
        top  : top
    })

}

/**
 * 过滤超链
 */
Dialog.filter = function(href,rex){
    if(href && href.indexOf('javascript') == -1){
        return href.match(rex)
    }
}

module.exports = Dialog;

// Dialog('a',{
//     left:10
// },function(){
//  
// })
});
require.register("smzdm_pro/source/plug/analytics.js", function(exports, require, module){
/**
 * 统计
 */
var $ = require('../lib/jquery');

// todo:传参后工作
var Statistic = function () {

}

Statistic.start = function () {
    window._gaq = window._gaq || [];
    window._gaq.push(['_setAccount', 'UA-41150971-1']);
    window._gaq.push(['_trackPageview']);
}

Statistic.collect = function (el, ev, type) {
    // ga('send', 'event', el, ev, type, value);
    _gaq.push(['_trackEvent', type, el, ev]);
}

// 置入外部文件
Statistic.loadFile = function (url, type, onload) {
    var domscript = type == 'js' ? document.createElement('script') : document.createElement('link');
    if (type == 'js') {
        domscript.src = url;
        domscript.charset = 'utf-8';
    } else if (type == 'css') {
        domscript.href = url;
        domscript.rel = 'stylesheet';
        domscript.type = 'text/css';
    }
    if (onload) {
        domscript.onloadDone = false;
        domscript.onload = onload;
        domscript.onreadystatechange = function () {
            if ("loaded" === domscript.readyState && domscript.onloadDone) {
                domscript.onloadDone = true;
                domscript.onload();
                domscript.removeNode(true);
            }
        };
    }
    document.getElementsByTagName('head')[0].appendChild(domscript);
}

module.exports = Statistic;

// 类化，使用采集实例，融合日志和工作环境
});
require.register("smzdm_pro/source/plug/keynote.js", function(exports, require, module){
/**
 * 重点采集
 * by kerring 2014.11.25
 * 依赖海淘
 */

var $ = require('../lib/jquery')
  , avalon = require('../lib/avalon')
  , DBoy = require("../src/core/DBoy")
  , config = require('../config/config')
  , sea = require('./sea')

var keynote = avalon.define('keynoteRange', function(vm){
	vm.name = '<span id="smzdm_keynote" title="点击发送">采集</span>'
	vm.status = false
	vm.price = {}

	vm.init = function(options){
        // 确认权限
        // if(!DBoy.local('smzdm_identity')) return false

        keynote.status = true
		$(function(){
			keynote.price = sea.price.$model
			$('#smzdm_keynote')
			.on('click', function(){
				keynote.update(function(data){
					if(data.Success){
						$('#smzdm_keynote').html('采集成功')
						$('#smzdm_keynote').parent().parent().addClass('out')
						setTimeout(function(){
							$('#smzdm_keynote').parent().parent().remove()
						},10000)
					}
				})
			})
			.parent().parent().addClass('smzdm_keynote')
		})
	}

	vm.fill = function(panel){}

	vm.update = function(callback){
		var url = window.location.href
		  , price = keynote.price

		var newprice = price.getdollarprice ? parseFloat(price.getdollarprice[0].replace(/\$|￥/g,'')) : ''

		DBoy.post(config.url.diffSubmit, {
			sn : config.app.tny,
			url: url,
			type: 'special',
			newprice: newprice
		}, function(data){
			console.log(data)
			callback(JSON.parse(data))
		})
	}
})

module.exports = keynote
});
require.register("smzdm_pro/source/view/background.js", function(exports, require, module){
/**
 * 背景层
 */

var DBoy = require('../src/core/DBoy')
  , noti = require('../src/core/notice')
  , Message = require('../src/data/message')
  , Favorites = require('../src/data/favorites')
  , options = require('../src/data/options') 
  , statistic = require('../plug/analytics')
  , conf = require('../config/config')

/*
// 开启通讯
var io = require('../lib/io')
console.log('io-----',io)
var socket = io.connect('ws://m.smzdm.com:3001', {'reconnect': true})
socket.on('connect', function(data) {
    console.log("Connected to Server")
});
socket.on('alaxList', function(data){
    console.log('data',data)
})
*/

// 插件自检
// Manager.init()

// 22+内核浏览器需要开启通知监听
noti.on(function(notice, index){
    Message.isRead(notice.msg_id)
    if( DBoy.unit.browType()['se'] ){
        index = (index == 0) ? 1 : 0
    }
    if(index == 0){
        DBoy.unit.goto(notice.link1, true)
    }else if(index == 1){
        // 增加通知收藏功能 by 14.12.29
        Favorites.add({
            msg_id: notice.msg_id,
            type  : conf.app.variety[notice.variety]
        }, function(result){})
    }else{
        DBoy.unit.goto(notice.link1, true)
    }
})

// 初始化版本
options.base(function(){
    Message.init() // 推送初始化
    options.init() // 设置初始化
    statistic.start() // 开启谷歌统计
    //require('../src/core/message').on() // 开启交互监听
    require('../src/core/ext') // 扩展浏览器兼容
})



});
require.register("smzdm_pro/source/view/notification.js", function(exports, require, module){
/**
 * 浏览器通知框
 */
var DBoy = require('../src/core/DBoy');
var Message = require("../src/data/message")
var avalon = require('../lib/avalon');
var ex = require('../src/core/notice')

var a = document.createElement("a");
a.href = location.href;

var params = (function() {
    var ret = {}
      , seg = a.search.replace(/^\?/, "").split("&")
      , s;
    
    for (var i = 0, l = seg.length; i < l; i++) {
        if (!seg[i]) {
            continue;
        }
        s = seg[i].split("=");
        ret[s[0]] = s[1];
    }
    return ret;
})()

var noti = avalon.define('notification',function(vm){
    vm.msg = {}
    vm.title = ""
    vm.date = ""
    vm.desc = ""
    vm.imgSrc = ""
    vm.isBuy = true

    vm.toInfo = function(url){
        DBoy.unit.goto(url)
    }
    vm.fill = function(){
        if(params.msg_id > 0){
            Message.getNotification(params.msg_id,function(data){ 
				
														   
                noti.msg = data
                if(noti.msg.msg_buyurl == ""){
                    noti.isBuy = false
                }
                noti.title = decodeURI(noti.msg.msg_title) 
                noti.date = DBoy.unit.getTime(parseInt(noti.msg.msg_date*1000))
                noti.desc = decodeURI(noti.msg.msg_desc)
                noti.imgSrc = noti.msg.msg_picurl == "logo" ? '/assets/img/logo128.png' : noti.msg.msg_picurl || "/assets/img/logo128.png"
            })
        }
        else{
            noti.title = "品牌消费第一站"
            noti.date = "2012:12:12 12:12:12"
            noti.desc = "“什么值得买”是一个中立的，致力于帮助广大网友买到更有性价比网购产品的推荐类博客。“什么值得买”的目的是在帮助网友控制网"
            noti.msg.msg_url = "http://www.smzdm.com"
            noti.msg.msg_buyurl = "http://www.smzdm.com"
            noti.imgSrc = "/assets/img/logo128.png"
        }   
    }
})

noti.fill()
});
require.register("smzdm_pro/source/view/options.js", function(exports, require, module){
/**
 * 设置页面
 * @author s
 * @date   2014/06/01
 * @time   24:00
 */
 
 
var avalon = require('../lib/avalon')
  , noti = require('../src/core/notice')
  , Message = require('../src/data/message')
  , options = require('../src/data/options')
  , DBoy = require('../src/core/DBoy')
  , unit = DBoy.unit

var config = require('../config/config')
var statistic = require('../plug/analytics')

// 开启监听
statistic.start()

/**
 * 导航栏
 */
avalon.define('navbarRange',function(vm){
    // 版本信息
    vm.name = JSON.parse(DBoy.local('manifest')).name || '';
    // 关于本插件
    vm.about = function(){
        // 弹出插件说明
        about.show() 
    }
})


/**
 * 基本设置
 */
var base = avalon.define('baseRange',function(vm){ 
    // 读取本地数据
    vm.option = {
        desktop     : 'on', // 桌面提醒
        muteTime    : 'off',// 静音时间
        beginTime   : '23:00',// 静音开始时间
        closureTime : '8:00',// 静音结束时间
        sound       : 'on',//声音提醒
        count       : '100',// 最近信息保留条数
        locus       : 'cn;global',// 所在地
        open_back   : 'on'
    }

    vm.baidubrowser = !DBoy.unit.browType()['baidu'] ? true : false

    vm.audiBtn = '试听'// 试听按钮文字提示
    vm.isPlay = false// 播放中

    // 切换选项卡
    vm.changeCheckBox = function(item){
		
        options.setBase(item);
        base.fill()
        // 记录
        statistic.collect(item, 'change','base', DBoy.local(item))
    }

    // 观看弹窗样式
    vm.showReminder = function(){
        noti.notice(noti.demo,'on')
    }

    // 试听
    vm.audition = function(){
        var audio = new Audio("/assets/notify.mp3");
        // 开始播放
        audio.addEventListener('play', function() {
            base.audiBtn = '播放中...'
            base.isPlay = true
        });
        // 结束播放
        audio.addEventListener('ended', function() {
            base.audiBtn = '试听'
            base.isPlay = false
        });
        // 播放音频
        audio.play();
    }

    // 最近信息保留条数
    vm.changeCount = function(num){
        base.option.count = num
        options.setLimit(num)
    }

    // 设置开始时间
    vm.changeBeginTime = function(e){
        options.setBeginTime(e.target.value)
    }

    // 设置结束时间
    vm.changeclosureTime = function(e){
        options.setClosureTime(e.target.value)
    }

    // 填充数据
    vm.fill = function(){
        base.option = options.getBase()
    }

})







/**
 * 推送分类设置
 */
var pull = avalon.define('pullRange',function(vm){
    // 读取本地数据
    vm.option = {
        locus: 'cn;global'// 所在地
    }
    vm.specialList = []
    vm.categoryList = []
    vm.other = 'on'
    vm.basic = 'on'

    // 填充数据
    vm.fill = function(){
        // alert('调用');
        var data = options.getPush()
        pull.specialList = data.specialList
        pull.categoryList = data.categoryList.slice(0)
        pull.other = options.getOther()
        pull.basic = options.getBasic()
        pull.option.locus = DBoy.local('item_location')
    }

    // 地域
    vm.changeLocus = function(str){
       pull.option.locus = str
       options.setLocation(str)
    }

    // 改变状态
    vm.changeEnable = function(el){
        options.changePull(el)
        // 记录
        statistic.collect(el.id,'change','base', el.value)
    }

    // 每日精选
    vm.changeBasic = function(){
        pull.basic = options.changeBasic()
    }

    // 改变其他
    vm.changeOther = function(){
        pull.other = options.changeOther()
    }
})

// 填充推送
pull.fill()

/**
 * 关键字订阅
 */
var key = avalon.define('keywordRange',function(vm){
    vm.keyword = "";
    
    vm.onBlur = function(){
        options.setKeyword(key.keyword)
    }

    vm.fill = function(){
        key.keyword = options.getKeyword()
    }
})

// 填充关键字
key.fill()

/**
 * 关于本插件弹窗
 */
var about = avalon.define('aboutRange',function(vm){
    vm.name = JSON.parse(DBoy.local('manifest')).name;// 版本名称
    vm.isShow = false;// 窗口显示状态
    vm.tabId = 0;// 当前选中项
    vm.btnStr = "发送";
    vm.isSubmit = false;// 发送状态

    vm.question_desc = ''// 问题描述
    vm.os_version = ''// 环境信息
    vm.username = ''// 姓名或网名
    vm.contact_info = ''// 联系方式
    vm.error = ""
    // 显示
    vm.show = function(){
        about.isShow = true;
    }
    // 隐藏
    vm.hide = function(){
        about.isShow = false;
    }

    // 评分
    vm.grade = function(){
    }

    // 切换选项卡
    vm.changeTab = function(id){
        about.tabId = id
    }

    vm.$watch('error', function(str){
        if(str != ''){
            setTimeout(function(){
                about.error = ''
            },8000)
        }
    })

    // 提交反馈
    vm.submit = function(){

        //修复avalon双向绑定bug
        about.question_desc = document.getElementById('question_desc').value;
        about.username = document.getElementById('username').value;
        about.os_version = document.getElementById('os_version').value;
        about.contact_info = document.getElementById('contact_info').value;

        if(about.question_desc == ""){
            return about.error = "问题描述不能为空"
        }
        if(about.username == ""){
            return about.error = "姓名或网名不能为空"
        }
        if(about.os_version == ""){
            return about.error = "环境信息不能为空"
        }
        if(about.contact_info == ""){
            return about.error = "联系方式不能为空"
        }

        about.btnStr = "发送中...."
        about.isSubmit = true

        options.reportSub({
            question_desc:about.question_desc,
            os_version:about.os_version,
            username:about.username,
            contact_info:about.contact_info
        },function(){
            alert.show('提交成功')

            about.hide()
            about.tabId = 0;
            about.btnStr = "发送"
            about.isSubmit = false
            about.error = ""
            about.question_desc = ''// 问题描述
            about.os_version = ''// 环境信息
            about.username = ''// 姓名或网名
            about.contact_info = ''// 联系方式
        })
    }
    // 当前版本
    vm.current = {new: false, ui: null, bug: null, dateline: 0, version: null, type: 0 };
    // 历史版本
    vm.update = [];
    // 获取日志
    vm.getLog = function(backcall){
        var time = unit.timestamp(unit.timeFormat(new Date(), 'yyyy-MM-dd h'));
        options.getDetails(function(d){
            if(DBoy.local('version') != d.version || !DBoy.local("smzdm_updateline") || ((time - DBoy.local("smzdm_updateline")) > 168)){
                DBoy.get(config.url.VERSIONUPDATE, function(data) {
                    if (data && data != "") {
                        DBoy.local("smzdm_update", JSON.stringify(data))
                        DBoy.local("smzdm_updateline", time);
                        backcall(data);
                    }
                });
            }else{
                backcall(JSON.parse(DBoy.local("smzdm_update")))
            }
        })
    };
})



// 填充日志
about.getLog(function(D){
    var type = JSON.parse(DBoy.local('manifest')).type;   //获取本地保存的属性manifest中的type的值
	
    for(var i = 0; i < D.length; i++){   //按照获取到的json中所有版本总数量循环
        (D[i].type==type) && about.update.push(D[i]);   //如果获取到的type等于本地的type，就把获取到的信息添加到 about.update数组中
    }
	
    about.current = about.update.length > 0 ? about.update[0] : about.current;      //如果about.update（历史版本）有数据的话，把其中第一个设为当前版本，否则就把默认的设为当前版本
    about.update = about.update.slice(1)   //历史版本设为排除第一个之外剩下的全部
	
	
});

// 版本号更新时
if(options.getUpdateStatus() === 'true'){
    about.show()
    options.setUpdateStatus(false)
}

/**
 * 提示弹框
 */
var alert = avalon.define('alertRange',function(vm){
    vm.active = false;
    vm.message = ''

    // 显示
    vm.show = function(msg){
        alert.message = msg
        alert.active = true

        // 开启遮罩
        backdrop.show()
    }

    // 隐藏
    vm.hide = function(){
        alert.message = ''
        alert.active = false

        // 关闭遮罩
        backdrop.hide()
    }
})

/**
 * 遮挡层
 */
var backdrop = avalon.define('backdropRange',function(vm){
    
    vm.active = false;// 显示控制

    // 显示
    vm.show = function(){
        backdrop.active = true
    }

    // 隐藏
    vm.hide = function(){
        backdrop.active = false
    }
})


//从服务器获取本人的设置参数覆盖到本地
//判断登录状态
;(function(){
	var local_login_state = localStorage.getItem("save_login_state");
	//没登录，读取本地设置
	if(local_login_state === 'false'){
		//读取本地基本设置数据
		base.fill();
	}else{
		//登录了，读取服务器设置
		var _options = {};
		_options['f'] = 'chrome';
		_options['token'] = localStorage.getItem('user_name');   //传输用户信息的token
		// 从接口获取服务器上的设置数据
		DBoy.post('http://api.smzdm.com/v1/util/update/is_chrome',_options,function(data){
			for(var a in data.data){
				localStorage.setItem(a,data.data[a]);   //从服务器获取当前用户的存储设置并盖到本地缓存
			}
			base.fill();
			pull.fill();
			key.fill();
		});
	}
}()); 




});
require.register("smzdm_pro/source/view/popup.js", function(exports, require, module){
/**
 * 弹窗视图类
 * @author s
 * @date 2014/06/05
 * @time 10:00
 */
var avalon = require('../lib/avalon')
    , ex = require('../src/core/notice')
    , message = require('../src/data/message')
    , User = require('../src/data/user')
    , Favorites = require('../src/data/favorites')
    , DBoy = require('../src/core/DBoy')
    , statistic = require('../plug/analytics')
    , options = require('../src/data/options')
    , conf = require('../config/config')
    , $ = require('../lib/jquery')

// 开启popup时清空
ex.setBadge('')

/**
 * 功能区
 */
var ribbon = avalon.define('ribbonRange', function (vm) {
    vm.userinfo = {} // 登录信息
    vm.isLogin = false // 登录
    vm.isSignIn = false // 签到

    // 退出登录
    vm.logout = function () {
        User.logout()
        ribbon.isLogin = false
        ribbon.isSignIn = false // 签到

        /* 退出后还原状态 */
        notify.show() // 显示商品
        favorites.hide() // 隐藏收藏
        tabs.tabId = 0 // 切换选项卡

        login.clear()
    }

    // 打开登录弹窗
    vm.login = function () {
        login.show()
    }
    // 注册
    vm.register = function () {
        DBoy.unit.goto('https://zhiyou.smzdm.com/user/register/mobile')
    }
    // 爆料
    vm.tipoff = function () {

        //跳转
        if (cache_url !== 'chrome://newtab/') {
            var baoliao_url = 'from_url=' + encodeURIComponent(cache_url);
            DBoy.unit.goto('http://www.smzdm.com/submit?' + baoliao_url + '&utm_source=chrome&utm_medium=Push&utm_campaign=baoliao&utm_Content= ')
            return false;
        }

        //网址为空白tab页则不传网址
        DBoy.unit.goto('http://www.smzdm.com/submit?' + '&utm_source=chrome&utm_medium=Push&utm_campaign=baoliao&utm_Content= ')

    }
    // 签到
    vm.signIn = function () {
        // 跳转到签到地址
        DBoy.unit.goto('http://www.smzdm.com/qiandao' + '?utm_source=chrome&utm_medium=Push&utm_campaign=qiandao&utm_Content= ')
    }
})

// logo动态控制
avalon.define('logoRange', function (vm) {
    vm.background = JSON.parse(DBoy.local('manifest')).type == 1 ? '../../assets/img/logo.jpg' : '../../assets/img/logo.png';
})

// 本地登录
User.localLogin(function (u) {

    ribbon.isLogin = true
    ribbon.isSignIn = u.isSignIn // 签到
    ribbon.userinfo = u
})


/**
 * 登录
 */


var login = avalon.define('loginRange', function (vm) {
    vm.msg = ''// 验证消息
    vm.isShow = false;// 显示状态
    vm.btnStr = '登 录'
    vm.check = false// 验证码显示
    vm.checklink = ''// 验证码图片

    vm.info = { // 登录信息
        username: '',// 登录名
        password: '',// 登录密码
        checkcode: '',// 验证码
        isSave: true,// 是否保存
        nickname: ''
    }

    // 登录
    vm.submit = function () {

        //修复avalon双向绑订bug（中文输入法最后确认把文字打上去的时候，此时双向绑定会失效）,重新获取内容
        login.info.username = $('#login_username').val();
        login.info.password = $('#login_password').val();

        // 验证内容
        if (login.info.username === '') {
            login.msg = "账户或密码不能为空"
            return;
        }
        if (login.info.password === '') {
            login.msg = "账户或密码不能为空"
            return;
        }
        // 请求数据
        User.login(login.info, function (u) {

            if (u.error_code > 0) {
                login.msg = u.error_msg


                // 超过3次发送验证码
                if (u['data']['login_error_num'] >= 3) {
                    login.check = true
                    login.checklink = require('../config/config').url.captcha()
                }
                return false
            }
            // 关闭登录弹窗
            login.hide()
            login.info.nickname = u.display_name
            ribbon.isLogin = true
            ribbon.isSignIn = u.checkin.web_has_checkin
            ribbon.userinfo = login.info


            // 登录后更新收藏夹
            favorites.fill()
        })
    }

    // 输入框回车
    vm.inputSub = function (e) {
        if (e.keyCode === 13) {
            login.submit()
        }
    }

    // 是否保存登录
    vm.changeSave = function () {
        login.info.isSave = login.info.isSave ? false : true
    }

    // 刷新验证码
    vm.changeCheckcode = function () {
        login.checklink = login.checklink + '&v=' + new Date()
    }

    vm.clear = function () {
        login.info.username = ''// 登录名
        login.info.password = ''// 登录密码
    }

    // 隐藏
    vm.hide = function () {
        login.isShow = false;
        // 关闭遮罩
        backdrop.hide()
    }
    // 显示
    vm.show = function () {
        login.isShow = true;
        // 开启遮罩
        backdrop.show()
    }
    // 监听报错定时清空
    vm.$watch('msg', function () {
        if (login.msg != '') {
            setTimeout(function () {
                login.msg = ''
            }, 5000)
        }
    })
})

/**
 * 选项卡和搜索
 */
var tabs = avalon.define('tabsRange', function (vm) {
    vm.unread = 0;// 未读消息数量
    vm.count = 0;// 总消息数量

    vm.searchStr = '请输入关键字' // 搜索文字

    vm.tabId = 0;// 当前选中tab
    //vm.num = 0;// 我的收藏数量

    vm.getSearchValue = function(){
        //修复avalon双向绑订bug（中文输入法最后确认把文字打上去的时候，此时双向绑定会失效）,重新获取内容
        return $('#search_input').val();
    }

    // 回车搜索
    vm.searchKey = function (e) {
        // 跳转到搜索结果页面
        if (e.keyCode === 13) {
            DBoy.unit.goto('http://search.smzdm.com/?utm_source=chrome&utm_medium=Push&utm_campaign=Search&utm_Content= ' + '&s=' + tabs.getSearchValue())
        }
    }

    // 按钮搜索
    vm.searchBtn = function () {
        DBoy.unit.goto('http://search.smzdm.com/?utm_source=chrome&utm_medium=Push&utm_campaign=Search&utm_Content= ' + '&s=' + tabs.getSearchValue())
    }

    // 切换选项卡
    vm.changeTab = function (id) {
        tabs.tabId = id
        if (id === 0) {
            notify.show()
            favorites.hide()
        }
        else {
            // 未登录时打开登录弹窗
            if (!ribbon.isLogin) {
                tabs.tabId = 0
                return ribbon.login()
            }
            favorites.show()
            notify.hide()
        }
    }

})


// 设置默认搜索词
DBoy.get(conf.url.searchword(), function (data) {
        tabs.searchStr = data.data.option_value;// 搜索文字
    }
);


// 推送列表
var notify = avalon.define('notifyRange', function (vm) {
    vm.active = true;// 选项卡状态
    vm.activeIn = true;// 选项卡状态
    vm.list = [];// 商品列表
    vm.addFlag = false;

    // 勿扰
    vm.noti_desktop = DBoy.local('noti_desktop')
    vm.disturb = function () {
        options.setBase('noti_desktop')
        notify.noti_desktop = DBoy.local('noti_desktop')
        favorites.noti_desktop = DBoy.local('noti_desktop')
    }

    // 查看更多
    vm.more = function () {
        DBoy.unit.goto('http://www.smzdm.com/?utm_source=chrome&utm_medium=Push&utm_campaign=Tixing&utm_Content=Gengduo')

        // 记录
        statistic.collect('button', 'click', 'more')
    }

    // 显示
    vm.show = function () {
        notify.active = true
        notify.activeIn = true
    }

    // 隐藏
    vm.hide = function () {
        notify.active = false
        notify.activeIn = false
    }

    // 删除全部
    vm.clear = function () {
        // 删除数据
        message.clear(function () {
            notify.activeIn = false// 动画效果
            tabs.count = 0// 清空计数
            tabs.unread = 0// 清空未读

            setTimeout(function () {
                notify.fill()
            }, 1)

            setTimeout(function () {
                notify.activeIn = true
            }, 500)
        })

        // 记录
        statistic.collect('button', 'click', 'removeAll')
    }

    // 打开商品链接
    vm.toInfo = function (e, url) {
/*
        // 检测是否是谷歌内核(可排除360及谷歌以外的浏览器)
        function isChrome(){
            var ua = navigator.userAgent.toLowerCase();
            return ua.indexOf("chrome") > 1;
        }
        // 测试mime
        function _mime(option, value) {
            var mimeTypes = navigator.mimeTypes;
            for (var mt in mimeTypes) {
                if (mimeTypes[mt][option] == value) {
                 return true;
                }
            }
            return false;
        }
        var is360 = _mime("type", "application/vnd.chromium.remoting-viewer");
        // 检查是否是360浏览器
        if (isChrome() && is360) {
            //判断是否是淘宝客链接
            var taobao = true
            if(taobao){
                alert.show('当前链接是淘宝客链接，确认跳转？','button',function (){
                    e.preventDefault()
                    DBoy.unit.goto(url)
                    // 记录
                    statistic.collect('a', 'click', 'commodity')
                });
            }else{
                e.preventDefault()
                DBoy.unit.goto(url)
                // 记录
                statistic.collect('a', 'click', 'commodity')
            }
        }else{
        */
            e.preventDefault()
            DBoy.unit.goto(url)
            // 记录
            statistic.collect('a', 'click', 'commodity')
        /*
        }
        */
    }

    vm.optionCheck = function () {
        if (DBoy.unit.browType()['se']) DBoy.unit.goto('options.html')
        else DBoy.unit.goto('html/options.html')
    }

    // 添加收藏
    vm.addFav = function (info, index, dom) {
        alert.buttonShow = false;
        var info = info.$model
        // 未登录时打开登录弹窗
        if (!ribbon.isLogin) return ribbon.login()

        //添加收藏状态
        //	var _option = info.id
        //	notify.fav._option = 'true';
        //执行视觉变化操作
        var type = conf.app.variety[info.variety] || 'youhui'
        if (!notify.addFlag) {
            notify.addFlag = true
            Favorites.add({
                msg_id: info.id,
                type: type
            }, function (result) {
                notify.addFlag = false
                //如果参数不为0则收藏失败
                if (result.error_code != 0) {
                    alert.show('收藏失败');
                    setTimeout(function () {
                        alert.hide();
                    }, 3000)
                    return false;
                }

                //收藏成功
                alert.show(result.error_msg)
                // 修改当前收藏按钮（颜色）状态
                $(dom).addClass('icon-fave-ed');

                // 添加cookie
                var cookie_name = 'product' + info.id
                var cookie_value = true;
                document.cookie = cookie_name + '=' + cookie_value;

                //弹出提示
                setTimeout(function () {
                    alert.hide();
                }, 3000)

                // 动画效果
                // 设置移除渐变
                //info.fade = true
                // 动画结束后删除元素
                //setTimeout(function(){
                //    notify.fill()
                //    //tabs.num = DBoy.cookie('smzdm-fav')
                //},300)
            })
        }
        // 记录
        statistic.collect('a', 'click', 'addFav')

    }

    // 分享
    vm.share = function (msg, id) {

        var appkey = '908111949'
            , appurl = 'http://v.t.sina.com.cn/share/share.php?'
            , msg = msg.$model || msg
            , url = msg.url
            , title = encodeURI(msg.title)// + ' ' + encodeURI(msg.price)
            , pic = msg.img || ''
            , topic = '　%23什么值得买Chrome插件%23'


        DBoy.unit.goto(appurl + 'appkey=' + appkey + '&url=' + url + '&title=' + title + topic + '&pic=' + pic, true)
    }

    // 填充列表
    vm.fill = function (callback) {
        // 获取数据
        message.getFill(function (list, numObj) {
            // 数据列表
            notify.list = list
            // 全部消息
            tabs.count = numObj.message_all
            // 未读消息
            tabs.unread = numObj.message_all_unread
            callback && callback()
        })
    }

    // 滚动
    vm.scroll = function (e) {
        var top = e.target.scrollTop

        DBoy.local("scrollTop", top)

    }
})


notify.fill(function () {
    // 开启监听
    statistic.start()
    // 修正渲染bug
    // document.querySelector('.container').style.overflow = "hidden"
    // 如果有未读消息
    if (tabs.unread > 0) {
        // 记录位置归0
        DBoy.local("scrollTop", 0)
    }else {
        document.querySelector('.notify_detail').scrollTop = DBoy.local("scrollTop")
    }
})

if (require('../src/core/ext')['open']) {
    require('../src/core/ext').popup(notify)
}

/**
 * 我的收藏
 */
var favorites = avalon.define('favoritesRange', function (vm) {
    vm.active = false;// 作用域状态
    vm.list = [];// 商品列表
    vm.favList = Favorites.getNav()// 导航
    vm.fav = 0;
//	vm.submenu = Favorites.getNav().

    vm.tabActive = vm.favList[0]// 当前选项卡
    vm.tabcache = function () {
        if (favorites.cachetitle == '众测报告' || favorites.cachetitle == '众测产品') {
            return '众测';
        } else if (favorites.cachetitle == '百科商品' || favorites.cachetitle == '百科话题') {
            return '百科';
        } else {
            return favorites.cachetitle;
        }

    };
    vm.cachetitle = '';
    vm.empty = false// 是否为空
    vm.magicleft = 0// 线条

    var oleft = 0

    // 勿扰
    vm.noti_desktop = DBoy.local('noti_desktop')
    vm.disturb = function () {
        options.setBase('noti_desktop')
        notify.noti_desktop = DBoy.local('noti_desktop')
        favorites.noti_desktop = DBoy.local('noti_desktop')
    }

    // 查看更多
    vm.more = function () {
        DBoy.unit.goto('http://www.smzdm.com/user/collection?utm_source=chrome&utm_medium=Push&utm_campaign=Shoucang&utm_Content=Gengduo')
        // 记录
        statistic.collect('button', 'click', 'favMore')
    }

    vm.optionCheck = function () {
        if (DBoy.unit.browType()['se']) DBoy.unit.goto('options.html')
        else DBoy.unit.goto('html/options.html')
    }

    // 显示
    vm.show = function () {
        favorites.active = true
    }

    // 隐藏
    vm.hide = function () {
        favorites.active = false
    }

    // 打开商品链接
    vm.toInfo = function (e, url) {

        /*
        // 检测是否是谷歌内核(可排除360及谷歌以外的浏览器)
        function isChrome(){
            var ua = navigator.userAgent.toLowerCase();
            return ua.indexOf("chrome") > 1;
        }
        // 测试mime
        function _mime(option, value) {
            var mimeTypes = navigator.mimeTypes;
            for (var mt in mimeTypes) {
                if (mimeTypes[mt][option] == value) {
                    return true;
                }
            }
            return false;
        }
        var is360 = _mime("type", "application/vnd.chromium.remoting-viewer");
        // 检查是否是360浏览器
        if (isChrome() && is360) {
            //判断是否是淘宝客链接
            var taobao = true
            if(taobao){
                alert.show('当前链接是淘宝客链接，确认跳转？','button',function (){
                    e.preventDefault()
                    DBoy.unit.goto(url)
                    // 记录
                    statistic.collect('a', 'click', 'favorites')
                });
            }else{
                e.preventDefault()
                DBoy.unit.goto(url)
                // 记录
                statistic.collect('a', 'click', 'favorites')
            }
        }else{
        */
            e.preventDefault()
            DBoy.unit.goto(url)
            // 记录
            statistic.collect('a', 'click', 'favorites')
        /*
        }
        */
    }

    // 删除收藏
    vm.remove = function (item) {
        var _id = item.$model.article_id;
        Favorites.remove({
            id: item.$model.article_id,
            type: favorites.tabActive.id
        }, function () {
            // 动画效果
            item.fade = true


            //清除指定的cookie
            function delCookie(name) {
                var date = new Date();
                date.setTime(date.getTime() - 10000);
                document.cookie = name + "=a; expires=" + date.toGMTString();
            }

            function getCookie(name) {
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg))
                    return unescape(arr[2]);
                else
                    return null;
            }

            if (getCookie('product' + _id)) {
                delCookie('product' + _id);
            }


            // 删除当前元素
            setTimeout(function () {
                favorites.list.remove(item)
                // tabs.num = DBoy.cookie('smzdm-fav')
                if (favorites.list.length === 0) {
                    favorites.empty = true
                } else {
                    favorites.empty = false
                }
            }, 300)
        })
    }


    // 分享
    vm.share = function (msg, id) {
        var appkey = '908111949'
            , appurl = 'http://v.t.sina.com.cn/share/share.php?'
            , msg = msg.$model || msg
            , url = msg.article_url
            , title = encodeURI(msg.article_title)// + ' ' + encodeURI(msg.article_price)
            , pic = msg.article_img || ''
            , topic = '　%23什么值得买Chrome插件%23'

        DBoy.unit.goto(appurl + 'appkey=' + appkey + '&url=' + url + '&title=' + title + topic + '&pic=' + pic, true)
    }

    // 填充收藏
    vm.fill = function () {

        // 当前标签为"众测"或者"百科"标签则不做任何处理
        if (favorites.tabActive.id == 'zhongce_false' || favorites.tabActive.id == 'wiki_false') {
            return false;
        }

        Favorites.getlist(favorites.tabActive.id, function (result) {
            if (result.data.rows.length === 0) {
                favorites.empty = true
            } else {
                favorites.empty = false
            }
            var data = result.data.rows

            //去除当前菜单加粗样式
            var bold_back = function () {
                $('.fav_notify').find('ul.nav-tabs').find('li').find('span').css('font-weight', '100');
            }


            for (var i in data) {
                // 添加默认图片
                data[i]['article_img'] = (data[i]['article_img'] != '') ? data[i]['article_img'] : '../assets/img/logo128.png'


                // 原创、资讯板块下不显示“相关” 这一标签
                if (favorites.tabActive.id == 'yuanchuang' || favorites.tabActive.id == 'news') {
                    data[i].related = false;
                }
                else {
                    data[i].related = true;
                }

                if (favorites.tabActive.id == 'wiki') {

                    data[i].article_price = false;

                }


                // 相关
                if (data[i]['article_tags_html']) {
                    var tags = data[i]['article_tags_html'].split(',')
                        , tag = []
                    if (tags.length > 0) {
                        for (var a in tags) {
                            var el = $(tags[a])
                            tag.push({
                                data: el.attr('data') + '?' + conf.app.census(),
                                html: el.html()
                            })
                        }
                    }
                    data[i]['article_tags_html'] = tag.length > 0 ? tag : false
                }


                data[i]['mall_link'] = data[i]['mall_link'] ? data[i]['mall_link'] + '?' + conf.app.census('Push', 'Shoucang', 'Mall') : ''


                //没有链接网址则不显示直达链接按钮

                if (data[i]['article_link'] == '') {
                    data[i]['article_link'] = false;
                }


                // 频道定义显示的时间前内容

                if (favorites.tabActive.id == 'wiki_topic') {      // 百科话题列表不显示图片
                    data[i]['article_img'] = false;
                } else if (favorites.tabActive.id == 'news') {
                    data[i]['mes'] = data[i]['article_rzlx']
                } else if (favorites.tabActive.id == 'yuanchuang' || favorites.tabActive.id == 'test') {
                    data[i]['mes'] = data[i]['article_referrals']
                } else {
                    data[i]['mes'] = data[i]['article_mall']
                }


                //去除当前菜单加粗样式
                bold_back();
                if (favorites.tabActive.id == 'test') {
                    for (var i = 0 , j = 7; i < j; i++) {
                        if ($('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('a').eq(0).html() == '众测') {
                            $('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('span').eq(0).css('font-weight', 'bold');
                        }
                    }
                } else if (favorites.tabActive.id == 'pingce') {
                    for (var i = 0 , j = 7; i < j; i++) {
                        if ($('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('a').eq(0).html() == '众测') {
                            $('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('span').eq(1).css('font-weight', 'bold');
                        }
                    }
                } else if (favorites.tabActive.id == 'wiki') {
                    for (var i = 0 , j = 7; i < j; i++) {
                        if ($('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('a').eq(0).html() == '百科') {
                            $('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('span').eq(0).css('font-weight', 'bold');
                        }
                    }
                } else if (favorites.tabActive.id == 'wiki_topic') {
                    for (var i = 0 , j = 7; i < j; i++) {
                        if ($('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('a').eq(0).html() == '百科') {
                            $('.fav_notify').find('ul.nav-tabs').find('li').eq(i).find('span').eq(1).css('font-weight', 'bold');
                        }
                    }
                }


            }

            favorites.list = data

        })
    }

    // 切换选项卡
    vm.change = function (item) {
        if (item.id == 'zhongce_false' || item.id == 'wiki_false') {
            return false;
        }
        else {
            favorites.cachetitle = item.title;
            favorites.tabActive = item
            favorites.fill()
            oleft = favorites.magicleft
        }

    }

    // 鼠标进入时移动线条
    vm.moveMagic = function (item) {
        favorites.magicleft = this.offsetLeft

        //下拉菜单控制
        if (item.submenu != false) {
            $(this).find('div').css('display', 'block');
        }

    }
    // 鼠标离开时还原线条
    vm.restore = function (item) {
        favorites.magicleft = oleft


        //鼠标离开时如果有下拉菜单就隐藏下拉菜单
        var _this = this;

        if (item.submenu != false) {
            $(_this).find('div').css('display', 'none');
        }

        $(_this).find('div').hover(
            function () {
                $(this).css('display', 'block');
            }
        )

    }

})

favorites.fill()

/**
 * 提示弹框
 */
var alert = avalon.define('alertRange', function (vm) {
    vm.active = false;
    vm.message = ''
    vm.buttonShow = true
    // 显示
    vm.show = function (msg,button,fn) {
        alert.message = msg
        alert.active = true

        if(button && fn){
            vm.buttonShow = true
            alert.goto = fn;
        }
        // 开启遮罩
        backdrop.show()
    }

    // 隐藏
    vm.hide = function () {
        alert.message = ''
        alert.active = false
        vm.buttonShow = false
        // 关闭遮罩
        backdrop.hide()
    }

    vm.agree = function(){
        alert.hide();
        alert.goto();   //打开标签页面
    }

})

/**
 * 遮挡层
 */
var backdrop = avalon.define('backdropRange', function (vm) {

    vm.active = false;// 显示控制

    // 显示
    vm.show = function () {
        backdrop.active = true
    }

    // 隐藏
    vm.hide = function () {
        backdrop.active = false
    }
})


//缓存当前页面url
var cache_url;

//通过浏览器标签切换把当前页面url赋值给cache_url
chrome.windows.getCurrent(function (currentWindow) {
    //获取有指定属性的标签，为空获取全部标签
    chrome.tabs.query({
        active: true, windowId: currentWindow.id
    }, function (activeTabs) {
        // console.log("Taburl:" + activeTabs[0].url);
        cache_url = activeTabs[0].url;
    });
});


//搜索框点击状态
$('input.search').focus(
    function () {
        $('li.notice').addClass('hover_search_button');
        if (this.value == '请输入关键字') {
            this.value = ''
        }
    }
)
$('input.search').blur(
    function () {
        $('li.notice').removeClass('hover_search_button');
        if (this.value == '') {
            this.value = '请输入关键字';
        }
    }
)




});
require.alias("smzdm_pro/source/main.js", "smzdm_pro/index.js");
if (typeof exports == 'object') {
  module.exports = require('smzdm_pro');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('smzdm_pro'); });
} else {
  window['App'] = require('smzdm_pro');
}})();