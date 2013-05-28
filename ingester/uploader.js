var util = require('util')
    , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('mongodb connection open');
    });

var permissibleValueSchema = mongoose.Schema({
    validValue: String    
}, {_id: false});

var conceptSchema = mongoose.Schema({
    name: String,
    origin: String,
    originId: String
}, {_id: false});

var dataElementSchema = mongoose.Schema({
        uuid: String
    	, preferredName: String
        , longName: String
        , preferredDefinition: String
        , origin: String
        , originId: String
        , owningContext: String
        , created: { type: Date, default: Date.now }
        , updated: { type: Date, default: Date.now }
        , objectClass: {concepts: [conceptSchema]}
        , property:{concepts: [conceptSchema]}
        , valueDomain: {
            preferredName: String
            , longName: String
            , preferredDefinition: String
            , permissibleValues: [permissibleValueSchema]
        }
    });
 
dataElementSchema.set('collection', 'dataelements');

var DataElement = mongoose.model('DataElement', dataElementSchema);

var xml2js = require('xml2js')
    , fs = require('fs')
    
if (process.argv[2] == 'fitbir') {
    console.log("Loading file: " + process.argv[3]);
    console.log("Uploader: fitbir");
    
    fs.readFile(process.argv[3], function(err, data) {
      var parser = new xml2js.Parser();
      parser.parseString(data, function (err, result) {

      for (var i in result.abstractDataElementsExport.elementList[0].element) {
          console.log("---- " + i);
          var srcDE = result.abstractDataElementsExport.elementList[0].element[i];

          var newDE = new DataElement({
              preferredName: srcDE.name
              , longName: srcDE.title
              , preferredDefinition: srcDE.description
              , owningContext: 'FITBIR'
              , origin: 'FITBIR'
              , originId: srcDE.id
              , valueDomain: {
                             }

          });

          for (var pvi in srcDE.valueRangeList) {
              srcPV = srcDE.valueRangeList[pvi];
              newDE.valueDomain.permissibleValues.push({validValue: srcPV.valueRange[0]});
          }

          newDE.save(function (err, newDE) {
              if (err) {
                console.log('unable to save DE: ' + util.inspect(newDE));
              }
          });

      }
      console.log('Done');
      });
   })

} else {
    console.log("no suitable processer for " +  process.argv[2]);
}

    
// wait 5 secs for mongoose to do it's thing before closing
setTimeout((function() {
 process.exit();
}), 5000);


