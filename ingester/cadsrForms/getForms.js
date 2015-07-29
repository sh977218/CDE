var request = require('request')
    , parseString = require('xml2js').parseString
    , mongoose = require('mongoose')
    , async = require('async');

mongoose.connect("mongodb://siteRootAdmin:password@localhost:27017/cadsrCache" ,{auth:{authdb:"admin"}});
var db = mongoose.connection;
db.once('open', function (callback) {

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
            if (!result["xlink:httpQuery"].queryResponse) return cb(null);
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
        forms.forEach(function(f){
            getResource(f.moduleCollection, function(sections){
                f.sections = sections;
                f.sections.forEach(function(s){
                    getResource(s.questionCollection, function(questions){
                        if (!questions) return;
                        s.questions = questions;
                        s.questions.forEach(function(q){
                            getResource(q.dataElement, function(de){
                                if (!de) return;
                                q.cde = de;
                            })
                        });
                    });
                });
            });
        });
        setTimeout(function(){
            console.log(JSON.stringify(forms));
        }, 4000);
    });
};

getForms(0);