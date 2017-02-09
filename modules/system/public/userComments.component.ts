import { Component, Input } from "@angular/core";
import { UserComments } from "./profile.component";

@Component({
    selector: "cde-user-comments",
    templateUrl: "./userComments.component.html"
})
export class UserCommentsComponent {
    @Input() comments: UserComments;

    getEltLink(c) {
        return {
                "cde": "/deview?tinyId=",
                "form": "/formView?tinyId=",
                "board": "/board/"
            }[c.element.eltType] + c.element.eltId;
    }
}
