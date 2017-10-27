import { Component, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import { DomSanitizer } from "@angular/platform-browser";
import { UserService } from 'core/user.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-embed",
    templateUrl: "embed.component.html"
})

export class EmbedComponent implements OnInit {

    constructor(protected userService: UserService,
                private http: Http,
                private alert: AlertService,
                private sanitizer: DomSanitizer ) {}

    embeds: any = {};
    selection: any;
    selectedOrg: any;
    showDelete: boolean;
    previewOn: boolean;
    defaultCommon: any = {
        lowestRegistrationStatus: 'Qualified',
        linkedForms: {},
        pageSize: 5,
        registrationStatus: {},
        primaryDefinition: {},
        otherNames: [],
        ids: []
    };

    ngOnInit() {
        this.reloadEmbeds();
    }

    reloadEmbeds ()  {
        this.userService.then(() => {
            this.userService.userOrgs.forEach(o => {
                this.http.get('/embeds/' + encodeURIComponent(o)).map(r => r.json()).subscribe(response => this.embeds[o] = response);
            });
        });
    }

    save () {
        this.http.post('/embed', this.selection).map(r => r.json()).subscribe(response => {
                if (!this.selection._id) this.selection._id = response._id;
                this.selection = null;
                this.previewOn = false;
                this.alert.addAlert("success", "Saved.");
            }, () => this.alert.addAlert('danger', "There was an issue saving this record.")
            );
    };

    cancel () {
        this.http.get('/embeds/' + encodeURIComponent(this.selection.org)).map(r => r.json()).subscribe(response => {
            this.embeds[this.selection.org] = response;
            this.selection = null;
            this.previewOn = false;
        });
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

    remove (e) {
        this.http.delete('/embed/' + e._id).subscribe(() => {
            this.alert.addAlert("success", "Removed");
            this.reloadEmbeds();
        });
    }

    edit (org, e) {
        this.selection = e;
        this.selectedOrg = org;
    }

    addCdeId () {
        if (!this.selection.cde.ids) this.selection.cde.ids = [];
        this.selection.cde.ids.push({source: "", idLabel: "Id", versionLabel: ""});
    };
    addCdeName () {
        if (!this.selection.cde.otherNames) this.selection.cde.otherNames = [];
        this.selection.cde.otherNames.push({contextName: "", label: ""});
    }
    addCdeClassification () {
        if (!this.selection.cde.classifications) this.selection.cde.classifications = [];
        this.selection.cde.classifications.push({under: ""});
    }

    enablePreview (b) {
        this.previewOn = b;
    }

    getPreview () {
        return this.sanitizer.bypassSecurityTrustResourceUrl("/embedded/public/html/index.html?id=" + this.selection._id);
    }

    enableCde (b) {
        if (b) {
            this.selection.cde = {lowestRegistrationStatus: 'Qualified'};
        } else {
            this.selection.cde = null;
        }
    }

}