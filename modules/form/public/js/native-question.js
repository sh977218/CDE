(function () {
    'use strict';
    angular.module('nativeQuestion', [])
        .directive("nativeQuestion", ["$compile", function ($compile) {
            return {
                restrict: "EA",
                scope: true,
                link: function (scope, element, attrs) {
                    var fes = scope.formElements;
                    var fe = scope.formElement;
                    var question = fe.question;
                    var type = question.datatype || 'text';
                    var required = question.required ? "ng-required='true'" : "";
                    var disabled = !question.editable ? "disabled" : "";
                    var htmlText = '';
                    function getLabel(pv) {
                        return pv ? (pv.valueMeaningName ? pv.valueMeaningName : pv.permissibleValue) : '';
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
                        pv && pv.subQuestions && pv.subQuestions.forEach(function (formElement, j) {
                            html +=
                                '<div class="' +
                                (pv.subQuestions && scope.isOneLiner(pv.subQuestions[0],pv.subQuestions.length)
                                    ? 'native-question-oneline-r' : '') + ' ' +
                                (!subQNonValuelist && numSubQuestions && !scope.isOneLiner(formElement,numSubQuestions)
                                    ? 'native-box' : '') + '">';

                            if ((formElement.elementType === 'question') && (!subQNonValuelist || subQNonValuelist && pv.nonValuelist)) {
                                html +=
                                    '<div native-question' +
                                    ' ng-init="';

                                if (subQNonValuelist)
                                    html +=
                                        'permissibleValue=formElement.question.answers[' + i + '].permissibleValue;';

                                html +=
                                    'formElements = formElement.question.answers[' + i + '].subQuestions;' +
                                    'formElement = formElements[' + j + '];' +
                                    'numSubQuestions=' + numSubQuestions + ';"></div>';
                            }
                            if ((formElement.elementType === 'section' || formElement.elementType === 'form') && (!subQNonValuelist || subQNonValuelist && pv.nonValuelist))
                                html +=
                                    '<div ng-include="\'/form/public/html/formRenderSection.html\'"' +
                                    ' ng-init="formElements = formElement.question.answers[' + i + '].subQuestions;' +
                                    ' formElement = formElements[' + j + '];"></div>';

                            html +=
                                '</div>';
                        });
                        return html;
                    }

                    if (scope.nativeRenderType === scope.FOLLOW_UP)
                        htmlText +=
                            '<div class="native-question">';
                    else if (scope.nativeRenderType === scope.SHOW_IF)
                        htmlText +=
                            '<div ng-if="evaluateSkipLogicAndClear(formElement.skipLogic.condition, formElements, formElement)" class="native-question">';

                    if (scope.hasLabel(fe))
                        htmlText +=
                            '<label ng-class="{\'native-question-label\': !numSubQuestions && selection.selectedProfile.displayNumbering}">' +
                               '<span ng-if="::permissibleValue">If {{::permissibleValue}}: </span>' + fe.label + '</label>';
                    if (fe.instructions && fe.instructions.value) {
                        htmlText +=
                            '<div ng-if="selection.selectedProfile.displayInstructions" class="native-instructions">';
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
                        '<div id="' + fe.label + '_{{::$index}}"' +
                        ' class="native-question-answers' + (scope.hasLabel(fe) ? ' native-box' : '') + '">';
                    if (question.isScore) // Label
                        htmlText +=
                            'Score: <span ng-bind="score(formElement)"></span>';
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
                                                    (pv.subQuestions && scope.isOneLiner(pv.subQuestions[0],pv.subQuestions.length)
                                                        ? 'native-question-oneline-l ' : '') +
                                                    (question.multiselect ? 'checkbox-inline' : 'radio-inline') + '">';

                                        if (!question.multiselect)
                                            htmlText +=
                                                '<input type="radio"' +
                                                ' ng-model="formElement.question.answer" ' +
                                                ' ng-value="formElement.question.answers[' + i + '].permissibleValue"' +
                                                ' name="' + fe.questionId + '" ' + required + ' ' + disabled + '/>';
                                        else
                                            htmlText +=
                                                '<input type="checkbox" ' +
                                                'checklist-model="formElement.question.answer" ' +
                                                'checklist-value="formElement.question.answers[' + i + '].permissibleValue" ' +
                                                'ng-value="formElement.question.answers[' + i + '].permissibleValue" ' +
                                                'name="' + fe.questionId + '" ' + required + ' ' + disabled + '/>';

                                        htmlText +=
                                            getLabel(pv) + '</label>';

                                        if (pv.subQuestions)
                                            htmlText +=
                                                htmlSubQuestion(pv,false, i);

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
                                        '<input class="form-control" uib-datepicker-popup="MM/dd/yyyy"' +
                                            ' datepicker-options="formElement.question.dateOptions"' +
                                            ' is-open="formElement.question.opened"' +
                                            ' type="date" alt-input-formats="[\'yyyy\']"' +
                                            ' ng-model="formElement.question.answer"' +
                                            ' name="' + fe.questionId + '" '+ required + ' ' + disabled + '/>' +
                                        '<div class="input-group-btn">' +
                                            '<button type="button" class="btn btn-default"' +
                                                ' ng-click="formElement.question.opened = true">' +
                                                '<i class="glyphicon glyphicon-calendar"></i>' +
                                            '</button></div></div>' +
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
                        if (pv.subQuestions)
                            htmlText +=
                                htmlSubQuestion(pv, true, i);
                    });

                    htmlText +=
                        '</div></div>';  //end question answers and question

                    element.replaceWith($compile(htmlText)(scope));
                }
            };
        }])
}());
