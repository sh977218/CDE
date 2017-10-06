angular.module('cdeModule', []).config(
    [function()
{
//     $routeProvider.
//         when('/cde/search', {
//             controller: 'SearchCtrl',
//             reloadOnSearch: false,
//             template: '<cde-cde-search [reloads]="searchReloadCount"></cde-cde-search>',
//             title: "Find Common Data Elements",
//             keywords: 'cde, common data element, promis, neuro-qol, phenx, ahrq, ninds, repository',
//             description: 'Repository of Common Data Elements (CDE). Search CDEs recommended by NIH. See their use in Protocol Forms.'
//         }).
//         when('/sdcview', {controller: ['$scope', '$routeParams', function($scope, $routeParams) {
//             $scope.cdeId = $routeParams.cdeId;
//         }], template: '<cde-sdc-view [cde-id]="cdeId"></cde-sdc-view>'}).
//         when('/board/:boardId', {controller: ['$scope', '$routeParams', function($scope, $routeParams) {
//             $scope.boardId = $routeParams.boardId;
//         }], template: '<cde-board-view [board-id]="boardId"></cde-board-view>'}).
//         when('/deView', {controller: ['$scope', '$routeParams',
//             function ($scope, $routeParams) {
//                 $scope.cbLocChange = function (cb) {
//                     $scope.cbMethod = cb;
//                 };
//                 $scope.routeParams  = $routeParams;
//                 $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
//                     $scope.cbMethod.fn(event, oldUrl, $scope.cbMethod.elt);
//                 });
//             }], template: '<cde-data-element-view [route-params]="routeParams" (h)="cbLocChange($event)"></cde-data-element-view>'}).
//         when('/cdeStatusReport', {controller: ['$scope', '$routeParams',
//             function ($scope, $routeParams) {
//                 $scope.searchSettings  = JSON.parse($routeParams.searchSettings);
//             }], template: '<cde-cde-status-report [search-settings]="searchSettings"></cde-cde-status-report>'
//         });
    }]);
