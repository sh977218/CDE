import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '_app/user.service';
import { map } from 'rxjs/operators';

export const loggedInGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userService: UserService = inject(UserService);

    return userService.user$.pipe(
        map(user => {
            if (!!user) return true;
            else {
                router.navigate(['/login']);
                return false;
            }
        })
    );
};
