import { platformBrowser } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { CdeAppModule } from "../app.module";
platformBrowser().bootstrapModuleFactory(CdeAppModule).then(platformRef => {
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.documentElement, ["cdeAppModule"]);
});
