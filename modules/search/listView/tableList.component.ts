import { Component, DoCheck, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ElasticService } from '_app/elastic.service';

@Component({
    selector: 'cde-table-list',
    templateUrl: './tableList.component.html',
    styles: [`
        :host >>> ul {
            padding-left: 15px;
        }
    `]
})
export class TableListComponent implements DoCheck, OnChanges {
    @Input() elts: any[];
    @Input() module: string;

    cacheElts: any[];
    headings: string[];
    rows: any[];

    constructor(public esService: ElasticService) {
        if (esService.searchSettings && esService.searchSettings.tableViewFields)
            this.render();
    }

    ngDoCheck() {
        // TODO: remove DoCheck when OnChanges inputs is implemented for Dynamic Components
        if (this.elts !== this.cacheElts)
            this.render();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elts)
            this.render();
    }

    render() {
        if (!this.esService.searchSettings.tableViewFields)
            return;

        if (this.module === 'cde')
            this.renderCde();
        else if (this.module === 'form')
            this.renderForm();
        else if (this.module === 'board')
            this.renderBoard();
    }

    renderBoard() {
    }

    renderCde() {
        let tableSetup = this.esService.searchSettings.tableViewFields;
        this.headings = [];
        if (tableSetup.name)
            this.headings.push('Name');
        if (tableSetup.questionTexts)
            this.headings.push('Question Texts');
        if (tableSetup.naming)
            this.headings.push('Other Names');
        if (tableSetup.permissibleValues)
            this.headings.push('Permissible Values');
        if (tableSetup.nbOfPVs)
            this.headings.push('Nb of PVs');
        if (tableSetup.uom)
            this.headings.push('Unit of Measure');
        if (tableSetup.stewardOrg)
            this.headings.push('Steward');
        if (tableSetup.usedBy)
            this.headings.push('Used by');
        if (tableSetup.registrationStatus)
            this.headings.push('Registration Status');
        if (tableSetup.administrativeStatus)
            this.headings.push('Admin Status');
        if (tableSetup.ids)
            this.headings.push('Identifiers');
        if (tableSetup.source)
            this.headings.push('Source');
        if (tableSetup.updated)
            this.headings.push('Updated');
        if (tableSetup.tinyId)
            this.headings.push('NLM ID');

        this.rows = this.elts.map(e => {
            let row = [];
            if (tableSetup.name)
                row.push({
                    css: 'name',
                    html: `<a routerLink="/deView" [queryParams]="{tinyId: ${e.tinyId}}">${e.naming[0].designation}</a>`
                });
            if (tableSetup.questionTexts)
                row.push({
                    css: 'naming',
                    html: TableListComponent.previewList(TableListComponent.getQuestionTexts(e), n => n.designation)
                });
            if (tableSetup.naming)
                row.push({
                    css: 'naming',
                    html: TableListComponent.previewList(TableListComponent.getOtherNames(e), n => n.designation)
                });
            if (tableSetup.permissibleValues)
                row.push({
                    css: 'permissibleValues multiline-ellipsis',
                    html: '<div>' + e.valueDomain.datatype + (e.valueDomain.datatype === 'Value List' ? ':' : '')
                    + '</div>' + TableListComponent.previewList(e.valueDomain.permissibleValues, pv => pv.permissibleValue)
                });
            if (tableSetup.nbOfPVs)
                row.push({
                    css: 'nbOfPVs',
                    html: e.valueDomain.nbOfPVs
                });
            if (tableSetup.uom)
                row.push({
                    css: 'uom',
                    html: e.valueDomain.uom
                });
            if (tableSetup.stewardOrg)
                row.push({
                    css: 'stewardOrg',
                    html: e.stewardOrg.name
                });
            if (tableSetup.usedBy)
                row.push({
                    css: 'usedBy multiline-ellipsis',
                    html: e.usedBy && TableListComponent.lineClip(e.usedBy.join(', '))
                });
            if (tableSetup.registrationStatus)
                row.push({
                    css: 'registrationStatus',
                    html: e.registrationState.registrationStatus
                });
            if (tableSetup.administrativeStatus)
                row.push({
                    css: 'administrativeStatus',
                    html: e.registrationState.administrativeStatus
                });
            if (tableSetup.ids)
                row.push({
                    css: 'ids',
                    html: TableListComponent.previewList(e.ids, id => {
                        let version = id.version ? 'v' + id.version : '';
                        return `${id.source}: <strong>${id.id}</strong> ${version}`;
                    })
                });
            if (tableSetup.source)
                row.push({
                    css: 'source',
                    html: e.source
                });
            if (tableSetup.updated)
                row.push({
                    css: 'updated',
                    html: e.updated ? new Date(e.updated).toLocaleString('en-US') : null
                });
            if (tableSetup.tinyId)
                row.push({
                    css: '',
                    html: e.tinyId
                });
            return row;
        });
    }

    renderForm() {
        let tableSetup = this.esService.searchSettings.tableViewFields;
        this.headings = [];
        if (tableSetup.name)
            this.headings.push('Name');
        if (tableSetup.naming)
            this.headings.push('Other Names');
        if (tableSetup.stewardOrg)
            this.headings.push('Steward');
        if (tableSetup.usedBy)
            this.headings.push('Used by');
        if (tableSetup.registrationStatus)
            this.headings.push('Registration Status');
        if (tableSetup.administrativeStatus)
            this.headings.push('Admin Status');
        if (tableSetup.ids)
            this.headings.push('Identifiers');
        if (tableSetup.numQuestions)
            this.headings.push('Questions');
        if (tableSetup.source)
            this.headings.push('Source');
        if (tableSetup.updated)
            this.headings.push('Updated');
        if (tableSetup.tinyId)
            this.headings.push('NLM ID');

        this.rows = this.elts.map(e => {
            let row = [];
            if (tableSetup.name)
                row.push({
                    css: 'name',
                    html: `<a routerLink="/formView" [queryParams]="{tinyId: ${e.tinyId}}">${e.naming[0].designation}</a>`
                });
            if (tableSetup.naming)
                row.push({
                    css: 'naming',
                    html: TableListComponent.previewList(e.naming, n => n.designation)
                });
            if (tableSetup.stewardOrg)
                row.push({
                    css: 'stewardOrg',
                    html: e.stewardOrg.name
                });
            if (tableSetup.usedBy)
                row.push({
                    css: 'usedBy multiline-ellipsis',
                    html: e.usedBy && TableListComponent.lineClip(e.usedBy.join(', '))
                });
            if (tableSetup.registrationStatus)
                row.push({
                    css: 'registrationStatus',
                    html: e.registrationState.registrationStatus
                });
            if (tableSetup.administrativeStatus)
                row.push({
                    css: 'administrativeStatus',
                    html: e.registrationState.administrativeStatus
                });
            if (tableSetup.ids)
                row.push({
                    css: 'ids',
                    html: TableListComponent.previewList(e.ids, id => {
                        let version = id.version ? 'v' + id.version : '';
                        return `${id.source}: <strong>${id.id}</strong> ${version}`;
                    })
                });
            if (tableSetup.numQuestions)
                row.push({
                    css: 'numQuestions',
                    html: e.numQuestions
                });
            if (tableSetup.source)
                row.push({
                    css: 'source',
                    html: e.source
                });
            if (tableSetup.updated)
                row.push({
                    css: 'updated',
                    html: e.updated ? new Date(e.updated).toLocaleString('en-US') : null
                });
            if (tableSetup.tinyId)
                row.push({
                    css: '',
                    html: e.tinyId
                });
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

    static previewList(list, f) {
        const size = list.length;
        let naming = '';
        let count = 0;
        for (let i = 0; i < size; i++) {
            let formatted = f(list[i]);
            if (formatted) {
                naming += `<li>${this.lineClip(formatted)}</li>`;
                count++;
            }
            if (count === this.maxLines && i + 1 < size) {
                naming += '<li class="lastItem">...</li>';
                break;
            }
        }
        return `<ul>${naming}</ul>`;
    }

    static getQuestionTexts(e) {
        return e.naming.filter(n => {
            if (!n.tags) n.tags = [];
            return n.tags.filter(t => t.indexOf('Question Text') > -1).length > 0;
        });
    }

    static getOtherNames(cde) {
        return cde.naming.filter(n => {
            if (!n.tags) n.tags = [];
            return n.tags.filter(t => t.indexOf('Question Text') > -1).length === 0;
        });
    }
}
