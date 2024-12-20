import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ScrollResponse } from '@elastic/elasticsearch/api/types';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { getFormQuestionsAsQuestionCde } from 'core/form/fe';
import { getFormOdm } from 'core/form/form';
import { convertToCsv, getCdeCsvHeader, projectItemForExport } from 'core/system/export';
import { RedcapExport } from 'form/redcapExport';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import JXON from 'jxon';
import { intersectionWith } from 'lodash';
import { fetchFormStringById } from 'nativeRender/form.service';
import { processRules, RegistrationValidatorService, RuleStatus } from 'non-core/registrationValidator.service';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { ElasticSearchResponseBody, responseHitsTotal } from 'shared/elastic';
import { CdeForm, CdeFormElastic, ElasticResponseDataForm } from 'shared/form/form.model';
import { Item, ItemElastic } from 'shared/item';
import { Cb1, CurationStatus, ModuleItem } from 'shared/models.model';
import { toPromise } from 'shared/observable';
import { SearchSettings } from 'shared/search/search.model';
import { noop } from 'shared/util';

export interface ExportRecord {
    tinyId: string;
    cdeName: string;
    validationRules: RuleStatus[];
}

export interface ExportRecordSettings {
    searchSettings: SearchSettings;
    status?: CurationStatus;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
    constructor(
        private alertService: AlertService,
        private registrationValidatorService: RegistrationValidatorService,
        private elasticService: ElasticService,
        protected userService: UserService,
        protected http: HttpClient
    ) {}

    async resultToCsv(result: ItemElastic[]): Promise<string> {
        const settings = this.elasticService.searchSettings;
        if (settings.tableViewFields.linkedForms) {
            if (result.length < 50) {
                for (const r of result) {
                    if (r !== undefined) {
                        const forms = await new Promise<CdeForm[] | undefined>(resolve => {
                            const lfSettings = this.elasticService.buildElasticQuerySettings(
                                new SearchSettings(r.tinyId)
                            );
                            this.elasticService.generalSearchQuery(
                                lfSettings,
                                'form',
                                (err?: string, esRes?: ElasticResponseDataForm) => resolve(esRes && esRes.forms)
                            );
                        });
                        if (forms && forms.length) {
                            (r as any).linkedForms = forms.map(f => f.tinyId).join(', ');
                        }
                    }
                }
            } else {
                const lfSettings = this.elasticService.buildElasticQuerySettings(new SearchSettings());
                let esResp = await toPromise(
                    this.http.post<ElasticSearchResponseBody<ItemElastic>>('/server/form/scrollExport', lfSettings)
                );
                let totalNbOfForms = 0;
                let formCounter = 0;
                const nonEmptyResults = result.filter(r => r !== undefined);
                const intersectOnBatch = (esResp: ElasticSearchResponseBody<any>) => {
                    if (esResp.hits.hits.length) {
                        totalNbOfForms = responseHitsTotal(esResp);
                        for (const hit of (esResp as any).hits.hits) {
                            formCounter++;
                            const esForm = hit._source;
                            const formCdes = getFormQuestionsAsQuestionCde(esForm);
                            const interArr: ItemElastic[] = intersectionWith(
                                nonEmptyResults,
                                formCdes,
                                (a: any, b: any) => a.tinyId === b.tinyId
                            );
                            interArr.forEach(matchId => {
                                const foundCdes = result.filter(c => c.tinyId === matchId.tinyId);
                                foundCdes.forEach((c: ItemElastic) => {
                                    if ((c as DataElementElastic).linkedForms) {
                                        (c as any).linkedForms =
                                            (c as DataElementElastic).linkedForms + ', ' + esForm.tinyId;
                                    } else {
                                        (c as DataElementElastic).linkedForms = esForm.tinyId;
                                    }
                                });
                            });
                            this.alertService.addAlert(
                                'success',
                                'Attaching linked forms ' + Math.trunc((100 * formCounter) / totalNbOfForms) + '%'
                            );
                        }
                        return true;
                    } else {
                        return false;
                    }
                };
                let keepScrolling = true;
                while (keepScrolling) {
                    keepScrolling = intersectOnBatch(esResp);
                    // tslint:disable-next-line:max-line-length
                    esResp = await toPromise(
                        this.http.get<ScrollResponse<CdeFormElastic>>(
                            '/server/form/scrollExport/' + (esResp as any)._scroll_id
                        )
                    );
                }
            }
        }
        return result.reduce(
            (csv, r) => csv + (r ? convertToCsv(projectItemForExport(r, settings.tableViewFields)) : '\n'),
            getCdeCsvHeader(settings.tableViewFields)
        );
    }

    exportDe = (elt: DataElement, queryString: string, type: 'json' | 'xml') => {
        fetch('/server/de/byId/' + elt._id + queryString)
            .then(res => res.text())
            .then(data => {
                const blob = new Blob([data], { type: 'application/' + type });
                saveAs(blob, elt.tinyId + '.' + type);
                this.alertService.addAlert('', 'Export downloaded.');
            })
            .catch(err => {
                this.alertService.addAlert('', 'Export failed with err: ' + err);
            });
    };

    exportForm = (elt: CdeForm, queryString: string, type: 'json' | 'xml') => {
        fetchFormStringById(elt._id, queryString)
            .then(data => {
                const blob = new Blob([data], { type: 'application/' + type });
                saveAs(blob, elt.tinyId + '.' + type);
                this.alertService.addAlert('', 'Export downloaded.');
            })
            .catch(err => {
                this.alertService.addAlert('', 'Export failed with err: ' + err);
            });
    };

    exportSearchResults(
        type: 'csv' | 'json' | 'odm' | 'validationRules' | 'xml',
        module: ModuleItem,
        exportSettings: ExportRecordSettings,
        cb?: Cb1<ExportRecord[] | undefined>
    ) {
        if (!this.userService.user && (module === 'form' || (module === 'cde' && type === 'validationRules'))) {
            return this.alertService.addAlert('danger', 'Please login to access this feature');
        }

        try {
            /* tslint:disable */
            new Blob();
            /* tslint:enable */
        } catch (e) {
            return this.alertService.addAlert(
                'danger',
                'Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.'
            );
        }

        this.elasticService.getExport(
            this.elasticService.buildElasticQuerySettings(exportSettings.searchSettings),
            module || 'cde',
            (err, result) => {
                if (err) {
                    return this.alertService.addAlert(
                        'danger',
                        'The server is busy processing similar request, please try again in a minute.'
                    );
                }

                const exporters = {
                    csv: async (result: ItemElastic[]) => {
                        const csv = await this.resultToCsv(result);
                        const blob = new Blob([csv], { type: 'text/csv' });
                        saveAs(blob, 'SearchExport.csv');
                        this.alertService.addAlert('', 'Search results downloaded as CSV.');
                    },
                    json: (result: ItemElastic[]) => {
                        const blob = new Blob([JSON.stringify(result)], {
                            type: 'application/json',
                        });
                        saveAs(blob, 'SearchExport.json');
                        this.alertService.addAlert('', 'Search results downloaded as JSON.');
                    },
                    xml: (result: ItemElastic[]) => {
                        const zip = new JSZip();
                        result.forEach((oneElt: ItemElastic) => {
                            if ((oneElt as DataElementElastic).linkedForms) {
                                ((oneElt as DataElementElastic).linkedForms as any).Preferred_Standard = (
                                    oneElt as DataElementElastic
                                ).linkedForms['Preferred Standard'];
                                delete (oneElt as any).linkedForms['Preferred Standard'];
                            }
                            const rootElement = module === 'cde' ? 'dataElement' : 'element';
                            zip.file(oneElt.tinyId + '.xml', JXON.jsToString({ [rootElement]: oneElt }));
                        });
                        zip.generateAsync({ type: 'blob' }).then((content: any) =>
                            saveAs(content, 'SearchExport_XML.zip')
                        );
                        this.alertService.addAlert('success', 'Search results downloaded as XML.');
                    },
                    odm: (elts: CdeFormElastic[]) => {
                        const zip = new JSZip();
                        elts.forEach(elt => {
                            getFormOdm(elt, (err, odmElt) => {
                                if (!err) {
                                    zip.file(elt.tinyId + '.xml', JXON.jsToString({ ODM: odmElt }));
                                }
                            });
                        });
                        zip.generateAsync({ type: 'blob' }).then((content: any) =>
                            saveAs(content, 'SearchExport_ODM.zip')
                        );
                        this.alertService.addAlert('success', 'Search results downloaded as ODM XML.');
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
                            r =>
                                cb(
                                    r
                                        .filter<ExportRecord>((r: ExportRecord | undefined): r is ExportRecord => !!r)
                                        .slice(0, 100)
                                ),
                            () => cb(undefined)
                        );
                    },
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
            }
        );
    }

    async quickBoardExport(elts: Item[]) {
        const csv = await this.resultToCsv(elts as ItemElastic[]);
        if (csv) {
            const blob = new Blob([csv], { type: 'text/csv' });
            saveAs(blob, 'QuickBoardExport' + '.csv');
            this.alertService.addAlert('', 'Export downloaded.');
        } else {
            this.alertService.addAlert('danger', 'Something went wrong, please try again in a minute.');
        }
    }

    async formCdeExport(form: CdeForm) {
        const tinyIdList = getFormQuestionsAsQuestionCde(form).map(f => f.tinyId);
        const elts = await toPromise(this.http.get<DataElement[]>('/server/de/list/' + tinyIdList)).catch(noop);
        let csv;
        if (elts) {
            csv = await this.resultToCsv(elts as DataElementElastic[]);
        }
        if (csv) {
            const blob = new Blob([csv], { type: 'text/csv' });
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
