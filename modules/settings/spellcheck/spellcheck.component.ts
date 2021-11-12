import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { ValidationWhitelist } from 'shared/models.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'cde-spellcheck',
    templateUrl: './spellcheck.component.html',
    styles: [`
        .checkBoxCell {
            cursor: pointer;
            text-align: center;
            vertical-align: middle;
        }
    `]
})
export class SpellCheckComponent {
    @ViewChild('newWhitelistModal', {static: true}) newWhitelistModal!: TemplateRef<any>;
    @ViewChild('deleteWhitelistModal', {static: true}) deleteWhitelistModal!: TemplateRef<any>;
    @ViewChild('editWhitelistModal', {static: true}) editWhitelistModal!: TemplateRef<any>;
    @ViewChild('newListHelpModal', {static: true}) newListHelpModal!: TemplateRef<any>;
    checkingFile: boolean = false;
    retrievingWhitelists: boolean = false;
    updatingWhitelists: boolean = false;
    fileErrors: string[] = [];
    selectedErrors: Set<string> = new Set();
    spellingErrors: Record<string, {
        row: number,
        name: string,
        error: string,
        field: string
    }[]> = {}
    showAllTermErrors: Record<string, boolean> = {}
    errorLimit: number = 5;
    currentErrorPage: string [] = [];
    pageIndex: number = 0;
    pageSize: number = 10;

    currentWhiteLists: ValidationWhitelist[] = [];
    selectedWhiteList: ValidationWhitelist | null = null;

    whiteListNewTerms: string[] = [];
    whiteListRemoveTerms: string[] = [];

    newWhiteList: string = '';
    newWhiteListTerms: string = '';

    constructor(private alert: AlertService, private http: HttpClient, public dialog: MatDialog) {
        this.getWhiteLists();
    }

    openFileDialog(id: string) {
        const open = document.getElementById(id) as HTMLInputElement;
        if (open && !this.checkingFile) {
            open.value = '';
            open.click();
        }
    }

    getWhiteLists() {
        this.retrievingWhitelists = true;
        this.http.get<ValidationWhitelist[]>('/server/loader/whitelists').subscribe(res => {
            this.currentWhiteLists = res;
            if (this.selectedWhiteList) {
                const idx = this.currentWhiteLists.findIndex(list => list.collectionName === this.selectedWhiteList?.collectionName);
                if (idx > -1) {
                    this.selectedWhiteList = this.currentWhiteLists[idx];
                }
            }
            this.retrievingWhitelists = false;
        }, error => {
            this.retrievingWhitelists = false;
            this.alert.httpErrorMessageAlert(error);
        });
    }

    whiteListSelectedErrors() {
        if (this.selectedErrors.size > 0) {
            this.updateWhiteList(Array.from(this.selectedErrors), []);
        }
    }

    updateWhiteList(newTerms: string[], removeTerms: string[]) {
        if (this.selectedWhiteList) {
            this.updatingWhitelists = true;
            this.http.post<any>('/server/loader/updatewhitelist', {
                whitelistName: this.selectedWhiteList.collectionName,
                newTerms,
                removeTerms
            }).subscribe((res) => {
                if (this.selectedErrors.size > 0) {
                    this.selectedErrors.clear();
                }
                if (this.getMisspelledTerms().length > 0) {
                    for (const t of res.terms) {
                        delete this.spellingErrors[t];
                    }
                    this.setCurrentErrorPage();
                }
                this.getWhiteLists();
                this.updatingWhitelists = false;
                this.alert.addAlert('success', 'Whitelist updated');
            }, err => {
                this.updatingWhitelists = false;
                this.alert.httpErrorMessageAlert(err);
            });
        }
    }

    spellcheckCSV(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0 && this.selectedWhiteList) {
            const formData = new FormData();
            formData.append('uploadedFile', files[0]);
            formData.append('whitelist', this.selectedWhiteList.collectionName)
            this.checkingFile = true;
            this.http.post<any>('/server/loader/spellcheckCSVLoad', formData).subscribe(
                response => {
                    this.checkingFile = false;
                    this.fileErrors = response.fileErrors;
                    this.spellingErrors = response.spellingErrors;
                    this.currentErrorPage = this.getMisspelledTerms().splice(0, this.pageSize);
                    this.showAllTermErrors = {};
                    this.pageIndex = 0;
                    if (this.fileErrors.length === 0 && this.getMisspelledTerms().length === 0) {
                        this.alert.addAlert('success', 'No issues found');
                    }
                },
                error => {
                    this.checkingFile = false;
                    this.alert.httpErrorMessageAlert(error);
                }
            );
        }
    }

    addOrRemoveSpellingError(add: boolean, term: string) {
        if (add && !this.selectedErrors.has(term)) {
            this.selectedErrors.add(term);
        } else if (!add) {
            this.selectedErrors.delete(term);
        }
    }

    openNewWhitelistModal() {
        this.dialog.open(this.newWhitelistModal, {width: '800px'}).afterClosed().subscribe(res => {
            if (res) {
                this.updatingWhitelists = true;
                this.http.post('/server/loader/addNewWhitelist',
                    {
                        newWhitelist: this.newWhiteList, newWhitelistTerms: this.newWhiteListTerms
                    }, {responseType: 'text'}).subscribe(
                    () => {
                        this.updatingWhitelists = false;
                        this.getWhiteLists();
                        this.alert.addAlert('success', 'New Whitelist added');
                    },
                    () => {
                        this.updatingWhitelists = false;
                        this.alert.addAlert('danger', 'Cannot create new whitelist. Does it already exist?');
                    }
                );
            }
            this.newWhiteList = '';
        });
    }

    copyWhitelist() {
        if (!!this.selectedWhiteList) {
            this.newWhiteList = `Copy of ${this.selectedWhiteList.collectionName}`;
            this.newWhiteListTerms = this.selectedWhiteList.terms.join('|');
            this.openNewWhitelistModal();
        }
    }

    openEditWhitelistModal() {
        this.dialog.open(this.editWhitelistModal, {width: '800px'}).afterClosed().subscribe(res => {
            if (res) {
                this.updateWhiteList(this.whiteListNewTerms, this.whiteListRemoveTerms);
            } else {
                this.getWhiteLists();
            }
            this.whiteListNewTerms = [];
            this.whiteListRemoveTerms = [];
        });
    }

    addNewTerm(term: string) {
        if (this.selectedWhiteList && !!term.trim()) {
            this.whiteListNewTerms.push(term.trim());
        }
    }

    removeWhiteListTerm(term: string) {
        if (this.selectedWhiteList) {
            this.selectedWhiteList.terms.splice(this.selectedWhiteList.terms.indexOf(term), 1);
            this.whiteListRemoveTerms.push(term);
        }
    }

    openDeleteWhitelistModal() {
        this.dialog.open(this.deleteWhitelistModal).afterClosed().subscribe(res => {
            if (res) {
                if (this.selectedWhiteList) {
                    this.updatingWhitelists = true;
                    this.http.delete('/server/loader/deletewhitelist/' + this.selectedWhiteList.collectionName).subscribe(() => {
                            this.getWhiteLists();
                            this.selectedWhiteList = null;
                            this.updatingWhitelists = false;
                            this.alert.addAlert('success', 'Whitelist deleted');
                        },
                        err => {
                            this.updatingWhitelists = false;
                            this.alert.addAlert('danger', 'Could not remove whitelist.');
                        });
                }
            }
        });
    }

    getMisspelledTerms(): string [] {
        return Object.keys(this.spellingErrors).sort();
    }

    pageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.setCurrentErrorPage();
    }

    setCurrentErrorPage() {
        const errorTerms = this.getMisspelledTerms();
        const errorsSize = errorTerms.length;
        if (this.pageIndex * this.pageSize > errorsSize - 1) {
            this.pageIndex = Math.ceil(errorsSize / this.pageSize) - 1;
        }
        this.currentErrorPage = errorTerms.splice(this.pageIndex * this.pageSize, this.pageSize);
    }

    getErrorDisplayText(text: string, term: string, row: number, field: string): string {
        const regEx = new RegExp(term, 'ig');
        text = text.replaceAll(regEx, '<strong>$&</strong>');
        return `Row ${row} - ${field}: ${text}`;
    }

    openTermHelp() {
        this.dialog.open(this.newListHelpModal, {width: '550px'});
    }
}
