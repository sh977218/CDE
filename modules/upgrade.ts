import {forwardRef, Inject, Injectable, Component} from '@angular/core';
import { UpgradeAdapter } from '@angular/upgrade';

import { CdeAppModule } from './app.module';

export const upgradeAdapter = new UpgradeAdapter(forwardRef(() => CdeAppModule));

upgradeAdapter.upgradeNg1Provider('Alert');
upgradeAdapter.upgradeNg1Provider('userResource');
upgradeAdapter.upgradeNg1Provider('ViewingHistory');
