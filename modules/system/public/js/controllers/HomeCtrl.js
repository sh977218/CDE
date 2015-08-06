angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$location','AutoCompleteResource', function($scope, $http, $location,AutoCompleteResource) {
    // Declare variables that will be used. Not needed but makes the code clear to understand.

    $scope.search = function () {
        $scope.currentSearchTerm = $scope.searchSettings.q;

        $scope.reload();
    };

    $scope.searchSettings =  {"q": ''};

    $scope.getAutoComplete = function (searchTerm) {
        return AutoCompleteResource.getAutoComplete(searchTerm);
    }

    $scope.gotoSearch = function() {
        $location.url( '/cde/search' );
    };

    $scope.submitForm = function( isValid ) {
        if( isValid ) {
            $scope.gotoSearch();
        } else {
            alert( 'Please correct form error(s) and resubmit.' );
        }
    };
}
]);