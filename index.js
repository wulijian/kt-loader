/**
 * 模板编译
 */
var path = require("path");
var beautify = require('js-beautify').js_beautify;

module.exports = function (source, sourcemap) {
    this.cacheable();
    var callback = this.async();
    if (sourcemap.sources.length > 0) {
        var modenamem = sourcemap.sources[0].match(/template\/(.*)\/.*$/);
        if (modenamem !== null) {
            callback(null, beautify(require('./lib/modules').buildTemplate(path.resolve(process.cwd(), './src/template'), modenamem[1]), {indent: 4}));
        } else {
            callback(null, source);
        }
    } else {
        callback(null, source);
    }
};