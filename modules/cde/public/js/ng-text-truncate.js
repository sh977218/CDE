(function() {
    'use strict';
    angular.module( 'ngTextTruncate', [] )
    .directive( "ngTextTruncate", [ "$compile", "Truncation",
    	function( $compile, Truncation ) {
        return {
            restrict: "A",
            scope: {
                text: "=ngTextTruncate",
                threshold: "@ngTtThreshold",
                customMoreLabel: "@ngTtMoreLabel",
                customLessLabel: "@ngTtLessLabel"
            },
            controller: function( $scope, $element, $attrs ) {
                $scope.toggleShow = function() {
                    $scope.open = !$scope.open;
                    $element.empty();
                    if ($scope.class === "collapseText")
                        $scope.class = "expandText";
                    else
                        $scope.class = "collapseText";
                     var THRESHOLD = parseInt( $scope.threshold );
                    Truncation.applyTruncation( THRESHOLD, $scope, $element );
                    if($scope.textType=='plainText' && $scope.text.length >= THRESHOLD)
                        $($element.find('span')[0]).text($scope.text);
                };
            },
            link: function( $scope, $element, $attrs ) {
                $scope.open = false;
                $scope.class = 'collapseText';
                $scope.textType = undefined;
                if($attrs.ngBindHtml != null){
                    $scope.textType='html';
                }
                if($attrs.ngBind != null){
                    $scope.textType='plainText';
                }
                var THRESHOLD = parseInt( $scope.threshold );
                $scope.$watch( "text", function() {
                    $element.empty();
                    Truncation.applyTruncation( THRESHOLD, $scope, $element );
                if($scope.textType=='plainText' && $scope.text.length >= THRESHOLD)
                    $($element.find('span')[0]).text($scope.text);
                })
            }
        };
    }] )
    .factory( "Truncation", [ "$compile", function( $compile ) {
        return {
            applyTruncation: function( threshould, $scope, $element ) {
                var elStr;
                var el;
                if($scope.text.length>=threshould) {
                    if($scope.textType == 'html') {
                        elStr = '<span ng-class="class">' +
                        $scope.text +
                        '</span>' +
                        '<span ng-show="!open" class="btn-link ngTruncateToggleText more" ng-click="toggleShow();">' +
                        ($scope.customMoreLabel ? $scope.customMoreLabel : "More") +
                        '</span>' +
                        '<span ng-show="open"  class="btn-link ngTruncateToggleText less" ng-click="toggleShow();">' +
                        ($scope.customLessLabel ? $scope.customLessLabel : "Less") +
                        '</span>';
                        el = angular.element( elStr );
                        $compile(el)($scope);
                        $element.append(el);
                    }
                    if($scope.textType == 'plainText') {
                        var html = '<span ng-class="class">' +
                        '</span>'+
                        '<span ng-show="!open" class="btn-link ngTruncateToggleText more" ng-click="toggleShow();">' +
                        ($scope.customMoreLabel ? $scope.customMoreLabel : "More") +
                        '</span>' +
                        '<span ng-show="open"  class="btn-link ngTruncateToggleText less" ng-click="toggleShow();">' +
                        ($scope.customLessLabel ? $scope.customLessLabel : "Less") +
                        '</span>';
                        el = angular.element( html );
                        $compile(el)($scope);
                        $element.append(el);
                    }
                }else{
                    if($scope.textType == 'html') {
                        elStr = '<span ng-class="">' +
                        $scope.text +
                        '</span>';
                        el = angular.element( elStr );
                        $compile(el)($scope);
                        $element.append(el);
                    }
                    if($scope.textType == 'plainText') {
                        elStr = $scope.text ;
                        $element.text(elStr);
                    }
                }
            }
        };
    }])
}());
