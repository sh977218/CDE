angular.module('systemModule').controller('EmbedCtrl', ['$scope', function($scope) {

    $scope.selection = {
        org: $scope.myOrgs[0],
        primaryDefinition: true,
        sourceId: true,
        sourceVersion: true,
        pageSize: 5,
        width: 1000,
        height: 900
    };

    $scope.getEmbedCode = function() {
        return "<iframe type='text/html' id='nlmcdeIFrame' src='http://localhost:3001/embedded/public/html/index.html?org=" +
            $scope.selection.org + "&primaryDefinition=" + $scope.selection.primaryDefinition +
            "&sourceId=" + $scope.selection.sourceId +
            "&sourceVersion=" + $scope.selection.sourceVersion +
            "&pageSize=" + $scope.selection.pageSize +
            "' width='" + $scope.selection.width + "px' height='" + $scope.selection.height + "px'></iframe>";
    };

    $scope.styles = "<style>html,body{height:100%;}.wrapper{width:80%;height:100%;margin:0 auto;background:#CCC}.h_iframe{position:relative;}.h_iframe .ratio {display:block;width:100%;height:auto;}.h_iframe iframe {position:absolute;top:0;left:0;width:100%; height:100%;} </style>";

}]);
