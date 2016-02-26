var csv = require('csv')
    , fs = require('fs')
    , byline = require('byline')
    , mongo_cde = require('../../modules/cde/node-js/mongo-cde.js')
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
        //TODO: concurency on callback? some els wont fit in...
        csv.parse(line, function(err, data){
            var ar = data[0];
            var loincId = ar[0].replace(/"/g,"");
            if (!ld.doWeCare(loincId)) return;
            ld.data[loincId] = {};
            Object.keys(loincXmlMap).forEach(function(k){
                ld.data[loincId][loincXmlMap[k]] = ar[k].replace(/"/g,"");
            });
        });
    };
    this.getPropertiesById = function(id){
        var obj = ld.data[id];
        var output = "LOINC_NUM: " + id + ", ";
        Object.keys(obj).forEach(function(k){
            output += k + ": " + obj[k] + ", ";
        });
        output = output.substr(0, output.length-1);
        return output;
    };
};
var loinc = new loincData();

function createLoincMap(){
    bylineStream = byline.createStream(fs.createReadStream('loinc.csv', {encoding: 'utf8'}));
    bylineStream.on('data', function (line) {
        if (line.indexOf('LOINC_NUM') > -1) return;
        loinc.add(line);
    });
    bylineStream.on('end', function () {
        console.log(loinc.getPropertiesById('72826-1'));
        updateCdes();
    });
}


function lookupCdes(){
    var cdeStream = mongo_cde.DataElement.find({"ids.source":"LOINC"}).stream();
    cdeStream.on('data', function(cde){
        var loincId;
        cde.ids.forEach(function(id){
            if (id.source === 'LOINC') loincId = id.id;
        });
        loinc.init(loincId);
    });
    cdeStream.on('end', function(){
        createLoincMap();
    });
}

function updateCdes(){
    var cdeStream = mongo_cde.DataElement.find({"ids.source":"LOINC"}).stream();
    cdeStream.on('data', function(cde){
        var loincId;
        cde.ids.forEach(function(id){
            if (id.source === 'LOINC') loincId = id.id;
        });
        var foundLoincProp = false;
        cde.properties.forEach(function(prop){
            if (prop.key === 'LOINC Fields') {
                foundLoincProp = true;
                prop.value = loinc.getPropertiesById(loincId);
            }
        });
        if (!foundLoincProp) {
            cde.properties.push({key: 'LOINC Fields', value: loinc.getPropertiesById(loincId)});
        }
        //mongo_cde.DataElement.update({tinyId: cde.tinyId}, {});
        cde.save();
    });
    cdeStream.on('end', function(){
        createLoincMap();
    });
};

lookupCdes();

