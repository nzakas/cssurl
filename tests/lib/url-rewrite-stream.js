/**
 * @fileoverview Tests for URLRewriteStream
 * @author nzakas
 */

/*global describe, it*/

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    fs = require("fs"),
    streamString = require("stream-string"),
    URLRewriteStream = require("../../lib/url-rewrite-stream");

describe("URLRewriteStream", function() {

    describe("new URLRewriteStream", function() {

        it("should throw an error when the first argument is missing", function() {
            assert.throws(function() {
                /*eslint-disable no-unused-vars*/
                var stream = new URLRewriteStream();
                /*eslint-enable no-unused-vars*/
            }, /Constructor expects a function/);
        });

        it("should throw an error when the first argument isn't a function", function() {
            assert.throws(function() {
                /*eslint-disable no-unused-vars*/
                var stream = new URLRewriteStream("hallo");
                /*eslint-enable no-unused-vars*/
            }, /Constructor expects a function/);
        });

    });

    describe("pipe()", function() {

        it("should replace URLs when there are more than one URL in the file", function(done) {
            var stream = new URLRewriteStream(function() {
                return "bar.css";
            });

            var resultStream = fs.createReadStream("./tests/fixtures/before.css")
                .pipe(stream);

            streamString(resultStream, function(err, result) {
                assert.ifError(err);
                assert.equal(result, fs.readFileSync("./tests/fixtures/after.css", "utf8"));
                done();
            });

        });

        it("should replace URLs when there are two URLs on the same line", function(done) {
            var stream = new URLRewriteStream(function() {
                return "bar.css";
            });

            var resultStream = fs.createReadStream("./tests/fixtures/minified-before.css")
                .pipe(stream);

            streamString(resultStream, function(err, result) {
                assert.ifError(err);
                assert.equal(result, fs.readFileSync("./tests/fixtures/minified-after.css", "utf8"));
                done();
            });

        });

        it("should emit an error event if there's a transform function error", function(done) {
            var stream = new URLRewriteStream(function() {
                throw new Error("This is bad");
            });

            fs.createReadStream("./tests/fixtures/minified-before.css")
                .pipe(stream);

            stream.on("error", function (e) {
                assert(e instanceof Error, "it is an Error");
                done();
            });

        });

    });

});
