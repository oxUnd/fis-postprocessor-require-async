/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';
function pregQuote (str, delimiter) {
    // http://kevin.vanzonneveld.net
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

//require.async(path) to require resource
function parseJs(content, file, conf){
    var reg = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))|\b(require\.async)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\[[\s\S]*?\])\s*/g;
    return content.replace(reg, function(m, comment, type, value){
        if(type){
            switch (type){
                case 'require.async':
                    var hasBrackets = false;
                    var values = [];
                    value = value.trim().replace(/(^\[|\]$)/g, function(m, v) {
                        if (v) {
                            hasBrackets = true;
                        }
                        return '';
                    });
                    values = value.split(/\s*,\s*/);
                    values = values.map(function(v) {
                        var info = fis.util.stringQuote(v);
                        v = info.rest.trim();
                        file.extras.async.push(v);
                        return info.quote + v + info.quote;
                    });
                    if (hasBrackets) {
                        m = 'require.async([' + values.join(', ') + ']';
                    } else {
                        m = 'require.async(' + values.join(', ');
                    }
                    break;
            }
        }
        return m;
    });
}

//<script|style ...>...</script|style> to analyse as js|css
function parseHtml(content, file, conf){
    var ld = pregQuote(conf.ld);
    var rd = pregQuote(conf.rd);
    var reg = /(<script(?:\s+[\s\S]+?["'\s\w\/]>|>))([\s\S]*?)(?=<\/script>|$)/ig;
    content = content.replace(reg, function(m, $1, $2) {
        if($1){//<script>
            m = $1 + parseJs($2, file, conf);
        }
        return m;
    });
    reg = new RegExp('('+ld+'script(?:\\s+[\\s\\S]+?["\'\\s\\w\\/]'+rd+'|'+rd+'))([\\s\\S]*?)(?='+ld+'\\/script'+rd+'|$)', 'ig');
    return content.replace(reg, function(m, $1, $2) {
        if($1){//<script>
            m = $1 + parseJs($2, file, conf);
        }
        return m;
    });
}

module.exports = function(content, file, conf){

    conf.ld = conf.ld ? conf.ld : '{%';
    conf.rd = conf.rd ? conf.rd : '%}';

    var initial = false;
    if (file.extras == undefined) {
        file.extras = {};
        initial = true;
    }
    file.extras.async = [];
    if (file.rExt === '.tpl' || file.rExt === '.html') {
        content = parseHtml(content, file, conf);
        if (file.extras.isPage) {
            content = content.replace(new RegExp('(?:'+pregQuote(conf.ld) +'\\*[\\s\\S]+?(?:\\*'+pregQuote(conf.rd)+'|$))|(?:([\s\S]*)('+pregQuote(conf.ld)+'\\/block'+pregQuote(conf.rd)+'))'),
                function(m, before, blockClose) {
                    if (blockClose) {
                        m = before +
                            conf.ld + 'require name="' + file.id + '"' + conf.rd +
                            blockClose;
                    }
                    return m;
                }
            );
        }
    } else if (file.rExt === '.js') {
        content = parseJs(content, file, conf);
    }
    //
    if (file.extras.async.length == 0) {
        file.extras.async = undefined;
        if (initial) {
            file.extras = undefined;
        }
    }
    return content;
};