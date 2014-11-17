/**
 * @fileoverview A utility for translating CSS URLs.
 * @author nzakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var path = require("path");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var SKIP_URLS = /^(?:data:|https?:\/\/|\/)/;

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/**
 * Creates a new instance of a URL translator.
 * @constructor
 */
function URLTranslator() {
}

URLTranslator.prototype = {

	/**
	 * Translates a given relative URL with consideration that the reference is
	 * relative to a specific CSS file, and that CSS file location is changing.
	 * @param {string} url The URL to translate.
	 * @param {string} fromFilename The original filename for the CSS.
	 * @param {string} toFilename The new filename for the CSS.
	 * @returns {string} The CSS code with the URLs translated.
	 */
	translate: function(url, fromFilename, toFilename) {

		if (!SKIP_URLS.test(url)) {

			var fromDirname = path.dirname(fromFilename),
				toDirname = path.dirname(toFilename),
				fromPath = path.resolve(fromDirname, url),
				toPath = path.resolve(toDirname);

			return path.relative(toPath, fromPath).replace(/\\/g, "/");
		} else {
			return url;
		}
	}

};

/**
 * @module url-translator
 */
module.exports = URLTranslator;
