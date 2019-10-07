import { classifyItem } from 'server/classification/orgClassificationSvc';

const mongo_cde = require('../../server/cde/mongo-cde');
const fs = require('fs');
const csv = require('csv-parse');

var classificationArray;

var classifyCde = function(index){
    mongo_cde.byOtherId("caDSR",classificationArray[index][0], function(err, cde){
        if (!cde) throw "Cannot find CDE";
        var classifications = [
            classificationArray[index][1]
            , classificationArray[index][2]
            , classificationArray[index][3]
        ];
        classifyItem(cde, "NIDA", classifications);
        cde.registrationState.registrationStatus = "Qualified";
        cde.save(function(err, cde){
            if (err)  throw "Can't save";
            console.log("Added NIDA classifications for: " + cde.naming[0].designation);
            if (classificationArray[index+1]) classifyCde(index+1);
            else setTimeout(function(){
                console.log("Imported Classifications");
                process.exit();
            }, 5000);
        });
    });
};

var parser = csv({delimiter: ','}, function(err, data){
    classificationArray = data;
    classifyCde(0);
});


setTimeout(function() {
    fs.createReadStream("./nida-cdes.csv").pipe(parser);
}, 1000);
