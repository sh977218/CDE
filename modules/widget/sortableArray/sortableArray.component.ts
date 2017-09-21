import { Component, Input, Output } from "@angular/core";

@Component({
    selector: "sortable-array",
    templateUrl: "./sortableArray.component.html"
})

export class SortableArrayComponent {

    @Input() theArray = [];
    @Input() index;
    @Output() cb;

    moveUp () {
        this.theArray.splice(this.index - 1, 0, this.theArray.splice(this.index, 1)[0]);
        this.cb.emit();
    };
    moveDown () {
        this.theArray.splice(this.index + 1, 0, this.theArray.splice(this.index, 1)[0]);
        this.cb.emit();
    };
    moveTop () {
        this.theArray.splice(0, 0, this.theArray.splice(this.index, 1)[0]);
        this.cb.emit();
    };

}