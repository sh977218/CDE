import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { canClassify } from 'shared/security/authorizationShared';
import { map } from 'rxjs/operators';

export const classifyGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userService: UserService = inject(UserService);

    return userService.user$.pipe(
        map(user => {
            if (canClassify(user)) {
                return true;
            } else {
                router.navigate(['/login']);
                return false;
            }
        })
    );
};
