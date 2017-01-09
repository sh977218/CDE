angular.module('formModule').controller
('GoogleSpreadsheetExportCtrl', ['$scope', '$http', 'elt', 'Alert', function($scope, $http, elt, Alert) {

    $scope.publishForGoogleSpreadsheet = function () {
        $http.post("/publishForGoogleSpreadsheet", {
            formId: elt._id,
            publishedFormName: $scope.publishedFormName,
            googleUrl: $scope.googleUrl
        }).then(function (result) {
            Alert.addAlert("info", "Done: " + result.data)
        });
    };

}]);