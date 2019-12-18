import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { getFormQuestionsAsQuestionCde } from 'core/form/fe';
import { getFormOdm } from 'core/form/form';
import { convertToCsv, getCdeCsvHeader, projectItemForExport } from 'core/system/export';
import { RedcapExport } from 'form/public/redcapExport';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as JXON from 'jxon';
import _intersectionWith from 'lodash/intersectionWith';
import _noop from 'lodash/noop';
import { processRules, RegistrationValidatorService, RuleStatus } from 'non-core/registrationValidator.service';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { Cb1, CurationStatus, ElasticQueryResponse, ElasticQueryResponseForm, Item, ItemElastic } from 'shared/models.model';
import { SearchSettings } from 'shared/search/search.model';

export interface ExportRecord {
    tinyId: string;
    cdeName: string;
    validationRules: RuleStatus[];
}

export interface ExportRecordSettings {
    searchSettings: SearchSettings;
    status?: CurationStatus;
}

@Injectable()
export class ExportService {
    constructor(private alertService: AlertService,
                private registrationValidatorService: RegistrationValidatorService,
                private elasticService: ElasticService,
                protected userService: UserService,
                protected http: HttpClient) {}

    async resultToCsv(result: ItemElastic[]) {
        const settings = this.elasticService.searchSettings;
        if (settings.tableViewFields.linkedForms) {
            if (result.length < 50) {
                for (const r of result) {
                    if (r !== undefined) {
                        const forms = await new Promise<Array<CdeForm>>(resolve => {
                            const lfSettings = this.elasticService.buildElasticQuerySettings(new SearchSettings(r.tinyId));
                            this.elasticService.generalSearchQuery(lfSettings, 'form',
                                (err?: string, esRes?: ElasticQueryResponseForm) => resolve(esRes && esRes.forms));
                        });
                        if (forms.length) { r.linkedForms = forms.map(f => f.tinyId).join(', '); }
                    }
                }
            } else {
                const lfSettings = this.elasticService.buildElasticQuerySettings(new SearchSettings());
                let esResp = await this.http.post<ElasticQueryResponse>('/server/form/scrollExport/form', lfSettings).toPromise();
                let totalNbOfForms = 0;
                let formCounter = 0;
                const nonEmptyResults = result.filter(r => r !== undefined);
                const intersectOnBatch = (esResp: ElasticQueryResponse) => {
                    if (esResp.hits.hits.length) {
                        totalNbOfForms = (esResp as any).hits.total;
                        for (const hit of (esResp as any).hits.hits) {
                            formCounter++;
                            const esForm = hit._source;
                            const formCdes = getFormQuestionsAsQuestionCde(esForm);
                            const interArr = _intersectionWith(
                                nonEmptyResults,
                                formCdes,
                                (a: any, b: any) => a.tinyId === b.tinyId);
                            interArr.forEach(matchId => {
                                const foundCdes = result.filter(c => c.tinyId === matchId.tinyId);
                                foundCdes.forEach(c => {
                                    if (c.linkedForms) {
                                        c.linkedForms = c.linkedForms + ', ' + esForm.tinyId;
                                    } else {
                                        c.linkedForms = esForm.tinyId;
                                    }
                                });
                            });
                            this.alertService.addAlert('success', 'Attaching linked forms '
                                + Math.trunc(100 * formCounter / totalNbOfForms) + '%');
                        }
                        return true;
                    } else { return false; }
                };
                let keepScrolling = true;
                while (keepScrolling) {
                    keepScrolling = intersectOnBatch(esResp);
                    esResp = await this.http.get<ElasticQueryResponse>('/server/form/scrollExport/' + (esResp as any)._scroll_id).toPromise();
                }
            }
        }
        return result.reduce(
            (csv, r) => csv + (r ? convertToCsv(projectItemForExport(r, settings.tableViewFields)) : '\n'),
            getCdeCsvHeader(settings.tableViewFields)
        );
    }

    exportSearchResults(type: 'cvs'|'json'|'validationRules'|'xml', module: 'cde'|'form', exportSettings: ExportRecordSettings,
                        cb?: Cb1<ExportRecord[] | undefined>) {
        if (!this.userService.loggedIn() && (module === 'form' || module === 'cde' && type === 'validationRules')) {
            return this.alertService.addAlert('danger', 'Please login to access this feature');
        }

        try {
            /* tslint:disable */
            !!new Blob();
            /* tslint:enable */
        } catch (e) {
            return this.alertService.addAlert('danger',
                'Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.');
        }

        if (type !== 'validationRules') {
            this.alertService.addAlert('', 'Your export is being generated, please wait.');
        }

        this.alertService.addAlert('', 'Fetching ' + module + 's. Please wait...');
        this.elasticService.getExport(
            this.elasticService.buildElasticQuerySettings(exportSettings.searchSettings), module || 'cde', (err, result) => {
                if (err) {
                    return this.alertService.addAlert('danger',
                        'The server is busy processing similar request, please try again in a minute.');
                }

                const exporters = {
                    csv: async (result: ItemElastic[]) => {
                        const csv = await this.resultToCsv(result);
                        const blob = new Blob([csv], {type: 'text/csv'});
                        saveAs(blob, 'SearchExport.csv');
                        this.alertService.addAlert('', 'Export downloaded.');
                    },
                    json: (result: ItemElastic[]) => {
                        const blob = new Blob([JSON.stringify(result)], {type: 'application/json'});
                        saveAs(blob, 'SearchExport.json');
                        this.alertService.addAlert('', 'Export downloaded.');
                    },
                    xml: (result: ItemElastic[]) => {
                        const zip = new JSZip();
                        result.forEach(oneElt => {
                            if (oneElt.linkedForms) {
                                oneElt.linkedForms.Preferred_Standard = oneElt.linkedForms['Preferred Standard'];
                                delete oneElt.linkedForms['Preferred Standard'];
                            }
                            zip.file(oneElt.tinyId + '.xml', JXON.jsToString({element: oneElt}));
                        });
                        zip.generateAsync({type: 'blob'}).then((content: any) => saveAs(content, 'SearchExport_XML.zip'));
                        this.alertService.addAlert('success', 'Export downloaded.');
                    },
                    odm: (elts: CdeFormElastic[]) => {
                        const zip = new JSZip();
                        elts.forEach(elt => {
                            getFormOdm(elt, (err, odmElt) => {
                                if (!err) { zip.file(elt.tinyId + '.xml', JXON.jsToString({ODM: odmElt})); }
                            });
                        });
                        zip.generateAsync({type: 'blob'}).then((content: any) => saveAs(content, 'SearchExport_ODM.zip'));
                        this.alertService.addAlert('success', 'Export downloaded.');
                    },
                    validationRules: (elts: ItemElastic[]) => {
                        const orgName = exportSettings.searchSettings.selectedOrg;
                        if (!cb || !orgName) {
                            return;
                        }
                        const status = exportSettings.status;
                        const validations: Promise<ExportRecord | undefined>[] = elts.map(elt => {
                            const cdeOrgRules = this.registrationValidatorService.getOrgRulesForCde(elt);
                            const ruleStatuses = processRules(elt, orgName, status, cdeOrgRules);
                            if (!ruleStatuses) {
                                return Promise.resolve(undefined);
                            }
                            const ruleStatusesExists = ruleStatuses;
                            return Promise.all(ruleStatuses.map(rule => rule.ruleResultPromise)).then(results => {
                                if (results.every(result => !result)) {
                                    return undefined; // All PASS
                                }
                                const record: ExportRecord = {
                                    tinyId: elt.tinyId,
                                    cdeName: elt.designations[0].designation,
                                    validationRules: ruleStatusesExists,
                                };
                                results.forEach((ri, i) => {
                                    record.validationRules[i].ruleError = ri;
                                });
                                return record;
                            });
                        });
                        Promise.all(validations).then(
                            r => cb(r.filter<ExportRecord>((r: ExportRecord | undefined): r is ExportRecord => !!r).slice(0, 100)),
                            () => cb(undefined)
                        );
                    }
                };

                if (result) {
                    const exporter = (exporters as any)[type];
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

    async quickBoardExport(elts: Item[]) {
        this.alertService.addAlert('', 'Fetching cdes. Please wait...');
        const csv = await this.resultToCsv(elts as ItemElastic[]);
        if (csv) {
            const blob = new Blob([csv], {type: 'text/csv'});
            saveAs(blob, 'QuickBoardExport' + '.csv');
            this.alertService.addAlert('', 'Export downloaded.');
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }

    async formCdeExport(form: CdeForm) {
        this.alertService.addAlert('', 'Fetching cdes. Please wait...');
        const tinyIdList = getFormQuestionsAsQuestionCde(form).map(f => f.tinyId);
        const elts = await this.http.get<DataElement[]>('/server/cde/deList/' + tinyIdList).toPromise().catch(_noop);
        let csv;
        if (elts) {
            csv = await this.resultToCsv(elts as DataElementElastic[]);
        }
        if (csv) {
            const blob = new Blob([csv], {type: 'text/csv'});
            saveAs(blob, 'FormCdes-' + form.tinyId + '.csv');
            this.alertService.addAlert('', 'Export downloaded.');
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }

    redcapExport(form: CdeForm) {
        RedcapExport.getZipRedCap(form);
        this.alertService.addAlert('', 'Export downloaded.');
    }


}
