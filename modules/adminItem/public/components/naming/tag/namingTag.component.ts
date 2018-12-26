import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrgHelperService } from 'core/orgHelper.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'cde-naming-tag',
    templateUrl: './namingTag.component.html'
})
export class NamingTagComponent implements OnInit {
    @Input() tags;
    @Input() canEdit;
    @Input() stewardOrgName;
    @Input() allTags?;

    tagCtrl = new FormControl();
    filteredTags: Observable<string[]>;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(private orgHelperService: OrgHelperService) {
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
            startWith(null),
            map((t: string | null) => t ? this._filter(t) : this.allTags.slice()));
    }

    ngOnInit() {
        if (this.stewardOrgName) {
            this.orgHelperService.then(orgsDetailedInfo => {
                let namingTags = orgsDetailedInfo[this.stewardOrgName].nameTags;
                this.allTags = namingTags;
            }, () => {
            });
        }
    }


    add(event: MatChipInputEvent): void {
        if (!this.matAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;

            if ((value || '').trim()) {
                this.tags.push(value.trim());
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.tagCtrl.setValue(null);
        }
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.tags.push(event.option.viewValue);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTags.filter(t => t.toLowerCase().indexOf(filterValue) === 0);
    }

}
