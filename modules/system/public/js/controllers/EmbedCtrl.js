angular.module('systemModule').controller('EmbedCtrl', function($scope, OrgHelpers) {

    $scope.selection = {
        org: $scope.myOrgs[0],
        primaryDefinition: true,
        sourceId: true,
        sourceVersion: true,
        lowestRegistrationStatus: 'Qualified',
        pageSize: 5,
        width: 1000,
        height: 900
    };

    $scope.getEmbeds = function() {
        var result = [];
        $scope.myOrgs.forEach(function(oName) {
            var org = OrgHelpers.orgsDetailedInfo[oName];
            if (org.embeds) {
                org.embeds.forEach(function(e) {
                    result.push({org: oName, embed: e});
                });
            }
        });
        return result;
    };

    $scope.addEmbed = function() {
        $scope.createMode = false;
        if (!OrgHelpers.orgsDetailedInfo[$scope.selection.org].embeds) {
            OrgHelpers.orgsDetailedInfo[$scope.selection.org].embeds = [];
        }

        // TODO save embed

        OrgHelpers.orgsDetailedInfo[$scope.selection.org].embeds.push({
            name: $scope.selection.embedName
        });
    };

    $scope.cancelEmbed = function() {
        $scope.createMode = false;
    };

    $scope.getEmbedCode = function() {
        var res = "<iframe type='text/html' id='nlmcdeIFrame' src='http://localhost:3001/embedded/public/html/index.html?org=" +
            $scope.selection.org + "&primaryDefinition=" + $scope.selection.primaryDefinition +
            "&sourceId=" + $scope.selection.sourceId +
            "&sourceVersion=" + $scope.selection.sourceVersion +
            "&pageSize=" + $scope.selection.pageSize +
            "&lowestRegistrationStatus=" + $scope.selection.lowestRegistrationStatus +
            "' width='" + $scope.selection.width + "px' height='" + $scope.selection.height + "px'></iframe>";
        return "Kfjf";
    };


});
