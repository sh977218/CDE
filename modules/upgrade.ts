import { forwardRef, Inject, Injectable, Component } from "@angular/core";
import { UpgradeAdapter } from "@angular/upgrade";

import { CdeAppModule } from "./app.module";

/* tslint:disable */
export const upgradeAdapter = new UpgradeAdapter(forwardRef(() => CdeAppModule));
/* tslint:enable */

upgradeAdapter.upgradeNg1Provider("Alert");
upgradeAdapter.upgradeNg1Provider("userResource");
upgradeAdapter.upgradeNg1Provider("ViewingHistory");
upgradeAdapter.upgradeNg1Provider("isAllowedModel");