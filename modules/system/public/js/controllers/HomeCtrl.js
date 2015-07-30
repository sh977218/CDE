angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
    // Declare variables that will be used. Not needed but makes the code clear to understand.

    $scope.search = function () {
        $scope.currentSearchTerm = $scope.ftsearch;
        $scope.cache.put($scope.getCacheName("ftsearch"), $scope.ftsearch);

        $scope.reload();
    };
    $scope.getAutoComplete = function (searchQuery) {
        return $http.get('/cdeCompletion/' + searchQuery, {}).then(function (response) {
            return response.data;
        });
    }

    $scope.onSelect = function (item, model, label) {
        $scope.gotoSearch();
    }

    $scope.ftsearch = '';
    

    $scope.gotoSearch = function() {
        $scope.initCache();
        $scope.cache.put( 'search.cde.ftsearch', $scope.ftsearch );
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