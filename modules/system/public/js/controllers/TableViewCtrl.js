angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchSettings', function ($scope, SearchSettings) {
    SearchSettings.getPromise().then(function (settings) {
        $scope.searchViewSettings = settings;
    });

    $scope.getQuestionTexts = function (cde) {
        return cde.naming.filter(function (n) {
            return n.tags.filter(function (t) {
                    return t.tag.indexOf("Question Text") > -1;
                }).length > 0;
        });
    };

    $scope.getOtherNames = function (cde) {
        return cde.naming.filter(function (n) {
            return n.tags.filter(function (t) {
                    return t.tag.indexOf("Question Text") > -1;
                }).length === 0;
        });
    };


}]);
