var upd = require("../../../../upgrade.ts");
var prof = require("../../profile.component");

angular.module('systemModule').directive('cdeProfile', upd.upgradeAdapter.downgradeNg2Component(prof.ProfileComponent));
