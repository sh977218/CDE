import { Component, Input } from "@angular/core";

@Component({
    selector: "classify-item-tree-view",
    templateUrl: "./classifyItemTreeView.component.html"
})
export class ClassifyItemTreeViewComponent {
    @Input() public element: any;

    toggle(e) {
        e.expended = !e.expended;
    }
}