if (typeof(exports) === "undefined") {exports = {};}


var _crypto;
if (typeof(window) === "undefined") {
    // This will be executed in NodeJS
    _crypto = require('crypto');
} else {
    // This will be executed in Chrome
    _crypto = jscrypto;
}

exports.getFormQuestions = function(form){
    var getQuestions = function(fe){
        var qs = [];
        fe.formElements.forEach(function(e){
            if (e.elementType === 'question') qs.push(e.question);
            else qs = qs.concat(getQuestions(e));
        });
        return qs;
    };
    return getQuestions(form);
};

exports.getFormCdes = function(form){
    return exports.getFormQuestions(form).map(function(q){return q.cde});
};


exports.getFormOdm = function(form, cb) {

    if (!form) return cb(null, "");
    if (!form.formElements) {
        form.formElements = [];
    }

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

    for (var i = 0; i < form.formElements.length; i++) {
        var sec = form.formElements[i];
        for (var j = 0; j < sec.formElements.length; j++) {
            if (sec.formElements[j].elementType === 'section')
                return cb(202, "Forms with nested sections cannot be exported to ODM.");
        }
    }

    var odmJsonForm = {
        '@CreationDateTime': new Date().toISOString()
        , '@FileOID': form.tinyId
        , '@FileType': 'Snapshot'
        , '@xmlns': 'http://www.cdisc.org/ns/odm/v1.3'
        , '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        , '@xsi:noNamespaceSchemaLocation': 'ODM1-3-2.xsd'
        , '@Granularity': 'Metadata'
        , '@ODMVersion': '1.3'
        , Study: {
            '@OID': form.tinyId
            , GlobalVariables: {
                StudyName: escapeHTML(form.naming[0].designation)
                , StudyDescription: escapeHTML(form.naming[0].definition)
                , ProtocolName: escapeHTML(form.naming[0].designation)
            }
            , BasicDefinitions: {}
            , MetaDataVersion: {
                '@Name': escapeHTML(form.naming[0].designation)
                , '@OID': 'MDV_' + form.tinyId
                , Protocol: {
                    StudyEventRef: {
                        '@Mandatory': 'Yes',
                        '@OrderNumber': '1',
                        '@StudyEventOID': 'SE_' + form.tinyId
                    }
                }
                , StudyEventDef: {
                    '@Name': 'SE',
                    '@OID': 'SE_' + form.tinyId,
                    '@Repeating': 'No',
                    '@Type': 'Unscheduled'
                    , FormRef: {
                        '@FormOID': form.tinyId,
                        '@Mandatory': 'Yes',
                        '@OrderNumber': '1'}
                }
                , FormDef: {
                    '@Name': escapeHTML(form.naming[0].designation)
                    , '@OID': form.tinyId
                    , '@Repeating': 'No'
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
                        '@xml:lang': 'en'
                        , 'keyValue': escapeHTML(q1.label)
                    }
                },
                '@DataType': cdeToOdmDatatype(q1.question.datatype)
                , '@Name': escapeHTML(q1.label)
                , '@OID': oid
            };
            if (q1.question.answers) {
                var codeListAlreadyPresent = false;
                codeLists.forEach(function (cl) {
                    var codeListInHouse = cl.CodeListItem.map(function (i) {
                        return i.Decode.TranslatedText.keyValue
                    }).sort();
                    var codeListToAdd = q1.question.answers.map(function (a) {
                        return a.valueMeaningName;
                    }).sort();
                    if (JSON.stringify(codeListInHouse) === JSON.stringify(codeListToAdd)) {
                        odmQuestion.CodeListRef = {'@CodeListOID': cl['@OID']};
                        questions.push(odmQuestion);
                        codeListAlreadyPresent = true;
                    }
                });

                if (!codeListAlreadyPresent){
                    odmQuestion.CodeListRef = {'@CodeListOID': 'CL_' + oid};
                    questions.push(odmQuestion);
                    var codeList = {
                        '@DataType': cdeToOdmDatatype(q1.question.datatype)
                        , '@OID': 'CL_' + oid
                        , '@Name': q1.label
                    };
                    codeList.CodeListItem = q1.question.answers.map(function (pv) {
                        var cl = {
                            '@CodedValue': pv.permissibleValue,
                            Decode: {
                                TranslatedText: {
                                    '@xml:lang': 'en'
                                    , 'keyValue': pv.valueMeaningName
                                }
                            }
                        };
                        if (pv.valueMeaningCode) cl.Alias = {
                            '@Context': pv.codeSystemName,
                            '@Name': pv.valueMeaningCode
                        };
                        return cl;
                    });
                    codeLists.push(codeList);
                }
            }
        });
        var oid = _crypto.createHash('md5').update(s1.label).digest('hex');
        odmJsonForm.Study.MetaDataVersion.FormDef.ItemGroupRef.push({
            '@ItemGroupOID': oid
            , '@Mandatory': 'Yes'
            , '@OrderNumber': 1
        });

        sections.push({
            '@Name': s1.label
            , '@OID': oid
            , '@Repeating': 'No'
            , Description: {
                TranslatedText: {
                    '@xml:lang':'en',
                    'keyValue': s1.label}
            }
            , ItemRef: childrenOids.map(function (oid, i) {
                return {
                    '@ItemOID': oid
                    , '@Mandatory': 'Yes'
                    , '@OrderNumber': i
                };
            })
        });
    });
    sections.forEach(function(s){odmJsonForm.Study.MetaDataVersion.ItemGroupDef.push(s)});
    questions.forEach(function(s){odmJsonForm.Study.MetaDataVersion.ItemDef.push(s)});
    codeLists.forEach(function(cl){odmJsonForm.Study.MetaDataVersion.CodeList.push(cl)});
    cb(null, odmJsonForm);
};