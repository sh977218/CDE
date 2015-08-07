angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$window','AutoCompleteResource',
    function($scope, $http, $window, AutoCompleteResource)
{

    $scope.autocomplete = AutoCompleteResource;
    $scope.searchSettings =  {"q": ''};
    $scope.submitForm = function( isValid ) {
        if( isValid ) {
            $window.location.assign('/#/cde/search?q=' + $scope.searchSettings.q);
        } else {
            alert( 'Please correct form error(s) and resubmit.' );
        }
    };

}]);