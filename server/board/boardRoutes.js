const authorization = require('../system/authorization');
const handleError = require('../log/dbLogger').handleError;
const logError = require('../log/dbLogger').logError;
const boardDb = require('./boardDb');
const elastic = require('./elastic');
const elastic_system = require('../system/elastic');
const config = require('../system/parseConfig');
const daoManager = require('../system/moduleDaoManager');
const _ = require('lodash');
const deService = require('../cde/cdesvc');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const authorizationShared = require('@std/esm')(module)("../../shared/system/authorizationShared");
const js2xml = require('js2xmlparser');

exports.module = function (roleConfig) {
    const router = require('express').Router();
    daoManager.registerDao(boardDb);


    app.post('/myBoards', [exportShared.nocacheMiddleware, authorization.isAuthenticatedMiddleware], (req, res) => {
        elastic.myBoards(req.user, req.body, handleError({req, res}, result => {
            res.send(result);
        }));
    });



    app.post('/pinEntireSearchToBoard', authorization.isAuthenticatedMiddleware, (req, res) => {
        let query = elastic_system.buildElasticSearchQuery(req.user, req.body.query);
        if (query.size > config.maxPin) return res.status(403).send("Maximum number excesses.");
        elastic_system.elasticsearch('cde', query, req.body.query, (err, cdes) => {
            boardsvc.pinAllToBoard(req, res, cdes.cdes);
        });
    });






};