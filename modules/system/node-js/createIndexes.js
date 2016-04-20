var config = require('./parseConfig')
    , request = require('request')
    , elastic = require('../../../deploy/elasticSearchInit.js')
    ;

exports.recreateIndexes = function(){
    var timeoutCount = 0;

    [config.elasticRiverUri, config.elasticUri, config.elasticFormRiverUri, config.elasticFormUri,
        config.elasticBoardRiverUri, config.elasticBoardIndexUri, config.elasticStoredQueryUri].forEach(function(uri) {
            timeoutCount++;
            setTimeout(function() {
                request.del(uri);
            }, timeoutCount * 1000);
        });

    //[
    //    {uri: config.elasticUri, data: elastic.createIndexJson},
    //    {uri: config.elasticRiverUri + "/_meta", data: elastic.createRiverJson},
    //    {uri: config.elasticFormUri, data: elastic.createFormIndexJson},
    //    {uri: config.elasticFormRiverUri + "/_meta", data: elastic.createFormRiverJson},
    //    {uri: config.elasticBoardIndexUri, data: elastic.createBoardIndexJson},
    //    {uri: config.elasticBoardRiverUri + "/_meta", data: elastic.createBoardRiverJson},
    //    {uri: config.elasticStoredQueryUri, data: elastic.createStoredQueryIndexJson}
    //].forEach(function (item) {
    //        timeoutCount++;
    //        setTimeout(function() {
    //            request.post(item.uri, {json: true, body: item.data});
    //        }, timeoutCount * 1000);
    //    });
};