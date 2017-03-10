import {upgradeAdapter} from "../../../../upgrade.ts";
import {ConceptsComponent} from "../../components/concepts.component";

angular.module('cdeModule').directive('cdeConcepts', upgradeAdapter.downgradeNg2Component(ConceptsComponent));