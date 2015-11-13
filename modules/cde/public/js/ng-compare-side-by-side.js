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
                        $scope.elt1 = elt1;
                        $scope.elt2 = elt2;


                        var questions1TinyId = elt1.questions.map(function (q) {
                            return q.question.cde.tinyId;
                        });
                        var questions2TinyId = elt2.questions.map(function (q) {
                            return q.question.cde.tinyId;
                        });
                        $scope.questionResult1 = [];
                        var t1 = [];
                        var t2 = [];
                        var i = 0;
                        elt1.questions.every(function (q) {
                            var j = questions2TinyId.indexOf(q.question.cde.tinyId);
                            if (j === -1) {
                                t1.push(-1);
                                return true;
                            } else {
                                t1.push(j);
                                return false;
                            }
                        });





                        $scope.questionResult2 = [];
                        elt2.questions.forEach(function (q) {
                            $scope.questionResult2.push(questions1TinyId.indexOf(q.question.cde.tinyId));
                        });

                        $scope.temp1 = [];
                        $scope.temp2 = [];
                        $scope.questionResult1.forEach(function (i) {
                            if (i === -1) {
                                $scope.temp1.push("delete");
                            }
                            else {
                                var j = $scope.questionResult2.indexOf(i);
                                if (j === -1) {
                                    $scope.temp2.push("delete");
                                } else {
                                    for (var k = 0; k < j; k++) {
                                        $scope.temp2.push("add");
                                    }
                                }

                            }
                        });


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
                    '   <div ng-repeat="elt in elts" class="col-xs-6 col-lg-6 col-md-6 noLeftPadding"">' +
                    '       <div ng-include="\'/cde/public/html/valueDomainSwitch.html\'"></div>' +
                    '   </div>' +
                    '</div>' +
                    '<hr class="divider">';

                    elStr = elStr +
                    '<div class="row">' +
                    '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding">' +
                    '       <div ng-repeat="i in questionResult1 track by $index" ng-class="{quickBoardContentCompareDelete:i===-1,quickBoardContentCompareAdd:i<$index,quickBoardContentCompareModified:i>$index}">' +
                    '           <div class="row">' +
                    '               <div class="col-md-2 col-xs-2 col-lg-2"><strong>elementType:</strong></div>' +
                    '               <div class="col-md-10 col-xs-10 col-lg-10">{{elt1.questions[i].elementType}}</div>' +
                    '           </div>' +
                    '           <div class="row">' +
                    '               <div class="col-md-2 col-xs-2 col-lg-2"><strong>label</strong></div>' +
                    '               <div class="col-md-10 col-xs-10 col-lg-10">{{elt1.questions[i].label}}</div>' +
                    '           </div>' +
                    '           <div class="row">' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11"><strong>datatype</strong></div>' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11">{{elt1.questions[i].question.datatype}}</div>' +
                    '           </div>' +
                    '           <div class="row">' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11"><strong>tinyId</strong></div>' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11">{{elt1.questions[i].question.cde.tinyId}}</div>' +
                    '           </div>' +
                    '           <div class="smallSpace"></div>' +
                    '       </div>' +
                    '   </div>' +
                    '   <div class="col-xs-6 col-lg-6 col-md-6 noLeftPadding">' +
                    '       <div ng-repeat="q in elt2.questions">' +
                    '           <div class="row">' +
                    '               <div class="col-md-2 col-xs-2 col-lg-2"><strong>elementType:</strong></div>' +
                    '               <div class="col-md-10 col-xs-10 col-lg-10">{{q.elementType}}</div>' +
                    '           </div>' +
                    '           <div class="row">' +
                    '               <div class="col-md-2 col-xs-2 col-lg-2"><strong>label</strong></div>' +
                    '               <div class="col-md-10 col-xs-10 col-lg-10">{{q.label}}</div>' +
                    '           </div>' +
                    '           <div class="row">' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11"><strong>datatype</strong></div>' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11">{{q.question.datatype}}</div>' +
                    '           </div>' +
                    '           <div class="row">' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11"><strong>tinyId</strong></div>' +
                    '               <div class="col-md-11 col-lg-11 col-xs-11">{{q.question.cde.tinyId}}</div>' +
                    '           </div>' +
                    '           <div class="smallSpace"></div>' +
                    '       </div>' +
                    '   </div>' +
                    '</div>' +
                    '<hr class="divider">';

                    var el = angular.element(elStr);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());