
var xml2js = require('xml2js')
    , fs = require('fs');


exports.doUpload = function(filename, DataElement) {        
  fs.readFile(fs, filename, function(err, data) {

    var parser = new xml2js.Parser();
    parser.parseString(data, function (err, result) {

    for (var i in result.abstractDataElementsExport.elementList.element) {
        console.log("---- " + i);
        var srcDE = result.abstractDataElementsExport.elementList.element[i];
        
        var newDE = new DataElement({
            preferredName: srcDE.name
            , longName: srcDE.title
            , preferredDefinition: srcDE.description
            , origin: 'FITBIR'
            , originId: srcDE.id
            , owningContext: 'FITBIR'
            , valueDomain: {
                           }
                         
        });
        
        for (var pvi in srcDE.valueRangeList) {
            srcPV = srcDE.valueRangeList[pvi];
            newDE.valueDomain.permissibleValues.push({validValue: srcPV.valueRange});
        }
        

        console.log(util.inspect(newDE));
        
//        newDE.save(function (err, newDE) {
//            if (err) {
//              console.log('unable to save DE: ' + util.inspect(newDE));
//            }
//        });
        
    }
    console.log('Done');
    });
 })
}
