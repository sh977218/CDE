import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ElasticService } from '_app/elastic.service';
import { CdeTableViewPreferencesComponent } from 'search/tableViewPreferences/cdeTableViewPreferencesComponent';
import { FormTableViewPreferencesComponent } from 'search/tableViewPreferences/formTableViewPreferencesComponent';
import { DataElementElastic, DataType } from 'shared/de/dataElement.model';
import { CdeId, Designation, ElasticQueryResponseForm, Item, ItemElastic, ModuleItem, UserSearchSettings } from 'shared/models.model';
import { SearchSettings } from 'shared/search/search.model';

// interface Row {
//     css: string;
//     datatype?: DataType;
//     elt?: ItemElastic;
//     value?: string;
//     values?: string[];
// }
type Row = {
    css: 'ids';
    values: CdeId[];
} | {
    css: 'name';
    elt: ItemElastic;
} | {
    css: 'naming';
    values: string[];
} | {
    css: 'permissibleValues multiline-ellipsis';
    datatype: DataType;
    values: string[];
} | {
    css: 'linkedForms',
    values: {tinyId: string, name: string}[]
} | {
    css: string,
    value?: string
};

@Component({
    templateUrl: './tableList.component.html',
    styles: [`
        :host >>> ul {
            padding-left: 15px;
        }
    `]
})
export class TableListComponent implements OnInit {
    @Input() set elts(elts: ItemElastic[]) {
        this._elts = elts;
        this.render();
    }
    get elts() {
        return this._elts;
    }
    @Input() module!: ModuleItem;
    private _elts!: ItemElastic[];
    headings!: string[];
    rows!: Row[][];

    constructor(public dialog: MatDialog,
                public esService: ElasticService) {
    }

    ngOnInit() {
        this.render();
    }

    render() {
        if (!this.esService.searchSettings.tableViewFields) {
            return;
        }
        if (this.module === 'cde') {
            this.renderCde();
        } else if (this.module === 'form') {
            this.renderForm();
        }
    }

    renderCde() {
        const tableSetup = this.searchSettings.tableViewFields;
        this.headings = [];
        if (tableSetup.name) { this.headings.push('Name'); }
        if (tableSetup.questionTexts) { this.headings.push('Question Texts'); }
        if (tableSetup.naming) { this.headings.push('Other Names'); }
        if (tableSetup.permissibleValues) { this.headings.push('Permissible Values'); }
        if (tableSetup.pvCodeNames) { this.headings.push('Code Names'); }
        if (tableSetup.nbOfPVs) { this.headings.push('Nb of PVs'); }
        if (tableSetup.uom) { this.headings.push('Unit of Measure'); }
        if (tableSetup.stewardOrg) { this.headings.push('Steward'); }
        if (tableSetup.usedBy) { this.headings.push('Used by'); }
        if (tableSetup.registrationStatus) { this.headings.push('Registration Status'); }
        if (tableSetup.administrativeStatus) { this.headings.push('Admin Status'); }
        if (tableSetup.ids) {
            if (Array.isArray(tableSetup.identifiers) && tableSetup.identifiers.length > 0) {
                tableSetup.identifiers.forEach(i => this.headings.push(i));
            } else {
                this.headings.push('Identifiers');
            }
        }
        if (tableSetup.source) { this.headings.push('Source'); }
        if (tableSetup.updated) { this.headings.push('Updated'); }
        if (tableSetup.tinyId) { this.headings.push('NLM ID'); }
        if (tableSetup.linkedForms) { this.headings.push('Forms'); }

        this.rows = (this.elts as DataElementElastic[]).map(e => {
            const row: Row[] = [];
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
                    values: TableListComponent.truncatedList(
                        e.valueDomain.datatype === 'Value List' ? e.valueDomain.permissibleValues : undefined,
                        pv => pv.permissibleValue
                    )
                });
            }
            if (tableSetup.pvCodeNames) {
                row.push({
                    css: 'permissibleValues multiline-ellipsis',
                    datatype: e.valueDomain.datatype,
                    values: TableListComponent.truncatedList(
                        e.valueDomain.datatype === 'Value List' ? e.valueDomain.permissibleValues : undefined,
                        pv => pv.valueMeaningName || ''
                    )
                });
            }
            if (tableSetup.nbOfPVs) {
                row.push({
                    css: 'nbOfPVs',
                    value: e.valueDomain.nbOfPVs + ''
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
                if (tableSetup.identifiers && tableSetup.identifiers.length > 0) {
                    tableSetup.identifiers.forEach(i => {
                        let value = '';
                        e.ids.forEach(id => {
                            if (id.source === i) {
                                value = id.id + (id.version ? ' v' + id.version : '');
                            }
                        });
                        row.push({
                            css: i,
                            value
                        });
                    });
                } else {
                    row.push({
                        css: 'ids',
                        values: TableListComponent.truncatedList<CdeId, CdeId>(e.ids, e => e)
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
                    value: e.updated ? new Date(e.updated).toLocaleString('en-US') : ''
                });
            }
            if (tableSetup.tinyId) {
                row.push({
                    css: '',
                    value: e.tinyId
                });
            }
            if (tableSetup.linkedForms) {
                const lfSettings = this.esService.buildElasticQuerySettings(new SearchSettings(e.tinyId));

                const values: {tinyId: string, name: string}[] = [];
                this.esService.generalSearchQuery(lfSettings, 'form', (err?: string, result?: ElasticQueryResponseForm) => {
                    if (result && result.forms) {
                        if (result.forms.length > 5) { result.forms.length = 5; }
                        result.forms.forEach(crf => values.push({name: crf.primaryNameCopy, tinyId: crf.tinyId}));
                    }
                    row.push({
                        css: 'linkedForms',
                        values
                    });
                });
            }
            return row;
        });
    }

    renderForm() {
        const tableSetup = this.searchSettings.tableViewFields;
        this.headings = [];
        if (tableSetup.name) { this.headings.push('Name'); }
        if (tableSetup.naming) { this.headings.push('Other Names'); }
        if (tableSetup.stewardOrg) { this.headings.push('Steward'); }
        if (tableSetup.usedBy) { this.headings.push('Used by'); }
        if (tableSetup.registrationStatus) { this.headings.push('Registration Status'); }
        if (tableSetup.administrativeStatus) { this.headings.push('Admin Status'); }
        if (tableSetup.ids) {
            if (tableSetup.identifiers && tableSetup.identifiers.length > 0) {
                tableSetup.identifiers.forEach(i => {
                    this.headings.push(i);
                });
            } else {
                this.headings.push('Identifiers');
            }
        }
        if (tableSetup.numQuestions) { this.headings.push('Questions'); }
        if (tableSetup.source) { this.headings.push('Source'); }
        if (tableSetup.updated) { this.headings.push('Updated'); }
        if (tableSetup.tinyId) { this.headings.push('NLM ID'); }

        this.rows = this.elts.map(e => {
            const row: Row[] = [];
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
                if (tableSetup.identifiers && tableSetup.identifiers.length > 0) {
                    tableSetup.identifiers.forEach(i => {
                        let value = '';
                        e.ids.forEach(id => {
                            if (id.source === i) {
                                value = id.id + (id.version ? ' v' + id.version : '');
                            }
                        });
                        row.push({
                            css: i,
                            value
                        });
                    });
                } else {
                    row.push({
                        css: 'ids',
                        values: TableListComponent.truncatedList<CdeId, CdeId>(e.ids, e => e)
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
                    value: e.updated ? new Date(e.updated).toLocaleString('en-US') : ''
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

    openTableViewPreferences() {
        let viewComponent = CdeTableViewPreferencesComponent;
        if (this.module === 'form') { viewComponent = FormTableViewPreferencesComponent; }
        const dialogRef = this.dialog.open(viewComponent, {
            width: '550px',
            data: {
            }
        });
        dialogRef.componentInstance.changed.subscribe(() => {
            this.render();
            this.esService.saveConfiguration();
        });
        dialogRef.componentInstance.closed.subscribe(() => dialogRef.close());
    }

    get searchSettings(): UserSearchSettings {
        return this.esService.searchSettings;
    }

    static readonly maxLines = 5;
    static readonly lineLength = 62;

    static lineClip(line: string|any): string|any {
        return line.length > this.lineLength
            ? line.substr(0, this.lineLength - 4) + ' ...'
            : line;
    }

    static truncatedList<T, U = string>(list: T[] | undefined, f: (a: T) => U): U[] {
        if (!Array.isArray(list)) { list = []; }
        const size = list.length;
        const result: any[] = [];
        for (let i = 0; i < size; i++) {
            const formatted = f(list[i]);
            if (formatted) {
                result.push(typeof(formatted) === 'string' ? this.lineClip(formatted) : formatted);
            }
            if (typeof(formatted) === 'string' && result.length === this.maxLines && (i + 1) < size) {
                result.push('...');
                i = size;
            }
        }
        return result;
    }

    static getQuestionTexts(e: Item): Designation[] {
        return e.designations.filter(n => {
            if (!n.tags) { n.tags = []; }
            return n.tags.filter(t => t.indexOf('Question Text') > -1).length > 0;
        });
    }

    static getOtherNames(item: Item): Designation[] {
        return item.designations.filter((n, i) => {
            if (!n.tags) { n.tags = []; }
            return i > 0 && n.tags.filter(t => t.indexOf('Question Text') > -1).length === 0;
        });
    }
}
