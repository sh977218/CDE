import { Component } from "@angular/core";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../node_modules/feedback/stable/2.0/html2canvas.js";
import { Http } from '@angular/http';
import { SharedService } from 'core/shared.service';
import { ElasticService } from 'core/elastic.service';

@Component({
    selector: "cde-embed",
    templateUrl: "./embedApp.component.html"
})
export class EmbedAppComponent  {
    name = "Embedded NIH CDE Repository";

    constructor(private http: Http,
                private elasticSvc: ElasticService) {
        let args = {};
        let args1 = window.location.search.substr(1).split("&");
        args1.forEach(arg => {
            let argArr = arg.split("=");
            args[argArr[0]] = argArr[1];
        });

        this.http.get('/embed/' + args['id']).map(r => r.json()).subscribe(response => {
            this.embed = response;
            this.searchSettings.selectedOrg = response.org;
            this.search();
        });

        this.searchViewSettings = elasticSvc.getDefault();

    }

    searchViewSettings: any;

    searchType = 'cde';
    lastQueryTimeStamp: number;
    elts: any = [];
    resultPerPage: number;
    numPages: number;
    totalItems: number;
    took: number;
    cutoffIndex: number;
    searchStarted: boolean = false;

    aggregations: any = {};
    searchSettings = {
        q: ""
        , page: 1
        , classification: []
        , classificationAlt: []
        , regStatuses: []
        , resultPerPage: 5
        , selectedOrg: ""
    };
    selectedClassif: string = "";
    embed: any;

    selectElement () {
        this.searchSettings.classification.push(this.selectedClassif);
        this.selectedClassif = "";
        this.searchStarted = true;
        this.search();
    }

    crumbSelect (i) {
        this.searchSettings.classification.length = i + 1;
        this.search();
    };

    reset () {
        this.searchSettings.q = "";
        this.searchSettings.page = 1;
        this.searchSettings.classification = [];
        this.search();
        this.searchStarted = false;
    };



// $scope.concatenateQuestions = function(form) {
    //     var cdes = formShared.getFormCdes(form);
    //     return cdes.map(function(c) {return c.name;}).join(",");
    // };



    // $scope.searchCDEs = function() {$scope.searchType = 'cde';};
    // $scope.searchForms = function() {$scope.searchType = 'form';};

    doClassif(currentString, classif, result) {
        if (currentString.length > 0) {
            currentString = currentString + ';';
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach(function(cl) {
                this.doClassif(currentString, cl, result);
            });
        } else {
            result.push(currentString);
        }
    }

    flattenClassification(elt) {
        let result = [];
        if (elt.classification) {
            elt.classification.forEach(cl => {
                if (cl.elements) {
                    cl.elements.forEach(subCl => {
                        this.doClassif(cl.stewardOrg.name, subCl, result);
                    });
                }
            });
        }
        return result;
    }


    search () {
        this.searchSettings.resultPerPage = this.embed[this.searchType].pageSize;
        let embed4Type = {...this.embed[this.searchType]};

        let timestamp = new Date().getTime();
        this.lastQueryTimeStamp = timestamp;

        for (let i = 0; i < SharedService.regStatusShared.orderedList.length; i++) {
            this.searchSettings.regStatuses.push(SharedService.regStatusShared.orderedList[i]);
            if (SharedService.regStatusShared.orderedList[i] === embed4Type.minStatus) {
                i = SharedService.regStatusShared.orderedList.length;
            }
        }

        let settings = this.elasticSvc.buildElasticQuerySettings(this.searchSettings);

        this.elasticSvc.generalSearchQuery(settings, this.searchType, (err, result) => {
            if (err) {
                // $scope[type + 's'] = [];
                this.elts = [];
                return;
            }
            if (timestamp < this.lastQueryTimeStamp) return;
            this.numPages = Math.ceil(result.totalNumber / this.resultPerPage);
            this.totalItems = result.totalNumber;
            // $scope[type + 's'] = result[type + 's'];
            this.elts = result[this.searchType + 's'];
            this.took = result.took;

            if (this.searchSettings.page === 1 && result.totalNumber > 0) {
                let maxJump = 0;
                let maxJumpIndex = 100;
                this.elts.map((e, i) => {
                    if (!this.elts[i+1]) return;
                    let jump = e.score - this.elts[i+1].score;
                    if (jump>maxJump) {
                        maxJump = jump;
                        maxJumpIndex = i+1;
                    }
                });

                if (maxJump > (result.maxScore/4)) this.cutoffIndex = maxJumpIndex;
                else this.cutoffIndex = 100;
            } else {
                this.cutoffIndex = 100;
            }

            this.aggregations = result.aggregations;

            if (result.aggregations !== undefined && result.aggregations.flatClassifications !== undefined) {
                this.aggregations.flatClassifications = result.aggregations.flatClassifications.flatClassifications.buckets.map(c => {
                    return {name: c.key.split(';').pop(), count: c.doc_count};
                });
            } else {
                this.aggregations.flatClassifications = [];
            }
        //
        //     OrgHelpers.addLongNameToOrgs($scope.aggregations.orgs.orgs.buckets, OrgHelpers.orgsDetailedInfo);
        //


            this.searchViewSettings.tableViewFields.customFields = [];

            embed4Type.ids.forEach(eId => {
                this.searchViewSettings.tableViewFields.customFields.push({key: eId.idLabel, label: eId.idLabel});
                if (eId.version) {
                    this.searchViewSettings.tableViewFields.customFields.push({key: eId.idLabel + "_version", label: eId.versionLabel});
                }
            });

            embed4Type.otherNames.forEach(eName => {
                this.searchViewSettings.tableViewFields.customFields.push({key: eName.label, label: eName.label});
            });

            if (embed4Type.primaryDefinition && embed4Type.primaryDefinition.show) {
                this.searchViewSettings.tableViewFields.customFields.push({key: "primaryDefinition",
                    label: embed4Type.primaryDefinition.label, style: embed4Type.primaryDefinition.style});
            }

            if (embed4Type.registrationStatus && embed4Type.registrationStatus.show) {
                this.searchViewSettings.tableViewFields.customFields.push({key: "registrationStatus",
                    label: embed4Type.registrationStatus.label});
            }


            // Decorate
            this.elts.forEach(c => {
                c.embed = {
                    ids: []
                };

                if (embed4Type.ids) {
                    embed4Type.ids.forEach(eId => {
                        let id = c.ids.filter(e => e.source === eId.source)[0];
                        if (id) {
                            c.embed[eId.idLabel] = id.id;
                            if (eId.version) {
                                c.embed[eId.idLabel + "_version"] = id.version;
                            }
                        }
                    });
                }

                if (embed4Type.properties) {
                    embed4Type.properties.forEach(eProp => {
                        let prop = c.properties.filter(e => e.key === eProp.key)[0];
                        if (prop) {
                            c.embed[eProp.label] = prop.value;
                            if (eProp.limit > 0) {
                                c.embed[eProp.label] = c.embed[eProp.label].substr(0, eProp.limit);
                            }
                        }
                    });
                }

                if (embed4Type.otherNames) {
                    embed4Type.otherNames.forEach(eName => {
                        let name = c.naming.filter(n => {
                            return n.tags.filter(t => t.indexOf('Question Text') > -1).length > 0;
                        })[0];
                        if (name) {
                            c.embed[eName.label] = name.designation;
                        }
                    });
                }

                if (embed4Type.primaryDefinition && embed4Type.primaryDefinition.show) {
                    c.embed.primaryDefinition = c.naming[0].definition;
                }

                if (embed4Type.registrationStatus && embed4Type.registrationStatus.show) {
                    c.embed.registrationStatus = c.registrationState.registrationStatus;
                }

                if (embed4Type.classifications && embed4Type.classifications.length > 0) {
                    embed4Type.classifications.forEach(eCl => {
                        let flatClassifs = this.flattenClassification(c);
                        let exclude = new RegExp(eCl.exclude);
                        c.embed[eCl.label] = flatClassifs.filter(cl => {
                            result = cl.indexOf(eCl.startsWith) === 0;
                            if (eCl.exclude) result = result && !cl.match(exclude);
                            if (eCl.selectedOnly) {
                                result = result && cl.indexOf(this.embed.org + ";" +
                                    this.searchSettings.classification.join(";")) === 0;
                            }
                            return result;
                        }).map(cl => cl.substr(eCl.startsWith.length));
                    });
                }

                if (embed4Type.linkedForms && embed4Type.linkedForms.show) {
                    c.embed.linkedForms = [];

                    let lfSettings = this.elasticSvc.buildElasticQuerySettings({
                        selectedOrg: this.embed.org
                        , q: c.tinyId
                        , page: 1
                        , classification: []
                        , classificationAlt: []
                        , regStatuses: []
                    });

                    this.elasticSvc.generalSearchQuery(lfSettings, "form", (err, result) => {
                        if (result.forms) {
                            result.forms.forEach(crf => c.embed.linkedForms.push({name: crf.primaryNameCopy}));
                        }
                    });
                }

            });

        });
    };

}