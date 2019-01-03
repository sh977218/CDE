import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { finalize, switchMap, debounceTime, tap, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-username-autocomplete',
    templateUrl: './usernameAutocomplete.component.html'
})
export class UsernameAutocompleteComponent {
    @Input() placeHolder: string = 'Choose a user';
    usernameControl = new FormControl();
    filteredUsernames = [];
    isLoading = true;

    @Output() onSelect = new EventEmitter<any>();

    constructor(userService: UserService) {
        this.usernameControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => this.isLoading = true),
                switchMap(value => value.length < 3 ? [] : userService.searchUsernames(value)
                    .pipe(
                        finalize(() => this.isLoading = false),
                    )
                )
            ).subscribe(usernames => this.filteredUsernames = usernames);
    }
}