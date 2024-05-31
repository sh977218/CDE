import { Component } from '@angular/core';

@Component({
    selector: 'cde-page-not-found',
    template: `
        <div class="m-4" style="text-align: center">
            <h1>404 Page Not Found</h1>
            <strong>The page you’re looking for isn’t available.</strong>
            <p>The page may be temporarily unavailable, moved, or no longer available.</p>
            <em>Please check the url. Broken links can be reported using reporting tool at the bottom of the page.</em>
        </div>
    `,
    standalone: true,
})
export class PageNotFoundComponent {}
