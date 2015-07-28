var request = require('request');
var parseString = require('xml2js').parseString;
var mongoose = require('mongoose');

//mongoose.connect('mongodb://siteRootAdmin:password@localhost');
//
//var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function (callback) {
//    console.log("connected to mongo");
//});

//var db = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/cadsrCache" ,{auth:{authdb:"admin"}});
mongoose.connect("mongodb://siteRootAdmin:password@localhost:27017/cadsrCache" ,{auth:{authdb:"admin"}});
var db = mongoose.connection;
db.once('open', function (callback) {
    console.log("connected to mongo");
});

var cachedPageSchema = mongoose.Schema({
    url: String
    , content: String
});

var CachedPage = mongoose.model('CachedPage', cachedPageSchema);


var formIncrement = 20;

var formListUrl = "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&resultCounter=" + formIncrement + "&startIndex=";

var getFormPageUrl = function(page){
    return formListUrl + (page * formIncrement);
};

var getResource = function(url, cb){
    var processResource = function(res, cb){
        var forms = [];
        parseString(res, function (err, result) {
            result["xlink:httpQuery"].queryResponse[0].class.forEach(function(cadsrForm){
                var form = {};
                cadsrForm.field.forEach(function(f){
                    form[f.$.name] = f._;
                    if (f.$['xlink:href']) form[f.$.name] = f.$['xlink:href'];
                });
                forms.push(form);
            });

        });
        cb(forms);
    };


    CachedPage.findOne({url: url}, function (err, page) {
        if (err) return console.error(err);
        if (page) processResource(page.content, cb);
        else {
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    processResource(body, cb);
                    var page = new CachedPage({url: url, content: body});
                    page.save();
                }
            });
        }
    });

};

var getForms = function(page){
    var url = getFormPageUrl(page);
    getResource(url, function(forms){
        console.log(forms);
        forms.forEach(function(f){
            getResource(f.moduleCollection, function(sections){
                f.sections = sections;
            });
        });
        setTimeout(function(){
            console.log(forms);
        }, 1000);
    });
};

getForms(0);