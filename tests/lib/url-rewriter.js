/**
 * @fileoverview Tests for URLRewriter
 * @author nzakas
 */

/*global describe, it*/

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
	fs = require("fs"),
	URLRewriter = require("../../lib/url-rewriter");

describe("URLRewriter", function () {

	describe("new URLRewriter", function () {

		it("should throw an error when the first argument is missing", function () {
			assert.throws(function () {
				/*eslint-disable no-unused-vars*/
				var rewriter = new URLRewriter();
				/*eslint-enable no-unused-vars*/
			}, /Constructor expects a function/);
		});

		it("should throw an error when the first argument isn't a function", function () {
			assert.throws(function () {
				/*eslint-disable no-unused-vars*/
				var rewriter = new URLRewriter("hallo");
				/*eslint-enable no-unused-vars*/
			}, /Constructor expects a function/);
		});

	});

	describe("rewrite()", function () {

		it("should pass URL into replacer function when URLs are surrounded by double quotes", function () {
			var rewriter = new URLRewriter(function (url) {
				assert.equal(url, "foo.css");
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url(\"foo.css\") screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should pass URL into replacer function when URLs are surrounded by single quotes", function () {
			var rewriter = new URLRewriter(function (url) {
				assert.equal(url, "foo.css");
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url('foo.css') screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should pass URL into replacer function when URLs are not surrounded quotes", function () {
			var rewriter = new URLRewriter(function (url) {
				assert.equal(url, "foo.css");
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url(foo.css) screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should pass URL into replacer function when URLs are surrounded by whitespace", function () {
			var rewriter = new URLRewriter(function (url) {
				assert.equal(url, "foo.css");
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url( foo.css ) screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should replace URLs in output when URLs are surrounded by double quotes", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url(\"foo.css\") screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should replace URLs in output when URLs are surrounded by single quotes", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url('foo.css') screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should replace URLs in output when URLs aren't surrounded by quotes", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url(foo.css) screen;");
			assert.equal(result, "@import url(bar.css) screen;");
		});

		it("should maintain line endings when \\n is used", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url(foo.css) screen;\n@import url(foo2.css);");
			assert.equal(result, "@import url(bar.css) screen;\n@import url(bar.css);");
		});

		it("should maintain line endings when \\r\\n is used", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite("@import url(foo.css) screen;\r\n@import url(foo2.css);");
			assert.equal(result, "@import url(bar.css) screen;\r\n@import url(bar.css);");
		});

		it("should maintain formatting when comments are present", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite("/*import something*/\n@import url(foo.css) screen;");
			assert.equal(result, "/*import something*/\n@import url(bar.css) screen;");
		});

		it("should replace URLs when there are two URLs on the same line", function () {
			var rewriter = new URLRewriter(function () {
				return "bar.css";
			});

			var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/minified-before.css", "utf8"));
			assert.equal(result, fs.readFileSync("./tests/fixtures/minified-after.css", "utf8"));
		});

		describe("Surround link with quotes", function () {

			it("single quotes: should replace URLs when there are more than one URL in the file", function () {
				var rewriter = new URLRewriter(function () {
					return "bar.css";
				});

				var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/before.css", "utf8"), "'");
				assert.equal(result, fs.readFileSync("./tests/fixtures/after-single-quotes.css", "utf8"));
			});

			it("double quotes: should replace URLs when there are more than one URL in the file", function () {
				var rewriter = new URLRewriter(function () {
					return "bar.css";
				});

				var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/before.css", "utf8"), '"');
				assert.equal(result, fs.readFileSync("./tests/fixtures/after-double-quotes.css", "utf8"));
			});

			it("single quotes: should replace URLs when there are two URLs on the same line", function () {
				var rewriter = new URLRewriter(function () {
					return "bar.css";
				});

				var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/minified-before.css", "utf8"), "'");
				assert.equal(result, fs.readFileSync("./tests/fixtures/minified-after-single-quotes.css", "utf8"));
			});

			it("single quotes: should replace URLs when there are two URLs on the same line", function () {
				var rewriter = new URLRewriter(function () {
					return "bar.css";
				});

				var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/minified-before.css", "utf8"), '"');
				assert.equal(result, fs.readFileSync("./tests/fixtures/minified-after-double-quotes.css", "utf8"));
			});

		});

		describe("Complex URLs", function () {

			it("replace with smaller link", function () {
				var rewriter = new URLRewriter(function () {
					return "bar.css";
				});

				var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/font-before.css", "utf8"));
				assert.equal(result, fs.readFileSync("./tests/fixtures/font-after.css", "utf8"));
			});

			it("replace with bigger link", function () {
				var rewriter = new URLRewriter(function () {
					return "abcdefghijklmnopqrstuvwxyz-123456789-abcdefghijklmnopqrstuvwxyz-123456789-abcdefghijklmnopqrstuvwxyz-123456789.css";
				});

				var result = rewriter.rewrite(fs.readFileSync("./tests/fixtures/font-before.css", "utf8"), '"');
				assert.equal(result, fs.readFileSync("./tests/fixtures/font-big-after.css", "utf8"));
			});

		});

	});

});
