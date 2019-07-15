import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '_app/user.service';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from 'shared/models.model';

@Component({
    selector: 'cde-username-autocomplete',
    templateUrl: './usernameAutocomplete.component.html'
})
export class UsernameAutocompleteComponent {
    @Input() placeHolder: string = 'Make the user';
    usernameControl = new FormControl();
    filteredUsernames: User[] = [];
    @Output() onSelect = new EventEmitter<any>();

    constructor(userService: UserService) {
        this.usernameControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(value => value.length < 3 ? [] : userService.searchUsernames(value)),
            ).subscribe(usernames => this.filteredUsernames = usernames);


        this.usernameControl.valueChanges.subscribe(val => this.onSelect.emit(val));

    }
}
