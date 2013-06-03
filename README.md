fis-preprocessor-require-async
=============================

分析使用了require.async执行的组件，并把它们记录下来


help
----

+ install
    
        npm install -g fis-preprocessor-require-async

+ config

        
        vi fis-conf.js

        fis.config.merge({
            modules: {
                preprocessor: {
                    js: 'require-async',
                    tpl: 'require-async'
                    ...
                }
            }
            ...
        });
