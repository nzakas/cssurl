/**
 * @fileoverview A utility for rewriting CSS URLs.
 * @author nzakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var TokenStream = require("parserlib").css.TokenStream,
	Tokens = require("parserlib").css.Tokens;

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var URL_PARENS = /^url\(["'"]?\s*|\s*["']?\)$/g;

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/**
 * Creates a new instance of a URL rewriter.
 * @param {Function} replacer A function that receives each URL it comes across
 *		as a parameter and returns the URL to replace it with.
 * @constructor
 */
function URLRewriter(replacer) {

	if (typeof replacer !== "function") {
		throw new TypeError("Constructor expects a function as an argument.");
	}

	/**
	 * The replacer function to use.
	 * @type Function
	 */
	this.replacer = replacer;
}

URLRewriter.prototype = {

	/**
	 * Rewrites the given CSS code using the replacer.
	 * @param {string} code The CSS code to rewrite.
	 * @returns {string} The CSS code with the URLs replaced.
	 */
	rewrite: function(code) {

		var tokens = new TokenStream(code),
			hasCRLF = code.indexOf("\r") > -1,
			lines = code.split(/\r?\n/),
			line,
			token,
			tt;

		while ((tt = tokens.get()) !== 0) {
			token = tokens.token();

			if (tt === Tokens.URI) { // URI
				line = lines[token.startLine - 1];
				lines[token.startLine - 1] = line.substring(0, token.startCol - 1) +
					"url(" + this.replacer(token.value.replace(URL_PARENS, "")) +
					")" + line.substring(token.endCol - 1);
			}
		}

		return lines.join(hasCRLF ? "\r\n" : "\n");
	}

};

/**
 * @module url-rewriter
 */
module.exports = URLRewriter;
