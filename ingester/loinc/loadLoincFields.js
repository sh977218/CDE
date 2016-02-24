var csv = require('csv')
    , fs = require('fs')
    , byline = require('byline')
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
    this.add = function(line){
        var ar = line.split(",");
        var loincId = ar[0].replace(/"/g,"");
        ld.data[loincId] = {};
        Object.keys(loincXmlMap).forEach(function(k){
            ld.data[loincId][loincXmlMap[k]] = ar[k].replace(/"/g,"");
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

var fileStream = fs.createReadStream('loinc.csv', {encoding: 'utf8'});
bylineStream = byline.createStream(fileStream);

bylineStream.on('data', function(line) {
    if (line.indexOf('LOINC_NUM')>-1) return;
    loinc.add(line);
});

bylineStream.on('end', function(){
    console.log(loinc.getPropertiesById('10137-8'));
});