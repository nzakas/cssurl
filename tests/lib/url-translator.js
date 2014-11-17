/**
 * @fileoverview Tests for URLTranslator
 * @author nzakas
 */

/*global describe, it*/

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
	leche = require("leche"),
	URLTranslator = require("../../lib/url-translator");

describe("URLTranslator", function() {

	describe("translate()", function() {

		leche.withData([
			[ "../../img/foo.png", "css/sprite/foo.css", "css/sprite.css", "../img/foo.png" ],
			[ "../img/foo.png", "css/foo.css", "css/sprite/foo.css", "../../img/foo.png" ]
		], function(url, from, to, expected) {
			it("should translate URL correctly when translating from " + from + " to " + to, function() {
				var translator = new URLTranslator();

				var result = translator.translate(url, from, to);
				assert.equal(result, expected);
			});

		});

		leche.withData([
			[ "data:foo", "css/sprite/foo.css", "css/sprite.css" ],
			[ "http://example.com", "css/foo.css", "css/sprite/foo.css", "../../img/foo.png" ],
			[ "https://example.com", "css/foo.css", "css/sprite/foo.css", "../../img/foo.png" ]
		], function(url, from, to) {
			it("should not translate URLs when passed " + url, function() {
				var translator = new URLTranslator();

				var result = translator.translate(url, from, to);
				assert.equal(result, url);
			});

		});

	});

});
