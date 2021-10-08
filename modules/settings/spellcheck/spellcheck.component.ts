import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { ValidationWhitelist } from 'shared/models.model';

@Component({
    selector: 'cde-spellcheck',
    templateUrl: './spellcheck.component.html',
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
        field: string
    }[]> = {}

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
        const open = document.getElementById(id);
        if (open && !this.checkingFile) {
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
                }
                this.getWhiteLists();
                this.updatingWhitelists = false;
                this.alert.addAlert('success', 'Whitelist updated');
            }, err => {
                this.updatingWhitelists = false;
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
                    if (this.fileErrors.length === 0 && this.getMisspelledTerms().length === 0) {
                        this.alert.addAlert('success', 'No issues found');
                    }
                },
                error => {
                    this.checkingFile = false;
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
                            this.alert.addAlert('danger', 'Could not remove whitelist.')
                        });
                }
            }
        });
    }

    getMisspelledTerms(): string [] {
        return Object.keys(this.spellingErrors);
    }

    openTermHelp() {
        this.dialog.open(this.newListHelpModal, {width: '550px'});
    }
}
