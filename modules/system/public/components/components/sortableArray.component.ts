import { Component, Input, Output } from "@angular/core";

@Component({
    selector: "cde-sortable-array",
    templateUrl: "./sortableArray.component.html"
})
export class SortableArrayComponent {

    @Input() public theArray: any;
    @Input() public index;
    @Output() public cb;

    constructor() {
    }

    moveUp() {
        this.theArray.splice(this.index - 1, 0, this.theArray.splice(this.index, 1)[0]);
    };

    moveDown() {
        this.theArray.splice(this.index + 1, 0, this.theArray.splice(this.index, 1)[0]);
    };

    moveTop() {
        this.theArray.splice(0, 0, this.theArray.splice(this.index, 1)[0]);
    };

    moveBottom() {
        this.theArray.push(this.theArray.shift());
    };
}
