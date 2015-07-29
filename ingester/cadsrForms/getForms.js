var request = require('request')
    , parseString = require('xml2js').parseString
    , mongoose = require('mongoose')
    , async = require('async')
    ;

mongoose.connect("mongodb://siteRootAdmin:password@localhost:27017/cadsrCache" ,{auth:{authdb:"admin"}});
var db = mongoose.connection;

db.once('open', function (callback) {

});

//var mongo_form = require('../../modules/form/node-js/mongo-form.js');

var cachedPageSchema = mongoose.Schema({
    url: String
    , content: String
});

var CachedPage = mongoose.model('CachedPage', cachedPageSchema);


var formIncrement = 1; //200
var maxPages = 1; //200

var formListUrl = "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&resultCounter=" + formIncrement + "&startIndex=";

var getFormPageUrl = function(page){
    return formListUrl + (page * formIncrement);
};

var getResource = function(url, cb){
    if (!url) throw url + " not a proper url!";
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
                if (!sections) return;
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
            f.classification = [];
            getResource(f.administeredComponentClassSchemeItemCollection, function(acCsis){
                acCsis.forEach(function(acCsi){
                    getResource(acCsi.classSchemeClassSchemeItem, function(csCsi){
                        getResource(csCsi[0].classificationScheme, function(cs){
                            getResource(csCsi[0].classificationSchemeItem, function(csi){
                                f.classification.push({
                                    scheme: cs[0].longName
                                    , item: csi[0].preferredDefinition
                                });
                            });
                        });
                    });
                });
            });
        });
        setTimeout(function(){
            console.log(JSON.stringify(forms));
        }, 1000);
    });
};

for (var i = 0; i < maxPages; i++) {
    var j = i;
    setTimeout(function(){
        getForms(j);
    }, i * 1000 * 5);
}