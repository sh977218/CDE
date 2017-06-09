import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { OrgHelperService } from "../../../../orgHelper.service";
import { AlertService } from "../../alert/alert.service";

@Component({
    selector: "cde-list-management",
    templateUrl: "./listManagement.component.html"
})

export class ListManagementComponent implements OnInit {

    orgs: [any];
    allPropertyKeys: String[] = [];
    allTags: String[] = [];
    public options: Select2Options;

    constructor(
        private http: Http,
        private Alert: AlertService,
        public orgHelper: OrgHelperService
    ) {}

    ngOnInit () {
        this.getOrgs();
        this.options = {
            multiple: true,
            tags: true,
            allowClear: true
        };
    }

    getOrgs () {
        this.http.get("/managedOrgs").map(r => r.json()).subscribe(response => {
            this.orgs = response.orgs;
            this.orgs.forEach(o => {
                if (o.propertyKeys) {
                    this.allPropertyKeys = this.allPropertyKeys.concat(o.propertyKeys);
                    o.currentPropertyKeys = o.propertyKeys.map(r => r);
                }
                if (o.nameTags) {
                    this.allTags = this.allTags.concat(o.nameTags);
                    o.currentTags = o.nameTags.map(r => r);
                }
            });
            this.orgs.sort((a, b) => a.name - b.name);
            this.allPropertyKeys = this.allPropertyKeys.filter((item, pos, self) => self.indexOf(item) === pos);
            this.allTags = this.allTags.filter((item, pos, self) => self.indexOf(item) === pos);
        });
    }

    tagsChanged(o, data: {value: string[]}) {
        if (!data.value) data.value = [];
        o.nameTags = data.value;
        this.saveOrg(o);
    }

    propsChanged(o, data: {value: string[]}) {
        if (!data.value) data.value = [];
        o.propertyKeys = data.value;
        this.saveOrg(o);
    }

    saveOrg (org) {
        this.http.post("/updateOrg", org).subscribe(() => {
            this.orgHelper.getOrgsDetails();
            this.orgHelper.orgDetails.subscribe(() => this.Alert.addAlert("success", "Org Updated"));
        }, response => this.Alert.addAlert("danger", "Error. Unable to save."));
    }

}