import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
    selector: "classify-item-tree-view",
    templateUrl: "./classifyItemTreeView.component.html"
})
export class ClassifyItemTreeViewComponent implements OnInit {
    @Input() public element: any;
    @Input() public newClassification: any = [];
    @Output() itemClassified = new EventEmitter<any>();

    toggle(e) {
        e.expended = !e.expended;
    }

    ngOnInit(): void {
        if (!this.newClassification || this.newClassification.length === 0)
            this.newClassification = [];
    }

    classifyItemByTree(classificationTree) {
        if (this.newClassification.length !== 1) {
            this.newClassification.push(classificationTree.name);
            this.itemClassified.emit(this.newClassification);
        }
        //this.classifyItem(this.newClassification);
    }


    classifyItem(newC) {
        console.log("new classification: " + JSON.stringify(newC));
    }

    foo() {
        console.log('a');
    }
}