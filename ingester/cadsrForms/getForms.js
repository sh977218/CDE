// add attachment!
// add instructions for sections

var formIncrement = 100;
var startPage = process.argv[2];
var endPage = process.argv[3];
console.log("Loading pages " + startPage + " to " + endPage);
startPage--;
endPage--;

var request = require('request')
    , parseString = require('xml2js').parseString
    , mongoose = require('mongoose')
    , async = require('async')
    , mongo_form = require('../../modules/form/node-js/mongo-form.js')
    , mongo_cde = require('../../modules/cde/node-js/mongo-cde.js')
    , classificationShared = require('../../modules/system/shared/classificationShared')
    , mongo_data_system = require('../../modules/system/node-js/mongo-data')
    ;

var startTime = new Date().getTime();

var db = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/cadsrCache", {auth:{authdb:"admin"}});

db.once('open', function (callback) {

});

var cachedPageSchema = mongoose.Schema({
    url: String
    , content: String
});

var CachedPage = db.model('CachedPage', cachedPageSchema);

var formListUrl = "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@workflowStatusName=RELEASED]&resultCounter=" + formIncrement + "&startIndex=";

var getFormPageUrl = function(page){
    //return "http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=Form&Form[@publicID=2696402]&resultCounter=200&startIndex=0";
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
        if (err) throw err;
        if (page) processResource(page.content, cb);
        else {
            var ro = {url: url, timeout: 120000};
            request(ro, function (error, response, body) {
                var pageLoadSuccess = function(url, body, cb){
                    processResource(body, cb);
                    var page = new CachedPage({url: url, content: body});
                    page.save();
                };
                if (error) {
                    request(ro, function (error, response, body) {
                        if (error) throw error;
                        else pageLoadSuccess(url, body, cb);
                    });
                } else {
                    pageLoadSuccess(url, body, cb);
                }
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
            getResource(s.instruction, function(instruction){
                if (instruction) s.instructionContent = instruction[0].preferredDefinition;
                getResource(s.questionCollection, function(questions){
                    if (!questions) return cbs();
                    s.questions = questions;
                    async.each(s.questions, function(q, cbq){
                        getResource(q.validValueCollection, function(vd){
                            if (vd) q.validValueCollectionContent = vd;

                            getResource(q.instruction, function(instruction){
                                if (instruction) q.instructionContent = instruction[0].preferredDefinition;
                                getResource(q.dataElement, function(de){
                                    if (!de) return cbq();
                                    q.cde = de[0];
                                    cbq();
                                });
                            });

                        });
                    }, function(){
                        cbs();
                    });
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
                        cbc();
                    });
                });
            });
        }, function(){
            cb();
        });
    });
};

///// Instructions
var getInstructions = function(f, cb){
    getResource(f.instruction, function(instruction){
        if (!instruction) return cb();
        f.instructionContent = instruction[0].preferredDefinition;
        cb();
    });
};

//// Protocol Name
var getProtocolLongname = function(f, cb){
    getResource(f.protocolCollection, function(ptc){
        if (!ptc) return cb();
        f.protocols = [];
        ptc.forEach(function(pt){
            f.protocols.push(pt.longName);
        });
        cb();
    });
};

///// Save Form
var saveForm = function(cadsrForm, cbfc) {
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
            , {key: "caDSR_context", value: cadsrForm.contextName}
        ]
        , ids: [
            {source: "caDSR", id: cadsrForm.publicID, version: cadsrForm.version}
        ]
        , created: cadsrForm.dateCreated
        , imported: new Date()
        , createdBy: {
            username: "batchloader"
        }
        , formElements: []
        , classification: [{stewardOrg: {name: "NCI"}, elements: []}]
        , source: "caDSR"
    };

    if (cadsrForm.protocols) {
        var protocols = cadsrForm.protocols.join(", ");
        cdeForm.properties.push({key: "caDSR_protocols", value: protocols});
    }

    if (cadsrForm.instructionContent) cdeForm.properties.push({key: "caDSR_instruction", value: cadsrForm.instructionContent});

    if (cadsrForm.classification && cadsrForm.classification.length > 0) {
        var cdeClassifTree = cdeForm.classification[0];
        cadsrForm.classification.forEach(function (co) {
            classificationShared.addCategory(cdeClassifTree, [cadsrForm.contextName, co.scheme, co.item]);
            classificationShared.addCategory(fakeTree, [cadsrForm.contextName, co.scheme, co.item]);
        });
    } else {
        console.log("form has no classifications!");
    }

    if (!cadsrForm.sections) return cbfc();

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

        if (s.instructionContent) newSection.instructions = s.instructionContent;

        if (s.maximumQuestionRepeat) {
            newSection.cardinality = s.maximumQuestionRepeat;
        }

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
                var newQuestion = {
                    elementType: 'question'
                    , label: q.questionText
                    , required: q.isMandatory
                    , editable: q.isEditable
                    , question: {
                        cde: {tinyId: cde.tinyId, version: cde.version, permissibleValues: cde.valueDomain.permissibleValues}
                        , datatype: cde.valueDomain.datatype
                        , answers: []
                    }
                };
                if (q.instructionContent) {
                    newQuestion.instructions = q.instructionContent;
                }
                if(q.validValueCollectionContent){
                    q.validValueCollectionContent = q.validValueCollectionContent.sort(function (a, b) {
                        return a.displayOrder - b.displayOrder
                    });
                    q.validValueCollectionContent.forEach(function(vv){
                        var value = vv.longName;
                        var vmn = vv.meaningText;
                        if (!vmn) {
                            console.log("no value meaning name");
                        }
                        var cdePvRecord = cde.valueDomain.permissibleValues.filter(function(pv){
                            if (!vmn) return false;
                            return pv.permissibleValue.toLowerCase().trim() === value.toLowerCase().trim()
                            && pv.valueMeaningName.toLowerCase().trim() === vmn.toLowerCase().trim();
                        })[0];
                        if (!cdePvRecord) {
                            newQuestion.question.answers.push({
                                permissibleValue: value
                                , valueMeaningName: vmn
                            });
                        } else {
                            newQuestion.question.answers.push({
                                permissibleValue: cdePvRecord.permissibleValue
                                , valueMeaningName: cdePvRecord.valueMeaningName
                                , valueMeaningCode: cdePvRecord.valueMeaningCode
                                , valueMeaningDefinition: cdePvRecord.valueMeaningDefinition
                                , codeSystemName: cdePvRecord.codeSystemName
                                , codeSystemVersion: cdePvRecord.codeSystemVersion
                            });
                        }
                    });
                }
                newSection.formElements.push(newQuestion);
                cbq();
            });
        }, function (err) {
            cbs();
        });
    }, function () {
        mongo_form.create(cdeForm, {_id: null, username: "batchloader"}, function (err) {
            if (err) throw err;
            console.log("Form created " + cadsrForm.longName);
            cbfc();
        });
    });
};

var unsavedForms;

var getForms = function(page, cb){
    var url = getFormPageUrl(page);
    getResource(url, function(forms){
        console.log("Page " + page + ", loading " + forms.length + " forms.");
        unsavedForms = forms.map(function(f){return f.longName;});
        async.each(forms, function(f, cbf) {
            if (f.workflowStatusName === "RETIRED ARCHIVED") return;
            async.parallel([
                    function (callback) {
                        getContext(f, function () {
                            console.log("Context Retrieval Complete, Form: " + f.longName);
                            callback();
                        });
                    },
                    function (callback) {
                        getSectionsQuestions(f, function () {
                            console.log("Content Retrieval Complete, Form: " + f.longName);
                            callback();
                        });
                    },
                    function (callback) {
                        getClassifications(f, function () {
                            console.log("Classification Retrieval Complete, Form: " + f.longName);
                            callback();
                        });
                    },
                    function (callback) {
                        getInstructions(f, function(){
                            console.log("Instruction Retrieval Complete, Form: " + f.longName);
                            callback();
                        });
                    },
                    function(callback){
                        getProtocolLongname(f, function(){
                            console.log("Protocol Retrieval Complete, Form: " + f.longName);
                            callback();
                        });
                    }
                ],
                function (err, results) {
                    saveForm(f, function () {
                        var i = unsavedForms.indexOf(f.longName);
                        unsavedForms.splice(i,1);
                        console.log(unsavedForms);
                        cbf();
                    });
                });

        }, function(){
            cb();
        });
    });
};

setTimeout(function(){
    mongo_data_system.orgByName("NCI", function(stewardOrg) {
        nciOrg = stewardOrg;
        fakeTree = {elements: stewardOrg.classifications};
    });
}, 1000);

var previousBulkTime = startTime;
var callNextBulk = function (page){
    console.log("Ingesting from API page: " + page);
    getForms(page, function(){
        var bulkTime = new Date().getTime() - previousBulkTime;
        var totalTime = new Date().getTime() - startTime;
        console.log("Page " + page  + " completed. Time " + (bulkTime/1000) + " seconds.");
        console.log("Total time: " + (totalTime/1000));
        page++;
        if (page <= endPage) {
            nciOrg.save(function () {
                console.log("Ingestion done ...");
                mongo_data_system.orgByName("NCI", function (stewardOrg) {
                    nciOrg = stewardOrg;
                    fakeTree = {elements: stewardOrg.classifications};
                    callNextBulk(page);
                });
            });
        }

    });
};

setTimeout(function(){
    callNextBulk(startPage);
}, 3000);
