angular.module('formModule', []).config(
    [function()
{
//         }).when('/createForm', {
//             controller: ['$scope', function ($scope) {
//                 $scope.$on('$locationChangeStart', function (event) {
//                     var txt = "You have unsaved changes, are you sure you want to leave this page? ";
//                     if (window.debugEnabled) {
//                         txt = txt + window.location.pathname;
//                     }
//                     var answer = confirm(txt);
//                     if (!answer) {
//                         event.preventDefault();
//                     }
//                 });
//             }],
//             template: '<cde-create-form></cde-create-form>'
//         }).when('/formView', {controller: ['$scope', '$routeParams',
//         function ($scope, $routeParams) {
//             $scope.cbLocChange = function (cb) {
//                 $scope.cbMethod = cb;
//             };
//             $scope.routeParams  = $routeParams;
//             $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
//                 $scope.cbMethod.fn(event, newUrl, oldUrl, $scope.cbMethod.elt);
//             });
//
//         }], template: '<cde-form-view [route-params]="routeParams" (h)="cbLocChange($event)"></cde-form-view>'});
    }]);
