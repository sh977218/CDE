import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
    selector: "classify-item-tree-view",
    templateUrl: "./classifyItemTreeView.component.html"
})
export class ClassifyItemTreeViewComponent implements OnInit {
    @Input() public element: any;
    @Input() public currentPath: any;
    @Input() public previousPath: any;

    toggle(e) {
        e.expended = !e.expended;
    }

    ngOnInit(): void {
        this.previousPath.push(this.currentPath);
    }

    classifyItemByTree(classificationTree) {
    }


    classifyItem(newC) {
        console.log("new classification: " + JSON.stringify(newC));
    }

    foo() {
        console.log('a');
    }
}