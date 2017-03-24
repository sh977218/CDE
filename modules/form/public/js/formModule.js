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
        templateUrl: '/form/public/html/formAccordionList.html'}
});
angular.module('formModule').directive('formSummaryList', ["PinModal", function (PinModal) {
    return {
        scope: {forms: '=', ejsPage: '=', module: '=', includeInAccordion: "="},
        templateUrl: '/form/public/html/formSummaryList.html',
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

// Angular 2 upgraded
import {upgradeAdapter} from "../../../upgrade";

import {MergeFormComponent} from "../components/mergeForm/mergeForm.component";
angular.module('formModule').directive('cdeMergeForm', upgradeAdapter.downgradeNg2Component(MergeFormComponent));

import {NativeRenderComponent} from "../nativeRender/nativeRender.component";
angular.module('formModule').directive('cdeNativeRender', upgradeAdapter.downgradeNg2Component(NativeRenderComponent));

import {NativeRenderFullComponent} from "../nativeRender/nativeRenderFull.component";
angular.module('formModule').directive('cdeNativeRenderFull', upgradeAdapter.downgradeNg2Component(NativeRenderFullComponent));