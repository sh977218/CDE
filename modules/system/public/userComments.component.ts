import {Component, Input} from "@angular/core";
import {UserComments} from "./profile.component";

@Component({
    selector: 'user-comments',
    templateUrl: './userComments.component.html'
})
export class UserCommentsComponent {
    @Input() comments:UserComments;
}
