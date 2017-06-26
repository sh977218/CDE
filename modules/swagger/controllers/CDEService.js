'use strict';

exports.debytinyidTinyIdVersionGET = function(args, res, next) {
  /**
   * CDE element
   * This element is equivalent to a reusable question. 
   *
   * tinyId String identifier
   * version String version
   * returns De
   **/
  var examples = {};
  examples['application/json'] = {
  "referenceDocuments" : "aeiou",
  "attachments" : "aeiou",
  "naming" : "aeiou",
  "history" : "aeiou",
  "classification" : "aeiou"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.formViewTinyIdGET = function(args, res, next) {
  /**
   * CDE Form
   * CDE Form which can be rendered. 
   *
   * tinyId String identifier
   * returns Form
   **/
  var examples = {};
  examples['application/json'] = {
  "naming" : "aeiou",
  "history" : "aeiou",
  "classification" : "aeiou",
  "formElements" : "aeiou"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

