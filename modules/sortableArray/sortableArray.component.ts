import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'cde-sortable-array',
    templateUrl: './sortableArray.component.html',
})
export class SortableArrayComponent {
    @Input() theArray = [];
    @Input() index!: number;
    @Output() cb = new EventEmitter();

    moveUp() {
        this.theArray.splice(this.index - 1, 0, this.theArray.splice(this.index, 1)[0]);
        this.cb.emit();
    }
    moveDown() {
        this.theArray.splice(this.index + 1, 0, this.theArray.splice(this.index, 1)[0]);
        this.cb.emit();
    }
    moveTop() {
        this.theArray.splice(0, 0, this.theArray.splice(this.index, 1)[0]);
        this.cb.emit();
    }
}
