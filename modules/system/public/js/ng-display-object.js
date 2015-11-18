(function () {
    'use strict';
    angular.module('ngDisplayObject', [])
        .directive("ngDisplayObject", ["$compile", "Display",
            function ($compile, Display) {
                return {
                    restrict: "AE",
                    scope: {
                        model: '='
                    },
                    controller: function ($scope) {
                    },
                    link: function ($scope, $element) {
                        var obj = $scope.model;
                        if (obj) {
                            if (Array.isArray(obj)) {
                                $scope.type = 'array';
                            }
                            else {
                                $scope.type = 'object';
                            }
                            $scope.obj = obj;
                        }
                        else $scope.type = 'undefined';
                        Display.applyHtml($scope, $element);
                    }
                };
            }])
        .factory("Display", ["$compile", function ($compile) {
            return {
                applyHtml: function ($scope, $element) {
                    var arrayHtml = '' +
                        '<div class="row" ng-repeat="o in obj">' +
                        '   <div class="row overflowHidden" ng-repeat="(key, value) in o">' +
                        '       <div class="col-xs-4">{{key}}:</div>' +
                        '       <div class="col-xs-8">{{value}}</div>' +
                        '   </div>' +
                        '</div>';
                    if ($scope.obj && $scope.obj.length > 0)
                        arrayHtml = arrayHtml + '<hr class="divider">';

                    var objectHtml = '<div>{{obj}}</div>';

                    var nullHtml = '<div></div>';
                    var el;
                    if ($scope.type === 'array')
                        el = angular.element(arrayHtml);
                    else if ($scope.type === 'object')
                        el = angular.element(objectHtml);
                    else if ($scope.type === 'undefined')
                        el = el = angular.element(nullHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());