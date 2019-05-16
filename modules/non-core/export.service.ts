import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { getFormQuestionsAsQuestionCde } from 'core/form/fe';
import { getFormOdm } from 'core/form/form';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as JXON from 'jxon';
import _intersectionWith from 'lodash/intersectionWith';
import _isEqual from 'lodash/isEqual';
import _noop from 'lodash/noop';
import {
    conditionsMetForStatusWithinOrg, evalCde, RegistrationValidatorService
} from 'non-core/registrationValidator.service';
import { SearchSettings } from 'search/search.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { ElasticQueryResponse, Item } from 'shared/models.model';
import { convertToCsv, getCdeCsvHeader, projectCdeForExport } from 'core/system/export';

@Injectable()
export class ExportService {
    constructor(private alertService: AlertService,
                private registrationValidatorService: RegistrationValidatorService,
                private elasticService: ElasticService,
                protected userService: UserService,
                protected http: HttpClient) {}

    async resultToCsv(result) {
        let settings = this.elasticService.searchSettings;
        let csv = getCdeCsvHeader(settings.tableViewFields);
        if (settings.tableViewFields.linkedForms) {
            if (result.length < 50) {
                for (let r of result) {
                    if (r !== undefined) {
                        let forms = await new Promise<Array<CdeForm>>(resolve => {
                            let lfSettings = this.elasticService.buildElasticQuerySettings(new SearchSettings(r.tinyId));
                            this.elasticService.generalSearchQuery(lfSettings, 'form',
                                (err?: string, esRes?: ElasticQueryResponse) => resolve(esRes.forms));
                        });
                        if (forms.length) r.linkedForms = forms.map(f => f.tinyId).join(', ');
                    }
                }
            } else {
                let lfSettings = this.elasticService.buildElasticQuerySettings(new SearchSettings());
                let esResp = await this.http.post('/scrollExport/form', lfSettings).toPromise();
                let totalNbOfForms = 0;
                let formCounter = 0;
                let nonEmptyResults = result.filter(r => r !== undefined);
                let intersectOnBatch = esResp => {
                    if ((esResp as any).hits.hits.length) {
                        totalNbOfForms = (esResp as any).hits.total;
                        for (let hit of (esResp as any).hits.hits) {
                            formCounter++;
                            let esForm = hit._source;
                            let formCdes = getFormQuestionsAsQuestionCde(esForm);
                            let interArr = _intersectionWith(
                                nonEmptyResults,
                                formCdes,
                                (a: any, b: any) => a.tinyId === b.tinyId);
                            interArr.forEach(matchId => {
                                let foundCdes = result.filter(c => c.tinyId === matchId.tinyId);
                                foundCdes.forEach(c => {
                                    if (c.linkedForms) c.linkedForms = c.linkedForms + ', ' + esForm.tinyId;
                                    else c.linkedForms = esForm.tinyId;
                                });
                            });
                            this.alertService.addAlert('success', 'Attaching linked forms ' + Math.trunc(100 * formCounter / totalNbOfForms) + '%');
                        }
                        return true;
                    } else return false;
                };
                let keepScrolling = true;
                while (keepScrolling) {
                    keepScrolling = intersectOnBatch(esResp);
                    esResp = await this.http.get('/scrollExport/' + (esResp as any)._scroll_id).toPromise();
                }
            }
        }
        result.forEach(r => {
            if (!r) {
                csv += '\n';
            } else {
                csv += convertToCsv(projectCdeForExport(r, settings.tableViewFields));
            }
        });
        return csv;
    }

    exportSearchResults(type, module, exportSettings) {

        if (module === 'form' && (!this.userService.user || !this.userService.user._id)) {
            return this.alertService.addAlert('danger', 'Please login to access this feature');
        }

        try {
            !!new Blob;
        } catch (e) {
            return this.alertService.addAlert('danger',
                'Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.');
        }

        if (type !== 'validationRules') {
            this.alertService.addAlert("", 'Your export is being generated, please wait.');
        }

        this.alertService.addAlert("", 'Fetching ' + module + 's. Please wait...');
        this.elasticService.getExport(
            this.elasticService.buildElasticQuerySettings(exportSettings.searchSettings), module || 'cde', (err, result) => {
                if (err) {
                    return this.alertService.addAlert('danger',
                        'The server is busy processing similar request, please try again in a minute.');
                }

                let exporters = {
                    csv: async (result: Item[]) => {
                        let csv = await this.resultToCsv(result);
                        let blob = new Blob([csv], {type: 'text/csv'});
                        saveAs(blob, 'SearchExport.csv');
                        this.alertService.addAlert("", 'Export downloaded.');
                    },
                    json: result => {
                        let blob = new Blob([JSON.stringify(result)], {type: 'application/json'});
                        saveAs(blob, 'SearchExport.json');
                        this.alertService.addAlert("", 'Export downloaded.');
                    },
                    xml: result => {
                        let zip = new JSZip();
                        result.forEach(oneElt => {
                            if (oneElt.linkedForms) {
                                oneElt.linkedForms.Preferred_Standard = oneElt.linkedForms['Preferred Standard'];
                                delete oneElt.linkedForms['Preferred Standard'];
                            }
                            zip.file(oneElt.tinyId + '.xml', JXON.jsToString({element: oneElt}));
                        });
                        zip.generateAsync({type: 'blob'}).then(content => saveAs(content, 'SearchExport_XML.zip'));
                        this.alertService.addAlert('success', 'Export downloaded.');
                    },
                    odm: result => {
                        let zip = new JSZip();
                        result.forEach(oneElt => {
                            getFormOdm(oneElt, (err, odmElt) => {
                                if (!err) zip.file(oneElt.tinyId + '.xml', JXON.jsToString({ODM: odmElt}));
                            });
                        });
                        zip.generateAsync({type: 'blob'}).then(content => saveAs(content, 'SearchExport_ODM.zip'));
                        this.alertService.addAlert('success', 'Export downloaded.');
                    },
                    validationRules: (result) => {
                        let orgName = exportSettings.searchSettings.selectedOrg;
                        let status = exportSettings.status;
                        let cdes = [];
                        result.forEach((oneElt) => {
                            let cdeOrgRules = this.registrationValidatorService.getOrgRulesForCde(oneElt);

                            if (!conditionsMetForStatusWithinOrg(oneElt, orgName, status, cdeOrgRules)) {
                                let record = {
                                    tinyId: oneElt.tinyId,
                                    cdeName: oneElt.designations[0].designation,
                                    validationRules: evalCde(oneElt, orgName, status, cdeOrgRules),
                                };
                                if (!record.validationRules.every(function (x) {
                                        return x.cdePassingRule;
                                    })) cdes.push(record);
                            }
                        });
                        if (exportSettings.cb) exportSettings.cb(cdes.slice(0, 100));
                    }
                };

                if (result) {
                    let exporter = (exporters as any)[type];
                    if (!exporter) {
                        this.alertService.addAlert('danger', 'This export format is not supported.');
                    } else {
                        exporter(result);
                    }
                } else {
                    this.alertService.addAlert('danger', 'There was no data to export.');
                }
            });
    }

    async quickBoardExport(elts) {
        this.alertService.addAlert("", 'Fetching cdes. Please wait...');
        let csv = await this.resultToCsv(elts);
        if (csv) {
            let blob = new Blob([csv], {type: 'text/csv'});
            saveAs(blob, 'QuickBoardExport' + '.csv');
            this.alertService.addAlert("", 'Export downloaded.');
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }

    async formCdeExport(form: CdeForm) {
        this.alertService.addAlert("", 'Fetching cdes. Please wait...');
        let tinyIdList = getFormQuestionsAsQuestionCde(form).map(f => f.tinyId);
        let elts = await this.http.get<DataElement[]>('/deList/' + tinyIdList).toPromise().catch(_noop);
        let csv;
        if (elts) {
            csv = await this.resultToCsv(elts);
        }
        if (csv) {
            let blob = new Blob([csv], {type: 'text/csv'});
            saveAs(blob, 'FormCdes-' + form.tinyId + '.csv');
            this.alertService.addAlert("", 'Export downloaded.');
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }

    redcapExport(form: CdeForm) {
    }

    formatSkipLogic(skipLogicString, map) {
        let redCapSkipLogic = skipLogicString;
        let _skipLogicString = skipLogicString.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
        let foundEquationArray = _skipLogicString.match(/"([^"])+"/g);
        if (foundEquationArray && foundEquationArray.length > 0) {
            foundEquationArray.forEach((label, i) => {
                if (i % 2 === 0) {
                    let foundVariable = map[label.replace(/\"/g, '')];
                    redCapSkipLogic = redCapSkipLogic.replace(label, '[' + foundVariable + ']');
                }
            })
        } else redCapSkipLogic = "Error Parse " + skipLogicString;
        return redCapSkipLogic;
    }


    getRedCap(form: CdeForm) {
        let variableCounter = 1;
        let sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;
        let doSection = (formElement, i) => {
            let sectionHeader = formElement.label ? formElement.label : '';
            let fieldLabel = formElement.instructions ? formElement.instructions.value : '';
            if (sectionsAsMatrix) {
                let temp = _.uniqWith(formElement.formElements, (a, b) => _isEqual(a.question.answers, b.question.answers));
                if (temp.length > 1) sectionsAsMatrix = false;
            }
            let _sectionSkipLogic = '';
            let sectionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
            if (sectionSkipLogic) _sectionSkipLogic = this.formatSkipLogic(sectionSkipLogic, label_variables_map);
            return {
                'Variable / Field Name': 'insect_' + i,
                'Form Name': form.designations[0].designation,
                'Section Header': sectionHeader,
                'Field Type': 'descriptive',
                'Field Label': fieldLabel,
                'Choices, Calculations, OR Slider Labels': '',
                'Field Note': '',
                'Text Validation Type OR Show Slider Number': '',
                'Text Validation Min': '',
                'Text Validation Max': '',
                'Identifier?': '',
                'Branching Logic (Show field only if...)': _sectionSkipLogic,
                'Required Field?': '',
                'Custom Alignment': '',
                'Question Number (surveys only)': '',
                'Matrix Group Name': sectionsAsMatrix ? sectionHeader : '',
                'Matrix Ranking?': ''
            };
        };
        let doQuestion = (formElement) => {
            let q = formElement.question;
            let _questionSkipLogic = '';
            let questionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
            if (questionSkipLogic) _questionSkipLogic = formatSkipLogic(questionSkipLogic, label_variables_map);
            if (!q.cde.tinyId) q.cde.tinyId = 'missing question cde';
            let variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' +
                variableCounter++ + "_" + q.cde.tinyId.toLowerCase();
            if (existingVariables[variableName]) {
                let index = existingVariables[variableName];
                let newVariableName = variableName + '_' + index;
                existingVariables[variableName] = index++;
                existingVariables[newVariableName] = 1;
                label_variables_map[formElement.label] = variableName;
                variableName = newVariableName;
            } else {
                existingVariables[variableName] = 1;
                label_variables_map[formElement.label] = variableName;
            }

            let fieldLabel = formElement.label;
            return {
                'Variable / Field Name': variableName,
                'Form Name': form.designations[0].designation,
                'Section Header': '',
                'Field Type': field_type_map[q.datatype],
                'Field Label': fieldLabel,
                'Choices, Calculations, OR Slider Labels': (q.answers || []).map(a => a.permissibleValue + ',' + a.valueMeaningName).join('|'),
                'Field Note': '',
                'Text Validation Type OR Show Slider Number': text_validation_type_map[q.datatype],
                'Text Validation Min': q.datatypeNumber ? q.datatypeNumber.minValue : '',
                'Text Validation Max': q.datatypeNumber ? q.datatypeNumber.maxValue : '',
                'Identifier?': '',
                'Branching Logic (Show field only if...)': _questionSkipLogic,
                'Required Field?': q.required,
                'Custom Alignment': '',
                'Question Number (surveys only)': '',
                'Matrix Group Name': '',
                'Matrix Ranking?': ''
            };
        };

        let instrumentJsonRows = [];
        let sectionIndex = 0;
        for (let formElement of form.formElements) {
            sectionIndex++;
            let sectionResult = doSection(formElement, sectionIndex);
            instrumentJsonRows.push(sectionResult);
            for (let fe of formElement.formElements) {
                let questionResult = doQuestion(fe);
                instrumentJsonRows.push(questionResult);
            }
        }
        return Json2csvParser(instrumentJsonRows);
    }


}
