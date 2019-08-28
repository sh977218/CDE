import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import _noop from 'lodash/noop';
import { Embed, EmbedItem } from 'shared/models.model';

function addEmbedItem(): EmbedItem {
    return {
        lowestRegistrationStatus: 'Qualified',
        linkedForms: {},
        pageSize: 5,
        registrationStatus: {},
        primaryDefinition: {},
        otherNames: [],
        ids: []
    };
}

@Component({
    selector: 'cde-embed',
    templateUrl: 'embed.component.html'
})
export class EmbedComponent implements OnInit {
    embeds: { [org: string]: Embed[] } = {};
    previewOn?: boolean;
    selection?: Embed;
    showDelete?: boolean;
    previewSrc?: SafeResourceUrl;

    ngOnInit() {
        this.reloadEmbeds();
    }

    constructor(
        private alert: AlertService,
        private sanitizer: DomSanitizer,
        private http: HttpClient,
        protected userService: UserService,
    ) {
    }

    addCdeClassification() {
        if (!this.selection || !this.selection.cde) {
            return;
        }
        if (!this.selection.cde.classifications) { this.selection.cde.classifications = []; }
        this.selection.cde.classifications.push({exclude: '', label: '', startsWith: ''});
    }

    addCdeId() {
        if (!this.selection || !this.selection.cde) {
            return;
        }
        if (!this.selection.cde.ids) {
            this.selection.cde.ids = [];
        }
        this.selection.cde.ids.push({source: '', idLabel: 'Id', versionLabel: ''});
    }

    addCdeName() {
        if (!this.selection || !this.selection.cde) {
            return;
        }
        if (!this.selection.cde.otherNames) {
            this.selection.cde.otherNames = [];
        }
        this.selection.cde.otherNames.push({contextName: '', label: ''});
    }

    addEmbed(org: string) {
        if (!this.embeds[org]) { this.embeds[org] = []; }

        const embed: Embed = {
            org,
            width: 1000,
            height: 900,
            cde: addEmbedItem(),
            form: addEmbedItem(),
        };
        this.embeds[org].push(embed);
        this.selection = embed;
    }

    edit(org: string, e: Embed) {
        this.selection = e;
    }

    enableCde(b: boolean) {
        if (!this.selection) {
            return;
        }
        this.selection.cde = b
            ? {lowestRegistrationStatus: 'Qualified', pageSize: 20}
            : undefined;
    }

    enablePreview(b: boolean) {
        this.previewOn = b;
        if (b && this.selection) {
            this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl('/embedded/public/html/index.html?id=' + this.selection._id);
        }
    }

    reloadEmbeds() {
        this.userService.then(() => {
            this.userService.userOrgs.forEach(org => this.reloadEmbedsOrg(org));
        }, _noop);
    }

    reloadEmbedsOrg(org: string) {
        this.http.get<Embed[]>('/embeds/' + encodeURIComponent(org)).subscribe(response => {
            this.embeds[org] = response;
            this.selection = undefined;
            this.previewOn = false;
        });
    }

    remove(e: Embed) {
        this.http.delete('/embed/' + e._id).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.reloadEmbeds();
        });
    }

    save() {
        if (!this.selection) {
            return;
        }
        const selection = this.selection;
        this.http.post<Embed>('/embed', this.selection).subscribe(response => {
            if (!selection._id) { selection._id = response._id; }
            this.selection = undefined;
            this.previewOn = false;
            this.alert.addAlert('success', 'Saved.');
            this.reloadEmbeds();
        }, () => this.alert.addAlert('danger', 'There was an issue saving this record.'));
    }
}
