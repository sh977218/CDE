import { Component, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { startWith, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'cde-tag',
    templateUrl: './tag.component.html'
})
export class TagComponent {
    @Input() tags: string[] = [];
    @Input() canEdit: boolean = false;
    @Input() allTags: string[] = [];
    @Input() placeHolder: string = 'New tag...';
    @Input() allowFreeType: boolean = false;

    @Output() changed = new EventEmitter();

    tagCtrl = new FormControl();
    filteredTags: Observable<string[]>;
    @ViewChild('tagInput') tagInput!: ElementRef;
    @ViewChild('tagAuto') matAutocomplete!: MatAutocomplete;

    constructor() {
        this.filteredTags = this.tagCtrl.valueChanges
            .pipe(
                startWith(''),
                debounceTime(300),
                distinctUntilChanged(),
                map(value => {
                    let filterValue = value.toLowerCase();
                    let temp = this.allTags.filter(t => t.toLowerCase().indexOf(filterValue) > -1);
                    return temp;
                })
            );
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) this.tags.splice(index, 1);
        this.changed.emit();
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        let selectedTag = event.option.viewValue;
        let tagIndex = this.tags.indexOf(selectedTag);
        if (tagIndex === -1) this.tags.push(selectedTag);
        else this.tags.splice(tagIndex, 1);
        this.changed.emit();
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue('');
    }

    add(event: MatChipInputEvent): void {
        if (this.allowFreeType) {
            if (!this.matAutocomplete.isOpen) {
                const input = event.input;
                const value = event.value;

                if ((value || '').trim()) {
                    this.tags.push(value.trim());
                    this.changed.emit();
                }

                if (input) input.value = '';

                this.tagCtrl.setValue('');
            }
        } else this.tagCtrl.setValue('');
    }

}
