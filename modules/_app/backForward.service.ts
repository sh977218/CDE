import { forwardRef, Inject, Injectable } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class BackForwardService {
    isBackForward = false;
    hasNavigated = false;

    constructor(
        @Inject(forwardRef(() => PlatformLocation))
        private location: PlatformLocation,
        @Inject(forwardRef(() => Router)) private router: Router
    ) {
        location.onPopState(() => {
            this.isBackForward = true;
            this.hasNavigated = false;
        });

        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                if (this.hasNavigated) {
                    this.isBackForward = false;
                } else {
                    this.hasNavigated = true;
                }
            }
        });
    }
}
