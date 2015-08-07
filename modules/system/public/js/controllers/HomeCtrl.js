angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$location','AutoCompleteResource',
    function($scope, $http, $location,AutoCompleteResource) {

    $scope.searchSettings =  {"q": ''};

    $scope.getAutoComplete = function (searchTerm) {
        return AutoCompleteResource.getAutoComplete(searchTerm);
    }

    $scope.submitForm = function( isValid ) {
        if( isValid ) {
            $location.assign('/#/cde/search?q=' + $scope.searchSettings.q);
        } else {
            alert( 'Please correct form error(s) and resubmit.' );
        }
    };
}
]);