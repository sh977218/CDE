angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchSettings', function($scope, SearchSettings) {
    SearchSettings.getPromise().then(function(settings) {
        $scope.searchViewSettings = settings;
    });

    $scope.getQuestionTexts = function (cde) {
        return cde.naming.filter(function (n) {
            return n.context && n.context.contextName &&
                n.context.contextName.indexOf("Question Text", n.context.contextName.length - "Question Text".length) !== -1;
        });
    };

}]);
