const JXON = require("jxon");
const _ = require("lodash");
import { flattenFormElement } from '../../shared/form/fe';

let _crypto: any;

if (typeof(window) === "undefined") {
    // This will be executed in NodeJS
    _crypto = require('crypto');
} else {
    // This will be executed in Chrome
    try {
        _crypto = (window as any).jscrypto;
    } catch (e) {
    }
}
const ODM_DATATYPE_MAP = {
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

export function getFormOdm(form, cb) {
    if (!form) return cb(null, "");
    if (form.toObject) form = form.toObject();
    if (!form.formElements) {
        form.formElements = [];
    }
    let odmJsonForm = {
        '$CreationDateTime': new Date().toISOString(),
        '$FileOID': form.tinyId,
        '$FileType': 'Snapshot',
        '$xmlns': 'http://www.cdisc.org/ns/odm/v1.3',
        '$xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '$xsi:noNamespaceSchemaLocation': 'ODM1-3-2.xsd',
        '$Granularity': 'Metadata',
        '$ODMVersion': '1.3',
        Study: {
            '$OID': form.tinyId,
            GlobalVariables: {
                StudyName: _.escape(form.designations[0].designation),
                StudyDescription: _.escape(form.definitions[0].definition),
                ProtocolName: _.escape(form.designations[0].designation)
            },
            BasicDefinitions: {},
            MetaDataVersion: {
                '$Name': _.escape(form.designations[0].designation),
                '$OID': 'MDV_' + form.tinyId,
                Protocol: {
                    StudyEventRef: {
                        '$Mandatory': 'Yes',
                        '$OrderNumber': '1',
                        '$StudyEventOID': 'SE_' + form.tinyId
                    }
                },
                StudyEventDef: {
                    '$Name': 'SE',
                    '$OID': 'SE_' + form.tinyId,
                    '$Repeating': 'No',
                    '$Type': 'Unscheduled',
                    FormRef: {
                        '$FormOID': form.tinyId,
                        '$Mandatory': 'Yes',
                        '$OrderNumber': '1'
                    }
                },
                FormDef: {
                    '$Name': _.escape(form.designations[0].designation),
                    '$OID': form.tinyId,
                    '$Repeating': 'No',
                    'ItemGroupRef': []
                },
                ItemGroupDef: [],
                ItemDef: [],
                CodeList: []
            }
        }
    };
    let sections: any[] = [];
    let questions: any[] = [];
    let codeLists: any[] = [];

    form.formElements.forEach(function (s1, si) {
        let childrenOids = [];
        flattenFormElement(s1).forEach(function (q1, qi) {
            let oid = q1.question.cde.tinyId + '_s' + si + '_q' + qi;
            childrenOids.push(oid);
            let omdDatatype = ODM_DATATYPE_MAP[q1.question.datatype] ? ODM_DATATYPE_MAP[q1.question.datatype] : "text";
            let odmQuestion: any = {
                Question: {
                    TranslatedText: {
                        '$xml:lang': 'en',
                        '_': _.escape(q1.label ? q1.label : '')
                    }
                },
                '$DataType': omdDatatype,
                '$Name': _.escape(q1.label ? q1.label : ''),
                '$OID': oid
            };

                let codeListAlreadyPresent = false;
                codeLists.forEach(function (cl) {
                    let codeListInHouse = cl.CodeListItem.map(i => i.Decode.TranslatedText._).sort();
                    let codeListToAdd = (q1.question.answers || []).map(a => a.valueMeaningName).sort();
                    if (JSON.stringify(codeListInHouse) === JSON.stringify(codeListToAdd)) {
                        odmQuestion.CodeListRef = {'$CodeListOID': cl['$OID']};
                        questions.push(odmQuestion);
                        codeListAlreadyPresent = true;
                    }
                });
                if (!codeListAlreadyPresent) {
                    odmQuestion.CodeListRef = {'$CodeListOID': 'CL_' + oid};
                    questions.push(odmQuestion);
                    codeLists.push({
                        CodeListItem: (q1.question.answers || []).map(function (pv) {
                            let cl: any = {
                                '$CodedValue': pv.permissibleValue,
                                Decode: {
                                    TranslatedText: {
                                        '$xml:lang': 'en',
                                        '_': pv.valueMeaningName
                                    }
                                }
                            };
                            if (pv.valueMeaningCode && pv.codeSystemName) cl.Alias = {
                                '$Context': pv.codeSystemName,
                                '$Name': pv.valueMeaningCode
                            };
                            return cl;
                        }),
                        '$DataType': omdDatatype,
                        '$OID': 'CL_' + oid,
                        '$Name': q1.label ? q1.label : ''
                    });
                }
        });
        let oid = _crypto.createHash('md5').update(s1.label ? s1.label : '').digest('hex');
        odmJsonForm.Study.MetaDataVersion.FormDef.ItemGroupRef.push({
            '$ItemGroupOID': oid,
            '$Mandatory': 'Yes',
            '$OrderNumber': 1
        });
        sections.push({
            '$Name': s1.label ? s1.label : '',
            '$OID': oid,
            '$Repeating': 'No',
            Description: {
                TranslatedText: {
                    '$xml:lang': 'en',
                    '_': s1.label ? s1.label : ''
                }
            },
            ItemRef: childrenOids.map((oid, i) => ({
                '$ItemOID': oid,
                '$Mandatory': 'Yes',
                '$OrderNumber': i
            }))
        });
    });
    sections.forEach(s => odmJsonForm.Study.MetaDataVersion.ItemGroupDef.push(s));
    questions.forEach(q => odmJsonForm.Study.MetaDataVersion.ItemDef.push(q));
    codeLists.forEach(cl => odmJsonForm.Study.MetaDataVersion.CodeList.push(cl));
    cb(null, JXON.jsToString({element: odmJsonForm}));
}