angular.module('systemModule').controller('EmbedCtrl', ["$scope", "OrgHelpers", "$http", "AlertService",
    function($scope, OrgHelpers, $http, Alert) {

    var defaultCommon = {
        lowestRegistrationStatus: 'Qualified',
        pageSize: 5
    };

    $scope.embeds = {};

    function reloadEmbeds()  {
            $scope.myOrgs.forEach(function(o) {
            $http.get('/embeds/' + encodeURIComponent(o)).then(function onSuccess(response) {
                $scope.embeds[o] = response.data;
            });
        });
    }

    reloadEmbeds();

    $scope.save = function() {
        $http.post('/embed', $scope.selection)
            .then(function onSuccess(response) {
                if (!$scope.selection._id) $scope.selection._id = response.data._id;
                delete $scope.selection;
                $scope.previewOn = false;
                Alert.addAlert("success", "Saved.");
            })
            .catch(function onError() {
                Alert.addAlert('danger', "There was an issue saving this record. ");
            });
    };

    $scope.cancel = function() {
        $http.get('/embeds/' + encodeURIComponent($scope.selection.org)).then(function onSuccess(response) {
            $scope.embeds[$scope.selection.org] = response.data;
            delete $scope.selection;
            $scope.previewOn = false;
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

    $scope.remove = function(e) {
        $http['delete']('/embed/' + e._id).then(function onSuccess() {
            Alert.addAlert("success", "Removed");
            reloadEmbeds();
        });
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
    $scope.addCdeClassification = function() {
        if (!$scope.selection.cde.classifications) $scope.selection.cde.classifications = [];
        $scope.selection.cde.classifications.push({under: ""});
    };

    $scope.enablePreview = function(b) {
        $scope.previewOn = b;
    };

    $scope.getPreview = function() {
        return "/embedded/public/html/index.html?id=" + $scope.selection._id;
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

}]);
