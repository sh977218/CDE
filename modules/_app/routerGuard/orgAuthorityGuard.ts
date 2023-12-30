import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { isOrgAuthority } from 'shared/security/authorizationShared';
import { map } from 'rxjs/operators';

export const orgAuthorityGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userService: UserService = inject(UserService);
    return userService.user$.pipe(
        map(user => {
            if (isOrgAuthority(user)) {
                return true;
            } else {
                router.navigate(['/login']);
                return false;
            }
        })
    );
};
