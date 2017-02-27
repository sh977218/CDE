import {upgradeAdapter} from "../../../../upgrade.ts";
import {IdentifiersComponent} from "../../components/adminItem/identifiers.component";

angular.module('systemModule').directive('cdeAdminItemIds', upgradeAdapter.downgradeNg2Component(IdentifiersComponent));

