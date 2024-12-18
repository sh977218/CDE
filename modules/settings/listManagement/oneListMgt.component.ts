import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ENTER } from '@angular/cdk/keycodes';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-one-list-management',
    templateUrl: './oneListMgt.component.html',
})
export class OneListMgtComponent implements OnInit {
    @Input() keys!: string[];
    @Input() allKeys!: string[];
    @Input() placeHolder: string = 'Property Keys';
    @Output() save: EventEmitter<any> = new EventEmitter();
    @ViewChild('keyInput', { static: true }) keyInput!: ElementRef<HTMLInputElement>;
    filteredKeys!: Observable<string[]>;
    keyControl = new UntypedFormControl();

    readonly separatorKeysCodes: number[] = [ENTER];

    ngOnInit() {
        this.filteredKeys = this.keyControl.valueChanges.pipe(
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
        const index = this.keys.indexOf(key);
        if (index >= 0) {
            this.keys.splice(this.keys.indexOf(key), 1);
            this.save.emit();
        }
    }

    addKey(event: MatChipInputEvent) {
        const value = (event.value || '').trim();

        if (value) {
            this.keys.push(value);
        }

        event.chipInput!.clear();
        this.keyControl.setValue(null);
        this.save.emit();
    }

    autoSelectedKey(key: MatAutocompleteSelectedEvent) {
        this.keys.push(key.option.viewValue);
        this.keyInput.nativeElement.value = '';
        this.keyControl.setValue(null);
    }
}
