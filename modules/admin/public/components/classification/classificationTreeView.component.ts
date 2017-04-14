import { Component, Input } from "@angular/core";
@Component({
    selector: "classification-tree-view",
    templateUrl: "./classificationTreeView.component.html"
})
export class ClassificationTreeViewComponent {
    @Input() public element: any;
}