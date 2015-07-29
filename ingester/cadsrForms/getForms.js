// add attachment!
// add instructions for sections

var request = require('request')
    , parseString = require('xml2js').parseString
    , mongoose = require('mongoose')
    , async = require('async')
    , mongo_form = require('../../modules/form/node-js/mongo-form.js')
    , mongo_cde = require('../../modules/cde/node-js/mongo-cde.js')
    , classificationShared = require('../../modules/system/shared/classificationShared')
    , mongo_data_system = require('../../modules/system/node-js/mongo-data')
    ;

var db = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/cadsrCache", {auth:{authdb:"admin"}});

db.once('open', function (callback) {

});

var cachedPageSchema = mongoose.Schema({
    url: String
    , content: String
});

var CachedPage = db.model('CachedPage', cachedPageSchema);


var formIncrement = 1; //200
var maxPages = 1; //200

var formListUrl = "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&resultCounter=" + formIncrement + "&startIndex=";

var getFormPageUrl = function(page){
    return formListUrl + (page * formIncrement);
};

var nciOrg, fakeTree;

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
                                q.cde = de[0];
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
            forms.forEach(function(cadsrForm){
                var cdeForm = {
                    naming: [{
                        designation: cadsrForm.longName
                        , definition: cadsrForm.preferredDefinition
                        , languageCode: "EN-US"
                        , context: {
                            contextName: "Health"
                            , acceptability: "preferred"
                        }
                    }]
                    , stewardOrg: {
                        name: "NCI"
                    }
                    , version: cadsrForm.version
                    , registrationState: {
                        registrationStatus: "Qualified"
                        , administrativeNote: cadsrForm.workflowStatusDescription
                        , administrativeStatus: cadsrForm.workflowStatusName
                    }
                    , properties: [
                        {key: "caDSR_createdBy", value: cadsrForm.createdBy}
                        , {key: "caDSR_dateModified", value: cadsrForm.dateModified}
                        , {key: "caDSR_modifiedBy", value: cadsrForm.modifiedBy}
                    ]
                    , ids: [
                        {source: "caDSR", id: cadsrForm.publicID, version: cadsrForm.version}
                    ]
                    //, attachments: [sharedSchemas.attachmentSchema]
                    , created: cadsrForm.dateCreated
                    , imported: new Date()
                    , createdBy: {
                        username: "batchloader"
                    }
                    , formElements: []
                    , classification: [{stewardOrg: {name: "NCI"}, elements: []}]
                };
                var cdeClassifTree = cdeForm.classification[0];
                cadsrForm.classification.forEach(function(co){
                    classificationShared.addCategory(cdeClassifTree, [co.scheme, co.item]);
                    classificationShared.addCategory(fakeTree, [co.scheme, co.item]);
                });

                cadsrForm.sections = cadsrForm.sections.sort(function(a,b){return a.displayOrder - b.displayOrder});

                cadsrForm.sections.forEach(function(s){
                    var newSection = {
                        elementType: 'section'
                        , label: s.longName
                        , formElements: []
                    };

                    cdeForm.formElements.push(newSection);

                    async.eachSeries(s.questions, function(q, cb) {
                        mongo_cde.byOtherId("caDSR", q.cde.publicID, function(err, cde){
                            newSection.formElements.push({
                                elementType: 'question'
                                , label: q.longName
                                //, instructions: String
                                , question:{
                                    cde: {tinyId: cde.tinyId, version: cde.version}
                                    , datatype: cde.valueDomain.datatype
                                    , uoms: [cde.valueDomain.uom]
                                    , answers: cde.valueDomain.permissibleValues
                                }
                            });
                            cb();
                        });
                    }, function(err){
                        mongo_form.create(cdeForm, {_id: null, username: "batchloader"}, function(){
                            console.log("CDE created " + cdeForm.longName);
                        });
                    });
                });

            });

        }, 1000);
    });
};

setTimeout(function(){
    mongo_data_system.orgByName("NCI", function(stewardOrg) {
        nciOrg = stewardOrg;
        fakeTree = {elements: stewardOrg.classifications};
    });
}, 1000);

setTimeout(function(){
    console.log("Ingestion started...");
    for (var i = 0; i < maxPages; i++) {
        var j = i;
        setTimeout(function(){
            console.log("Ingesting from API page: " + j);
            getForms(j);
            setTimeout(function(){
                nciOrg.save(function(){
                    console.log("Ingestion done ...");
                    process.exit(0);
                });
            }, 30000);
        }, i * 1000 * 5);
    }
},2000);