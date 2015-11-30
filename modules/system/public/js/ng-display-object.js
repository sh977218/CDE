(function () {
    'use strict';
    angular.module('ngDisplayObject', [])
        .directive("ngDisplayObject", ["$compile", "Display",
            function ($compile, Display) {
                return {
                    restrict: "AE",
                    scope: {
                        obj: '=',
                        properties: '=',
                        showwarningicon: '='
                    },
                    controller: function ($scope) {
                        $scope.getValueByNestedProperty = function (o, s) {
                            if (!o) return "";
                            // convert indexes to properties
                            s = s.replace(/\[(\w+)\]/g, '.$1');
                            // strip a leading dot
                            s = s.replace(/^\./, '');
                            var a = s.split('.');
                            for (var i = 0, n = a.length; i < n; ++i) {
                                var k = a[i];
                                if (k in o) {
                                    o = o[k];
                                } else {
                                    return;
                                }
                            }
                            return o;
                        }
                    },
                    link: function ($scope, $element) {
                        if (!$scope.obj) return;
                        else $scope.type = typeof $scope.obj;
                        Display.applyHtml($scope, $element);
                    }
                };
            }])
        .factory("Display", ["$compile", function ($compile) {
            return {
                getValueByNestedProperty: function (o, s) {
                    if (!o) return "";
                    // convert indexes to properties
                    s = s.replace(/\[(\w+)\]/g, '.$1');
                    // strip a leading dot
                    s = s.replace(/^\./, '');
                    var a = s.split('.');
                    for (var i = 0, n = a.length; i < n; ++i) {
                        var k = a[i];
                        if (k in o) {
                            o = o[k];
                        } else {
                            return "";
                        }
                    }
                    return o;
                },
                applyHtml: function ($scope, $element) {
                    var _this = this;
                    $scope.value = "";
                    $scope.type = typeof _this.getValueByNestedProperty($scope.obj, $scope.properties.property);
                    if ($scope.type === "string") $scope.value = _this.getValueByNestedProperty($scope.obj, $scope.properties.property);
                    if (Array.isArray(_this.getValueByNestedProperty($scope.obj, $scope.properties.property)) && _this.getValueByNestedProperty($scope.obj, $scope.properties.property) && _this.getValueByNestedProperty($scope.obj, $scope.properties.property)[0] && typeof _this.getValueByNestedProperty($scope.obj, $scope.properties.property)[0] === 'string')
                        $scope.value = _this.getValueByNestedProperty($scope.obj, $scope.properties.property);
                    if ($scope.properties.displayAs && Array.isArray(_this.getValueByNestedProperty($scope.obj, $scope.properties.property)) && _this.getValueByNestedProperty($scope.obj, $scope.properties.property) && _this.getValueByNestedProperty($scope.obj, $scope.properties.property)[0] && typeof _this.getValueByNestedProperty($scope.obj, $scope.properties.property)[0] === 'object')
                        $scope.value = _this.getValueByNestedProperty($scope.obj, $scope.properties.property).map(function (o) {
                            return "<p>" + o[$scope.properties.displayAs] + "</p>";
                        }).join("");
                    var objectHtml = '' +
                        '<div class="row" ng-class="{quickBoardContentCompareDiff:showwarningicon && properties.match===false}">' +
                        '   <div class="col-xs-4 {{properties.label}}">{{properties.label}}:</div>' +
                        '   <div ng-if="properties.link" class="col-xs-7"><a ng-href="{{properties.url}}' + _this.getValueByNestedProperty($scope.obj, $scope.properties.property) + '">' + _this.getValueByNestedProperty($scope.obj, $scope.properties.property) + '</a></div>' +
                        '   <div ng-if="!properties.link" class="col-xs-7" ng-bind-html="value" ng-text-truncate="value" ng-tt-threshold="500"></div>';
                    if ($scope.showwarningicon)
                        objectHtml = objectHtml +
                        '   <i ng-if="properties.match===false" class="fa fa-exclamation-triangle"></i>';
                    objectHtml = objectHtml +
                    '</div>';
                    var el = angular.element(objectHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());