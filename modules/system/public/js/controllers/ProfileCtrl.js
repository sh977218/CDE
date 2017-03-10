import {upgradeAdapter} from "../../../../upgrade.ts";
import {ProfileComponent} from "../../components/profile.component.ts";

angular.module('systemModule').directive('cdeProfile', upgradeAdapter.downgradeNg2Component(ProfileComponent));
