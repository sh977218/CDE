(function () {
    'use strict';
    angular.module('nativeQuestion', [])
        .directive("nativeQuestion", ["$compile", function ($compile) {
            return {
                restrict: "EA",
                scope: {
                    formElement: '<formElement',
                    numSubQuestions: '<?',
                    profile: '<',
                    parentValue: '<?',
                    elt: '<',
                    error: '=',
                    index: '@'
                },
                controller: ["$scope", "nativeFormService", function ($scope, nativeFormService) {
                    $scope.nativeFormService = nativeFormService;
                    $scope.classColumns = function (pvIndex, index) {
                        var result = '';

                        if ( pvIndex !== -1 && $scope.profile && $scope.profile.numberOfColumns) {
                            switch ($scope.profile.numberOfColumns) {
                                case 2:
                                    result = 'col-sm-6';
                                    break;
                                case 3:
                                    result = 'col-sm-4';
                                    break;
                                case 4:
                                    result = 'col-sm-3';
                                    break;
                                case 5:
                                    result = 'col-sm-2-4';
                                    break;
                                case 6:
                                    result = 'col-sm-2';
                                    break;
                                default:
                            }
                        }

                        if ($scope.isFirstInRow(pvIndex != undefined ? pvIndex : index))
                            result += ' clear';
                        return result;
                    };
                    $scope.isFirstInRow = function (index) {
                        if ($scope.profile && $scope.profile.numberOfColumns > 0)
                            return index % $scope.profile.numberOfColumns == 0;
                        else
                            return index % 4 == 0;
                    };
                }],
                link: function (scope, element) {
                    function getLabel(pv) {
                        return pv ? (pv.valueMeaningName ? pv.valueMeaningName : pv.permissibleValue) : '';
                    }
                    function getValue(pv) {
                        return pv ? (pv.permissibleValue ? pv.permissibleValue : pv.permissibleValue) : '';
                    }
                    function hasLabel(question) {
                        return question.label && !question.hideLabel;
                    }
                    function isOneLiner(question, numSubQuestions) {
                        return numSubQuestions && !hasLabel(question) &&
                            question.question.datatype !== 'Value List';
                    }
                    function htmlTextUoms(uoms) {
                        var html = '';
                        uoms.forEach(function (uom) {
                            html +=
                                '<label class="input-group-addon' + (required ? ' nativeRequiredBox' : '') + '">' +
                                '<input type="radio" ng-model="formElement.question.answerUom" ' +
                                'value="' + uom + '" ' +
                                'name="' + fe.questionId + '_uom" ' + required + ' ' + disabled + '/> ' + uom + '</label>';
                        });
                        return html;
                    }
                    function htmlSubQuestion(pv, subQNonValuelist, i) {
                        var numSubQuestions = (pv && pv.subQuestions ? pv.subQuestions.length : 0);
                        var html = '';
                        pv && pv.subQuestions && pv.subQuestions.forEach(function (formElement, j, formElements) {
                            // wrap sub-question
                            html +=
                                '<div';
                            if (scope.nativeRenderType === scope.FOLLOW_UP) {}
                            else if (scope.nativeRenderType === scope.SHOW_IF)
                                html +=
                                    ' ng-if="nativeFormService.evaluateSkipLogicAndClear(error, formElement.skipLogic.condition, formElement.question.answers[' + i + '].subQuestions, formElement, elt)"';
                            html +=
                                ' class="native-question-header' +
                                (pv.subQuestions && isOneLiner(pv.subQuestions[0],pv.subQuestions.length) ? ' native-question-oneline-r' : '') +
                                (!subQNonValuelist && numSubQuestions && !isOneLiner(formElement,numSubQuestions) ? ' native-box' : '') + '">';

                            // sub-question
                            if ((formElement.elementType === 'question') && (!subQNonValuelist || subQNonValuelist && pv.nonValuelist)) {
                                html +=
                                    '<div native-question' +
                                    ' form-element="formElement.question.answers[' + i + '].subQuestions[' + j + ']"' +
                                    ' profile="profile"' +
                                    ' num-sub-questions="' + numSubQuestions + '"' +
                                    ' elt="elt"' +
                                    ' error="error"' +
                                    ' index="' + i + '"';

                                if (subQNonValuelist)
                                    html +=
                                        ' parent-value="formElement.question.answers[' + i + '].permissibleValue"';

                                html +=
                                    '></div>';
                            }
                            if ((formElement.elementType === 'section' || formElement.elementType === 'form') && (!subQNonValuelist || subQNonValuelist && pv.nonValuelist))
                                html +=
                                    '<div native-section' +
                                    ' form-elements="formElement.question.answers[' + i + '].subQuestions"' +
                                    ' form-element="formElement.question.answers[' + i + '].subQuestions[' + j + ']"' +
                                    ' profile="profile"' +
                                    ' num-sub-questions="' + numSubQuestions + '"' +
                                    ' elt="elt"' +
                                    ' error="error"></div>';

                            html +=
                                '</div>';
                        });
                        return html;
                    }

                    var fe = scope.formElement;
                    if (!fe) return "";
                    var question = fe.question;
                    var type = question.datatype || 'text';
                    var required = question.required ? "ng-required='true'" : "";
                    var disabled = !question.editable ? "disabled" : "";
                    var htmlText = '';

                    if (hasLabel(fe))
                        htmlText +=
                            '<label ng-class="{\'native-question-label\': !numSubQuestions && profile.displayNumbering}">' +
                               '<span ng-if="::parentValue">If {{::parentValue}}: </span>' + fe.label + '</label>';
                    if (fe.instructions && fe.instructions.value) {
                        htmlText +=
                            '<div ng-if="profile.displayInstructions" class="native-instructions">';
                        if (fe.instructions.valueFormat === 'html')
                            htmlText +=
                                '<span ng-bind-html="::formElement.instructions.value"></span>';
                        else
                            htmlText +=
                                '<span class="text-muted">' + fe.instructions.value + '</span>';
                        htmlText +=
                            '</div>';
                    }

                    htmlText +=
                        '<div id="' + fe.label + '_' + scope.index + '"' +
                        (hasLabel(fe) ? ' class="native-box"' : '') + '>';
                    if (question.isScore) // Label
                        htmlText +=
                            'Score: <span ng-bind="nativeFormService.score(formElement, elt)"></span>';
                    else {
                        switch (question.datatype) {
                            case 'Value List':
                                htmlText +=
                                    '<div class="row">';
                                question.answers.forEach(function (pv, i) {
                                    if(!pv.nonValuelist) {
                                        htmlText +=
                                            '<div ng-class="classColumns(' + pv.index +',' + i + ')"' +
                                            ' class="col-xs-12">' +
                                                '<label class="' +
                                                    (pv.subQuestions && isOneLiner(pv.subQuestions[0],pv.subQuestions.length)
                                                        ? 'native-question-oneline-l ' : '') +
                                                    (question.multiselect ? 'checkbox-inline' : 'radio-inline') + '">';

                                        if (!question.multiselect)
                                            htmlText +=
                                                '<input type="radio"' +
                                                ' ng-model="formElement.question.answer"' +
                                                ' ng-value="formElement.question.answers[' + i + '].permissibleValue"' +
                                                ' name="' + fe.questionId + '" ' + required + ' ' + disabled + '/>';
                                        else
                                            htmlText +=
                                                '<input type="checkbox"' +
                                                ' checklist-model="formElement.question.answer"' +
                                                ' checklist-value="formElement.question.answers[' + i + '].permissibleValue"' +
                                                ' ng-value="formElement.question.answers[' + i + '].permissibleValue"' +
                                                ' name="' + fe.questionId + '" ' + required + ' ' + disabled + '/>';

                                        htmlText +=
                                            getLabel(pv) + '<span ng-if="selection.selectedProfile.displayValues">  ' + getValue(pv) + '  </span>' + '</label>';

                                        if (pv.subQuestions)
                                            htmlText +=
                                                htmlSubQuestion(pv, false, i); // sub-question of value-list option

                                        htmlText +=
                                            '</div>';
                                    }
                                });
                                htmlText +=
                                    '</div>' +
                                    '<div ng-bind="sectionLabel.$$element[0][\'' + fe.questionId + '\'][0].validationMessage"></div>';
                                break;
                            case 'Date':
                                htmlText +=
                                    '<div class="input-group">' +
                                        '<input class="form-control" datepicker-options="formElement.question.dateOptions"' +
                                            ' is-open="formElement.question.opened"' +
                                            ' type="date" ng-model="formElement.question.answer"' +
                                            ' name="' + fe.questionId + '" '+ required + ' ' + disabled + '/>' +
                                    '<div ng-bind="sectionLabel.$$element[0][\'' + fe.questionId + '\'].validationMessage"></div>';
                                break;
                            case 'Number':
                                htmlText +=
                                    '<div' + (question.uoms.length > 0 ? ' class="input-group"' : '') + '>' +
                                        '<input type="number" class="form-control" ' +
                                            ' ng-model="formElement.question.answer"' +
                                            (question.datatypeNumber ?
                                                ' min="' + question.datatypeNumber.minValue +
                                                '" max="' + question.datatypeNumber.maxValue + '"' : '' ) +
                                            ' name="' + fe.questionId + '" ' + required + ' ' + disabled + '/>';
                                if (question.uoms.length > 0)
                                    htmlText += htmlTextUoms(question.uoms);

                                htmlText +=
                                    '</div>' +
                                    '<div ng-bind="sectionLabel.$$element[0][\'' + fe.questionId + '\'].validationMessage"></div>';
                                break;
                            default: // Text
                                htmlText +=
                                    '<div' + (question.uoms.length > 0 ? ' class="input-group"' : '') + '>' +
                                        '<input type="text" class="form-control" ' +
                                            ' ng-model="formElement.question.answer"' +
                                            ' name="' + fe.questionId + '" ' + required + ' ' + disabled + '/>';
                                if (question.uoms.length > 0)
                                    htmlText += htmlTextUoms(question.uoms);

                                htmlText +=
                                    '</div>' +
                                    '<div ng-bind="sectionLabel.$$element[0][\'' + fe.questionId + '\'].validationMessage"></div>';
                        }
                    }
                    question.answers.forEach(function (pv, i){
                        if (pv.nonValuelist && pv.subQuestions)
                            htmlText +=
                                htmlSubQuestion(pv, true, i); // sub-question not of value-list option
                    });

                    htmlText +=
                        '</div></div>';  //end question answers and question

                    element.replaceWith($compile(htmlText)(scope));
                }
            };
        }])
}());
