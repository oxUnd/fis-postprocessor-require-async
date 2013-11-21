
"use strict"

var fis = require('fis');
//设置项目路劲
fis.project.setProjectRoot(__dirname + '/require.async');
var PROJECT_ROOT = fis.project.getProjectPath();
//加载模块配置文件
require(PROJECT_ROOT + '/fis-conf.js');

var _ = fis.util;
var file = fis.file;

var expect = require('chai').expect;
var _parser = require(__dirname + '/../../index.js');



describe("require.async in a JavaScript file: ", function() {
	var f = file.wrap(PROJECT_ROOT + '/src/require.async.js');
	var res = _parser(f.getContent(), f, {});

	it('test content', function() {
		expect(res).to.equal("require.async('test:src/require.async.a.js');");
	});

	it ('test file.extras.async', function() {
		expect(f.extras).to.be.a('object');
		expect(f.extras.async).to.be.a('array');
		expect(f.extras.async).to.deep.equal(['test:src/require.async.a.js']);
	});

});

describe("require.async in comment: ", function() {
	var f = file.wrap(PROJECT_ROOT + '/src/require.async.comment.js');
	var res = _parser(f.getContent(), f, {});

	it ('test content', function() {
		expect(res).to.equal("// \n\n/*\n * \n */");
	});

	it ('test file.extras.async', function() {
		expect(f.extras).to.be.a('object');
		expect(f.extras.async).to.be.a('array');
		expect(f.extras.async).to.deep.equal(['test:src/require.async.comment.a.js', 'test:src/require.async.comment.b.js']);
	});
});

