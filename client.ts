// ./src/client.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MainModule } from './browser.module';

export const platformRef = platformBrowserDynamic();

export function main() {
    return platformRef.bootstrapModule(MainModule);
}

switch (document.readyState) {
    case 'loading':
        document.addEventListener('DOMContentLoaded', () => main());
        break;
    case 'interactive':
    case 'complete':
    default:
        main();
}