import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'cde-table-list',
    templateUrl: './tableList.component.html',
})
export class TableListComponent implements OnChanges {
    @Input() elts: any[];
    @Input() module: string;

    headings: string[];
    rows: any[];
    tableSetup: any;

    constructor(@Inject('SearchSettings') public searchSettings) {
        searchSettings.getPromise().then(settings => {
            if (settings && settings.tableViewFields) {
                this.tableSetup = settings.tableViewFields;
                this.render();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elts)
            this.render();
    }

    render() {
        if (!this.tableSetup)
            return;

        if (this.module === 'cde')
            this.renderCde();
        else if (this.module === 'form')
            this.renderForm();
        else if (this.module === 'board')
            this.renderBoard();
    }

    renderBoard() {}

    renderCde() {
        this.headings = [];
        if (this.tableSetup.name)
            this.headings.push('Name');
        if (this.tableSetup.questionTexts)
            this.headings.push('Question Texts');
        if (this.tableSetup.naming)
            this.headings.push('Other Names');
        if (this.tableSetup.permissibleValues)
            this.headings.push('Permissible Values');
        if (this.tableSetup.nbOfPVs)
            this.headings.push('Nb of PVs');
        if (this.tableSetup.uom)
            this.headings.push('Unit of Measure');
        if (this.tableSetup.stewardOrg)
            this.headings.push('Steward');
        if (this.tableSetup.usedBy)
            this.headings.push('Used by');
        if (this.tableSetup.registrationStatus)
            this.headings.push('Registration Status');
        if (this.tableSetup.administrativeStatus)
            this.headings.push('Admin Status');
        if (this.tableSetup.ids)
            this.headings.push('Identifiers');
        if (this.tableSetup.source)
            this.headings.push('Source');
        if (this.tableSetup.updated)
            this.headings.push('Updated');
        if (this.tableSetup.tinyId)
            this.headings.push('NLM ID');

        this.rows = this.elts.map(e => {
            let row = [];
            if (this.tableSetup.name)
                row.push({
                    css: 'name',
                    html: `<a href="/deView?tinyId=${e.tinyId}">${e.naming[0].designation}</a>`
                });
            if (this.tableSetup.questionTexts)
                row.push({
                    css: 'naming',
                    html: TableListComponent.previewList(TableListComponent.getQuestionTexts(e), n => n.designation)
                });
            if (this.tableSetup.naming)
                row.push({
                    css: 'naming',
                    html: TableListComponent.previewList(TableListComponent.getOtherNames(e), n => n.designation)
                });
            if (this.tableSetup.permissibleValues)
                row.push({
                    css: 'permissibleValues multiline-ellipsis',
                    html: '<div>' + e.valueDomain.datatype + (e.valueDomain.datatype === 'Value List' ? ':' : '')
                    + '</div>' + TableListComponent.previewList(e.valueDomain.permissibleValues, pv => pv.permissibleValue)
                });
            if (this.tableSetup.nbOfPVs)
                row.push({
                    css: 'nbOfPVs',
                    html: e.valueDomain.nbOfPVs
                });
            if (this.tableSetup.uom)
                row.push({
                    css: 'uom',
                    html: e.valueDomain.uom
                });
            if (this.tableSetup.stewardOrg)
                row.push({
                    css: 'stewardOrg',
                    html: e.stewardOrg.name
                });
            if (this.tableSetup.usedBy)
                row.push({
                    css: 'usedBy multiline-ellipsis',
                    html: TableListComponent.lineClip(e.usedBy.join(", "))
                });
            if (this.tableSetup.registrationStatus)
                row.push({
                    css: 'registrationStatus',
                    html: e.registrationState.registrationStatus
                });
            if (this.tableSetup.administrativeStatus)
                row.push({
                    css: 'administrativeStatus',
                    html: e.registrationState.administrativeStatus
                });
            if (this.tableSetup.ids)
                row.push({
                    css: 'ids',
                    html: TableListComponent.previewList(e.ids, id => {
                        let version = id.version ? 'v' + id.version : '';
                        return `${id.source}: <strong>${id.id}</strong> ${version}`;
                    })
                });
            if (this.tableSetup.source)
                row.push({
                    css: 'source',
                    html: e.source
                });
            if (this.tableSetup.updated)
                row.push({
                    css: 'updated',
                    html: e.updated ? new Date(e.updated).toLocaleString('en-US') : null
                });
            if (this.tableSetup.tinyId)
                row.push({
                    css: '',
                    html: e.tinyId
                });
            return row;
        });
    }

    renderForm() {
        this.headings = [];
        if (this.tableSetup.name)
            this.headings.push('Name');
        if (this.tableSetup.naming)
            this.headings.push('Other Names');
        if (this.tableSetup.stewardOrg)
            this.headings.push('Steward');
        if (this.tableSetup.usedBy)
            this.headings.push('Used by');
        if (this.tableSetup.registrationStatus)
            this.headings.push('Registration Status');
        if (this.tableSetup.administrativeStatus)
            this.headings.push('Admin Status');
        if (this.tableSetup.ids)
            this.headings.push('Identifiers');
        if (this.tableSetup.numQuestions)
            this.headings.push('Questions');
        if (this.tableSetup.source)
            this.headings.push('Source');
        if (this.tableSetup.updated)
            this.headings.push('Updated');
        if (this.tableSetup.tinyId)
            this.headings.push('NLM ID');

        this.rows = this.elts.map(e => {
            let row = [];
            if (this.tableSetup.name)
                row.push({
                    css: 'name',
                    html: `<a href="/formView?tinyId=${e.tinyId}">${e.naming[0].designation}</a>`
                });
            if (this.tableSetup.naming)
                row.push({
                    css: 'naming',
                    html: TableListComponent.previewList(e.naming, n => n.designation)
                });
            if (this.tableSetup.stewardOrg)
                row.push({
                    css: 'stewardOrg',
                    html: e.stewardOrg.name
                });
            if (this.tableSetup.usedBy)
                row.push({
                    css: 'usedBy multiline-ellipsis',
                    html: TableListComponent.lineClip(e.usedBy.join(", "))
                });
            if (this.tableSetup.registrationStatus)
                row.push({
                    css: 'registrationStatus',
                    html: e.registrationState.registrationStatus
                });
            if (this.tableSetup.administrativeStatus)
                row.push({
                    css: 'administrativeStatus',
                    html: e.registrationState.administrativeStatus
                });
            if (this.tableSetup.ids)
                row.push({
                    css: 'ids',
                    html: TableListComponent.previewList(e.ids, id => {
                        let version = id.version ? 'v' + id.version : '';
                        return `${id.source}: <strong>${id.id}</strong> ${version}`;
                    })
                });
            if (this.tableSetup.numQuestions)
                row.push({
                    css: 'numQuestions',
                    html: e.numQuestions
                });
            if (this.tableSetup.source)
                row.push({
                    css: 'source',
                    html: e.source
                });
            if (this.tableSetup.updated)
                row.push({
                    css: 'updated',
                    html: e.updated ? new Date(e.updated).toLocaleString('en-US') : null
                });
            if (this.tableSetup.tinyId)
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
        return e.naming.filter(function (n) {
            if (!n.tags) n.tags = [];
            return n.tags.filter(function (t) {
                    return t.tag.indexOf("Question Text") > -1;
                }).length > 0;
        });
    }

    static getOtherNames(cde) {
        return cde.naming.filter(function (n) {
            if (!n.tags) n.tags = [];
            return n.tags.filter(function (t) {
                    return t.tag.indexOf("Question Text") > -1;
                }).length === 0;
        });
    }
}
