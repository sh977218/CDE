angular.module('formModule', ['resourcesForm', 'ngRoute', 'ui.scrollpoint', 'formTemplates']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/form/search', {
            controller: 'SearchCtrl',
            reloadOnSearch: false,
            template: '<cde-form-search [reloads]="searchReloadCount"></cde-form-search>',
            title: "Find protocol forms",
            keywords: 'form, protocol, protocol form, crf, case report form, repository',
            description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'
        }).when('/form', {
            redirectTo: '/form/search'
        }).when('/createForm', {
            controller: 'CreateFormCtrl',
            templateUrl: '/form/public/html/createForm.html'
        }).when('/formView', {controller:'FormViewCtrl', templateUrl: '/form/public/html/formView.html'});
    }]);

angular.module('formModule').directive("jqSlider", ["$compile", "$timeout", "$parse", function ($compile, $timeout, $parse) {
    return {
        link: function ($scope, element, attrs) {
            $timeout(function () {
                $(function () {
                    var handle = $(element).find(".ui-slider-handle");
                    $(element).slider({
                        value: $parse(attrs.jqSlider)($scope),
                        min: $parse(attrs.jqSliderMin)($scope),
                        max: $parse(attrs.jqSliderMax)($scope),
                        step: $parse(attrs.jqSliderStep)($scope),
                        create: function () {
                            handle.text($(this).slider("value"));
                        },
                        slide: function (event, ui) { // jshint ignore:line
                            handle.text(ui.value);
                            $parse(attrs.jqSlider).assign($scope, ui.value);
                            $scope.$apply($parse(attrs.jqSliderOnslide)($scope));
                        }
                    });
                });
            }, 0, false);
        }
    };
}]);

import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";

import {BoardFormSummaryListComponent} from "../components/listView/boardFormSummaryList.component";
angular.module('formModule').directive('cdeBoardFormSummaryList',
    downgradeComponent({component: BoardFormSummaryListComponent, inputs: ['board', 'forms', 'module', 'currentPage', 'totalItems'], outputs: ['reload']}));

import {FormSearchComponent} from "../components/search/formSearch.component";
angular.module('formModule').directive('cdeFormSearch', downgradeComponent({component: FormSearchComponent, inputs: ['reloads'], outputs: []}));

import {MergeFormComponent} from "../components/mergeForm/mergeForm.component";

angular.module('formModule').directive('cdeMergeForm', downgradeComponent({
    component: MergeFormComponent,
    inputs: ['left', 'right'],
    outputs: []
}));

import {CreateFormComponent} from "../components/createForm.component";

angular.module('formModule').directive('cdeCreateForm', downgradeComponent({
    component: CreateFormComponent,
    inputs: ['elt'],
    outputs: []
}));

import {FormViewComponent} from "../components/formView.component";

angular.module('formModule').directive('cdeFormView', downgradeComponent({
    component: FormViewComponent,
    inputs: ['elt'],
    outputs: ['stageElt', 'reload']
}));

