angular.module('formModule').controller('FormRenderCtrl', ['$scope', '$location', '$sce', 'nativeFormService',
    function ($scope, $location, $sce, nativeFormService)
{

    $scope.displayInstruction = false;
    $scope.skipLogicError = {msg: ''};
    $scope.formUrl = $location.absUrl();
    $scope.nativeFormService = nativeFormService;
    $scope.SHOW_IF = 'Dynamic';
    $scope.FOLLOW_UP = 'Follow-up';
    $scope.setNativeRenderType = function (type) {
        if (type == undefined) type = $scope.FOLLOW_UP;
        $scope.nativeRenderType = type;

        if ($scope.nativeRenderType === $scope.FOLLOW_UP) {
            if (!$scope.followForm || $scope.elt.unsaved) {
                $scope.formElement = undefined;
                $scope.followForm = angular.copy($scope.elt);
                transformFormToInline($scope.followForm);
                preprocessValueLists($scope.followForm.formElements);
            }
            $scope.formElement = $scope.followForm;
        }
        if ($scope.nativeRenderType === $scope.SHOW_IF)
            $scope.formElement = $scope.elt;
    };

    $scope.getElt = function () {
        switch ($scope.nativeRenderType) {
            case $scope.SHOW_IF:
                return $scope.elt;
            case $scope.FOLLOW_UP:
                return $scope.followForm;
        }
    };

    $scope.getEndpointUrl = function () {
        return $sce.trustAsResourceUrl(window.endpointUrl);
    };

    $scope.selection = {};
    var setSelectedProfile = function () {
        if ($scope.elt && $scope.elt.displayProfiles && $scope.elt.displayProfiles.length > 0 &&
            $scope.elt.displayProfiles.indexOf($scope.selection.selectedProfile) === -1)
            $scope.selection.selectedProfile = $scope.elt.displayProfiles[0];
        if (!$scope.selection.selectedProfile)
            $scope.selection.selectedProfile = {
                name: "Default Config",
                displayInstructions: true,
                displayNumbering: true,
                sectionsAsMatrix: true,
                displayValues: false,
                displayType: 'Follow-up',
                numberOfColumns: 4
            };
        $scope.setNativeRenderType($scope.selection.selectedProfile.displayType);
    };

    $scope.createSubmitMapping = function () {
        $scope.mapping = JSON.stringify({sections: flattenForm($scope.elt.formElements)});
    };

    $scope.$on('eltReloaded', function () {
        $scope.createSubmitMapping();
        delete $scope.followForm;
        setSelectedProfile();
    });
    $scope.$on('tabGeneral', function () {
        $scope.createSubmitMapping();
        setSelectedProfile();
    });
    $scope.deferredEltLoaded.promise.then(function () {
        $scope.createSubmitMapping();
        setSelectedProfile();
    });

    function transformFormToInline(form) {
        var prevQ = "";
        var transformed = false;
        var feSize = form.formElements.length;
        for (var i = 0; i < feSize; i++) {
            var fe = form.formElements[i];
            var qs = getShowIfQ(fe, prevQ);
            if (qs.length > 0) {
                var substituted = false;
                parentQ = qs[0][0];
                qs.forEach(function (match) {
                    var answer;
                    if (parentQ.question.datatype === 'Value List') {
                        if (match[3] === '') {
                            parentQ.question.answers.push({
                                permissibleValue: createRelativeText([match[3]], match[2], true),
                                nonValuelist: true,
                                subQuestions: [fe]
                            });
                            substituted = true;
                        } else {
                            answer = parentQ.question.answers.filter(function (a) {
                                return a.permissibleValue === match[3];
                            });
                            if (answer.length) answer = answer[0];
                            if (answer) {
                                if (!answer.subQuestions) answer.subQuestions = [];
                                answer.subQuestions.push(fe);
                                substituted = true;
                            }
                        }
                    } else {
                        if (!parentQ.question.answers) parentQ.question.answers = [];
                        var existingLogic = parentQ.question.answers.filter(function(el) {
                            return el.nonValuelist && el.subQuestions.length === 1 && el.subQuestions[0] === fe;
                        });
                        if (existingLogic.length > 0) {
                            var existingSubQ = existingLogic[0];
                            existingSubQ.permissibleValue = existingSubQ.permissibleValue + ' or ' +
                                createRelativeText([match[3]], match[2], false);
                        } else {
                            parentQ.question.answers.push({
                                permissibleValue: createRelativeText([match[3]], match[2], false),
                                nonValuelist: true,
                                subQuestions: [fe]
                            });
                        }
                        substituted = true;
                    }
                });
                if (substituted) {
                    form.formElements.splice(i, 1);
                    feSize--;
                    i--;
                    transformed = true;
                }
                prevQ.push(fe);
            } else {
                prevQ = [fe];
            }
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                if (transformFormToInline(fe))
                    fe.forbidMatrix = true;
                if (fe.skipLogic) delete fe.skipLogic;
                continue;
            }
            // after transform processing of questions
            if (fe.question.uoms && fe.question.uoms.length === 1)
                fe.question.answerUom = fe.question.uoms[0];
            if (fe.skipLogic) delete fe.skipLogic;
        }
        return transformed;
    }

    function getShowIfQ(q, prevQ) {
        if (q.skipLogic && q.skipLogic.condition) {
            var strPieces = q.skipLogic.condition.split('"');
            if (strPieces[0] === '') strPieces.shift();
            if (strPieces[strPieces.length - 1] === '') strPieces.pop();
            var accumulate = [];
            strPieces.forEach(function(e,i,strPieces) {
                var matchQ = prevQ.filter(function (q) {
                    return q.label === strPieces[i];
                });
                if (matchQ.length) {
                    var operator = strPieces[i + 1].trim();
                    var compValue = strPieces[i + 2];
                    var operatorWithNumber = operator.split(' ');
                    if (operatorWithNumber.length > 1) {
                        operator = operatorWithNumber[0];
                        compValue = operatorWithNumber[1];
                    }
                    accumulate.push([matchQ[0], strPieces[i], operator, compValue]);
                }
            });
            return accumulate;
        }
        return [];
    }

    function createRelativeText(v, oper, isValuelist) {
        var values = angular.copy(v);
        values.forEach(function (e, i, a) {
           if (e === '') {
               if (isValuelist)
                   a[i] = 'none';
               else
                   a[i] = 'empty';
           }
        });
        switch (oper) {
            case '=':
                return values.join(' or ');
            case '>':
                return 'more than ' + min(values);
            case '<':
                return 'less than ' + max(values);
            case '>=':
                return min(values) + ' or more';
            case '<=':
                return max(values) + ' or less';
        }
    }

    function max(values) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    function min(values) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    function preprocessValueLists(formElements) {
        formElements.forEach(function (fe) {
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                preprocessValueLists(fe.formElements);
                return;
            }
            if (fe.question && fe.question.answers) {
                var index = -1;
                fe.question.answers.forEach(function (v,i,a) {
                    if (hasOwnRow(v) || index === -1 && (i+1 < a.length && hasOwnRow(a[i+1]) || i+1 === a.length))
                        v.index = index = -1;
                    else
                        v.index = ++index;
                    if (v.subQuestions)
                        preprocessValueLists(v.subQuestions)
                });
            }
        });
    }

    function hasOwnRow(e) {
        return !!e.subQuestions && e.subQuestions.some(function (subE) {return !subE.question.invisible});
    }

    function flattenForm(formElements) {
        var last_id = 0;
        var result = [];
        var questions = [];
        flattenFormSection(formElements, []);
        return result;

        function createId() {
            return "q" + ++last_id;
        }

        function flattenFormSection(formElements, section) {
            formElements.forEach(function (fe) {
                flattenFormFe(fe, section.concat(fe.label));
            });
            flattenFormPushQuestions(section);
        }

        function flattenFormQuestion(fe, section) {
            fe.questionId = createId();
            q = {'question': fe.label, 'name': fe.questionId, 'ids': fe.question.cde.ids, 'tinyId': fe.question.cde.tinyId};
            if (fe.question.answerUom) q.answerUom = fe.question.answerUom;
            questions.push(q);
            fe.question.answers && fe.question.answers.forEach(function (a) {
                a.subQuestions && a.subQuestions.forEach(function (sq) {
                    flattenFormFe(sq, section);
                });
            });
        }

        function flattenFormFe(fe, section) {
            if (fe.elementType === 'question') {
                flattenFormQuestion(fe, section);
            }
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                flattenFormPushQuestions(section);
                flattenFormSection(fe.formElements, section);
            }
        }

        function flattenFormPushQuestions(section) {
            if (questions.length) {
                result.push({'section': section[section.length - 1], 'questions': questions});
                questions = [];
            }
        }
    }

}]);


