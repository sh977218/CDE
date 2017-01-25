import {Component, OnChanges, Inject} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';

export class UserComments {
    constructor(public currentCommentsPage:number,
                public totalItems:number,
                public latestComments:Array<any>) {}
}

@Component({
    selector: 'cde-profile',
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnChanges {
    comments:UserComments = new UserComments(1, 10000, []);
    cdes: any;
    hasQuota: any;
    orgCurator: string;
    orgAdmin: string;
    user: any;

    constructor(private http: Http,
                @Inject('Alert') private alert,
                @Inject('userResource') private userService,
                @Inject('ViewingHistory') private viewingHistoryService) {
        viewingHistoryService.getViewingHistory();
        viewingHistoryService.getPromise().then((response) => {
            this.cdes = [];
            if (Array.isArray(response))
                this.cdes = response;
        });

        userService.getRemoteUser();
        userService.getPromise().then(() => {
            if (userService.user.username) {
                this.hasQuota = userService.user.quota;
                this.orgCurator = userService.user.orgCurator.toString().replace(/,/g, ', ');
                this.orgAdmin = userService.user.orgAdmin.toString().replace(/,/g, ', ');
                this.getComments(1);
                this.user = userService.user;
            }
        });
    }

    ngOnChanges(changes) {
        if (changes.comments && changes.comments.currentValue.currentCommentsPage != changes.comments.oldValue.currentCommentsPage)
            this.getComments(this.comments.currentCommentsPage);
    }

    saveProfile() {
        this.http.post('/user/me', this.user)
            .subscribe(
                (data) => this.alert.addAlert("success", "Saved"),
                (err) => this.alert.addAlert("danger", "Error, unable to save")
            );
    }

    removePublishedForm(pf) {
        this.user.publishedForms = this.user.publishedForms.filter(function (p) {
            return p.id !== pf.id;
        });
        this.saveProfile();
    }

    getComments(page) {
        this.http.get("/commentsFor/" + this.userService.user.username + "/" + (page - 1) * 30 + "/30").map((res: Response) => res.json()).subscribe( (data) => {
            this.comments.latestComments = data;
            if (this.comments.latestComments.length === 0) {
                this.comments.totalItems = (page - 2) * 30;
            } else if (this.comments.latestComments.length < 30) {
                this.comments.totalItems = (page - 1) * 30 + this.comments.latestComments.length;
            }
        });
    }

    static getEltLink(c) {
        return {
                'cde': "/deview?tinyId=",
                'form': "/formView?tinyId=",
                'board': "/board/"
            }[c.element.eltType] + c.element.eltId;
    }
}
