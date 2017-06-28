angular.module('formModule', ['resourcesForm', 'ngRoute', 'ui.scrollpoint', 'formTemplates']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/form/search', {
            template: '<cde-form-search></cde-form-search>',
            title: "Find protocol forms",
            keywords: 'form, protocol, protocol form, crf, case report form, repository',
            description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'
        }).
        when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/form/public/html/createForm.html'}).
        when('/formView', {controller: 'FormViewCtrl', templateUrl: '/form/public/html/formView.html'});
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

import {FormDescriptionComponent} from "../tabs/description/formDescription.component";
angular.module('formModule').directive('cdeFormDescription', downgradeComponent({component: FormDescriptionComponent, inputs: ['elt', 'inScoreCdes', 'cache'], outputs: ['isFormValid', 'stageElt', 'cachePut']}));

import {DisplayProfileComponent} from "../components/displayProfile/displayProfile.component";
angular.module('formModule').directive('cdeFormDisplayProfile', downgradeComponent({component: DisplayProfileComponent, inputs: ['eltLoaded', 'elt'], outputs: []}));

import {FormSearchComponent} from "../components/search/formSearch.component";
angular.module('formModule').directive('cdeFormSearch', downgradeComponent({component: FormSearchComponent, inputs: [], outputs: []}));

import {MergeFormComponent} from "../components/mergeForm/mergeForm.component";
angular.module('formModule').directive('cdeMergeForm', downgradeComponent({component: MergeFormComponent, inputs: ['left', 'right'], outputs: []}));

import {NativeRenderComponent} from "../nativeRender/nativeRender.component";
angular.module('formModule').directive('cdeNativeRender', downgradeComponent({component: NativeRenderComponent, inputs: ['eltLoaded', 'elt', 'profile', 'submitForm'], outputs: []}));

import {NativeRenderFullComponent} from "../nativeRender/nativeRenderFull.component";
angular.module('formModule').directive('cdeNativeRenderFull', downgradeComponent({component: NativeRenderFullComponent, inputs: ['eltLoaded', 'elt'], outputs: []}));

import {FormGeneralDetailsComponent} from "../components/formGeneralDetails/formGeneralDetails.component";
angular.module('formModule').directive('cdeFormGeneralDetails', downgradeComponent({component: FormGeneralDetailsComponent, inputs: ['eltLoaded', 'elt'], outputs: []}));
