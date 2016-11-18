/**
 * 模板编译
 */
var path = require("path");
var beautify = require('js-beautify').js_beautify;
var beautify = require('js-beautify').js_beautify;

module.exports = function (source, sourcemap) {
    var templateDir = path.normalize(this.query.replace(/^\?/, ''));
    var callback = this.async();
    var modeNameReg = new RegExp(templateDir.replace(/([\\])/g, function ($0, $1) {
            return $1 + $1;
        }) + '([\\\/\\\\])(.*)\\1.*$');
    if (sourcemap.sources.length > 0) {
        var modenamem = sourcemap.sources[0].match(modeNameReg);
        if (modenamem !== null) {
            callback(null, beautify(require('./lib/modules').buildTemplate(path.resolve(process.cwd(), templateDir), modenamem[2]), {indent: 4}));
        } else {
            callback(null, source);
        }
    } else {
        callback(null, source);
    }
};