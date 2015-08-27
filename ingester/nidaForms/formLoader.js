var forms = require("../../nida-forms.json")
    , mongo_form = require("../../modules/form/node-js/mongo-form")
    , mongo_cde = require("../../modules/cde/node-js/mongo-cde")
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
                //{key: String, value: String, valueFormat: String, _id: false}
            ]
            , ids: [
                //{source: String, id: String, version: String, _id: false}
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
        };

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
                        , instructions: cde.naming[0].definition
                        , cardinality: "1"
                        , question: {
                            cde: {
                                tinyId: cde.tinyId
                                , version: cde.version
                                , permissibleValues: cde.valueDomain.permissibleValues
                            }
                            , datatype: cde.valueDomain.datatype
                            //, uoms: [cde.valueDomain.uom]
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