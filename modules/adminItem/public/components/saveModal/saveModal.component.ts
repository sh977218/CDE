import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import _isEqual from 'lodash/isEqual';

import { AlertService } from '_app/alert.service';
import { iterateFormElements } from 'shared/form/formShared';


@Component({
    selector: 'cde-save-modal',
    templateUrl: './saveModal.component.html'
})
export class SaveModalComponent {
    @Input() elt: any;
    @Output() save = new EventEmitter();
    @Output() onEltChange = new EventEmitter();
    @ViewChild('updateElementContent') updateElementContent: NgbModalModule;
    duplicatedVersion = false;
    modalRef: NgbModalRef;
    protected newCdes = [];
    overrideVersion: false;

    constructor(private alert: AlertService,
                public http: HttpClient,
                public modalService: NgbModal) {}

    confirmSave() {
        this.modalRef.close();
        this.save.emit();
    }

    newVersionVersionUnicity(newVersion = null) {
        if (newVersion === null) newVersion = this.elt.version;
        let url;
        if (this.elt.elementType === 'cde') url = '/de/' + this.elt.tinyId + '/latestVersion/';
        if (this.elt.elementType === 'form') url = '/form/' + this.elt.tinyId + '/latestVersion/';
        this.http.get(url, {responseType: 'text'}).subscribe(
            res => {
                if (res && newVersion && _isEqual(res, newVersion)) {
                    this.duplicatedVersion = true;
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
            }, err => this.alert.httpErrorMessageAlert(err));
    }

    openSaveModal() {
        this.newCdes = [];
        this.newVersionVersionUnicity();
        if (this.elt) this.elt.changeNote = '';
        if (this.elt.elementType === 'form' && this.elt.isDraft) {
            iterateFormElements(this.elt, {
                async: true,
                questionCb: (fe, cb) => {
                    if (!fe.question.cde.tinyId) {
                        if (fe.question.cde.designations.length === 0) {
                            fe.question.cde.designations.invalid = true;
                            fe.question.cde.designations.message = 'no designation.';
                        } else {
                            fe.question.cde.designations.invalid = false;
                            fe.question.cde.designations.message = null;
                        }
                        this.newCdes.push(fe.question.cde);
                        if (cb) cb();
                    } else if (cb) cb();
                }
            }, () => {
                this.modalRef = this.modalService.open(this.updateElementContent, {container: 'body', size: 'lg'});
            });
        }
        else this.modalRef = this.modalService.open(this.updateElementContent, {container: 'body', size: 'lg'});
    }
}
