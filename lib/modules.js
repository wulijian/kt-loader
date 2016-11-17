/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */

var fs = require('fs');
var path = require('path');
var tp = require('jstm');
var uglify = require('uglify-js');

/**
 * debug阶段转换合成以后的js代码中图片和css的路径，将相对于js文件的路径转换为相对于主页的路径
 * 默认.html都是在项目根文件夹下。如果，在模板中创建文件夹，文件夹中含有子模板，子模板中引用的图片的
 * 如：
 * index.html
 * src/template
 *  -a.js  <img src='./b.jpg'>
 *  -b.jpg
 * 转换后：
 *  -a.js  <img src='/src/template/b.jpg'>
 *
 * @param tempName
 * @param code 需处理的代码
 */
var alterSourcePath = function (tempName, code) {
    code = code.replace(/<(img)\s+[\s\S]*?["'\s\w\/]>\s*/ig, function (m) {
        var getSrc = m.match(/(?:\ssrc\s*=\s*)(['"]?)([^'"\s]*)\1/);
        var sourceSrc = getSrc[2];
        if (sourceSrc.indexOf('http') === 0 ||//网上的资源，直接返回，不处理
            sourceSrc.indexOf('data:') === 0 ||//base64的图片
            sourceSrc === '') {//空的图片地址不处理
            return m;
        }
        var sourceRealPath = '\'+JSON.stringify(require("' + sourceSrc + '"))+\'';
        return m.replace(sourceSrc, sourceRealPath.replace(/\\/g, '/'));
    });
    code = code.replace(/<(link)\s+[\s\S]*?["'\s\w\/]>\s*/ig, function (m) {
        var getSrc = m.match(/(?:\shref\s*=\s*)(['"]?)([^'"\s]*)\1/);
        var sourceSrc = getSrc[2];
        if (sourceSrc.indexOf('http') === 0 ||//网上的资源，直接返回，不处理
            sourceSrc === '') {//空的图片地址不处理
            return m;
        }
        var sourceRealPath = '\'+JSON.stringify(require("' + sourceSrc + '"))+\'';
        return m.replace(sourceSrc, sourceRealPath.replace(/\\/g, '/'));
    });
    return code;
};

/**
 * 编译一个模块
 * @param filedir
 * @param value
 * @returns {*}
 */
exports.buildTemplate = function (filedir, value) {
    var templateDir = path.resolve(filedir, value);
    var JsCode = "error", render, paramOut, templateCode;
    var tmpIndex = fs.readFileSync(path.join(templateDir, 'index.js'), 'utf-8');
    if (/___template___\((.*)\)/.test(tmpIndex)) {
        render = tp.compileAdaptive(templateDir, 'm');
        paramOut = tmpIndex.match(/___template___\((.*)\)/)[1];
        var functionBody = /function\s*.*?\{([\s\S]*)\}/;
        templateCode = 'var _data = ' + paramOut + ';' + render.toString().match(functionBody)[1];
        //模块模版的语法树
        JsCode = tmpIndex.replace(/return\s*___template___\((.*)\)/, templateCode);
    }
    if (/___template___es6\((.*)\)/.test(tmpIndex)) {// 为 ktemplate 支持es6
        render = tp.compileAdaptive(templateDir, 'm', true);
        paramOut = tmpIndex.match(/___template___es6\((.*)\)/)[1];
        render = render.replace(/}$/, '').split('"es6insertposition";')[1];//todo:
        templateCode = 'var _data = ' + paramOut + ';' + render;
        //模块模版的语法树
        JsCode = tmpIndex.replace(/return\s*___template___es6\((.*)\)/, templateCode);
    }

    JsCode = alterSourcePath(value, JsCode); //将模块名称传到模块的模板中
    return JsCode;
};
