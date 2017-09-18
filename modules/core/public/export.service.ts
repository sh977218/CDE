import { Inject, Injectable } from "@angular/core";
import * as JSZip from "jszip";
import * as JXON from "jxon";
import { saveAs } from "file-saver";
import { AlertService } from "system/public/components/alert/alert.service";
import { ElasticService } from 'core/public/elastic.service';
import { RegistrationValidatorService } from "system/public/components/registrationValidator.service";
import { SharedService } from "./shared.service";
import { UserService } from "./user.service";

@Injectable()
export class ExportService {
    constructor(private alertService: AlertService,
                private registrationValidatorService: RegistrationValidatorService,
                private elasticService: ElasticService,
                @Inject("SearchSettings") private searchSettings,
                protected userService: UserService) {
    }

    exportSearchResults(type, module, exportSettings) {
        if (module === 'form' && (!this.userService.user || !this.userService.user._id))
            return this.alertService.addAlert("danger", "Please login to access this feature");

        try {
            !!new Blob;
        } catch (e) {
            return this.alertService.addAlert("danger",
                "Export feature is not supported in this browser. Please try Google Chrome or Mozilla FireFox.");
        }

        if (type !== 'validationRules')
            this.alertService.addAlert("warning", "Your export is being generated, please wait.");

        this.elasticService.getExport(
            this.elasticService.buildElasticQuerySettings(exportSettings.searchSettings),
            module || 'cde',
            (err, result) => {
                if (err)
                    return this.alertService.addAlert("danger",
                        "The server is busy processing similar request, please try again in a minute.");

                let exporters = {
                    'csv': (result) => {
                        this.searchSettings.getPromise().then(function (settings) {
                            let csv = SharedService.exportShared.getCdeCsvHeader(settings.tableViewFields);
                            result.forEach(function (ele) {
                                csv += SharedService.exportShared.convertToCsv(
                                    SharedService.exportShared.projectCdeForExport(ele, settings.tableViewFields));
                            });
                            let blob = new Blob([csv], {type: "text/csv"});
                            saveAs(blob, 'SearchExport.csv');
                        });
                    },
                    'json': function (result) {
                        let blob = new Blob([JSON.stringify(result)], {type: "application/json"});
                        saveAs(blob, "SearchExport.json");
                    },
                    'xml': function (result) {
                        let zip = new JSZip();
                        result.forEach(function (oneElt) {
                            zip.file(oneElt.tinyId + ".xml", JXON.jsToString({element: oneElt}));
                        });
                        let content = zip.generate({type: "blob"});
                        saveAs(content, "SearchExport_XML.zip");
                    },
                    'odm': function (result) {
                        let zip = new JSZip();
                        result.forEach(function (oneElt) {
                            SharedService.formShared.getFormOdm(oneElt, function (err, odmElt) {
                                if (!err) zip.file(oneElt.tinyId + ".xml", JXON.jsToString({ODM: odmElt}));
                            });
                        });
                        let content = zip.generate({type: "blob"});
                        saveAs(content, "SearchExport_ODM.zip");
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
        this.searchSettings.getPromise().then((settings) => {
            let result = SharedService.exportShared.getCdeCsvHeader(settings.tableViewFields);
            elts.forEach(function (ele) {
                result += SharedService.exportShared.convertToCsv(
                    SharedService.exportShared.projectCdeForExport(ele, settings.tableViewFields));
            });

            if (result) {
                let blob = new Blob([result], {
                    type: "text/csv"
                });
                saveAs(blob, 'QuickBoardExport' + '.csv');
                this.alertService.addAlert("success", "Export downloaded.");
            } else {
                this.alertService.addAlert("danger", "Something went wrong, please try again in a minute.");
            }
        });
    }
}
