import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
import _remove from 'lodash/remove';

import { AlertService } from '_app/alert.service';
import { iterateFesSync } from 'shared/form/fe';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';


@Injectable()
export class QuickBoardListService {
    module: string = 'cde';
    quickBoard: any;
    number_dataElements: number = 0;
    number_forms: number = 0;

    dataElements: DataElement[] = [];
    forms: CdeForm[] = [];


    constructor(private alert: AlertService,
                private http: HttpClient,
                private localStorageService: LocalStorageService) {
        this.loadElements();
    }

    addToQuickBoard(elt) {
        if (elt.elementType === 'cde') {
            this.dataElements.push(elt);
            this.saveDataElementQuickBoard();
            this.alert.addAlert('success', 'Added to QuickBoard!');
        }
        if (elt.elementType === 'form') {
            this.forms.push(elt);
            this.saveFormQuickBoard();
            this.alert.addAlert('success', 'Added to QuickBoard!');
        }
    }

    canAddElement(elt) {
        if (elt.elementType === 'cde') {
            return _isEmpty(_find(this.dataElements, {tinyId: elt.tinyId}));
        }
        if (elt.elementType === 'form') {
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
        let dataElementLocalStorage = <Array<any>> this.localStorageService.get('quickBoard');
        if (dataElementLocalStorage) {
            let l = dataElementLocalStorage.map(d => d.tinyId);
            if (!_isEmpty(l)) {
                this.http.get<DataElement[]>('/deList/' + l)
                    .subscribe(res => {
                        if (res) {
                            this.dataElements = res;
                            this.number_dataElements = this.dataElements.length;
                        }
                    }, err => this.alert.httpErrorMessageAlert(err));
            }
        }
        let formLocalStorage = <Array<any>> this.localStorageService.get('formQuickBoard');
        if (formLocalStorage) {
            let l = formLocalStorage.map(d => d.tinyId);
            if (!_isEmpty(l)) {
                this.http.get<CdeForm[]>('/formList/' + l)
                    .subscribe(res => {
                        if (res) {
                            this.forms = res;
                            this.forms.forEach(f => {
                                f.numQuestions = 0;
                                iterateFesSync(f.formElements, undefined, undefined, () => f.numQuestions++);
                            });
                            this.number_forms = this.forms.length;
                        }
                    }, err => this.alert.httpErrorMessageAlert(err));
            }
        }
        this.module = <string>this.localStorageService.get('defaultQuickBoard');
    }

    removeElement(elt) {
        if (elt.elementType === 'cde') {
            _remove(this.dataElements, e => e.tinyId === elt.tinyId);
            this.saveDataElementQuickBoard();
            this.alert.addAlert('success', 'Removed from QuickBoard!');
        }
        if (elt.elementType === 'form') {
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

    setDefaultQuickBoard(tab) {
        let type;
        if (tab.nextId === 'formQuickBoard') type = 'form';
        if (tab.nextId === 'dataElementQuickBoard') type = 'cde';
        this.module = type;
        this.localStorageService.set('defaultQuickBoard', type);
    }
}
