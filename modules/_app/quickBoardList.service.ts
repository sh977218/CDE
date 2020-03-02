import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
import _remove from 'lodash/remove';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { CdeFormElastic } from 'shared/form/form.model';
import { iterateFesSync } from 'shared/form/fe';
import { Item, ItemElastic } from 'shared/models.model';
import { isCdeForm, isDataElement } from 'shared/item';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Injectable()
export class QuickBoardListService {
    dataElements: DataElementElastic[] = [];
    forms: CdeFormElastic[] = [];
    module = 'cde';
    numberDataElements = 0;
    numberForms = 0;
    quickBoard: any;

    constructor(private alert: AlertService,
                private http: HttpClient,
                private localStorageService: LocalStorage) {
        this.loadElements();
    }

    addToQuickBoard(elt: Item) {
        if (isDataElement(elt)) {
            this.dataElements.push(elt as DataElementElastic);
            this.saveDataElementQuickBoard();
            this.alert.addAlert('success', 'Added to QuickBoard!');
        }
        if (isCdeForm(elt)) {
            this.forms.push(elt as CdeFormElastic);
            this.saveFormQuickBoard();
            this.alert.addAlert('success', 'Added to QuickBoard!');
        }
    }

    canAddElement(elt: Item) {
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
        this.localStorageService
            .getItem('quickBoard')
            .subscribe((dataElementLocalStorage: any) => {
                if (dataElementLocalStorage) {
                    const l = dataElementLocalStorage.map((d: any) => d.tinyId);
                    if (!_isEmpty(l)) {
                        this.http.get<DataElement[]>('/server/de/list/' + l)
                            .subscribe(res => {
                                if (res) {
                                    this.dataElements = res as DataElementElastic[];
                                    this.numberDataElements = this.dataElements.length;
                                }
                            }, err => this.alert.httpErrorMessageAlert(err));
                    }
                }
            });

        this.localStorageService
            .getItem('formQuickBoard')
            .subscribe((formLocalStorage: any) => {
                if (formLocalStorage) {
                    const l = formLocalStorage.map((d: any) => d.tinyId);
                    if (!_isEmpty(l)) {
                        this.http.get<CdeFormElastic[]>('/server/form/list/' + l)
                            .subscribe(res => {
                                if (res) {
                                    this.forms = res;
                                    this.forms.forEach(f => {
                                        let numQuestions = 0;
                                        iterateFesSync(f.formElements, undefined, undefined, () => numQuestions = numQuestions + 1);
                                        f.numQuestions = numQuestions;
                                        f.score = NaN;
                                    });
                                    this.numberForms = this.forms.length;
                                }
                            }, err => this.alert.httpErrorMessageAlert(err));
                    }
                }
            });

        this.localStorageService
            .getItem('defaultQuickBoard')
            .subscribe((module: any) => this.module = module);
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
        this.localStorageService
            .setItem('quickBoard', this.dataElements)
            .subscribe(() => {
                this.numberDataElements = this.dataElements.length;
            });
    }

    saveFormQuickBoard() {
        this.localStorageService
            .setItem('formQuickBoard', this.forms)
            .subscribe(() => {
                this.numberForms = this.forms.length;
            });
    }

    setDefaultQuickBoard(event: MatTabChangeEvent) {
        if (event.tab.textLabel.startsWith('Form')) {
            this.module = 'form';
        }
        if (event.tab.textLabel.startsWith('CDE')) {
            this.module = 'cde';
        }
        this.localStorageService
            .setItem('defaultQuickBoard', this.module)
            .subscribe();
    }
}
