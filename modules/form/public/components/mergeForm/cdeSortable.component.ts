import { Component, Input, ViewChild, Host } from "@angular/core";
import { SortableComponent } from "ng2-bootstrap/index";
import { MergeFormComponent } from "./mergeForm.component";

@Component({
    selector: "cde-sortable",
    templateUrl: "./cdeSortable.component.html"
})
export class CdeSortableComponent {
    @Input() public array: any;
    @Input() public checkSortable: Function;
    @ViewChild("sortableComponent") sortableComponent: SortableComponent;
    private mergeFormComponent;

    constructor(@Host() mergeFormComponent: MergeFormComponent) {
        this.mergeFormComponent = mergeFormComponent;
    }

    addItem() {
        this.array.push({question: {cde: {tinyId: "", name: ""}}});
        this.sortableComponent.writeValue(this.array);
        this.mergeFormComponent.checkSortable();
    }

    removeItem(index) {
        if (index === undefined) index = -1;
        this.array.splice(index, 1);
        this.sortableComponent.writeValue(this.array);
        this.mergeFormComponent.checkSortable();
    }

}