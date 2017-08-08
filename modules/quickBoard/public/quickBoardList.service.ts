import { Inject, Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';

@Injectable()
export class QuickBoardListService {
    eltsToCompareMap = {};
    module: string;
    quickBoard: any;
    number_dataElements: number = 0;
    number_forms: number = 0;
    number_elements: number = 0;



    constructor(private localStorageService: LocalStorageService,
                @Inject('QuickBoard') public cdeQuickBoard,
                @Inject('FormQuickBoard') public formQuickBoard) {
        let dataElements = <Array<any>> this.localStorageService.get("quickBoard");
        this.number_dataElements = dataElements.length;
        let forms = <Array<any>> this.localStorageService.get("formQuickBoard");
        this.number_forms = forms.length;
        this.number_elements = this.number_dataElements + this.number_forms;


        let defaultQuickBoard = window.localStorage['nlmcde.defaultQuickBoard'];
        if (defaultQuickBoard) {
            if (!this.setEltType(defaultQuickBoard)) {
                window.localStorage.removeItem('nlmcde.defaultQuickBoard');
                this.setEltType('cde');
            }
        } else
            this.setEltType('cde');
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

    setEltType(type) {
        if (type === 'cde')
            this.quickBoard = this.cdeQuickBoard;
        else if (type === 'form')
            this.quickBoard = this.formQuickBoard;
        else
            return false;

        this.module = type;
        window.localStorage['nlmcde.defaultQuickBoard'] = type;
        return true;
    }

    toggleEltsToCompare(elt) {
        if (this.eltsToCompareMap[elt.tinyId])
            delete this.eltsToCompareMap[elt.tinyId];
        else
            this.eltsToCompareMap[elt.tinyId] = elt;
    }
}