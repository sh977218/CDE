(function () {
    'use strict';
    angular.module('ngRenderForm', [])
        .directive("ngRenderForm", ["$compile", "Render",
            function ($compile, Render) {
                return {
                    restrict: "E",
                    scope: {
                        model: '=model',
                        options: '=options'
                    },
                    templateUrl: '/system/public/html/renderTemplate/renderSwitchTemplate.html',
                    link: function ($scope, $element) {
                        $scope.renderTemplate = {
                            form: {
                                url: '/system/public/html/renderTemplate/renderForm.html',
                                ctrl: ''
                            },
                            section: {
                                url: '/system/public/html/renderTemplate/renderSection.html',
                                ctrl: ''
                            },
                            question: {
                                url: '/system/public/html/renderTemplate/renderQuestion.html',
                                ctrl: 'FormRenderQuestionCtrl'
                            }
                        }[$scope.options.type];
                    },
                    Controller: function ($scope) {

                    }
                };
            }])
        .factory("Render", ["$compile", function ($compile) {
            return {};
        }])
}());