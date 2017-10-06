angular.module('formModule', []).config(
    [function()
{
//     $routeProvider.
//         when('/form/search', {
//             controller: 'SearchCtrl',
//             reloadOnSearch: false,
//             template: '<cde-form-search [reloads]="searchReloadCount"></cde-form-search>',
//             title: "Find protocol forms",
//             keywords: 'form, protocol, protocol form, crf, case report form, repository',
//             description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'
//         }).when('/form', {
//             redirectTo: '/form/search'
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

import {downgradeComponent} from "@angular/upgrade/static";

import {BoardFormSummaryListComponent} from "../components/listView/boardFormSummaryList.component";
angular.module('formModule').directive('cdeBoardFormSummaryList',
    downgradeComponent({component: BoardFormSummaryListComponent,
        inputs: ['board', 'forms', 'module', 'currentPage', 'totalItems'],
        outputs: ['reload']}));

import {FormSearchComponent} from "../components/search/formSearch.component";
angular.module('formModule').directive('cdeFormSearch', downgradeComponent({component: FormSearchComponent,
    inputs: ['reloads'], outputs: []}));

import {CreateFormComponent} from "../components/createForm.component";
angular.module('formModule').directive('cdeCreateForm', downgradeComponent({
    component: CreateFormComponent,
    inputs: ['elt'],
    outputs: []
}));

import {FormViewComponent} from "../components/formView.component";
angular.module('formModule').directive('cdeFormView', downgradeComponent({
    component: FormViewComponent,
    inputs: ['routeParams'],
    outputs: ['h']
}));

