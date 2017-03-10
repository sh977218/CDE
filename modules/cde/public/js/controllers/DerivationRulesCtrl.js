import {upgradeAdapter} from "../../../../upgrade.ts";
import {DerivationRulesComponent} from "../../components/derivationRules.component";

angular.module('systemModule').directive('cdeDerivationRules', upgradeAdapter.downgradeNg2Component(DerivationRulesComponent));


