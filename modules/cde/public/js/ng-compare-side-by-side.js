(function () {
    'use strict';
    angular.module('ngCompareSideBySide', [])
        .directive("ngCompareSideBySide", ["$compile", "Comparsion",
            function ($compile, Comparsion) {
                return {
                    restrict: "AE",
                    scope: {
                        left: '=',
                        right: '='
                    },
                    controller: function ($scope, $element, $attrs) {
                    },
                    link: function ($scope, $element, $attrs) {
                        var elt1 = Comparsion.deepCopy($scope.left);
                        elt1.questions = [];
                        Comparsion.flatFormQuestions(elt1, elt1.questions);
                        Comparsion.sortPropertiesByName(elt1);
                        Comparsion.wipeUseless(elt1);

                        var elt2 = Comparsion.deepCopy($scope.right);
                        elt2.questions = [];
                        Comparsion.flatFormQuestions(elt2, elt2.questions);
                        Comparsion.sortPropertiesByName(elt2);
                        Comparsion.wipeUseless(elt2);

                        var result1 = {};
                        var result2 = {};
                        for (var property in elt1) {
                            var diff = DeepDiff(elt1[property], elt2[property]);
                            if (diff && diff.length > 0) {
                                result1[property] = 'modified';
                                result2[property] = 'modified';
                                console.log('diff on ' + property);
                                console.log(diff);
                            }
                            else {
                                result1[property] = 'unmodified';
                                result2[property] = 'unmodified';
                                console.log('no diff on ' + property);
                            }
                        }
                        $scope.result1 = result1;
                        $scope.result2 = result2;
                        $scope.elt1 = elt1;
                        $scope.elt2 = elt2;

                        Comparsion.applyComparsion($scope, $element);
                    }
                };
            }])
        .factory("Comparsion", ["$compile", function ($compile) {
            return {
                sortPropertiesByName: function (o) {
                    for (var p in o) {
                        if (p !== 'questions' && Array.isArray(p)) {
                            p.sort();
                        }
                    }
                },
                flatFormQuestions: function (fe, questions) {
                    var f = function (fe, questions) {
                        if (fe.formElements != undefined) {
                            fe.formElements.forEach(function (e) {
                                if (e.elementType && e.elementType === 'question') {
                                    delete e.formElements;
                                    questions.push(JSON.parse(JSON.stringify(e)));
                                }
                                else f(e, questions);
                            })
                        }
                    };
                    f(fe, questions);
                },
                deepCopy: function (o) {
                    return JSON.parse(JSON.stringify(o));
                },
                wipeUseless: function (o) {
                    delete o._id;
                    delete o.__v;
                    delete o.history;
                    delete o.imported;
                    delete o.created;
                    delete o.createdBy;
                    delete o.noRenderAllowed;
                    delete o.displayProfiles;
                    delete o.attachments;
                    delete o.updated;
                    delete o.version;
                    delete o.comments;
                    delete o.registrationState;
                    delete o.tinyId;
                    delete o.derivationRules;
                    delete o.usedBy;
                    delete o.classification;
                    delete o.$$hashKey;
                    delete o.isOpen;
                    delete o.formElements;
                    o.questions.forEach(function (q) {
                        delete q._id;
                    })
                },
                applyComparsion: function ($scope, $element) {
                    var elStr = '' +
                        '<div class="row">' +
                        '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding">' +
                        '       <div class="col-xs-12 col-md-12" ng-repeat="(attribute, value) in result1">' +
                        '           <div class="col-lg-12 col-md-12 col-xs-12 noLeftRightPadding">' +
                        '               <strong>{{attribute}}</strong>:' +
                        '           </div>' +
                        '           <div class="col-lg-12 col-md-12 col-xs-12 noLeftRightPadding" ng-if="value===' + "'modified'" + '"' +
                        '           ng-class="{quickBoardCompareDifferent:value===' + "'modified'" + '}">{{elt1[attribute]}}' +
                        '           </div>' +
                        '           <div class="col-lg-12 col-md-12 col-xs-12 noLeftRightPadding" ng-if="value===' + "'unmodified'" + '"' +
                        '           ng-class="{quickBoardCompareSame:value===' + "'unmodified'" + '}">{{elt1[attribute]}}' +
                        '           </div>' +
                        '           <div class="smallSpace"></div>' +
                        '       </div>' +
                        '   </div>' +

                        '   <div class="col-xs-6 col-lg-6 col-md-6 noRightPadding">' +
                        '       <div class="col-xs-12 col-md-12" ng-repeat="(attribute, value) in result2">' +
                        '       <div class="col-lg-12 col-md-12 col-xs-12 noLeftRightPadding">' +
                        '           <strong>{{attribute}}</strong>:' +
                        '       </div>' +
                        '       <div class="col-lg-12 col-md-12 col-xs-12 noLeftRightPadding" ng-if="value===' + "'modified'" + '"' +
                        '       ng-class="{quickBoardCompareDifferent:value===' + "'modified'" + '}">{{elt2[attribute]}}' +
                        '       </div>' +
                        '       <div class="col-lg-12 col-md-12 col-xs-12 noLeftRightPadding" ng-if="value===' + "'unmodified'" + '"' +
                        '       ng-class="{quickBoardCompareSame:value===' + "'unmodified'" + '}">{{elt2[attribute]}}' +
                        '       </div>' +
                        '       <div class="smallSpace"></div>' +
                        '   </div>' +

                        '</div>';
                    var el = angular.element(elStr);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());