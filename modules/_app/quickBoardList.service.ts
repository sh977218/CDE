import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { LocalStorageService } from 'angular-2-local-storage';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
import _remove from 'lodash/remove';

import { AlertService } from '_app/alert/alert.service';


@Injectable()
export class QuickBoardListService {
    module: string = 'cde';
    quickBoard: any;
    number_dataElements: number = 0;
    number_forms: number = 0;

    dataElements = [];
    forms = [];


    constructor(private localStorageService: LocalStorageService,
                private alert: AlertService,
                private http: Http) {
        this.loadElements();
    }

    private findFormQuestionNr (fe) {
        let n = 0;
        if (fe.formElements) {
            fe.formElements.forEach(_fe => {
                if (_fe.elementType && _fe.elementType === 'question') n++;
                else n = n + this.findFormQuestionNr(_fe);
            });
        }
        return n;
    }

    loadElements(): void {
        let dataElementLocalStorage = <Array<any>> this.localStorageService.get('quickBoard');
        if (dataElementLocalStorage) {
            let l = dataElementLocalStorage.map(d => d.tinyId);
            if (!_isEmpty(l))
                this.http.get('/deList/' + l).map(res => res.json())
                    .subscribe(res => {
                        if (res) {
                            this.dataElements = res;
                            this.number_dataElements = this.dataElements.length;
                        }
                    }, err => this.alert.addAlert('danger', err));
        }
        let formLocalStorage = <Array<any>> this.localStorageService.get('formQuickBoard');
        if (formLocalStorage) {
            let l = formLocalStorage.map(d => d.tinyId);
            if (!_isEmpty(l))
                this.http.get('/formList/' + l).map(res => res.json())
                    .subscribe(res => {
                        if (res) {
                            this.forms = res;
                            this.forms.forEach(f => f.numQuestions = this.findFormQuestionNr(f));
                            this.number_forms = this.forms.length;
                        }
                    }, err => this.alert.addAlert('danger', err));
        }
        this.module = <string>this.localStorageService.get('defaultQuickBoard');
    }

    saveFormQuickBoard() {
        this.localStorageService.set('formQuickBoard', this.forms);
        this.number_forms = this.forms.length;
    }

    saveDataElementQuickBoard() {
        this.localStorageService.set('quickBoard', this.dataElements);
        this.number_dataElements = this.dataElements.length;
    }

    setDefaultQuickBoard(tab) {
        let type;
        if (tab.nextId === 'formQuickBoard') type = 'form';
        if (tab.nextId === 'dataElementQuickBoard') type = 'cde';
        this.module = type;
        this.localStorageService.set('defaultQuickBoard', type);
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

    canAddElement(elt) {
        if (elt.elementType === 'cde') {
            return _isEmpty(_find(this.dataElements, {tinyId: elt.tinyId}));
        }
        if (elt.elementType === 'form') {
            return _isEmpty(_find(this.forms, {tinyId: elt.tinyId}));
        }
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

    emptyDataElementQuickBoard() {
        this.dataElements = [];
        this.saveDataElementQuickBoard();
    }

    emptyFormQuickBoard() {
        this.forms = [];
        this.saveFormQuickBoard();
    }

}