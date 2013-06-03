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
    var reg = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))|\b(require\.async)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*')\s*/g;
    return content.replace(reg, function(m, comment, type, value){
        if(type){
            switch (type){
                case 'require.async':
                    var info = fis.uri.getId(value, file.dirname);
                    file.extras.async.push(info.id);
                    m = 'require.async(' + info.quote + info.id + info.quote;
                    break;
            }
        }
        return m;
    });
}

//<script|style ...>...</script|style> to analyse as js|css
function parseHtml(content, file, conf){
    conf.ld = conf.ld ? pregQuote(conf.ld) : '\\{%';
    conf.rd = conf.rd ? pregQuote(conf.rd) : '%\\}';
    var reg = /(<script(?:\s+[\s\S]+?["'\s\w\/]>|>))([\s\S]*?)(?=<\/script>|$)/ig;
    content = content.replace(reg, function(m, $1, $2) {
        if($1){//<script>
            m = $1 + parseJs($2, file, conf);
        }
        return m;
    });
    reg = new RegExp('('+conf.ld+'script(?:\\s+[\\s\\S]+?["\'\\s\\w\\/]'+conf.rd+'|'+conf.rd+'))([\\s\\S]*?)(?='+conf.ld+'\\/script'+conf.rd+'|$)', 'ig');
    return content.replace(reg, function(m, $1, $2) {
        if($1){//<script>
            m = $1 + parseJs($2, file, conf);
        }
        return m;
    });
}

module.exports = function(content, file, conf){
    var initial = false;
    if (file.extras == undefined) {
        file.extras = {};
        initial = true;
    }
    file.extras.async = [];
    if (file.rExt === '.tpl' || file.rExt === '.html') {
        content = parseHtml(content, file, conf);
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