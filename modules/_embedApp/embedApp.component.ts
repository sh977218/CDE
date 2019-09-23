import '../../node_modules/feedback/stable/2.0/html2canvas.js';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { SearchSettings } from 'search/search.model';
import { orderedList } from 'shared/system/regStatusShared';
import {
    ClassificationElement, ElasticQueryResponseAggregationsItem, ElasticQueryResponseDe, ElasticQueryResponseForm,
    ElasticQueryResponseItem, Embed, ItemElastic, ModuleItem, UserSearchSettings
} from 'shared/models.model';


@Component({
    selector: 'cde-embed',
    templateUrl: './embedApp.component.html'
})
export class EmbedAppComponent {
    aggregations: any = {};
    cutoffIndex?: number;
    elts: ItemElastic[] = [];
    embed!: Embed;
    lastQueryTimeStamp?: number;
    name = 'Embedded NIH CDE Repository';
    searchStarted = false;
    searchSettings: SearchSettings = new SearchSettings('', 5);
    searchType: ModuleItem = 'cde';
    searchViewSettings: UserSearchSettings;
    selectedClassif = '';
    took?: number;
    totalItems?: number;

    constructor(private http: HttpClient,
                private elasticSvc: ElasticService) {
        const args: any = {};
        const args1 = window.location.search.substr(1).split('&');
        args1.forEach(arg => {
            const argArr = arg.split('=');
            args[argArr[0]] = argArr[1];
        });

        this.http.get<Embed>('/server/embed/' + args.id).subscribe(response => {
            this.embed = response;
            this.searchViewSettings.tableViewFields.customFields = [];
            const customFields = this.searchViewSettings.tableViewFields.customFields;

            const embed4Type = Object.assign({}, this.embed[this.searchType]);

            if (embed4Type.ids) {
                embed4Type.ids.forEach(eId => {
                    customFields.push({key: eId.idLabel, label: eId.idLabel});
                    if (eId.version) {
                        customFields.push({key: eId.idLabel + '_version', label: eId.versionLabel});
                    }
                });
            }

            if (embed4Type.otherNames) {
                embed4Type.otherNames.forEach(eName => {
                    customFields.push({key: eName.label, label: eName.label});
                });
            }

            if (embed4Type.primaryDefinition && embed4Type.primaryDefinition.show) {
                this.searchViewSettings.tableViewFields.customFields.push({
                    key: 'primaryDefinition',
                    label: embed4Type.primaryDefinition.label, style: embed4Type.primaryDefinition.style
                });
            }

            if (embed4Type.registrationStatus && embed4Type.registrationStatus.show) {
                this.searchViewSettings.tableViewFields.customFields.push({
                    key: 'registrationStatus',
                    label: embed4Type.registrationStatus.label
                });
            }

            this.searchSettings.selectedOrg = response.org;
            this.search();
        });

        this.searchViewSettings = ElasticService.getDefault();
    }

    crumbSelect(i: number) {
        this.searchSettings.classification.length = i + 1;
        this.search();
    }

    doClassif(currentString: string, classif: ClassificationElement, result: string[]) {
        if (currentString.length > 0) {
            currentString = currentString + ';';
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach(cl => {
                this.doClassif(currentString, cl, result);
            });
        } else {
            result.push(currentString);
        }
    }

    flattenClassification(elt: ItemElastic) {
        const result: string[] = [];
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

    reset() {
        this.searchSettings.q = '';
        this.searchSettings.page = 1;
        this.searchSettings.classification = [];
        this.search();
        this.searchStarted = false;
    }

    search() {
        const embedItem = this.embed[this.searchType];
        this.searchSettings.resultPerPage = embedItem ? embedItem.pageSize : 0;
        const embed4Type = Object.assign({}, this.embed[this.searchType]);

        const timestamp = new Date().getTime();
        const lastQueryTimeStamp = this.lastQueryTimeStamp = timestamp;

        for (let i = 0; i < orderedList.length; i++) {
            this.searchSettings.regStatuses.push(orderedList[i]);
            if (orderedList[i] === embed4Type.lowestRegistrationStatus) {
                i = orderedList.length;
            }
        }

        const settings = this.elasticSvc.buildElasticQuerySettings(this.searchSettings);
        settings.fullRecord = true;

        this.elasticSvc.generalSearchQuery(settings, this.searchType,
            (err?: string, r?: ElasticQueryResponseItem) => {
                const result = r as ElasticQueryResponseAggregationsItem;
                if (err || !result) {
                    this.elts = [];
                    return;
                }
                if (timestamp < lastQueryTimeStamp) {
                    return;
                }
                this.totalItems = result.totalNumber;
                this.elts = this.searchType === 'cde'
                    ? (result as ElasticQueryResponseDe).cdes
                    : (result as ElasticQueryResponseForm).forms;
                this.took = result.took;

                if (this.searchSettings.page === 1 && result.totalNumber > 0) {
                    let maxJump = 0;
                    let maxJumpIndex = 100;
                    this.elts.map((e, i) => {
                        if (!this.elts[i + 1]) {
                            return;
                        }
                        const jump = e.score - this.elts[i + 1].score;
                        if (jump > maxJump) {
                            maxJump = jump;
                            maxJumpIndex = i + 1;
                        }
                    });

                    if (maxJump > (result.maxScore / 4)) {
                        this.cutoffIndex = maxJumpIndex;
                    } else {
                        this.cutoffIndex = 100;
                    }
                } else {
                    this.cutoffIndex = 100;
                }

                this.aggregations = result.aggregations;

                if (result.aggregations !== undefined && result.aggregations.flatClassifications !== undefined) {
                    this.aggregations.flatClassifications = result.aggregations.flatClassifications.flatClassifications.buckets
                        .map(c => ({name: c.key.split(';').pop(), count: c.doc_count}));
                } else {
                    this.aggregations.flatClassifications = [];
                }

                // Decorate
                this.elts.forEach(c => {
                    c.embed = {
                        ids: []
                    };

                    if (embed4Type.ids) {
                        embed4Type.ids.forEach(eId => {
                            const id = c.ids.filter(e => e.source === eId.source)[0];
                            if (id) {
                                c.embed[eId.idLabel] = id.id;
                                if (eId.version) {
                                    c.embed[eId.idLabel + '_version'] = id.version;
                                }
                            }
                        });
                    }

                    if (embed4Type.properties) {
                        embed4Type.properties.forEach(eProp => {
                            const prop = c.properties.filter(e => e.key === eProp.key)[0];
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
                            const name = c.designations.filter(
                                n => (n.tags || []).filter(t => t.indexOf('Question Text') > -1).length > 0
                            )[0];
                            if (name) {
                                c.embed[eName.label] = name.designation;
                            }
                        });
                    }

                    if (embed4Type.primaryDefinition && embed4Type.primaryDefinition.show) {
                        c.embed.primaryDefinition = c.definitions[0].definition;
                    }

                    if (embed4Type.registrationStatus && embed4Type.registrationStatus.show) {
                        c.embed.registrationStatus = c.registrationState.registrationStatus;
                    }

                    if (embed4Type.classifications && embed4Type.classifications.length > 0) {
                        embed4Type.classifications.forEach(eCl => {
                            const flatClassifs = this.flattenClassification(c);
                            const exclude = new RegExp(eCl.exclude);
                            c.embed[eCl.label] = flatClassifs.filter(cl => {
                                let result = cl.indexOf(eCl.startsWith) === 0;
                                if (eCl.exclude) {
                                    result = result && !cl.match(exclude);
                                }
                                if (eCl.selectedOnly) {
                                    result = result && cl.indexOf(this.embed.org + ';' +
                                        this.searchSettings.classification.join(';')) === 0;
                                }
                                return result;
                            }).map(cl => cl.substr(eCl.startsWith.length));
                        });
                    }

                    if (embed4Type.linkedForms && embed4Type.linkedForms.show) {
                        c.embed.linkedForms = [];

                        const searchSettings = new SearchSettings(c.tinyId);
                        searchSettings.selectedOrg = this.embed.org;
                        const lfSettings = this.elasticSvc.buildElasticQuerySettings(searchSettings);

                        this.elasticSvc.generalSearchQuery(lfSettings, 'form', (err?: string, result?: ElasticQueryResponseForm) => {
                            if (err || !result) {
                                return;
                            }
                            if (result.forms) {
                                result.forms.forEach(crf => c.embed.linkedForms.push({name: crf.primaryNameCopy}));
                            }
                        });
                    }

                });

            });
    }

    selectElement() {
        this.searchSettings.classification.push(this.selectedClassif);
        this.selectedClassif = '';
        this.searchStarted = true;
        this.search();
    }
}
