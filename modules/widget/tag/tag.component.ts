import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'cde-tag',
    templateUrl: './tag.component.html'
})
export class TagComponent implements OnInit {
    @Input() tags: string[] = [];
    @Input() canEdit: boolean = false;
    @Input() allTags: any = [];
    @Input() placeHolder: string = 'New tag...';

    @Output() changed = new EventEmitter();

    tagCtrl = new FormControl();
    filteredTags: Observable<string[]>;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    ngOnInit() {
        let t = this.tagCtrl.valueChanges.pipe(
            startWith(''),
            map((t: string | null) => {
                let temp = this._filter(t);
                return temp;
            }));
        this.filteredTags = t;

    }

    /*
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

            if (index >= 0) {
                this.tags.splice(index, 1);
            }
            this.changed.emit();
        }

        selected(event: MatAutocompleteSelectedEvent): void {
            this.tags.push(event.option.viewValue);
            this.tagInput.nativeElement.value = '';
            this.tagCtrl.setValue(null);
        }*/

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTags.filter(t => t.toLowerCase().includes(filterValue));
    }

}
