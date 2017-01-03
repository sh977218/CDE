angular.module('formModule', ['resourcesForm', 'ngRoute', 'formTemplates', 'nativeValuelist']).config(
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