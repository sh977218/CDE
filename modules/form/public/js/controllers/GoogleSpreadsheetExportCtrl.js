angular.module('formModule').controller
('GoogleSpreadsheetExportCtrl', ['$scope', '$http', elt, function($scope, $http, elt) {

    $scope.publishForGoogleSpreadsheet = new function () {
        $http.post("/publishForGoogleSpreadsheet", {
            formId: elt._id,
            publishedFormName: $scope.publishedFormName,
            googleUrl: $scope.googleUrl
        }).then(function (result) {
            
        });
    };

}]);