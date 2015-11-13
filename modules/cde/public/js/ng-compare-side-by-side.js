(function () {
    'use strict';
    angular.module('ngCompareSideBySide', [])
        .directive("ngCompareSideBySide", ["$compile", "Comparison",
            function ($compile, Comparison) {
                return {
                    restrict: "AE",
                    scope: {
                        left: '=',
                        right: '=',
                        sort: '=',
                        properties: '=',
                        question: '='
                    },
                    controller: function ($scope, $element) {
                    },
                    link: function ($scope, $element) {
                        if (!$scope.left || !$scope.right)
                            return;
                        var leftObj = Comparison.deepCopy($scope.left);
                        var rightObj = Comparison.deepCopy($scope.right);
                        if (Array.isArray($scope.left) && Array.isArray($scope.right)) {
                            $scope.type = 'array';
                            if ($scope.sort) {
                                Comparison.sortPropertiesByName(leftObj);
                                Comparison.sortPropertiesByName(rightObj);
                            }
                            var leftIds = leftObj.map(function (o) {
                                Comparison.wipeUseless(o);
                                if ($scope.question) {
                                    return o.question.cde.tinyId;
                                }
                                else
                                    return JSON.stringify(o);
                            });
                            var rightIds = rightObj.map(function (o) {
                                Comparison.wipeUseless(o);
                                if ($scope.question) {
                                    return o.question.cde.tinyId;
                                }
                                else
                                    return JSON.stringify(o);
                            });
                            var result = [];
                            var leftIndex = 0;
                            var beginIndex = 0;
                            leftObj.forEach(function (o) {
                                var cdeId;
                                if ($scope.question) {
                                    cdeId = o.question.cde.tinyId;
                                }
                                else
                                    cdeId = JSON.stringify(o);
                                var rightIndex = rightIds.slice(beginIndex, rightIds.length).indexOf(cdeId);
                                if (rightIndex === -1) {
                                    if (beginIndex === 0) {
                                        result.push({
                                            action: "space",
                                            rightIndex: beginIndex
                                        });
                                    }
                                    result.push({
                                        action: "not found",
                                        leftIndex: leftIndex
                                    });
                                } else {
                                    for (var k = 0; k < rightIndex; k++) {
                                        result.push({
                                            action: "space",
                                            rightIndex: beginIndex + rightIndex - 1
                                        });
                                        beginIndex++;
                                    }
                                    result.push({
                                        action: "found",
                                        leftIndex: leftIndex,
                                        rightIndex: beginIndex + rightIndex - 1
                                    });
                                    beginIndex++;
                                }
                                leftIndex++;
                            });
                            $scope.result = result;
                        } else if (typeof $scope.left === 'object' && typeof $scope.right === 'object') {
                            $scope.type = 'object';
                            var diff = DeepDiff(leftObj, rightObj);
                            if (diff && diff.length > 0) {
                                $scope.result = diff;
                            }
                        }
                        Comparison.applyComparison($scope, $element);
                    }
                };
            }])
        .factory("Comparison", ["$compile", function ($compile) {
            return {
                sortPropertiesByName: function (o) {
                    for (var p in o) {
                        if (p !== 'questions' && Array.isArray(p)) {
                            p.sort();
                        }
                    }
                },
                deepCopy: function (o) {
                    return JSON.parse(JSON.stringify(o));
                },
                wipeUseless: function (o) {
                    delete o._id;
                    delete o.__v;
                    delete o.history;
                    delete o.imported;
                    delete o.noRenderAllowed;
                    delete o.displayProfiles;
                    delete o.attachments;
                    delete o.version;
                    delete o.comments;
                    delete o.tinyId;
                    delete o.derivationRules;
                    delete o.usedBy;
                    delete o.classification;
                    delete o.$$hashKey;
                    delete o.isOpen;
                    delete o.formElements;
                },
                applyComparison: function ($scope, $element) {
                    var arrayHtml = '' +
                        '<div class="row" ng-repeat="r in result">' +
                        '   <div class="col-xs-5 col-lg-5 col-md-5 quickBoardContentCompare" ng-class="{quickBoardContentCompareDelete:r.action===\'space\'}">' +
                        '       <div ng-if="r.action !== \'space\'" ng-repeat="p in properties" class="row quickBoardContentCompare">' +
                        '           <div class="col-xs-2">{{p}}</div>' +
                        '           <div class="col-xs-10">{{left[r.leftIndex][p]}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '   <div class="col-xs-5 col-lg-5 col-md-5 quickBoardContentCompare" ng-class="{quickBoardContentCompareAdd:r.action===\'not found\'}">' +
                        '       <div ng-if="r.action !== \'not found\'" ng-repeat="p in properties" class="row quickBoardContentCompare">' +
                        '           <div class="col-xs-2">{{p}}</div>' +
                        '           <div class="col-xs-10">{{right[r.rightIndex][p]}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>' +
                        '<hr class="divider">';

                    var objectHtml = '' +
                        '<div class="row">' +
                        '   <div class="col-md-5 quickBoardContentCompare">' +
                        '       <div class="row" ng-repeat="p in properties">' +
                        '           <div class="col-md-3">{{p}}:</div>' +
                        '           <div class="col-md-9">{{left[p]}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '   <div class="col-md-5 quickBoardContentCompare">' +
                        '       <div class="row" ng-repeat="p in properties">' +
                        '           <div class="col-md-3">{{p}}:</div>' +
                        '           <div class="col-md-9">{{right[p]}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>' +
                        '<hr class="divider">';
                    /*
                     elStr = elStr +
                     '<div ng-repeat="i in questionResult1 track by $index" class="row">' +
                     '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding">' +
                     '       <div ng-class="{quickBoardContentCompareDelete:i.action===\'space\',quickBoardContentCompareAdd:i.action===\'not found\'}">' +
                     '           <div ng-if="i.action !==\'space\'">' +
                     '               <div class="row">' +
                     '                   <div class="col-md-2 col-xs-2 col-lg-2"><strong>elementType:</strong></div>' +
                     '                   <div class="col-md-10 col-xs-10 col-lg-10">{{elt1.questions[i.leftIndex].elementType}}</div>' +
                     '               </div>' +
                     '               <div class="row">' +
                     '                   <div class="col-md-2 col-xs-2 col-lg-2"><strong>label: </strong></div>' +
                     '                   <div class="col-md-10 col-xs-10 col-lg-10">{{elt1.questions[i.leftIndex].label}}</div>' +
                     '               </div>' +
                     '               <div class="row">' +
                     '                   <div class="col-md-11 col-lg-11 col-xs-11"><strong>datatype: </strong></div>' +
                     '                   <div class="col-md-11 col-lg-11 col-xs-11">{{elt1.questions[i.leftIndex].question.datatype}}</div>' +
                     '               </div>' +
                     '               <div class="row">' +
                     '                   <div class="col-md-11 col-lg-11 col-xs-11"><strong>tinyId: </strong></div>' +
                     '                   <div class="col-md-11 col-lg-11 col-xs-11">{{elt1.questions[i.leftIndex].question.cde.tinyId}}</div>' +
                     '               </div>' +
                     '               <div class="smallSpace"></div>' +
                     '           </div>' +
                     '       </div>' +
                     '   </div>' +
                     '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding">' +
                     '       <div ng-if="i.action !==\'not found\'">' +
                     '           <div class="row">' +
                     '               <div class="col-md-2 col-xs-2 col-lg-2"><strong>elementType:</strong></div>' +
                     '               <div class="col-md-10 col-xs-10 col-lg-10">{{elt2.questions[i.rightIndex].elementType}}</div>' +
                     '           </div>' +
                     '           <div class="row">' +
                     '               <div class="col-md-2 col-xs-2 col-lg-2"><strong>label</strong></div>' +
                     '               <div class="col-md-10 col-xs-10 col-lg-10">{{elt2.questions[i.rightIndex].label}}</div>' +
                     '           </div>' +
                     '           <div class="row">' +
                     '               <div class="col-md-11 col-lg-11 col-xs-11"><strong>datatype</strong></div>' +
                     '               <div class="col-md-11 col-lg-11 col-xs-11">{{elt2.questions[i.rightIndex].question.datatype}}</div>' +
                     '           </div>' +
                     '           <div class="row">' +
                     '               <div class="col-md-11 col-lg-11 col-xs-11"><strong>tinyId</strong></div>' +
                     '               <div class="col-md-11 col-lg-11 col-xs-11">{{elt2.questions[i.rightIndex].question.cde.tinyId}}</div>' +
                     '           </div>' +
                     '           <div class="smallSpace"></div>' +
                     '       </div>' +
                     '   </div>' +
                     '</div>' +
                     '<hr class="divider">';*/
                    var el;
                    if ($scope.type === 'array')
                        el = angular.element(arrayHtml);
                    else if ($scope.type === 'object')
                        el = angular.element(objectHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());