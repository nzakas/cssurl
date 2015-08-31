/**
 * @fileoverview A utility for rewriting CSS URLs.
 * @author nzakas
 */
/*eslint no-underscore-dangle:0*/

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var Transform = require("stream").Transform,
    URLRewriter = require("./url-rewriter");

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/**
 * Creates a new instance of a URL rewriter stream.
 * @param {Function} replacer A function that receives each URL it comes across
 *      as a parameter and returns the URL to replace it with.
 * @constructor
 */
function URLRewriteStream(replacer) {

    if (typeof replacer !== "function") {
        throw new TypeError("Constructor expects a function as an argument.");
    }

    Transform.call(this, { objectMode: true });

    /**
     * The replacer function to use.
     * @type Function
     */
    this.replacer = replacer;

    /**
     * Any partial data that isn't ready to be returned yet.
     * @type *
     */
    this._leftover = "";
}

URLRewriteStream.prototype = Object.create(Transform.prototype);

/**
 * Transforms the incoming data by replacing any URLs contained in it.
 * @param {Buffer} data The incoming data to transform.
 * @param {string} encoding The encoding of the data.
 * @param {Function} done The callback to call when processing is complete.
 * @returns {void}
 * @private
 */
URLRewriteStream.prototype._transform = function(data, encoding, done) {

    var text = data.toString();

    // if there was anything left from the last chunk, add it now
    if (this._leftover) {
        text = this._leftover + text;
        this._leftover = "";
    }

    // get last bit of data after the last newline
    var lastNewlineIndex = text.lastIndexOf("\n");

    if (lastNewlineIndex > -1) {
        this._leftover = text.substring(lastNewlineIndex + 1, text.length);
        text = text.substring(0, lastNewlineIndex + 1);
    }

    // rewrite the lines
    this._rewrite(text);

    done();
};

/**
 * Transforms the last batch of information.
 * @param {Function} done The callback to call when processing is complete.
 * @returns {void}
 * @private
 */
URLRewriteStream.prototype._flush = function(done) {

    // if there was anything left from the last chunk, add it now
    if (this._leftover) {

        // rewrite the lines
        this._rewrite(this._leftover);

    }

    done();
};

/**
 * Do the actual url rewriting of a chunk, handle errors.
 * @param  {string} text string to rewrite
 * @returns {void}
 * @private
 */
URLRewriteStream.prototype._rewrite = function(text) {

    var rewriter = new URLRewriter(this.replacer);
    try {
        this.push(rewriter.rewrite(text));
    } catch (e) {
        this.emit("error", e);
    }
};

/**
 * @module url-rewrite-stream
 */
module.exports = URLRewriteStream;
