var mongo_data_form = require('./mongo-form')
    , mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
    , js2xml = require('js2xmlparser')
    , logging = require('../../system/node-js/logging')
    , sdc = require('./sdcForm')
    ;

exports.findForms = function (req, res) {
    mongo_data_form.findForms(req.body.criteria, function (err, forms) {
        forms.forEach(exports.hideUnapprovedComments);
        res.send(forms);
    });
};

exports.save = function (req, res) {
    adminSvc.save(req, res, mongo_data_form);
};

exports.findAllCdesInForm = function (node, map, array) {
    if (node.formElements) {
        for (var i = 0; i < node.formElements.length; i++) {
            if (node.formElements[i].elementType === "question") {
                map[node.formElements[i].question.cde.tinyId] = node.formElements[i].question.cde;
                array.push(node.formElements[i].question.cde.tinyId);
            }
            exports.findAllCdesInForm(node.formElements[i], map, array);
        }
    }
};

var getFormJson = function(req, res){
    var markCDE = function (form, cb) {
        var allTinyId = [];
        var allCdes = {};
        exports.findAllCdesInForm(form, allCdes, allTinyId);
        mongo_data_cde.findCurrCdesInFormElement(allTinyId, function (error, currCdes) {
            var currCdeMap = {};
            for (var i = 0; i < currCdes.length; i++) {
                var currCde = currCdes[i];
                currCdeMap[currCde['tinyId']] = currCde['version'];
            }
            for (var tinyId in allCdes) {
                var cde = allCdes[tinyId];
                var version = cde['version'];
                var currVersion = currCdeMap[tinyId];
                if (version !== currVersion) {
                    cde['outdated'] = true;
                    form['outdated'] = true;
                }
            }
            if (cb) cb();
        });
    };
    //var type = req.query.type === 'tinyId' ? 'eltByTinyId' : 'byId';
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if (form) {
            adminSvc.hideUnapprovedComments(form);
            var resForm = form.toObject();
            markCDE(resForm, function () {
                res.send(resForm);
            });
        } else {
            res.status(404).end();
        }
    });
};

var getFormPlainXml = function(req, res){
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if(!form) return res.status(404).end();
        res.setHeader("Content-Type", "application/xml");
        var exportForm = form.toObject();
        delete exportForm._id;
        exportForm.formElements.forEach(function(s){
            s.formElements.forEach(function(q){delete q._id;});
        });
        res.send(js2xml("Form", exportForm));
    });
};

exports.formById = function (req, res) {
    if(req.query.type==='xml' && req.query.subtype==='odm') getFormOdm(req, res);
    else if(req.query.type==='xml' && req.query.subtype==='sdc') getFormSdc(req, res);
    else if(req.query.type==='xml') getFormPlainXml(req, res);
    else getFormJson(req, res);
};

var getFormSdc = function(req, res){
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if (err) {
            logging.errorLogger.error("Error: Cannot find element by tiny id.", {
                origin: "system.adminItemSvc.approveComment",
                stack: new Error().stack
            }, req);
            return res.status(500).send();
        } else {
            res.setHeader("Content-Type", "application/xml");
            res.send(sdc.formToSDC(form));
        }
    });
};

var getFormOdm = function(req, res){
    function cdeToOdmDatatype(cdeType){
        var cdeOdmMapping = {
            "Value List": "text",
            "Character": "text",
            "Numeric": "float",
            "Date/Time": "datetime",
            "Number": "float",
            "Text": "text",
            "Date": "date",
            "Externally Defined": "text",
            "String\nNumeric": "text",
            "anyClass": "text",
            "java.util.Date": "date",
            "java.lang.String": "text",
            "java.lang.Long": "float",
            "java.lang.Integer": "integer",
            "java.lang.Double": "float",
            "java.lang.Boolean": "boolean",
            "java.util.Map": "text",
            "java.lang.Float": "float",
            "Time": "time",
            "xsd:string": "text",
            "java.lang.Character": "text",
            "xsd:boolean": "boolean",
            "java.lang.Short": "integer",
            "java.sql.Timestamp": "time",
            "DATE/TIME": "datetime",
            "java.lang.Byte": "integer"
        };
        return cdeOdmMapping[cdeType] || 'text';
    }

    function escapeHTML(text){
        return text.replace(/\<.+?\>/gi, "");
    }

    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        for (var i = 0; i < form.formElements.length; i++) {
            var sec = form.formElements[i];
            for (var j = 0; j < sec.formElements.length; j++) {
                if (sec.formElements[j].elementType === 'section') return res.status(202).send("Form with nested sections cannot be exported to ODM.");
            }
        }

        var odmJsonForm = {
            '@': {
                'CreationDateTime': new Date().toISOString()
                , 'FileOID': form.tinyId
                , 'FileType': 'Snapshot'
                , 'xmlns': 'http://www.cdisc.org/ns/odm/v1.3'
                , 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
                , 'xsi:noNamespaceSchemaLocation': 'ODM1-3-2.xsd'
                , 'Granularity': 'Metadata'
                , 'ODMVersion': '1.3'
            }
            , Study: {
                '@': {OID: form.tinyId}
                , GlobalVariables: {
                    StudyName: escapeHTML(form.naming[0].designation)
                    , StudyDescription: escapeHTML(form.naming[0].definition)
                    , ProtocolName: escapeHTML(form.naming[0].designation)
                }
                , BasicDefinitions: {}
                , MetaDataVersion: {
                    '@': {
                        'Name': escapeHTML(form.naming[0].designation)
                        , 'OID': 'MDV_' + form.tinyId
                    }
                    , Protocol: {
                        StudyEventRef: {
                            '@': {Mandatory: 'Yes', OrderNumber: '1', StudyEventOID: 'SE_' + form.tinyId}
                        }
                    }
                    , StudyEventDef: {
                        '@': {Name: 'SE', OID: 'SE_' + form.tinyId, Repeating: 'No', Type: 'Unscheduled'}
                        , FormRef: {'@': {FormOID: form.tinyId, Mandatory: 'Yes', OrderNumber: '1'}}
                    }
                    , FormDef: {
                        '@': {
                            'Name': escapeHTML(form.naming[0].designation)
                            , 'OID': form.tinyId
                            , 'Repeating': 'No'
                        }
                        , 'ItemGroupRef': []
                    }
                    , ItemGroupDef: []
                    , ItemDef: []
                    , CodeList: []
                }
            }
        };
        var sections = [];
        var questions = [];
        var codeLists = [];
        form.formElements.forEach(function (s1,si) {
            var childrenOids = [];
            s1.formElements.forEach(function (q1, qi) {
                var oid = q1.question.cde.tinyId + '_s' + si + '_q' + qi;
                childrenOids.push(oid);
                var odmQuestion = {
                    Question: {
                        TranslatedText: {
                            '@': {
                                'xml:lang': 'en'
                            }
                            , '#': escapeHTML(q1.label)
                        }
                    }
                    , '@': {
                        'DataType': cdeToOdmDatatype(q1.question.datatype)
                        , 'Name': escapeHTML(q1.label)
                        , 'OID': oid
                    }
                };
                if (q1.question.answers) {
                    var codeListAlreadyPresent = false;
                    codeLists.forEach(function (cl) {
                        var codeListInHouse = cl.CodeListItem.map(function (i) {
                            return i.Decode.TranslatedText['#']
                        }).sort();
                        var codeListToAdd = q1.question.answers.map(function (a) {
                            return a.valueMeaningName;
                        }).sort();
                        if (JSON.stringify(codeListInHouse) === JSON.stringify(codeListToAdd)) {
                            odmQuestion.CodeListRef = {'@': {CodeListOID: cl['@'].OID}};
                            questions.push(odmQuestion);
                            codeListAlreadyPresent = true;
                        }
                    });

                    if (!codeListAlreadyPresent){
                        odmQuestion.CodeListRef = {'@': {CodeListOID: 'CL_' + oid}};
                        questions.push(odmQuestion);
                        var codeList = {
                            '@': {
                                'DataType': cdeToOdmDatatype(q1.question.datatype)
                                , OID: 'CL_' + oid
                                , Name: q1.label
                            }
                        };
                        codeList.CodeListItem = q1.question.answers.map(function (pv) {
                            var cl = {
                                '@': {
                                    CodedValue: pv.permissibleValue
                                }
                                ,
                                Decode: {
                                    TranslatedText: {
                                        '@': {
                                            'xml:lang': 'en'
                                        }
                                        ,
                                        '#': pv.valueMeaningName
                                    }
                                }
                            };
                            if (pv.valueMeaningCode) cl.Alias = {
                                '@': {
                                    Context: pv.codeSystemName,
                                    Name: pv.valueMeaningCode
                                }
                            };
                            return cl;
                        });
                        codeLists.push(codeList);
                    }
                }
            });
            var oid = Math.floor(Math.random() * 1000);
            odmJsonForm.Study.MetaDataVersion.FormDef.ItemGroupRef.push({
                '@': {
                    'ItemGroupOID': oid
                    , 'Mandatory': 'Yes'
                    , 'OrderNumber': 1
                }
            });
            sections.push({
                '@': {
                    'Name': s1.label
                    , 'OID': oid
                    , 'Repeating': 'No'
                }
                , Description: {
                    TranslatedText:{'@':{ 'xml:lang':'en'}, '#': s1.label}
                }
                , ItemRef: childrenOids.map(function (oid, i) {
                    return {
                        '@': {
                            'ItemOID': oid
                            , 'Mandatory': 'Yes'
                            , 'OrderNumber': i
                        }
                    };
                })
            });
        });
        sections.forEach(function(s){odmJsonForm.Study.MetaDataVersion.ItemGroupDef.push(s)});
        questions.forEach(function(s){odmJsonForm.Study.MetaDataVersion.ItemDef.push(s)});
        codeLists.forEach(function(cl){odmJsonForm.Study.MetaDataVersion.CodeList.push(cl)});
        var xmlForm = js2xml("ODM", odmJsonForm);
        res.set('Content-Type', 'text/xml');
        res.send(xmlForm);
    });
};