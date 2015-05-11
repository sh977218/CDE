var mongo_cde = require('../../modules/cde/node-js/mongo-cde')
    , classificationShared = require('../../modules/system/shared/classificationShared')
    , fs = require('fs')
    , csv = require('csv-parse')
    ;

var classificationArray;

var classifyCde = function(index){
    mongo_cde.byOtherId("caDSR",classificationArray[index][0], function(err, cde){
        var steward = mongo_cde.findSteward(cde, "NIDA");
        if (steward) steward.object.elements = [];
        if (classificationArray[index+1]) classifyCde(index+1);
        else process.exit();
    });

};

var parser = csv({delimiter: ','}, function(err, data){
    classificationArray = data;
    classifyCde(0);
});


setTimeout(function() {
    fs.createReadStream("./nida-cdes.csv").pipe(parser);
}, 1000);


//mongo_cde.query({"classification.stewardOrg.name":"NIDA"}, function(err, result) {
//    result.forEach(function(cde) {
//        var steward = classificationShared.findSteward(cde, "NIDA");
//        if (steward) steward.object.elements = [];
//    });
//});