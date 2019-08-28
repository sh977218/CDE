import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-one-list-management',
    templateUrl: './oneListMgt.component.html'
})
export class OneListMgtComponent implements OnInit {
    @Input() keys!: string[];
    @Input() allKeys!: string[];
    @Input() placeHolder: string = 'Property Keys';
    @Output() save: EventEmitter<any> = new EventEmitter();
    @ViewChild('keyInput') keyInput!: ElementRef<HTMLInputElement>;
    filteredKeys!: Observable<string[]>;
    keyControl = new FormControl();

    readonly separatorKeysCodes: number[] = [ENTER];

    ngOnInit() {
        this.filteredKeys = this.keyControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(this.allKeys, value))
            );

    }

    _filter(options: string[], value: string): string[] {
        if (!value) {
            return [];
        }
        return options.filter(option => option.toLowerCase().includes(value.toLowerCase()));
    }

    removeKey(key: string) {
        this.keys.splice(this.keys.indexOf(key), 1);
        this.save.emit();
    }

    addKey(key: MatChipInputEvent) {
        const input = key.input;
        const value = key.value;

        if ((value || '').trim()) {
            this.keys.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.keyControl.setValue(null);
        this.save.emit();

    }

    autoSelectedKey(key: MatAutocompleteSelectedEvent) {
        this.keys.push(key.option.viewValue);
        this.keyInput.nativeElement.value = '';
        this.keyControl.setValue(null);
        this.save.emit();
    }
}
