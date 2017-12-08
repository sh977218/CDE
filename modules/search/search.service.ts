import { Injectable } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';

@Injectable()
export class SearchService {
    isBackForward = false;
    hasNavigated = false;

    constructor(private location: PlatformLocation, private router: Router) {
        location.onPopState(e => {
            this.isBackForward = true;
            this.hasNavigated = false;
        });

        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                if (this.hasNavigated)
                    this.isBackForward = false;
                else
                    this.hasNavigated = true;
            }
        });
    }
}