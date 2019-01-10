import { Component, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';

@Component({
    selector: 'cde-tag',
    templateUrl: './tag.component.html'
})
export class TagComponent {
    @Input() tags: string[] = [];
    @Input() canEdit: boolean = false;
    @Input() allTags: string[] = [];
    @Input() placeHolder: string = 'New tag...';

    @Output() changed = new EventEmitter();

    tagCtrl = new FormControl();
    filteredTags: string[] = [];
    @ViewChild('tagInput') tagInput: ElementRef;
    @ViewChild('tagAuto') matAutocomplete: MatAutocomplete;

    constructor() {
        this.tagCtrl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(value => {
                    let filterValue = value.toLowerCase();
                    return this.allTags.filter(t => t.toLowerCase().includes(filterValue));
                })
            ).subscribe(t => this.filteredTags = t);
    }

    add(event: MatChipInputEvent): void {
        if (!this.matAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;

            if ((value || '').trim()) {
                this.tags.push(value.trim());
            }

            if (input) input.value = '';

            this.tagCtrl.setValue(null);
        }
        this.changed.emit();
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) this.tags.splice(index, 1);
        this.changed.emit();
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.tags.push(event.option.viewValue);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

}
