import { Injectable } from "@angular/core";
import * as JSZip from "jszip";
import * as JXON from "jxon";
import { saveAs } from "file-saver";
import { ElasticService } from '_app/elastic.service';
import { getFormCdes, getFormOdm } from 'shared/form/formShared';
import { RegistrationValidatorService } from "core/registrationValidator.service";
import { SharedService } from '_commonApp/shared.service';
import { UserService } from '_app/user.service';
import { AlertService } from '_app/alert/alert.service';
import { HttpClient } from "@angular/common/http";
import { CdeForm } from "../../shared/form/form.model";

@Injectable()
export class ExportService {
    constructor(private alertService: AlertService,
                private registrationValidatorService: RegistrationValidatorService,
                private elasticService: ElasticService,
                protected userService: UserService,
                protected http: HttpClient) {
    }

    exportSearchResults(type, module, exportSettings) {
        if (module === 'form' && (!this.userService.user || !this.userService.user._id)) {
            return this.alertService.addAlert("danger", "Please login to access this feature");
        }

        try {
            !!new Blob;
        } catch (e) {
            return this.alertService.addAlert("danger",
                "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }

        if (type !== 'validationRules') {
            this.alertService.addAlert("warning", "Your export is being generated, please wait.");
        }

        this.elasticService.getExport(
            this.elasticService.buildElasticQuerySettings(exportSettings.searchSettings), module || 'cde', (err, result) => {
                if (err) {
                    return this.alertService.addAlert("danger",
                        "The server is busy processing similar request, please try again in a minute.");
                }

                let exporters = {
                    'csv': async result => {
                        let settings = this.elasticService.searchSettings;
                        let csv = SharedService.exportShared.getCdeCsvHeader(settings.tableViewFields);
                        if (settings.tableViewFields.linkedForms) {
                            if (result.length < 50) {
                                for (let r of result) {
                                    let forms = await new Promise<Array<CdeForm>>(resolve => {
                                        let lfSettings = this.elasticService.buildElasticQuerySettings({
                                            q: r.tinyId
                                            , page: 1
                                            , classification: []
                                            , classificationAlt: []
                                            , regStatuses: []
                                        });
                                        this.elasticService.generalSearchQuery(lfSettings, 'form', (err, esRes) => {
                                            resolve(esRes.forms);
                                        });
                                    });
                                    if (forms.length) {
                                        r.linkedForms = forms.map(f => f.tinyId).join(", ");
                                    }
                                }
                            } else {

                            }
                        }
                        result.forEach(r => {
                            csv += SharedService.exportShared.convertToCsv(
                                SharedService.exportShared.projectCdeForExport(r, settings.tableViewFields));
                        });
                        let blob = new Blob([csv], {type: "text/csv"});
                        saveAs(blob, 'SearchExport.csv');
                    },
                    'json': result => {
                        let blob = new Blob([JSON.stringify(result)], {type: "application/json"});
                        saveAs(blob, "SearchExport.json");
                    },
                    'xml': result => {
                        let zip = new JSZip();
                        result.forEach(oneElt => zip.file(oneElt.tinyId + ".xml", JXON.jsToString({element: oneElt})));
                        zip.generateAsync({type: "blob"}).then(content => saveAs(content, "SearchExport_XML.zip"));
                    },
                    'odm': result => {
                        let zip = new JSZip();
                        result.forEach(oneElt => {
                            getFormOdm(oneElt, (err, odmElt) => {
                                if (!err) zip.file(oneElt.tinyId + ".xml", JXON.jsToString({ODM: odmElt}));
                            });
                        });
                        zip.generateAsync({type: "blob"}).then(content => saveAs(content, "SearchExport_ODM.zip"));
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
                    let exporter = exporters[type];
                    if (!exporter) {
                        this.alertService.addAlert("danger", "This export format is not supported.");
                    } else {
                        exporter(result);
                        if (type !== 'validationRules') this.alertService.addAlert("success", "Export downloaded.");
                    }
                } else {
                    this.alertService.addAlert("danger", "There was no data to export.");
                }
            });
    }

    quickBoardExport(elts) {
        let settings = this.elasticService.searchSettings;
        let result = SharedService.exportShared.getCdeCsvHeader(settings.tableViewFields);
        elts.forEach(ele => {
            result += SharedService.exportShared.convertToCsv(
                SharedService.exportShared.projectCdeForExport(ele, settings.tableViewFields));
        });

        if (result) {
            let blob = new Blob([result], {type: "text/csv"});
            saveAs(blob, 'QuickBoardExport' + '.csv');
            this.alertService.addAlert("success", "Export downloaded.");
        } else {
            this.alertService.addAlert("danger", "Something went wrong, please try again in a minute.");
        }
    }

    async formCdeExport (form) {
        let settings = this.elasticService.searchSettings;
        let result = SharedService.exportShared.getCdeCsvHeader(settings.tableViewFields);

        for (let qCde of getFormCdes(form)) {
            const cde = await this.http.get('/de/' + qCde.tinyId).toPromise().catch(() => {});
            if (!cde) result += "\n";
            else {
                result += SharedService.exportShared.convertToCsv(
                    SharedService.exportShared.projectCdeForExport(cde, settings.tableViewFields));
            }
        }

        if (result) {
            let blob = new Blob([result], {
                type: "text/csv"
            });
            saveAs(blob, 'FormCdes-' + form.tinyId + '.csv');
            this.alertService.addAlert("success", "Export downloaded.");
        } else {
            this.alertService.addAlert("danger", "Something went wrong, please try again in a minute.");
        }
    }


}
