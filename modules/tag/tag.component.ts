import { Component, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { startWith, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import { addOrRemoveFromArray, removeFromArray } from 'shared/array';

@Component({
    selector: 'cde-tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.scss'],
})
export class TagComponent {
    @Input() tags: string[] = [];
    @Input() canEdit: boolean = false;
    @Input() allTags: string[] = [];
    @Input() placeHolder: string = 'New tag...';
    @Input() allowFreeType: boolean = false;
    @Output() changed = new EventEmitter();
    @ViewChild('tagAuto') matAutocomplete!: MatAutocomplete;
    @ViewChild('tagInput') tagInput!: ElementRef;
    tagCtrl = new UntypedFormControl();
    filteredTags: Observable<string[]>;

    constructor() {
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            map(value => this.allTags.filter(t => t.toLowerCase().indexOf(value.toLowerCase()) > -1))
        );
    }

    remove(tag: string): void {
        removeFromArray(this.tags, tag);
        this.changed.emit();
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        const selectedTag = event.option.viewValue;
        addOrRemoveFromArray(this.tags, selectedTag);
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

                if (input) {
                    input.value = '';
                }

                this.tagCtrl.setValue('');
            }
        } else {
            this.tagInput.nativeElement.value = '';
        }
    }
}
