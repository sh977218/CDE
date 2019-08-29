import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { Comment } from 'shared/models.model';
import { Dictionary } from 'async';

type CommentWithOrgName = Comment & {organizationName: string} & Dictionary<any>;

@Component({
    templateUrl: './comments.component.html'
})
export class CommentsComponent {
    @ViewChild('commentTable', { read: MatSort }) commentSort!: MatSort;
    @ViewChild('commentPage') commentPaginator!: MatPaginator;
    commentColumns: string[] = ['created', 'text', 'type', 'user', 'organizationName'];
    commentTableData!: MatTableDataSource<CommentWithOrgName>;
    commentUrl!: string;
    getEltLink = UserService.getEltLink;
    organizationNames?: string[];
    selectedOrganization = '';
    title = 'Comments';

    constructor(protected route: ActivatedRoute,
                private alert: AlertService,
                private http: HttpClient) {
        this.route.data.subscribe(event => {
            this.title = event.title;
            this.commentUrl = event.commentsUrl;
            this.getComments();
        });
    }

    getComments(orgName?: string) {
        this.http.get<CommentWithOrgName[]>(this.commentUrl + 0 + '/-1' + (orgName ? '/' + orgName : '')).subscribe(comments => {
            if (!this.commentUrl) {
                return;
            }

            this.commentTableData = new MatTableDataSource(comments);
            setTimeout(() => {
                this.commentTableData.sort = this.commentSort;
                this.commentTableData.paginator = this.commentPaginator;
            }, 0);
            this.commentTableData.filterPredicate = (data: CommentWithOrgName, filter: string) =>
                this.selectedOrganization === 'all organizations' || this.selectedOrganization === data.organizationName;
            this.commentTableData.sortingDataAccessor = (data: CommentWithOrgName, sortHeaderId: string) => {
                switch (sortHeaderId) {
                    case 'type':
                        return data.element.eltType;
                    case 'user':
                        return data.user.username;
                    default:
                        return data[sortHeaderId];
                }

            };

            const organizationSet = new Set<string>();
            comments.forEach(comment => organizationSet.add(comment.organizationName));
            this.organizationNames = Array.from(organizationSet.values());
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    onFilter() {
        this.commentTableData.filter = 'filter: ' + this.selectedOrganization;

        if (this.commentTableData.paginator) {
            this.commentTableData.paginator.firstPage();
        }
    }
}
