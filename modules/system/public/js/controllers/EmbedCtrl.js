angular.module('systemModule').controller('EmbedCtrl', function($scope, OrgHelpers, $http, Alert) {

    var defaultCommon = {
        lowestRegistrationStatus: 'Qualified',
        pageSize: 5
    };

    $scope.embeds = {};

    $scope.myOrgs.forEach(function(o) {
        $http.get('/embeds/' + encodeURIComponent(o)).success(function(res) {
            $scope.embeds[o] = res;
        });
    });

    $scope.save = function() {
        $http.post('/embed', $scope.selection)
            .success(function(result) {
                if (!$scope.selection._id) $scope.selection._id = result._id;
                delete $scope.selection;
                Alert.addAlert("success", "Saved.");
            }).error(function() {
                Alert.addAlert('danger', "There was an issue saving this record. ");
        });
    };

    $scope.addEmbed = function(org) {
        if (!$scope.embeds[org]) {
            $scope.embeds[org] = [];
        }

        $scope.embeds[org].push(
            {
                org: org,
                width: 1000,
                height: 900,
                cde: JSON.parse(JSON.stringify(defaultCommon)),
                form: JSON.parse(JSON.stringify(defaultCommon))
            }
        );

        $scope.selection = $scope.embeds[org][$scope.embeds[org].length - 1];
        $scope.selectedOrg = org;
    };

    $scope.edit = function(org, e) {
        $scope.selection = e;
        $scope.selectedOrg = org;
    };

    $scope.addCdeId = function() {
        if (!$scope.selection.cde.ids) $scope.selection.cde.ids = [];
        $scope.selection.cde.ids.push({source: "", idLabel: "Id", versionLabel: ""});
    };
    $scope.addCdeName = function() {
        if (!$scope.selection.cde.otherNames) $scope.selection.cde.otherNames = [];
        $scope.selection.cde.otherNames.push({contextName: "", label: ""});
    };
    $scope.addCdeProperty = function() {
        if (!$scope.selection.cde.properties) $scope.selection.cde.properties = [];
        $scope.selection.cde.properties.push({key: "", label: "", limit: 50});
    };

    $scope.enableCde = function(b) {
        if (b) {
            $scope.selection.cde = {lowestRegistrationStatus: 'Qualified'};
        } else {
            delete $scope.selection.cde;
        }
    };
    $scope.enableForm = function(b) {
        if (b) {
            $scope.selection.form = {lowestRegistrationStatus: 'Qualified'};
        } else {
            delete $scope.selection.form;
        }
    };

    $scope.cancelEmbed = function() {
        $scope.createMode = false;
    };

});
