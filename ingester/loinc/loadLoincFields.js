// usage: node loadLoincFields.js /temp/loinc.csv
// path to loinc csv needs to be argument #2 right after 'node load(..).js'

var csv = require('csv')
    , fs = require('fs')
    , byline = require('byline')
    , async = require('async')
    , mongo_cde = require('../../modules/cde/node-js/mongo-cde.js')
    , mongo_form = require('../../modules/form/node-js/mongo-form.js')
;

var loincCsvPath = process.argv[2];

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
    , 27: 'EXTERNAL_COPYRIGHT'
};

var loincData = function(){
    var ld = this;
    this.data = {};
    this.init = function(id){
        ld.data[id] = true;
    };
    this.doWeCare = function(id){
        return !!ld.data[id];
    };
    this.add = function(line){
        csv.parse(line, function(err, data){
            var ar = data[0];
            var loincId = ar[0].replace(/"/g,"");
            if (!ld.doWeCare(loincId)) return;
            ld.data[loincId] = {};
            Object.keys(loincXmlMap).forEach(function(k){
                ld.data[loincId][loincXmlMap[k]] = ar[k]?ar[k].replace(/"/g,""):null;
            });
        });
    };
    this.getPropertiesById = function(id){
        var obj = ld.data[id];
        var output = "";
        Object.keys(obj).forEach(function(k){
            if (obj[k]) output += k + ": " + obj[k] + "<br> ";
        });
        output = output.substr(0, output.length-1);
        return output;
    };
};
var loinc = new loincData();

function createLoincMap(){
    bylineStream = byline.createStream(fs.createReadStream(loincCsvPath, {encoding: 'utf8'}));
    bylineStream.on('data', function (line) {
        if (line.indexOf('LOINC_NUM') > -1) return;
        loinc.add(line);
    });
    bylineStream.on('end', function () {
        console.log("Updating elements in database.");
        async.parallel([
                function(callback){
                    updateElts(mongo_cde.DataElement, callback);
                },
                function(callback){
                    updateElts(mongo_form.Form, callback);
                }
            ],
            function(){
                console.log('LOINC Update Successfully ended!');
                process.exit();
            });
    });
}


function lookupElts(model, cb){
    var stream = model.find({"ids.source":"LOINC", archived: false}).stream();
    stream.on('data', function(cde){
        var loincId = "";
        cde.ids.forEach(function(id){
            if (id.source === 'LOINC') loincId = id.id;
        });
        loinc.init(loincId);
    });
    stream.on('end', function(){
        cb();
    });
}

var doneCount = 0;
function updateElts(model, cb){
    var stream = model.find({"ids.source": "LOINC", archived: false}).stream();
    stream.on('data', function(cde){
        var loincId = "";
        cde.ids.forEach(function(id){
            if (id.source === 'LOINC') loincId = id.id;
        });
        var foundLoincProp = false;
        cde.properties.forEach(function(prop){
            if (prop.key === 'LOINC Fields') {
                foundLoincProp = true;
                prop.value = loinc.getPropertiesById(loincId);
                prop.valueFormat = 'html';
            }
        });
        if (!foundLoincProp) {
            cde.properties.push({key: 'LOINC Fields', value: loinc.getPropertiesById(loincId), valueFormat: 'html'});
        }
        cde.save(function(err) {
            if (err) console.log(err);
            console.log(loincId + " updated. " + ++doneCount + " elements done of " + Object.keys(loinc.data).length);

            if (doneCount === Object.keys(loinc.data).length) cb();
        });
    });
}

async.parallel([
    function(callback){
        console.log("Searching CDEs & Forms with LOINC IDs.");
        lookupElts(mongo_cde.DataElement, callback);
    },
    function(callback){
        lookupElts(mongo_form.Form, callback);
    }
],
function(){
    console.log("Parsing loing.csv and storing it in memory.");
    createLoincMap();
});




