import { flattenFormElement } from 'shared/form/fe';

export function convertFormToSection(form) {
    if (form && form.formElements)
        return {
            elementType: 'form',
            formElements: form.formElements,
            inForm: {
                form: {
                    tinyId: form.tinyId,
                    version: form.version,
                    name: form.designations[0] ? form.designations[0].designation : '',
                    ids: form.ids
                }
            },
            label: form.designations[0] ? form.designations[0].designation : '',
            mapTo: form.mapTo,
            skipLogic: {
                condition: ''
            },
        };
    else
        return null;
}

export function getFormOdm(form, cb) {
    if (!form) return cb(null, "");
    if (!form.formElements) {
        form.formElements = [];
    }

    function cdeToOdmDatatype(cdeType) {
        return {
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
        }[cdeType] || 'text';
    }

    function escapeHTML(text) {
        if (!text) return "";
        return text.replace(/\<.+?\>/gi, ""); // jshint ignore:line
    }

    let odmJsonForm = {
        '$CreationDateTime': new Date().toISOString()
        , '$FileOID': form.tinyId
        , '$FileType': 'Snapshot'
        , '$xmlns': 'http://www.cdisc.org/ns/odm/v1.3'
        , '$xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        , '$xsi:noNamespaceSchemaLocation': 'ODM1-3-2.xsd'
        , '$Granularity': 'Metadata'
        , '$ODMVersion': '1.3'
        , Study: {
            '$OID': form.tinyId
            , GlobalVariables: {
                StudyName: escapeHTML(form.designations[0].designation)
                , StudyDescription: escapeHTML(form.definitions[0].definition)
                , ProtocolName: escapeHTML(form.designations[0].designation)
            }
            , BasicDefinitions: {}
            , MetaDataVersion: {
                '$Name': escapeHTML(form.designations[0].designation)
                , '$OID': 'MDV_' + form.tinyId
                , Protocol: {
                    StudyEventRef: {
                        '$Mandatory': 'Yes',
                        '$OrderNumber': '1',
                        '$StudyEventOID': 'SE_' + form.tinyId
                    }
                }
                , StudyEventDef: {
                    '$Name': 'SE',
                    '$OID': 'SE_' + form.tinyId,
                    '$Repeating': 'No',
                    '$Type': 'Unscheduled'
                    , FormRef: {
                        '$FormOID': form.tinyId,
                        '$Mandatory': 'Yes',
                        '$OrderNumber': '1'
                    }
                }
                , FormDef: {
                    '$Name': escapeHTML(form.naming[0].designation)
                    , '$OID': form.tinyId
                    , '$Repeating': 'No'
                    , 'ItemGroupRef': []
                }
                , ItemGroupDef: []
                , ItemDef: []
                , CodeList: []
            }
        }
    };
    let sections = [];
    let questions = [];
    let codeLists = [];

    form.formElements.forEach(function (s1, si) {
        let childrenOids = [];
        flattenFormElement(s1).forEach(function (q1, qi) {
            let oid = q1.question.cde.tinyId + '_s' + si + '_q' + qi;
            childrenOids.push(oid);
            let odmQuestion = {
                Question: {
                    TranslatedText: {
                        '$xml:lang': 'en'
                        , '_': escapeHTML(q1.label)
                    }
                },
                '$DataType': cdeToOdmDatatype(q1.question.datatype)
                , '$Name': escapeHTML(q1.label)
                , '$OID': oid
            };
            if (q1.question.answers) {
                let codeListAlreadyPresent = false;
                codeLists.forEach(function (cl) {
                    let codeListInHouse = cl.CodeListItem.map(function (i) {
                        return i.Decode.TranslatedText._;
                    }).sort();
                    let codeListToAdd = q1.question.answers.map(function (a) {
                        return a.valueMeaningName;
                    }).sort();
                    if (JSON.stringify(codeListInHouse) === JSON.stringify(codeListToAdd)) {
                        odmQuestion.CodeListRef = {'$CodeListOID': cl['$OID']};
                        questions.push(odmQuestion);
                        codeListAlreadyPresent = true;
                    }
                });

                if (!codeListAlreadyPresent) {
                    odmQuestion.CodeListRef = {'$CodeListOID': 'CL_' + oid};
                    questions.push(odmQuestion);
                    let codeList = {
                        '$DataType': cdeToOdmDatatype(q1.question.datatype)
                        , '$OID': 'CL_' + oid
                        , '$Name': q1.label
                    };
                    codeList.CodeListItem = q1.question.answers.map(function (pv) {
                        let cl = {
                            '$CodedValue': pv.permissibleValue,
                            Decode: {
                                TranslatedText: {
                                    '$xml:lang': 'en'
                                    , '_': pv.valueMeaningName
                                }
                            }
                        };
                        if (pv.valueMeaningCode) cl.Alias = {
                            '$Context': pv.codeSystemName,
                            '$Name': pv.valueMeaningCode
                        };
                        return cl;
                    });
                    codeLists.push(codeList);
                }
            }
        });
        let oid = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        odmJsonForm.Study.MetaDataVersion.FormDef.ItemGroupRef.push({
            '$ItemGroupOID': oid
            , '$Mandatory': 'Yes'
            , '$OrderNumber': 1
        });

        sections.push({
            '$Name': s1.label
            , '$OID': oid
            , '$Repeating': 'No'
            , Description: {
                TranslatedText: {
                    '$xml:lang': 'en',
                    '_': s1.label
                }
            }
            , ItemRef: childrenOids.map(function (oid, i) {
                return {
                    '$ItemOID': oid
                    , '$Mandatory': 'Yes'
                    , '$OrderNumber': i
                };
            })
        });
    });
    sections.forEach(function (s) {
        odmJsonForm.Study.MetaDataVersion.ItemGroupDef.push(s);
    });
    questions.forEach(function (s) {
        odmJsonForm.Study.MetaDataVersion.ItemDef.push(s);
    });
    codeLists.forEach(function (cl) {
        odmJsonForm.Study.MetaDataVersion.CodeList.push(cl);
    });
    cb(null, odmJsonForm);
}