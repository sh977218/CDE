var util = require('util')
    , mongoose = require('mongoose')
;

var mongoUri = process.env.MONGO_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/nlmcde';
console.log("connecting to " + mongoUri);
mongoose.connect(mongoUri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('mongodb connection open');
    });

var schemas = require('../node-js/schemas');

var DataElement = mongoose.model('DataElement', schemas.dataElementSchema);

var replaceMap = [
    {
        name: "Administrative Sex"
        , match: ['Male', 'Female']
        , conceptualDomain: {vsac: 
            {
                "id" : "2.16.840.1.113762.1.4.1",
                "name" : "ONC Administrative Sex",
                "version" : "20121025"
            }}  
    }
];

for (var m  = 0; m < replaceMap.length; m++) {
    var toDo = replaceMap[m];
    console.log("Matching: " + toDo.name);
    DataElement.find({"valueDomain.permissibleValues.permissibleValue": {"$all": toDo.match}}).where("archived").equals(null).exec(function (err, result) {
        for (var i = 0; i < result.length; i++) {
            var elt = result[i].toObject();
            var id = elt._id;
            delete elt._id;
            elt.dataElementConcept.conceptualDomain = toDo.conceptualDomain;
            elt.registrationState.administrativeStatus = "Ready For Review";
            console.log("updating: " + id);
            DataElement.update({'_id': id}, elt, function (err, savedElt) {
                if (err)
                    console.log(err);   
            });
        }
    });
    console.log('Done');

    // wait 5 secs for mongoose to do it's thing before closing.  
    setTimeout((function() {
        process.exit();
    }), 5000);
    
};