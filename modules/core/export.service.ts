import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import * as JXON from 'jxon';
import { saveAs } from 'file-saver';
import _intersectionWith from 'lodash/intersectionWith';
import _noop from 'lodash/noop';

import { Alert, AlertService } from '_app/alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { RegistrationValidatorService } from 'core/registrationValidator.service';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { getFormCdes, getFormOdm } from 'shared/form/formShared';
import { convertToCsv, getCdeCsvHeader, projectCdeForExport } from 'shared/system/exportShared';


@Injectable()
export class ExportService {
    progressAlert: Alert;

    constructor(private alertService: AlertService,
                private registrationValidatorService: RegistrationValidatorService,
                private elasticService: ElasticService,
                protected userService: UserService,
                protected http: HttpClient) {}

    exportProgressCb (msg, terminate?) {
        if (!this.progressAlert || this.progressAlert.expired) {
            this.progressAlert = this.alertService.addAlert('success', msg);
            this.progressAlert.persistant = true;
        } else {
            this.progressAlert.setMessage(msg);
        }
        if (terminate) this.progressAlert.persistant = false;
    }

    async resultToCsv (result) {
        let settings = this.elasticService.searchSettings;
        let csv = getCdeCsvHeader(settings.tableViewFields);
        if (settings.tableViewFields.linkedForms) {
            if (result.length < 50) {
                for (let r of result) {
                    if (r !== undefined) {
                        let forms = await new Promise<Array<CdeForm>>(resolve => {
                            let lfSettings = this.elasticService.buildElasticQuerySettings({
                                q: r.tinyId
                                , page: 1
                                , classification: []
                                , classificationAlt: []
                                , regStatuses: []
                            });
                            this.elasticService.generalSearchQuery(lfSettings, 'form', (err, esRes) => resolve(esRes.forms));
                        });
                        if (forms.length) r.linkedForms = forms.map(f => f.tinyId).join(', ');
                    }
                }
            } else {
                let lfSettings = this.elasticService.buildElasticQuerySettings({
                    page: 1
                    , classification: []
                    , classificationAlt: []
                    , regStatuses: []
                });
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
                            let formCdes = getFormCdes(esForm);
                            let interArr = _intersectionWith(
                                nonEmptyResults,
                                formCdes,
                                (a, b) => a.tinyId === b.tinyId);
                            interArr.forEach(matchId => {
                                let foundCdes = result.filter(c => c.tinyId === matchId.tinyId);
                                foundCdes.forEach(c => {
                                    if (c.linkedForms) c.linkedForms = c.linkedForms + ', ' + esForm.tinyId;
                                    else c.linkedForms = esForm.tinyId;
                                });
                            });
                            this.exportProgressCb('Attaching linked forms ' + Math.trunc(100 * formCounter / totalNbOfForms) + '%');
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
            this.exportProgressCb('Your export is being generated, please wait.');
        }
        this.exportProgressCb('Fetching ' + module + 's. Please wait...');
        this.elasticService.getExport(
            this.elasticService.buildElasticQuerySettings(exportSettings.searchSettings), module || 'cde', (err, result) => {
                if (err) {
                    return this.alertService.addAlert('danger',
                        'The server is busy processing similar request, please try again in a minute.');
                }

                let exporters = {
                    'csv': async result => {
                        let csv = await this.resultToCsv(result);
                        let blob = new Blob([csv], {type: 'text/csv'});
                        saveAs(blob, 'SearchExport.csv');
                        this.exportProgressCb('Export downloaded.', true);
                    },
                    'json': result => {
                        let blob = new Blob([JSON.stringify(result)], {type: 'application/json'});
                        saveAs(blob, 'SearchExport.json');
                        this.exportProgressCb('Export downloaded.', true);
                    },
                    'xml': result => {
                        let zip = new JSZip();
                        result.forEach(oneElt => zip.file(oneElt.tinyId + '.xml', JXON.jsToString({element: oneElt})));
                        zip.generateAsync({type: 'blob'}).then(content => saveAs(content, 'SearchExport_XML.zip'));
                        this.alertService.addAlert('success', 'Export downloaded.');
                    },
                    'odm': result => {
                        let zip = new JSZip();
                        result.forEach(oneElt => {
                            getFormOdm(oneElt, (err, odmElt) => {
                                if (!err) zip.file(oneElt.tinyId + '.xml', JXON.jsToString({ODM: odmElt}));
                            });
                        });
                        zip.generateAsync({type: 'blob'}).then(content => saveAs(content, 'SearchExport_ODM.zip'));
                        this.alertService.addAlert('success', 'Export downloaded.');
                    },
                    'validationRules': (result) => {
                        let orgName = exportSettings.searchSettings.selectedOrg;
                        let status = exportSettings.status;
                        let cdes = [];
                        result.forEach((oneElt) => {
                            let cdeOrgRules = this.registrationValidatorService.getOrgRulesForCde(oneElt);

                            if (!this.registrationValidatorService.conditionsMetForStatusWithinOrg(oneElt, orgName, status, cdeOrgRules)) {
                                let record = {
                                    tinyId: oneElt.tinyId
                                    ,
                                    cdeName: oneElt.naming[0].designation
                                    ,
                                    validationRules: this.registrationValidatorService.evalCde(oneElt, orgName, status, cdeOrgRules)
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
                    // @TODO remove after convert newTags
                    result.forEach(r => {
                        r.naming.forEach(n => {
                            delete n.newTags;
                        });
                    });
                    let exporter = exporters[type];
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
        this.exportProgressCb('Fetching cdes. Please wait...');
        let csv = await this.resultToCsv(elts);
        if (csv) {
            let blob = new Blob([csv], {type: 'text/csv'});
            saveAs(blob, 'QuickBoardExport' + '.csv');
            this.exportProgressCb('Export downloaded.', true);
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }

    async formCdeExport (form) {
        this.exportProgressCb('Fetching cdes. Please wait...');
        let elts = [];
        for (let qCde of getFormCdes(form)) {
            const cde = await this.http.get<DataElement>('/de/' + qCde.tinyId).toPromise().catch(_noop);
            elts.push(cde);
        }

        let csv = await this.resultToCsv(elts);
        if (csv) {
            let blob = new Blob([csv], {type: 'text/csv'});
            saveAs(blob, 'FormCdes-' + form.tinyId + '.csv');
            this.exportProgressCb('Export downloaded.', true);
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }
}
