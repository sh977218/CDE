import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ElasticService } from '_app/elastic.service';
import { CdeTableViewPreferencesComponent } from 'search/tableViewPreferences/cdeTableViewPreferencesComponent';
import { FormTableViewPreferencesComponent } from 'search/tableViewPreferences/formTableViewPreferencesComponent';

@Component({
    selector: 'cde-table-list',
    templateUrl: './tableList.component.html',
    styles: [`
        :host >>> ul {
            padding-left: 15px;
        }
    `]
})
export class TableListComponent implements OnInit {
    @Input() set elts(elts: any[]) {
        this._elts = elts;
        this.render();
    }

    get elts() {
        return this._elts;
    }

    @Input() module: string;

    private _elts: any[];
    headings: string[];
    rows: any[];

    searchSettings;

    constructor(public dialog: MatDialog,
                public esService: ElasticService) {
        this.searchSettings = this.esService.searchSettings;
    }

    ngOnInit() {
        this.render();
    }

    render() {
        if (!this.esService.searchSettings.tableViewFields) return;
        if (this.module === 'cde') this.renderCde();
        else if (this.module === 'form') this.renderForm();
    }

    renderCde() {
        let tableSetup = this.searchSettings.tableViewFields;
        this.headings = [];
        if (tableSetup.name) this.headings.push('Name');
        if (tableSetup.questionTexts) this.headings.push('Question Texts');
        if (tableSetup.naming) this.headings.push('Other Names');
        if (tableSetup.permissibleValues) this.headings.push('Permissible Values');
        if (tableSetup.pvCodeNames) this.headings.push('Code Names');
        if (tableSetup.nbOfPVs) this.headings.push('Nb of PVs');
        if (tableSetup.uom) this.headings.push('Unit of Measure');
        if (tableSetup.stewardOrg) this.headings.push('Steward');
        if (tableSetup.usedBy) this.headings.push('Used by');
        if (tableSetup.registrationStatus) this.headings.push('Registration Status');
        if (tableSetup.administrativeStatus) this.headings.push('Admin Status');
        if (tableSetup.ids) {
            if (tableSetup.identifiers.length > 0) tableSetup.identifiers.forEach(i => this.headings.push(i));
            else this.headings.push('Identifiers');
        }
        if (tableSetup.source) this.headings.push('Source');
        if (tableSetup.updated) this.headings.push('Updated');
        if (tableSetup.tinyId) this.headings.push('NLM ID');
        if (tableSetup.linkedForms) this.headings.push('Forms');

        this.rows = this.elts.map(e => {
            let row = [];
            if (tableSetup.name) {
                row.push({
                    css: 'name',
                    elt: e
                });
            }
            if (tableSetup.questionTexts) {
                row.push({
                    css: 'naming',
                    values: TableListComponent.truncatedList(TableListComponent.getQuestionTexts(e), n => n.designation),
                });
            }
            if (tableSetup.naming) {
                row.push({
                    css: 'naming',
                    values: TableListComponent.truncatedList(TableListComponent.getOtherNames(e), n => n.designation),
                });
            }
            if (tableSetup.permissibleValues) {
                row.push({
                    css: 'permissibleValues multiline-ellipsis',
                    datatype: e.valueDomain.datatype,
                    values: TableListComponent.truncatedList(e.valueDomain.permissibleValues, pv => pv.permissibleValue)
                });
            }
            if (tableSetup.pvCodeNames) {
                row.push({
                    css: 'permissibleValues multiline-ellipsis',
                    datatype: e.valueDomain.datatype,
                    values: TableListComponent.truncatedList(e.valueDomain.permissibleValues, pv => pv.valueMeaningName)
                });
            }
            if (tableSetup.nbOfPVs) {
                row.push({
                    css: 'nbOfPVs',
                    value: e.valueDomain.nbOfPVs
                });
            }
            if (tableSetup.uom) {
                row.push({
                    css: 'uom',
                    value: e.valueDomain.uom
                });
            }
            if (tableSetup.stewardOrg) {
                row.push({
                    css: 'stewardOrg',
                    value: e.stewardOrg.name
                });
            }
            if (tableSetup.usedBy) {
                row.push({
                    css: 'usedBy multiline-ellipsis',
                    value: e.usedBy && TableListComponent.lineClip(e.usedBy.join(', '))
                });
            }
            if (tableSetup.registrationStatus) {
                row.push({
                    css: 'registrationStatus',
                    value: e.registrationState.registrationStatus
                });
            }
            if (tableSetup.administrativeStatus) {
                row.push({
                    css: 'administrativeStatus',
                    value: e.registrationState.administrativeStatus
                });
            }
            if (tableSetup.ids) {
                if (tableSetup.identifiers.length > 0) {
                    tableSetup.identifiers.forEach(i => {
                        let value = '';
                        e.ids.forEach(id => {
                            if (id.source === i) {
                                value = id.id + (id.version ? " v" + id.version : "");
                            }
                        });
                        row.push({
                            css: i,
                            values: value
                        });
                    });
                } else {
                    row.push({
                        css: 'ids',
                        values: TableListComponent.truncatedList(e.ids, (e) => e)
                    });
                }
            }
            if (tableSetup.source) {
                row.push({
                    css: 'source',
                    value: e.source
                });
            }
            if (tableSetup.updated) {
                row.push({
                    css: 'updated',
                    value: e.updated ? new Date(e.updated).toLocaleString('en-US') : null
                });
            }
            if (tableSetup.tinyId) {
                row.push({
                    css: '',
                    value: e.tinyId
                });
            }
            if (tableSetup.linkedForms) {
                let lfSettings = this.esService.buildElasticQuerySettings({
                    q: e.tinyId
                    , page: 1
                    , classification: []
                    , classificationAlt: []
                    , regStatuses: []
                });

                let values = [];
                this.esService.generalSearchQuery(lfSettings, 'form', (err, result) => {
                    if (result.forms) {
                        if (result.forms.length > 5) result.forms.length = 5;
                        result.forms.forEach(crf => values.push({name: crf.primaryNameCopy, tinyId: crf.tinyId}));
                    }
                    row.push({
                        css: 'linkedForms',
                        values: values
                    });
                });
            }
            return row;
        });
    }

    renderForm() {
        let tableSetup = this.searchSettings.tableViewFields;
        this.headings = [];
        if (tableSetup.name) this.headings.push('Name');
        if (tableSetup.naming) this.headings.push('Other Names');
        if (tableSetup.stewardOrg) this.headings.push('Steward');
        if (tableSetup.usedBy) this.headings.push('Used by');
        if (tableSetup.registrationStatus) this.headings.push('Registration Status');
        if (tableSetup.administrativeStatus) this.headings.push('Admin Status');
        if (tableSetup.ids) {
            if (tableSetup.identifiers.length > 0) {
                tableSetup.identifiers.forEach(i => {
                    this.headings.push(i);
                });
            } else this.headings.push('Identifiers');
        }
        if (tableSetup.numQuestions) this.headings.push('Questions');
        if (tableSetup.source) this.headings.push('Source');
        if (tableSetup.updated) this.headings.push('Updated');
        if (tableSetup.tinyId) this.headings.push('NLM ID');

        this.rows = this.elts.map(e => {
            let row = [];
            if (tableSetup.name) {
                row.push({
                    css: 'name',
                    elt: e
                });
            }
            if (tableSetup.naming) {
                row.push({
                    css: 'naming',
                    values: TableListComponent.truncatedList(TableListComponent.getOtherNames(e), n => n.designation),
                });
            }
            if (tableSetup.stewardOrg) {
                row.push({
                    css: 'stewardOrg',
                    value: e.stewardOrg.name
                });
            }
            if (tableSetup.usedBy) {
                row.push({
                    css: 'usedBy multiline-ellipsis',
                    value: e.usedBy && TableListComponent.lineClip(e.usedBy.join(', '))
                });
            }
            if (tableSetup.registrationStatus) {
                row.push({
                    css: 'registrationStatus',
                    value: e.registrationState.registrationStatus
                });
            }
            if (tableSetup.administrativeStatus) {
                row.push({
                    css: 'administrativeStatus',
                    value: e.registrationState.administrativeStatus
                });
            }
            if (tableSetup.ids) {
                if (tableSetup.identifiers.length > 0) {
                    tableSetup.identifiers.forEach(i => {
                        let value = '';
                        e.ids.forEach(id => {
                            if (id.source === i) {
                                value = id.id + (id.version ? " v" + id.version : "");
                            }
                        });
                        row.push({
                            css: i,
                            values: value
                        });
                    });
                } else {
                    row.push({
                        css: 'ids',
                        values: TableListComponent.truncatedList(e.ids, (e) => e)
                    });
                }
            }
            if (tableSetup.numQuestions) {
                row.push({
                    css: 'numQuestions',
                    value: e.numQuestions
                });
            }
            if (tableSetup.source) {
                row.push({
                    css: 'source',
                    value: e.source
                });
            }
            if (tableSetup.updated) {
                row.push({
                    css: 'updated',
                    value: e.updated ? new Date(e.updated).toLocaleString('en-US') : null
                });
            }
            if (tableSetup.tinyId) {
                row.push({
                    css: '',
                    value: e.tinyId
                });
            }
            return row;
        });
    }

    static readonly maxLines = 5;
    static readonly lineLength = 62;

    static lineClip(line): string {
        return line.length > this.lineLength
            ? line.substr(0, this.lineLength - 4) + ' ...'
            : line;
    }

    static truncatedList(list, f) {
        const size = list.length;
        let result = [];
        for (let i = 0; i < size; i++) {
            let formatted = f(list[i]);
            if (formatted) result.push(this.lineClip(formatted));
            if (result.length === this.maxLines && (i + 1) < size) {
                result.push("...");
                i = size;
            }
        }
        return result;
    }

    static getQuestionTexts(e) {
        return e.designations.filter(n => {
            if (!n.tags) n.tags = [];
            return n.tags.filter(t => t.indexOf('Question Text') > -1).length > 0;
        });
    }

    static getOtherNames(cde) {
        return cde.designations.filter((n, i) => {
            if (!n.tags) n.tags = [];
            return i > 0 && n.tags.filter(t => t.indexOf('Question Text') > -1).length === 0;
        });
    }

    openTableViewPreferences() {
        let viewComponent = CdeTableViewPreferencesComponent;
        if (this.module === 'form') viewComponent = FormTableViewPreferencesComponent;
        let dialogRef = this.dialog.open(viewComponent, {
            width: '550px',
            data: {
                searchSettings: this.searchSettings
            }
        });
        dialogRef.componentInstance.onChanged.subscribe(() => {
            this.render();
            this.esService.saveConfiguration(this.searchSettings);
        });
        dialogRef.componentInstance.onClosed.subscribe(() => dialogRef.close());
    }
}
