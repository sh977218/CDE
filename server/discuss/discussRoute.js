const dbLogger = require('../log/dbLogger');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_board = require('../board/mongo-board');
const discussDb = require('./discussDb');
const userService = require('../system/usersrvc');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    return router;
};