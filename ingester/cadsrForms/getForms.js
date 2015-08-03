// add attachment!
// add instructions for sections
// load protocols

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


var formIncrement = 200; //200
var maxPages = 1; //200
var bulkDelay = 30;
var waitForContent = 20;

var formListUrl = "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&resultCounter=" + formIncrement + "&startIndex=";

var getFormPageUrl = function(page){
    //return "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@publicID=2432444]";
    return formListUrl + (page * formIncrement);
};

var nciOrg, fakeTree;

var getResource = function(url, cb){
    if (!url) throw url + " not a proper url!";
    var processResource = function(res, cb){
        if (!res) throw "Cannot parse nothing";
        var results = [];
        parseString(res, function (err, result) {
            if (err) {
                var fs = require('fs');
                fs.writeFileSync('./badRes', res);
                console.log(res);
                throw err;
            }
            if (!result["xlink:httpQuery"].queryResponse) {
                return cb(null);
            }
            result["xlink:httpQuery"].queryResponse[0].class.forEach(function(cadsrForm){
                var item = {};
                cadsrForm.field.forEach(function(f){
                    item[f.$.name] = f._;
                    if (f.$['xlink:href']) item[f.$.name] = f.$['xlink:href'];
                });
                results.push(item);
            });
            cb(results);
        });

    };


    CachedPage.findOne({url: url}, function (err, page) {
        if (err) throw console.error(err);
        if (page) processResource(page.content, cb);
        else {
            request(url, function (error, response, body) {
                if (error) throw error;
                processResource(body, cb);
                var page = new CachedPage({url: url, content: body});
                page.save();
            });
        }
    });

};


/// Context
var getContext = function(f, cb){
    getResource(f.context, function(context){
        f.contextName = context[0].name;
        cb();
    });
};

///// Sections
var getSectionsQuestions = function(f, cb){
    getResource(f.moduleCollection, function(sections){
        if (!sections) return cb();
        f.sections = sections;
        async.each(f.sections, function(s, cbs) {
            getResource(s.questionCollection, function(questions){
                if (!questions) return cbs();
                s.questions = questions;
                async.each(s.questions, function(q, cbq){
                    getResource(q.dataElement, function(de){
                        if (!de) return cbq();
                        q.cde = de[0];
                        cbq();
                    })
                }, function(){
                    cbs();
                });
            });
        }, function(){
            cb();
        });
    });
};

///// Classifications
var getClassifications = function(f, cb){
    f.classification = [];
    getResource(f.administeredComponentClassSchemeItemCollection, function(acCsis){
        if (!acCsis) return cb();
        async.each(acCsis, function(acCsi, cbc){
            getResource(acCsi.classSchemeClassSchemeItem, function(csCsi){
                getResource(csCsi[0].classificationScheme, function(cs){
                    getResource(csCsi[0].classificationSchemeItem, function(csi){
                        f.classification.push({
                            scheme: cs[0].longName
                            , item: csi[0].preferredDefinition
                        });
                        console.log("csi");
                        console.log(csi[0].preferredDefinition);
                        cbc();
                    });
                });
            });
        }, function(){
            cb();
        });
    });
};

///// Save Form
var saveForm = function(cadsrForm) {
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
        , source: "caDSR"
    };

    if (cadsrForm.classification && cadsrForm.classification.length > 0) {
        var cdeClassifTree = cdeForm.classification[0];
        cadsrForm.classification.forEach(function (co) {
            classificationShared.addCategory(cdeClassifTree, [cadsrForm.contextName, co.scheme, co.item]);
            classificationShared.addCategory(fakeTree, [cadsrForm.contextName, co.scheme, co.item]);
        });
    } else {
        console.log("form has no classifications!");
    }

    if (!cadsrForm.sections) return;

    cadsrForm.sections = cadsrForm.sections.sort(function (a, b) {
        return a.displayOrder - b.displayOrder
    });

    async.eachSeries(cadsrForm.sections, function (s, cbs) {
        if (!s.questions) return cbs();

        var newSection = {
            elementType: 'section'
            , label: s.longName
            , formElements: []
        };

        if (s.maximumQuestionRepeat) newSection.cardinality = s.maximumQuestionRepeat;

        cdeForm.formElements.push(newSection);

        s.questions = s.questions.sort(function (a, b) {
            return a.displayOrder - b.displayOrder
        });

        async.eachSeries(s.questions, function (q, cbq) {
            if (!q.cde) {
                console.log("No CDE as a part of the form: ");
                console.log("Question Public ID " + q.publicID);
                console.log("Form Public ID " + cadsrForm.publicID);
                return cbq();
            }
            mongo_cde.byOtherId("caDSR", q.cde.publicID, function (err, cde) {
                if (!cde) {
                    console.log("CDE not found. caDSR ID: " + q.cde.publicID);
                    return cbq();
                }
                newSection.formElements.push({
                    elementType: 'question'
                    , label: q.questionText
                    , required: q.isMandatory
                    , editable: q.isEditable
                    , instructions: q.cde.longName
                    , question: {
                        cde: {tinyId: cde.tinyId, version: cde.version}
                        , datatype: cde.valueDomain.datatype
                        //, uoms: [cde.valueDomain.uom]
                        , answers: cde.valueDomain.permissibleValues
                    }
                });
                cbq();
            });
        }, function (err) {
            cbs();
        });
    }, function () {
        mongo_form.create(cdeForm, {_id: null, username: "batchloader"}, function () {
            console.log("Form created " + cadsrForm.longName);
            console.log("form pid: " + cdeForm.publicID);
        });
    });
};

var getForms = function(page){
    var url = getFormPageUrl(page);
    getResource(url, function(forms){
        console.log("Page " + page + ", loading " + forms.length + " forms.");
        forms.forEach(function(f){
            if (f.workflowStatusName === "RETIRED ARCHIVED") return;
            async.parallel([
                function(callback){
                    getContext(f, function(){
                        callback();
                    });
                },
                function(callback){
                    getSectionsQuestions(f, function(){
                        callback();
                    });
                },
                function(callback){
                    getClassifications(f, function(){
                        callback();
                    });
                }
            ],
            function(err, results){
                saveForm(f, function(){});
            });
        });

    });
};

setTimeout(function(){
    mongo_data_system.orgByName("NCI", function(stewardOrg) {
        nciOrg = stewardOrg;
        fakeTree = {elements: stewardOrg.classifications};
    });
}, 1000);

//setTimeout(function(){
//    console.log("Ingestion started...");
//    for (var i = 0; i < maxPages; i++) {
//        var j = i;
//        setTimeout(function(){
//            console.log("Ingesting from API page: " + j);
//            getForms(j);
//        }, j * 1000 * 5);
//    }
//}, 2000);

var callNextBulk = function (page){
    console.log("Ingesting from API page: " + page);
    getForms(page);
    page++;

    if (page + 1 < maxPages) {
        setTimeout(function(){
            callNextBulk(page);
        }, bulkDelay * 1000);
    } else {
        setTimeout(function(){
            nciOrg.save(function(){
                console.log("Ingestion done ...");
                //process.exit(0);
            });
        }, 40000);
    }
};

setTimeout(function(){
    callNextBulk(0);
}, 3000);


//setTimeout(function(){
//    nciOrg.save(function(){
//        console.log("Ingestion done ...");
//        process.exit(0);
//    });
//}, (1000 * maxPages * bulkDelay) + (waitForContent * 2) + 60000);