import { Inject, Injectable } from '@angular/core';

@Injectable()
export class QuickBoardListService {
    eltsToCompareMap = {};
    module: string;
    quickBoard: any;

    constructor(@Inject('QuickBoard') public cdeQuickBoard,
                @Inject('FormQuickBoard') public formQuickBoard) {
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