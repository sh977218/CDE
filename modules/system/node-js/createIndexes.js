var config = require('./parseConfig')
    , request = require('request')
    ;

exports.recreateIndexes = function(){

    [config.elasticRiverUri, config.elasticUri, config.elasticFormRiverUri, config.elasticFormUri,
        config.elasticBoardRiverUri, config.elasticBoardIndexUri, config.elasticStoredQueryUri].forEach(function(uri) {
                request.del(uri);
        });

};