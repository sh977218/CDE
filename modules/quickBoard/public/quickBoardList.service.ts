import { Injectable, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { AlertService } from 'system/public/components/alert/alert.service';
import * as _ from "lodash";

@Injectable()
export class QuickBoardListService {
    eltsToCompareMap = {};
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

    loadElements(): void {
        let dataElementLocalStorage = <Array<any>> this.localStorageService.get("quickBoard");
        if (dataElementLocalStorage) {
            let l = dataElementLocalStorage.map(d => d.tinyId);
            if (!_.isEmpty(l))
                this.http.get("/deList/" + l).map(res => res.json())
                    .subscribe(res => {
                        if (res) {
                            this.dataElements = res;
                            this.number_dataElements = this.dataElements.length;
                        }
                    }, err => this.alert.addAlert("danger", err));
        }
        let formLocalStorage = <Array<any>> this.localStorageService.get("formQuickBoard");
        if (formLocalStorage) {
            let l = formLocalStorage.map(d => d.tinyId);
            if (!_.isEmpty(l))
                this.http.get("/formList/" + l).map(res => res.json())
                    .subscribe(res => {
                        if (res) {
                            this.forms = res;
                            this.number_forms = this.forms.length;
                        }
                    }, err => this.alert.addAlert("danger", err));
        }
        this.module = <string>this.localStorageService.get('defaultQuickBoard');
    }

    saveFormQuickBoard() {
        this.localStorageService.set("formQuickBoard", this.forms);
        this.number_forms = this.forms.length;
    }

    saveDataElementQuickBoard() {
        this.localStorageService.set("quickBoard", this.dataElements);
        this.number_dataElements = this.dataElements.length;
    }

    getSelectedElts() {
        if (this.quickBoard.elts.length === 2
            && Object.keys(this.eltsToCompareMap).length === 0)
            this.quickBoard.elts.forEach(e => {
                this.eltsToCompareMap[e.tinyId] = e;
            });

        let selectedElts = [];
        for (let key in this.eltsToCompareMap) {
            if (this.eltsToCompareMap.hasOwnProperty(key))
                selectedElts.push(this.eltsToCompareMap[key]);
        }
        return selectedElts;
    }

    setDefaultQuickBoard(tab) {
        let type;
        if (tab.nextId === 'formQuickBoard') type = 'form';
        if (tab.nextId === 'dataElementQuickBoard') type = 'cde';
        this.module = type;
        this.localStorageService.set('defaultQuickBoard', type);
    }

    removeElement(elt) {
        if (elt.elementType === "cde") {
            _.remove(this.dataElements, e => e.tinyId === elt.tinyId);
            this.saveDataElementQuickBoard();
        }
        if (elt.elementType === "form") {
            _.remove(this.dataElements, e => e.tinyId === elt.tinyId);
            this.saveFormQuickBoard();
        }
    }

    canAddElement(elt) {
        if (elt.elementType === "cde") {
            return !_.isEmpty(_.find(this.dataElements, {tinyId: elt.tinyId}));
        }
        if (elt.elementType === "form") {
            return !_.isEmpty(_.find(this.forms, {tinyId: elt.tinyId}));
        }
    }

    addToQuickBoard(elt) {
        if (elt.elementType === "cde") {
            this.dataElements.push(elt);
            this.saveDataElementQuickBoard();
            return;
        }
        if (elt.elementType === "form") {
            this.forms.push(elt);
            this.saveFormQuickBoard();
            return;
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