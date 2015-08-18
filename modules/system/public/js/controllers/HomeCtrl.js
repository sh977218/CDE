angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$location','AutoCompleteResource',
    function($scope, $http, $location, AutoCompleteResource)
{

    $scope.autocomplete = AutoCompleteResource;
    $scope.searchSettings =  {"q": ''};
    $scope.submitForm = function( isValid ) {
        if( isValid ) {
            $location.url('cde/search?q=' + $scope.searchSettings.q);
        } else {
            $scope.addAlert( 'Please correct form error(s) and resubmit.' );
        }
    };

}]);