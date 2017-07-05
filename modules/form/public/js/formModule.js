angular.module('formModule', ['resourcesForm', 'ngRoute', 'ui.scrollpoint', 'formTemplates']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/form/search', {
            controller: 'ListCtrl',
            subCtrl: 'FormListCtrl',
            templateUrl: '/system/public/html/list.html',
            reloadOnSearch: false,
            title: "Find protocol forms",
            keywords: 'form, protocol, protocol form, crf, case report form, repository',
            description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'
        }).
        when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/form/public/html/createForm.html'}).
        when('/formView', {controller: 'FormViewCtrl', templateUrl: '/form/public/html/formView.html'});
}]);

angular.module('formModule').directive('formAccordionList', function () {
    return {
        scope: {forms: '=', ejsPage: '=', module: '='},
        template: require('../html/formAccordionList.html')}
});
angular.module('formModule').directive('formSummaryList', ["PinModal", function (PinModal) {
    return {
        scope: {forms: '=', ejsPage: '=', module: '=', includeInAccordion: "="},
        template: require('../html/formSummaryList.html'),
        controller: ["$scope", "PinModal", "FormQuickBoard", function ($scope, PinModal, QuickBoard) {
            $scope.PinModal = PinModal.new("form");
            $scope.quickBoard = QuickBoard;
        }]
    };
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

angular.module('formModule').directive('formSearch', [function () {
    return {
        scope: {result: '&', cache: '<', cachePut: '&'},
        template: require('../html/formSearch.html'),
        controller: ["$scope", function ($scope) {
            $scope.addMode = 0;
            $scope.openFormInNewTab = true;
            $scope.searchAdded = function (fe) {
                $scope.result(fe);
            }
        }]
    };
}]);

angular.module('formModule').directive('questionSearch', [function () {
    return {
        scope: {result: '&', cache: '<', cachePut: '&'},
        template: require('../html/questionSearch.html'),
        controller: ["$scope", function ($scope) {
            $scope.addMode = 0;
            $scope.openCdeInNewTab = true;
            $scope.searchAdded = function (fe) {
                $scope.result(fe);
            }
        }]
    };
}]);

import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";

import {BoardFormSummaryListComponent} from "../components/searchResults/boardFormSummaryList.component";
angular.module('formModule').directive('cdeBoardFormSummaryList',
    downgradeComponent({component: BoardFormSummaryListComponent, inputs: ['board', 'forms', 'currentPage', 'totalItems'], outputs: ['reload']}));

import {FormDescriptionComponent} from "../tabs/description/formDescription.component";
angular.module('formModule').directive('cdeFormDescription', downgradeComponent({component: FormDescriptionComponent, inputs: ['elt', 'inScoreCdes', 'cache'], outputs: ['isFormValid', 'stageElt', 'cachePut']}));

import {DisplayProfileComponent} from "../components/displayProfile/displayProfile.component";
angular.module('formModule').directive('cdeFormDisplayProfile', downgradeComponent({component: DisplayProfileComponent, inputs: ['eltLoaded', 'elt'], outputs: []}));

import {FormSummaryListComponent} from "../components/searchResults/formSummaryList.component";
angular.module('formModule').directive('cdeFormSummaryList', downgradeComponent({component: FormSummaryListComponent, inputs: ['forms'], outputs: []}));

import {MergeFormComponent} from "../components/mergeForm/mergeForm.component";
angular.module('formModule').directive('cdeMergeForm', downgradeComponent({component: MergeFormComponent, inputs: ['left', 'right'], outputs: []}));

import {NativeRenderComponent} from "../nativeRender/nativeRender.component";
angular.module('formModule').directive('cdeNativeRender', downgradeComponent({component: NativeRenderComponent, inputs: ['eltLoaded', 'elt', 'profile', 'submitForm'], outputs: []}));

import {NativeRenderFullComponent} from "../nativeRender/nativeRenderFull.component";
angular.module('formModule').directive('cdeNativeRenderFull', downgradeComponent({component: NativeRenderFullComponent, inputs: ['eltLoaded', 'elt'], outputs: []}));

import {FormGeneralDetailsComponent} from "../components/formGeneralDetails/formGeneralDetails.component";
angular.module('formModule').directive('cdeFormGeneralDetails', downgradeComponent({component: FormGeneralDetailsComponent, inputs: ['eltLoaded', 'elt'], outputs: []}));

import {CreateFormComponent} from "../components/createForm.component";
angular.module('formModule').directive('cdeCreateForm', downgradeComponent({component: CreateFormComponent, inputs: ['elt'], outputs: []}));

