var csv = require('csv')
    , fs = require('fs')
;

var loincXmlMap = {
    0: 'LOINC_NUM'
    , 1: 'COMPONENT'
    , 2: 'PROPERTY'
    , 3: 'TIME_ASPCT'
    , 4: 'SYSTEM'
    , 5: 'SCALE_TYP'
    , 6: 'METHOD_TYP'
    , 12: 'STATUS'
    , 23: 'SHORTNAME'
};

//fs.readFile("loinc.csv", "utf-8", function(err, data) {
//    csv.parse(data, function(err, data){
//        console.log(data);
//    });
//});