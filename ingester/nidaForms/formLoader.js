var forms = require("../../nida-forms.json")
    , mongo_form = require("../../server/form/mongo-form")
    , mongo_cde = require("../../server/cde/mongo-cde")
    , async = require('async');

console.log(JSON.stringify(forms));

setTimeout(function() {

    forms.forEach(function (nidaForm) {
        var newCdeForm = {
            naming: [{
                designation: nidaForm.name
                , definition: nidaForm.description || "N/A"
                , context: {contextName: "Health"}
                , definitionFormat: "html"
            }]
            , stewardOrg: {
                name: "NIDA"
            }
            , registrationState: {registrationStatus: "Incomplete"}
            , properties: [
            ]
            , ids: [
            ]
            , isCopyrighted: true
            , copyright: {
                authority: "NIDA"
            }
            , origin: "NIDA CTN"
            , attachments: []
            , imported: new Date()
            , formElements: []
            , classification: [{
                stewardOrg: {name: "NIDA"}
                , elements: [{name: nidaForm.classification[0], elements: []}]
            }]
            , referenceDocuments: []
        };

        if (nidaForm.referenceDocument) newCdeForm.referenceDocuments.push({
            docType: String,
            document: String,
            referenceDocumentId: String,
            text: String,
            uri: String,
            providerOrg: String,
            title: String,
            languageCode: String
        });

        if (nidaForm.version) newCdeForm.version = nidaForm.version;

        async.eachSeries(nidaForm.sections, function(sec, scb){
            var newSection = {
                elementType: 'section'
                , label: sec.name
                , cardinality: "1"
                , formElements: []
            };
            async.eachSeries(sec.questions, function(q, qcb){
                mongo_cde.byOtherId("caDSR", q.id, function(err, cde){
                    if (!cde) throw "cannot find cde of id " + q.id + "\nform " + nidaForm.name;
                    newSection.formElements.push({
                        elementType: 'question'
                        , label: q.label
                        , cardinality: "1"
                        , question: {
                            cde: {
                                tinyId: cde.tinyId
                                , version: cde.version
                                , permissibleValues: cde.valueDomain.permissibleValues
                            }
                            , datatype: cde.valueDomain.datatype
                            , answers: cde.valueDomain.permissibleValues
                        }
                    });

                    newSection.formElements.push();
                    qcb();
                });
            }, function(){
                newCdeForm.formElements.push(newSection);
                scb();
            });
        }, function(){
            mongo_form.create(newCdeForm, {username: "bashloader"}, function(err){
                if (err) throw err;
            });
        });

    });

}, 3000);