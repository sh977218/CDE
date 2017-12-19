import * as async from 'async';
import noop from 'lodash.noop';


export function areDerivationRulesSatisfied(elt) {
    let missingCdes = [];
    let allCdes = {};
    let allQuestions = [];
    this.iterateFeSync(elt, undefined, undefined, (fe) => {
        if (fe.question.datatype === 'Number' && !Number.isNaN(fe.question.defaultAnswer))
            fe.question.answer = Number.parseFloat(fe.question.defaultAnswer);
        else
            fe.question.answer = fe.question.defaultAnswer;
        allCdes[fe.question.cde.tinyId] = fe.question;
        allQuestions.push(fe);
    });
    allQuestions.forEach(quest => {
        if (quest.question.cde.derivationRules)
            quest.question.cde.derivationRules.forEach(derRule => {
                delete quest.incompleteRule;
                if (derRule.ruleType === 'score') {
                    quest.question.isScore = true;
                    quest.question.scoreFormula = derRule.formula;
                }
                derRule.inputs.forEach(input => {
                    if (allCdes[input]) {
                        allCdes[input].partOf = 'score';
                    } else {
                        missingCdes.push({tinyId: input});
                        quest.incompleteRule = true;
                    }
                });
            });
    });
    return missingCdes;
}

export function convertFormToSection(form) {
    if (form.formElements)
        return {
            elementType: 'form',
            label: form.naming[0] ? form.naming[0].designation : '',
            skipLogic: {
                condition: ''
            },
            inForm: {
                form: {
                    tinyId: form.tinyId,
                    version: form.version,
                    name: form.naming[0] ? form.naming[0].designation : '',
                    ids: form.ids
                }
            }
        };
    else
        return {};
}

export function findQuestionByTinyId(tinyId, elt) {
    let result = null;
    let doFormElement = function (formElt) {
        if (formElt.elementType === 'question') {
            if (formElt.question.cde.tinyId === tinyId) {
                result = formElt;
            }
        } else if (formElt.elementType === 'section') {
            formElt.formElements.forEach(doFormElement);
        }
    };
    elt.formElements.forEach(doFormElement);
    return result;
}

export function flattenFormElement(fe) {
    let result = [];
    fe.formElements.map(function (subFe) {
        if (!subFe.formElements || subFe.formElements.length === 0) {
            result.push(subFe);
        } else {
            let subEs = flattenFormElement(subFe);
            subEs.forEach(function (e) {
                result.push(e);
            });
        }
    });
    return result;
}

export function getFormQuestions(form) {
    let getQuestions = function (fe) {
        let qs = [];
        if (fe.formElements) {
            fe.formElements.forEach(function (e) {
                if (e.elementType === 'question') qs.push(e.question);
                else qs = qs.concat(getQuestions(e));
            });
        }
        return qs;
    };
    return getQuestions(form);
}

export function getFormCdes(form) {
    return getFormQuestions(form).map(function (q) {
        return q.cde;
    });
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
                StudyName: escapeHTML(form.naming[0].designation)
                , StudyDescription: escapeHTML(form.naming[0].definition)
                , ProtocolName: escapeHTML(form.naming[0].designation)
            }
            , BasicDefinitions: {}
            , MetaDataVersion: {
                '$Name': escapeHTML(form.naming[0].designation)
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

export function isSubForm(node) {
    let n = node;
    while (n.data.elementType !== 'form' && n.parent) {
        n = n.parent;
    }
    return n.data.elementType === 'form';
}

// callback(error)
// feCb(fe, cbContinue(error))
export function iterateFe(fe, callback, formCb = undefined, sectionCb = undefined, questionCb = undefined) {
    if (fe)
        this.iterateFes(fe.formElements, callback, formCb, sectionCb, questionCb);
}

// cb(fe)
export function iterateFeSync(fe, formCb = undefined, sectionCb = undefined, questionCb = undefined) {
    if (fe)
        this.iterateFesSync(fe.formElements, formCb, sectionCb, questionCb);
}

// callback(error)
// feCb(fe, cbContinue(error))
export function iterateFes(fes, callback = noop, formCb = noop1, sectionCb = noop1, questionCb = noop1) {
    if (Array.isArray(fes))
        async.forEach(fes, (fe, cb) => {
            if (fe.elementType === 'form') {
                formCb(fe, (err) => {
                    if (err)
                        cb(err);
                    else
                        this.iterateFe(fe, cb, formCb, sectionCb, questionCb);
                });
            } else if (fe.elementType === 'section') {
                sectionCb(fe, (err) => {
                    if (err)
                        cb(err);
                    else
                        this.iterateFe(fe, cb, formCb, sectionCb, questionCb);
                });
            } else {
                questionCb(fe, cb);
            }
        }, callback);
}

// cb(fe)
export function iterateFesSync(fes, formCb = noop, sectionCb = noop, questionCb = noop) {
    if (Array.isArray(fes))
        fes.forEach(fe => {
            if (fe.elementType === 'form') {
                formCb(fe);
                this.iterateFeSync(fe, formCb, sectionCb, questionCb);
            } else if (fe.elementType === 'section') {
                sectionCb(fe);
                this.iterateFeSync(fe, formCb, sectionCb, questionCb);
            } else {
                questionCb(fe);
            }
        });
}

function noop1(a, cb) {
    cb();
}

export function score(question, elt) {
    if (!question.question.isScore)
        return;
    let result = 0;
    let service = this;
    question.question.cde.derivationRules.forEach(function (derRule) {
        if (derRule.ruleType === 'score') {
            if (derRule.formula === 'sumAll' || derRule.formula === 'mean') {
                derRule.inputs.forEach(function (cdeTinyId) {
                    let q = service.findQuestionByTinyId(cdeTinyId, elt);
                    if (isNaN(result)) return;
                    if (q) {
                        let answer = q.question.answer;
                        if (answer === null)
                            result = 'Incomplete answers';
                        else if (isNaN(answer))
                            result = 'Unable to score';
                        else
                            result = result + parseFloat(answer);
                    }
                });
            }
            if (derRule.formula === 'mean') {
                if (!isNaN(result))
                    result = result / derRule.inputs.length;
            }
        }
    });
    return result;
}
