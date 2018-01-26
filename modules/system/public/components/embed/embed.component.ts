import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';


@Component({
    selector: 'cde-embed',
    templateUrl: 'embed.component.html'
})
export class EmbedComponent implements OnInit {
    defaultCommon: any = {
        lowestRegistrationStatus: 'Qualified',
        linkedForms: {},
        pageSize: 5,
        registrationStatus: {},
        primaryDefinition: {},
        otherNames: [],
        ids: []
    };
    embeds: any = {};
    previewOn: boolean;
    selectedOrg: any;
    selection: any;
    showDelete: boolean;

    ngOnInit() {
        this.reloadEmbeds();
    }

    constructor(
        private alert: AlertService,
        private sanitizer: DomSanitizer,
        private http: HttpClient,
        protected userService: UserService,
    ) {}

    addCdeClassification () {
        if (!this.selection.cde.classifications) this.selection.cde.classifications = [];
        this.selection.cde.classifications.push({under: ''});
    }

    addCdeId () {
        if (!this.selection.cde.ids) this.selection.cde.ids = [];
        this.selection.cde.ids.push({source: '', idLabel: 'Id', versionLabel: ''});
    }

    addCdeName () {
        if (!this.selection.cde.otherNames) this.selection.cde.otherNames = [];
        this.selection.cde.otherNames.push({contextName: '', label: ''});
    }

    addEmbed (org) {
        if (!this.embeds[org]) this.embeds[org] = [];

        this.embeds[org].push(
            {
                org: org,
                width: 1000,
                height: 900,
                cde: JSON.parse(JSON.stringify(this.defaultCommon)),
                form: JSON.parse(JSON.stringify(this.defaultCommon))
            }
        );

        this.selection = this.embeds[org][this.embeds[org].length - 1];
        this.selectedOrg = org;
    }

    cancel () {
        this.http.get('/embeds/' + encodeURIComponent(this.selection.org)).subscribe(response => {
            this.embeds[this.selection.org] = response;
            this.selection = null;
            this.previewOn = false;
        });
    }

    edit (org, e) {
        this.selection = e;
        this.selectedOrg = org;
    }

    enableCde (b) {
        if (b) {
            this.selection.cde = {lowestRegistrationStatus: 'Qualified'};
        } else {
            this.selection.cde = null;
        }
    }

    enablePreview (b) {
        this.previewOn = b;
    }

    getPreview () {
        return this.sanitizer.bypassSecurityTrustResourceUrl('/embedded/public/html/index.html?id=' + this.selection._id);
    }

    reloadEmbeds ()  {
        this.userService.then(() => {
            this.userService.userOrgs.forEach(o => {
                this.http.get('/embeds/' + encodeURIComponent(o)).subscribe(response => this.embeds[o] = response);
            });
        });
    }

    remove (e) {
        this.http.delete('/embed/' + e._id).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.reloadEmbeds();
        });
    }

    save () {
        this.http.post<any>('/embed', this.selection).subscribe(response => {
            if (!this.selection._id) this.selection._id = response._id;
            this.selection = null;
            this.previewOn = false;
            this.alert.addAlert('success', 'Saved.');
        }, () => this.alert.addAlert('danger', 'There was an issue saving this record.'));
    }
}
