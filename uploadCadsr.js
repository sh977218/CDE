var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'), 
    mongoose = require('mongoose');

var parser = new xml2js.Parser();

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/test';
console.log("connecting to " + mongoUri);

mongoose.connect(mongoUri);
console.log("Loading file: " + process.argv[2]);

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
    	preferredName: String,
        longName: String,
        preferredDefinition: String,
        origin: String,
        originId: String,
        owningContext: String,
        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now },
        objectClass: {concepts: [conceptSchema]},
        property:{concepts: [conceptSchema]},
        valueDomain: {
            preferredName: String,
            longName: String,
            preferredDefinition: String,
            permissibleValues: [permissibleValueSchema]
        }
    });
 
dataElementSchema.set('collection', 'dataelements');

var DataElement = mongoose.model('DataElement', dataElementSchema);

fs.readFile(process.argv[2], function(err, data) {
    parser.parseString(data, function (err, result) {

    for (var i in result.DataElementsList.DataElement) {
        console.log("---- " + i);
        var cadsrDE = result.DataElementsList.DataElement[i];
        
        var newDE = new DataElement({
            preferredName: cadsrDE.PREFERREDNAME
            , longName: cadsrDE.LONGNAME
            , preferredDefinition: cadsrDE.PREFERREDDEFINITION
            , origin: 'CADSR'
            , originId: cadsrDE.PUBLICID + "v" + cadsrDE.VERSION
            , owningContext: cadsrDE.CONTEXTNAME
            , valueDomain: {  preferredName: cadsrDE.VALUEDOMAIN[0].PreferredName,
                            longName: cadsrDE.VALUEDOMAIN[0].LongName,
                            preferredDefinition: cadsrDE.VALUEDOMAIN[0].PreferredDefinition
                         }
                         
        });
        
        for (var pvi in cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
            cadsrPV = cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM[pvi];
            newDE.valueDomain.permissibleValues.push({validValue: cadsrPV.VALIDVALUE[0]});
        }
        
        for (var occi in cadsrDE.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
            concept = cadsrDE.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM[occi];
            newDE.objectClass.concepts.push({name: concept.LONG_NAME, origin: concept.ORIGIN, originId: concept.PREFERRED_NAME});
        }
        
        for (var pci in cadsrDE.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM) {
            concept = cadsrDE.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM[pci];
            newDE.property.concepts.push({name: concept.LONG_NAME, origin: concept.ORIGIN, originId: concept.PREFERRED_NAME});
        }

//        console.log(util.inspect(newDE));
        
        newDE.save(function (err, newDE) {
            if (err) {
              console.log('unable to save DE: ' + util.inspect(newDE));
            }
        });
        
    }
    console.log('Done');
    
    // wait 5 secs for mongoose to do it's thing before closing
    setTimeout((function() {
     process.exit();
    }), 5000);
    });
});




