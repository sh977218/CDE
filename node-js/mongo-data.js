var mongoose = require('mongoose')
    , util = require('util')
    , vsac_io = require('./vsac-io')
    , xml2js = require('xml2js')

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/test';

mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('mongodb connection open');
    });

var xmlParser = new xml2js.Parser();

var ObjectId = require('mongodb').ObjectId;

var permissibleValueSchema = mongoose.Schema({
    validValue: String
    , valueCode: String
    , codeSystemName: String
}, {_id: false});


var deJsonSchema = {
    	preferredName: String
        , longName: String
        , preferredDefinition: String
        , origin: String
        , originId: String
        , owningContext: String
        , created: Date
        , updated: Date
        , valueDomain: {
            preferredName: String
            , longName: String
            , preferredDefinition: String
            , vsacOid: String
            , permissibleValues: [permissibleValueSchema]
        }
        , history: [ObjectId]
        , changeNote: String
    };

var dataElementSchema = mongoose.Schema(deJsonSchema); 
dataElementSchema.set('collection', 'dataelements');

var dataElementArchiveSchema = mongoose.Schema(deJsonSchema);
dataElementArchiveSchema.set('collection', 'dataelements_archive');

dataElementSchema.index({ longName: 'text', preferredDefinition: 'text' });

var DataElement = mongoose.model('DataElement', dataElementSchema);
var DataElementArchive = mongoose.model('DataElementArchive', dataElementArchiveSchema);

//exports.fulltext = function(from, limit, searchTerm, callback) {
//    if (searchTerm) {
//        console.log("FULL TEXT");
//        DataElement.textSearch(searchTerm, function(err, output) {
//           var resultCdes = [];
//           for (var i in output.results) {
//               resultCdes.push(output.results[i].obj);
//           }
//           callback("",{
//                 cdes: resultCdes,
//                 page: Math.ceil(from / limit),
//                 pages: Math.ceil(output.stats.nfound / limit)
//             });
//        });
//    } else {
//        console.log("FIND ALL TEXT");
//        DataElement.find().skip(from).limit(limit).sort('longName').exec(function (err, cdes) {
//        DataElement.count().exec(function (err, count) {
//        callback("",{
//               cdes: cdes,
//               page: Math.ceil(from / limit),
//               pages: Math.ceil(count / limit)
//           });
//        });
//    });
//    }
//};

exports.cdelist = function(from, limit, searchOptions, callback) {
    DataElement.find(searchOptions).skip(from).limit(limit).sort('longName').exec(function (err, cdes) {
        DataElement.count(searchOptions).exec(function (err, count) {
        callback("",{
               cdes: cdes,
               page: Math.ceil(from / limit),
               pages: Math.ceil(count / limit)
           });
        });
    });
};  

exports.listcontexts = function(callback) {
    DataElement.find().distinct('owningContext', function(error, contexts) {
        callback("", contexts);
    });
};

exports.priorCdes = function(cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        return DataElementArchive.find().where("_id").in(dataElement.history).exec(function(err, cdes) {
            callback("", cdes);
        });
    });
};

exports.show = function(cdeId, callback) {
    DataElement.findOne({'_id': cdeId}, function(err, cde) {
        callback("", cde);
    });
};

exports.autocomplete = function (inValue, callback) {
    DataElement.find({'longName': new RegExp(inValue, 'i')}, {longName: 1}).limit(20).exec(function (err, result) {
        callback("", result);
    });
};

exports.linktovsac = function(req, callback) {
    return DataElement.findById(req.body.cde_id, function (err, dataElement) {
        cdeArchive(dataElement, function (arcCde) {
            dataElement.history.push(arcCde._id);
            dataElement.valueDomain.vsacOid = req.body.vs_id;
            vsac_io.getValueSet(req.body.vs_id, function (valueSet_xml) {
                xmlParser.parseString(valueSet_xml, function (err, result) {
                    dataElement.valueDomain.longName = result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                    dataElement.valueDomain.preferredName = '';
                    dataElement.valueDomain.preferredDefinition = '';
                    dataElement.valueDomain.permissibleValues = [];
                    dataElement.changeNote = req.body.changeNote;
                    console.log("Change note: " + dataElement.changeNote);
                    dataElement.updated = new Date().toJSON();


                    for (var i in result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept']) {
                        var pv = result['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i];
                        dataElement.valueDomain.permissibleValues.push({
                                validValue: pv['$'].displayName
                                , valueCode: pv['$'].code
                                , codeSystemName: pv['$'].codeSystemName                       
                        });
                    }
                    return dataElement.save(function (err) {
                         if (err) {
                             console.log(err);
                         }
                         return dataElement;
                    });
                });
                callback("", dataElement);
            });       
        });
    });
};

exports.save = function(req, callback) {
   return DataElement.findById(req.body._id, function (err, dataElement) {
        return cdeArchive(dataElement, function (arcCde) {
            dataElement.history.push(arcCde._id);
            dataElement.longName = req.body.longName;
            dataElement.preferredDefinition = req.body.preferredDefinition;
            dataElement.changeNote = req.body.changeNote;
            console.log("Save ChangeNote: " + dataElement.changeNote);
            dataElement.updated = new Date().toJSON();
            return dataElement.save(function (err) {
                if (err) {
                    console.log(err);
                }
                return dataElement;
            });
        });

    });
};

// @TODO Following is prone to error, see if there's a deep copy mechanism. 
cdeArchive = function(cde, callback) {
    var deArchive = new DataElementArchive();
    deArchive.longName = cde.longName;
    deArchive.preferredName = cde.preferredName;
    deArchive.origin = cde.origin;
    deArchive.originId = cde.originId;
    deArchive.preferredDefinition = cde.preferredDefinition;
    deArchive.valueDomain = cde.valueDomain;
    deArchive.changeNote = cde.changeNote;
    deArchive.created = cde.created;
    deArchive.updated = cde.updated;
    deArchive.history = cde.history;
    deArchive.owningContext = cde.owningContext;
    deArchive.save(function(err) {
        if(err) {
            console.log(err);
        }
    });
    callback(deArchive); 
};