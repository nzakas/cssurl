/**
 * @fileoverview Build file
 * @author nzakas
 */
/*global cat, echo, exec, exit, find, mv, rm, target*/

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

require("shelljs/make");

var dateformat = require("dateformat"),
    nodeCLI = require("shelljs-nodecli");

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

var NODE_MODULES = "./node_modules/",

    // Utilities - intentional extra space at the end of each string
    MOCHA = NODE_MODULES + "mocha/bin/_mocha ",

    // Files
    MAKEFILE = "./Makefile.js",
    /*eslint-disable no-use-before-define */
    JS_FILES = find("lib/").filter(fileType("js")).join(" "),
    TEST_FILES = find("tests/lib/").filter(fileType("js")).join(" ");
    /*eslint-enable no-use-before-define */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Generates a function that matches files with a particular extension.
 * @param {string} extension The file extension (i.e. "js")
 * @returns {Function} The function to pass into a filter method.
 * @private
 */
function fileType(extension) {
    return function(filename) {
        return filename.substring(filename.lastIndexOf(".") + 1) === extension;
    };
}

/**
 * Executes a Node command and exits if the exit code isn't 0.
 * @returns {void}
 * @private
 */
function nodeExec() {
	var exitCode = nodeCLI.exec.apply(nodeCLI, arguments).code;
	if (exitCode > 0) {
		exit(1);
	}
}

/**
 * Creates a release version tag and pushes to origin.
 * @param {string} type The type of release to do (patch, minor, major)
 * @returns {void}
 */
function release(type) {
    target.test();
    exec("npm version " + type);
    target.changelog();
    exec("git push origin master --tags");
    exec("npm publish");
}

//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.all = function() {
    target.test();
};

target.lint = function() {
    echo("Validating Makefile.js");
    nodeExec("eslint", MAKEFILE);

    echo("Validating JavaScript files");
    nodeExec("eslint", JS_FILES);

    echo("Validating JavaScript test files");
    nodeExec("eslint", TEST_FILES);
};

target.test = function() {
    target.lint();

    // exec(ISTANBUL + " cover " + MOCHA + "-- -c " + TEST_FILES);
    nodeExec("istanbul", "cover", MOCHA, "-- -c", TEST_FILES);

    // exec(ISTANBUL + "check-coverage --statement 99 --branch 98 --function 99 --lines 99");
    nodeExec("istanbul", "check-coverage", "--statement 90 --branch 80 --function 100 --lines 90");
};

target.docs = function() {
    echo("Generating documentation");
    nodeCLI.exec("jsdoc", "-d jsdoc lib");
    echo("Documentation has been output to /jsdoc");
};

target.changelog = function() {

    // get most recent two tags
    var tags = exec("git tag", { silent: true }).output.trim().split(/\s/g),
        rangeTags = tags.slice(tags.length - 2),
        now = new Date(),
        timestamp = dateformat(now, "mmmm d, yyyy");

    // output header
    (rangeTags[1] + " - " + timestamp + "\n").to("CHANGELOG.tmp");

    // get log statements
    var logs = exec("git log --pretty=format:\"* %s (%an)\" " + rangeTags.join(".."), {silent:true}).output.split(/\n/g);
    logs = logs.filter(function(line) {
        return line.indexOf("Merge pull request") === -1 && line.indexOf("Merge branch") === -1;
    });
    logs.push(""); // to create empty lines
    logs.unshift("");

    // output log statements
    logs.join("\n").toEnd("CHANGELOG.tmp");

    // switch-o change-o
    cat("CHANGELOG.tmp", "CHANGELOG.md").to("CHANGELOG.md.tmp");
    rm("CHANGELOG.tmp");
    rm("CHANGELOG.md");
    mv("CHANGELOG.md.tmp", "CHANGELOG.md");

    // add into commit
    exec("git add CHANGELOG.md");
    exec("git commit --amend --no-edit");

};

target.patch = function() {
    release("patch");
};

target.minor = function() {
    release("minor");
};

target.major = function() {
    release("major");
};
