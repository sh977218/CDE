import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { LocalStorageService } from 'angular-2-local-storage';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
import _remove from 'lodash/remove';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { CdeFormElastic } from 'shared/form/form.model';
import { iterateFesSync } from 'shared/form/fe';
import { ItemElastic } from 'shared/models.model';
import { isCdeForm, isDataElement } from 'shared/item';

@Injectable()
export class QuickBoardListService {
    module = 'cde';
    quickBoard: any;
    number_dataElements = 0;
    number_forms = 0;

    dataElements: DataElementElastic[] = [];
    forms: CdeFormElastic[] = [];


    constructor(private alert: AlertService,
                private http: HttpClient,
                private localStorageService: LocalStorageService) {
        this.loadElements();
    }

    addToQuickBoard(elt: ItemElastic) {
        if (isDataElement(elt)) {
            this.dataElements.push(elt);
            this.saveDataElementQuickBoard();
            this.alert.addAlert('success', 'Added to QuickBoard!');
        }
        if (isCdeForm(elt)) {
            this.forms.push(elt);
            this.saveFormQuickBoard();
            this.alert.addAlert('success', 'Added to QuickBoard!');
        }
    }

    canAddElement(elt: ItemElastic) {
        if (isDataElement(elt)) {
            return _isEmpty(_find(this.dataElements, {tinyId: elt.tinyId}));
        }
        if (isCdeForm(elt)) {
            return _isEmpty(_find(this.forms, {tinyId: elt.tinyId}));
        }
    }

    emptyDataElementQuickBoard() {
        this.dataElements = [];
        this.saveDataElementQuickBoard();
    }

    emptyFormQuickBoard() {
        this.forms = [];
        this.saveFormQuickBoard();
    }

    loadElements(): void {
        const dataElementLocalStorage = this.localStorageService.get('quickBoard') as Array<any>;
        if (dataElementLocalStorage) {
            const l = dataElementLocalStorage.map(d => d.tinyId);
            if (!_isEmpty(l)) {
                this.http.get<DataElement[]>('/deList/' + l)
                    .subscribe(res => {
                        if (res) {
                            this.dataElements = res as DataElementElastic[];
                            this.number_dataElements = this.dataElements.length;
                        }
                    }, err => this.alert.httpErrorMessageAlert(err));
            }
        }
        const formLocalStorage = this.localStorageService.get('formQuickBoard') as Array<any>;
        if (formLocalStorage) {
            const l = formLocalStorage.map(d => d.tinyId);
            if (!_isEmpty(l)) {
                this.http.get<CdeFormElastic[]>('/formList/' + l)
                    .subscribe(res => {
                        if (res) {
                            this.forms = res;
                            this.forms.forEach(f => {
                                f.numQuestions = 0;
                                iterateFesSync(f.formElements, undefined, undefined, () => f.numQuestions++);
                                f.score = NaN;
                            });
                            this.number_forms = this.forms.length;
                        }
                    }, err => this.alert.httpErrorMessageAlert(err));
            }
        }
        this.module = this.localStorageService.get('defaultQuickBoard') as string;
    }

    removeElement(elt: ItemElastic) {
        if (isDataElement(elt)) {
            _remove(this.dataElements, e => e.tinyId === elt.tinyId);
            this.saveDataElementQuickBoard();
            this.alert.addAlert('success', 'Removed from QuickBoard!');
        }
        if (isCdeForm(elt)) {
            _remove(this.forms, e => e.tinyId === elt.tinyId);
            this.saveFormQuickBoard();
            this.alert.addAlert('success', 'Removed from QuickBoard!');
        }
    }

    saveDataElementQuickBoard() {
        this.localStorageService.set('quickBoard', this.dataElements);
        this.number_dataElements = this.dataElements.length;
    }

    saveFormQuickBoard() {
        this.localStorageService.set('formQuickBoard', this.forms);
        this.number_forms = this.forms.length;
    }

    setDefaultQuickBoard(event: MatTabChangeEvent) {
        let type;
        if (event.tab.textLabel.startsWith('Form')) { type = 'form'; }
        if (event.tab.textLabel.startsWith('CDE')) { type = 'cde'; }
        this.module = type;
        this.localStorageService.set('defaultQuickBoard', type);
    }
}
