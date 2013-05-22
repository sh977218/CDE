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
    	preferredName: String,
        longName: String,
        preferredDefinition: String,
        origin: String,
        originId: String,
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





