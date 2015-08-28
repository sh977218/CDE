angular.module('formModule', ['ui.bootstrap'])
.config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:text\//);
}]);
