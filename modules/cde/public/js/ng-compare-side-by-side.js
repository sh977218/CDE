(function () {
    'use strict';
    angular.module('ngCompareSideBySide', [])
        .directive("ngCompareSideBySide", ["$compile", "Comparison",
            function ($compile, Comparison) {
                return {
                    restrict: "AE",
                    scope: {
                        left: '=',
                        right: '='
                    },
                    controller: function ($scope, $element) {
                    },
                    link: function ($scope, $element) {
                        var elt1 = Comparison.deepCopy($scope.left);
                        elt1.questions = [];
                        Comparison.flatFormQuestions(elt1, elt1.questions);
                        Comparison.sortPropertiesByName(elt1);
                        Comparison.wipeUseless(elt1);

                        var elt2 = Comparison.deepCopy($scope.right);
                        elt2.questions = [];
                        Comparison.flatFormQuestions(elt2, elt2.questions);
                        Comparison.sortPropertiesByName(elt2);
                        Comparison.wipeUseless(elt2);

                        var result = {};
                        Comparison.propertiesToBeCompared().forEach(function (property) {
                            var diff = DeepDiff(elt1[property], elt2[property]);
                            if (diff && diff.length > 0) {
                                result[property] = 'modified';
                            }
                            else {
                                result[property] = 'unmodified';
                            }
                        });
                        $scope.result = result;
                        $scope.elts = [];
                        $scope.elts.push(elt1);
                        $scope.elts.push(elt2);
                        $scope.compareView = true;


                        $scope.questionResult1 = [];
                        for (var q in elt1.questions) {
                            $scope.questionResult1.push(elt2.questions.indexOf(q));
                        }


                        Comparison.applyComparison($scope, $element);
                    }
                };
            }])
        .factory("Comparison", ["$compile", function ($compile) {
            return {
                propertiesToBeCompared: function () {
                    var p = ['naming', 'properties', 'dataElementConcept', 'referenceDocuments', 'stewardOrg', 'registrationState', 'formUsageCounter', 'views', 'created', 'updated', 'createdBy'];
                    return p;
                },
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
                    o.questions.forEach(function (q) {
                        delete q._id;
                    })
                },
                applyComparison: function ($scope, $element) {
                    var elStr = '' +
                        '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.naming===\'modified\'}}}">' +
                        '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding" ng-repeat="elt in elts">' +
                        '       <div ng-include="\'/system/public/html/naming.html\'"></div>' +
                        '   </div>' +
                        '</div>' +
                        '<hr class="divider">';

                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.stewardOrg===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2"><strong>Steward:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10">{{elt.stewardOrg.name}}</div>' +
                    '   </div>' +
                    '</div>';
                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.registrationState===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2"><strong>Status:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10">{{elt.registrationState.registrationStatus}}</div>' +
                    '   </div>' +
                    '</div>';
                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.formUsageCounter===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2" ng-if="elt.formUsageCounter"><strong>Form Usage:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10" ng-if="elt.formUsageCounter">{{elt.formUsageCounter}}</div>' +
                    '   </div>' +
                    '</div>';
                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.views===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2" ng-if="elt.views"><strong>Views:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10" ng-if="elt.views">{{elt.views}}</div>' +
                    '   </div>' +
                    '</div>';
                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.created===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2"><strong>Added to NLM:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10">{{elt.created | date: \'MM/dd/yyyy @ h:mma\'}}</div>' +
                    '   </div>' +
                    '</div>';
                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.updated===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2" ng-if="elt.updated"><strong>Updated in NLM:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10" ng-if="elt.updated">{{elt.updated | date: \'MM/dd/yyyy @ h:mma\'}}</div>' +
                    '   </div>' +
                    '</div>';
                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.createdBy===\'modified\'}}}">' +
                    '   <div ng-repeat="elt in elts" class="col-md-6">' +
                    '       <div tabindex="0" class="col-lg-2 col-md-2" ng-if="elt.createdBy"><strong>Created By:</strong></div>' +
                    '       <div tabindex="0" class="col-lg-10 col-md-10" ng-if="elt.createdBy">{{elt.createdBy.username}}</div>' +
                    '   </div>' +
                    '</div>';

                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.dataElementConcept===\'modified\'}}}">' +
                    '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding" ng-repeat="elt in elts">' +
                    '       <div ng-controller="ConceptsCtrl" ng-include="\'/cde/public/html/deConcepts.html\'"></div>' +
                    '   </div>' +
                    '</div>' +
                    '<hr class="divider">';

                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.referenceDocuments===\'modified\'}}}">' +
                    '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding" ng-repeat="elt in elts">' +
                    '       <div ng-include="\'/system/public/html/referenceDocument.html\'"></div>' +
                    '   </div>' +
                    '</div>' +
                    '<hr class="divider">';

                    elStr = elStr +
                    '<div class="row" ng-class="{quickBoardCompareDifferent:{{result.properties===\'modified\'}}}">' +
                    '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding" ng-repeat="elt in elts">' +
                    '       <div ng-include="\'/system/public/html/properties.html\'"></div>' +
                    '   </div>' +
                    '</div>' +
                    '<hr class="divider">';

                    elStr = elStr +
                    '<div class="row">' +
                    '<div ng-repeat="elt in elts" class="col-xs-6 col-lg-6 col-md-6 noLeftPadding"">' +
                    '<div ng-include="\'/cde/public/html/valueDomainSwitch.html\'"></div>' +
                    '</div>' +
                    '</div>';


                    var el = angular.element(elStr);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());