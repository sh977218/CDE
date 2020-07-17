import { consoleLog, logError } from 'server/log/dbLogger';
import { config } from 'server/system/parseConfig';
import { create as builderCreate } from 'xmlbuilder';
import { sdcExport } from './aws';
import { Dictionary } from 'async';
import { FormSection } from 'shared/form/form.model';

function addQuestion(parent: any, question: any) {
    const newQuestion: any = {
        '@ID': question.question.cde.tinyId || 'N/A'
    };
    if (!!question.label) {
        newQuestion['@title'] = question.label;
    }
    if (question.instructions && question.instructions.value) {
        newQuestion.Property = {'@propName': 'instruction', '@val': question.instructions.value};
    }
    const questionEle = parent.ele({Question: newQuestion});
    if (question.question.cde.ids.length > 0) {
        question.question.cde.ids.forEach((id: any) => {
            const codedValueEle = questionEle.ele({
                CodedValue: {
                    Code: {'@val': id.id},
                    CodeSystem: {
                        CodeSystemName: {'@val': id.source || ''}
                    }
                }
            });
            if (id.version) {
                codedValueEle.children.filter((c: any) => c.name === 'CodeSystem')[0].ele({Version: {'@val': id.version}});
            }
        });
    }

    if (question.question.datatype === 'Value List' && question.question.answers.length > 0) {
        const newListField = questionEle.ele('ListField');
        const newList = newListField.ele('List');
        if (question.question.multiselect) { newListField.att('maxSelections', '0'); }

        if (question.question.answers) {
            question.question.answers.forEach((answer: any) => {
                const title = answer.valueMeaningName ? answer.valueMeaningName : answer.permissibleValue;
                const q: any = {
                    '@ID': 'NA_' + Math.random(),
                    '@title': title ? title : ''
                };
                if (answer.valueMeaningCode && answer.codeSystemName) {
                    q.CodedValue = {
                        Code: {'@val': answer.valueMeaningCode},
                        CodeSystem: {
                            CodeSystemName: {'@val': answer.codeSystemName}
                        }
                    };
                }
                newList.ele({ListItem: q});
            });
        }
    } else {
        questionEle.ele('ResponseField').ele('Response').ele('string', {
            name: 'NA_' + Math.random(),
            maxLength: '4000'
        });
    }
    idToName[question.question.cde.tinyId] = question.label;
    questionsInSection[question.label] = questionEle;
}

function doQuestion(parent: any, question: any) {

    let embed = false;
    try {
        if (question.skipLogic && question.skipLogic.condition.length > 0) {
            if (question.skipLogic.condition.match('".+" = ".+"')) {
                const terms = question.skipLogic.condition.match(/"[^"]+"/g).map((t: string) => t.substr(1, t.length - 2));
                if (terms.length === 2) {
                    const qToAddTo = questionsInSection[terms[0]];
                    // below is xmlBuilder ele. This seems to be the way to find child inside element
                    qToAddTo.children.filter((c: any) => c.name === 'ListField')[0]
                        .children.filter((c: any) => c.name === 'List')[0]
                        .children.filter((c: any) => c.name === 'ListItem').forEach((li: any) => {
                        if (li.attributes.title && li.attributes.title.value === terms[1]) {
                            embed = true;
                            if (question.question.datatype === 'Value List') {
                                let liChildItems = li.children.filter((c: any) => c.name === 'ChildItems')[0];
                                if (!liChildItems) { liChildItems = li.ele({ChildItems: {}}); }
                                addQuestion(liChildItems, question);
                            } else {
                                if (!question.label) {
                                    li.ele({ListItemResponseField: {Response: {string: ''}}});
                                } else {
                                    let liChildItems2 = li.children.filter((c: any) => c.name === 'ChildItems')[0];
                                    if (!liChildItems2) { liChildItems2 = li.ele({ChildItems: {}}); }
                                    addQuestion(liChildItems2, question);
                                }
                            }
                        }
                    });
                }
            }
        }
    } catch (e) {
    }

    if (!embed) { addQuestion(parent, question); }
}

const questionsInSection: Dictionary<any> = {};

const doSection = (parent: any, section: FormSection) => {
    const newSection = {
        '@ID': 'NA_' + Math.random(),
        '@title': section.label ? section.label : ''
    };
    const subSection = parent.ele({Section: newSection});
    if (section.formElements && section.formElements.length > 0) {
        const childItems = subSection.ele({ChildItems: {}});
        section.formElements.forEach(formElement => {
            if (formElement.elementType === 'question') {
                doQuestion(childItems, formElement);
            } else if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                doSection(childItems, formElement as any);
            }
        });
    }
};

let idToName: Dictionary<any> = {};

export function formToSDC({form, renderer, validate}, cb: any) {
    const formDesign = builderCreate({
        FormDesign: {
            '@xmlns': 'urn:ihe:qrph:sdc:2016',
            '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@xsi:schemaLocation': 'http://healthIT.gov/sdc SDCFormDesign.xsd',
            '@ID': form.tinyId + (form.version ? 'v' + form.version : ''),
            Header: {
                '@ID': 'S1',
                '@title': form.designations[0].designation,
                '@styleClass': 'left'
            }
        }
    }, {separateArrayItems: true, headless: true});

    const body = formDesign.ele({
        Body: {
            '@ID': 'NA_' + Math.random()
        }
    });

    let noSupport: any = false;

    const childItems = body.ele({ChildItems: {}});

    form.formElements.forEach((formElement: any) => {
        if (formElement.elementType === 'section' || formElement.elementType === 'form') {
            doSection(childItems, formElement);
        } else {
            noSupport = 'true';
        }
    });

    idToName = {};

    let xmlStr = formDesign.end({pretty: false});
    if (noSupport) { return cb(undefined, '<error>SDC Export does not support questions outside of sections.</error>'); }

    if (renderer === 'defaultHtml') {
        xmlStr = "<?xml-stylesheet type='text/xsl' href='/form/public/assets/sdc/sdctemplate.xslt'?> \n" + xmlStr;
    }

    if (validate) {
        consoleLog('faas: ' + config.provider.faas + ' ' + (global as any).CURRENT_SERVER_ENV);
        switch (config.provider.faas) {
            case 'AWS':
                sdcExport(xmlStr, form, cb);
                break;
            case 'ON_PREM':
                // workaround until local lambda
                const validator = require('xsd-schema-validator');
                validator.validateXML(xmlStr, './modules/form/public/assets/sdc/SDCFormDesign.xsd', (err: any) => {
                    if (err) {
                        logError({
                            message: 'SDC Schema validation error: ',
                            stack: err,
                            details: 'formID: ' + form._id
                        });
                        xmlStr = '<!-- Validation Error: ' + err + ' -->' + xmlStr;
                    }
                    cb(null, xmlStr);
                });
                break;
            default:
                throw new Error('not supported');
        }
    } else {
        cb (null, xmlStr);
    }
}
