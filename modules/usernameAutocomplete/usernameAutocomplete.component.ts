import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { UserService } from '_app/user.service';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from 'shared/models.model';

@Component({
    selector: 'cde-username-autocomplete',
    templateUrl: './usernameAutocomplete.component.html',
})
export class UsernameAutocompleteComponent {
    @Input() placeHolder: string = 'Make the user';
    @Output() selected = new EventEmitter<User | string>();
    filteredUsernames: User[] = [];
    usernameControl = new UntypedFormControl();

    constructor(userService: UserService) {
        this.usernameControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(value =>
                    value.length < 3 ? [] : userService.searchUsernames(value)
                )
            )
            .subscribe(usernames => (this.filteredUsernames = usernames));

        this.usernameControl.valueChanges.subscribe(val =>
            this.selected.emit(val)
        );
    }
}
