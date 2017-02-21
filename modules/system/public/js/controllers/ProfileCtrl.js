import {upgradeAdapter} from "../../../../upgrade.ts";
import {ProfileComponent} from "../../profile.component";

angular.module('systemModule').directive('cdeProfile', upgradeAdapter.downgradeNg2Component(ProfileComponent));
