'use strict';

var url = require('url');

var CDE = require('./CDEService');

module.exports.debytinyidTinyIdVersionGET = function debytinyidTinyIdVersionGET (req, res, next) {
  CDE.debytinyidTinyIdVersionGET(req.swagger.params, res, next);
};

module.exports.formViewTinyIdGET = function formViewTinyIdGET (req, res, next) {
  CDE.formViewTinyIdGET(req.swagger.params, res, next);
};
