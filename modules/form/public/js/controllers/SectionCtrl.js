angular.module('formModule').controller('SectionCtrl', ['$scope', '$uibModal', '$timeout', '$http',
    function ($scope, $modal, $timeout, $http) {
        $scope.cardinalityOptions =
            [
                {label: "Exactly 1", value: {min: 1, max: 1}},
                {label: "1 or more", value: {min: 1, max: -1}},
                {label: "0 or more", value: {min: 0, max: -1}},
                {label: "0 or 1", value: {min: 0, max: 1}}
            ];
        $scope.getCardinalityLabel = function (cardinality) {
            if (cardinality === undefined || cardinality.min === undefined || cardinality.max === undefined)
                return "";
            return {
                "0": {
                    "1": "0 or 1",
                    "-1": "0 or more"
                },
                "1": {
                    "1": "Exactly 1",
                    "-1": "1 or more"
                }
            }[cardinality.min][cardinality.max];
        };

        $scope.addSection = function () {
            if (!$scope.elt.formElements) {
                $scope.elt.formElements = [];
            }
            $scope.elt.formElements.push({
                label: "New Section",
                cardinality: {min: 1, max: 1},
                section: {},
                skipLogic: {condition: ''},
                formElements: [],
                elementType: "section"
            });
            $scope.stageElt();
        };

        $scope.sortableOptionsSections = {
            connectWith: ".dragSections",
            handle: ".fa.fa-arrows",
            revert: true,
            placeholder: "questionPlaceholder",
            start: function (event, ui) {
                $('.dragQuestions').css('border', '2px dashed grey');
                ui.placeholder.height("20px");
            },
            stop: function () {
                $('.dragQuestions').css('border', '');
            },
            receive: function (e, ui) {
                if (!ui.item.sortable.moved) {
                    ui.item.sortable.cancel();
                    return;
                }
                if (ui.item.sortable.moved.tinyId || ui.item.sortable.moved.elementType === "question")
                    ui.item.sortable.cancel();
            },
            helper: function () {
                return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
            }
        };

        function convertCdeToQuestion(cde) {
            if (cde.valueDomain !== undefined) {
                var question = {
                    elementType: "question",
                    label: cde.naming[0].designation,
                    cardinality: {min: 1, max: 1},
                    skipLogic: {
                        condition: ''
                    },
                    question: {
                        cde: {
                            tinyId: cde.tinyId,
                            version: cde.version,
                            derivationRules: cde.derivationRules,
                            name: cde.naming[0] ? cde.naming[0].designation : '',
                            ids: cde.ids ? cde.ids : [],
                            permissibleValues: []
                        },
                        datatype: cde.valueDomain.datatype,
                        datatypeNumber: cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {},
                        required: false,
                        uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
                        answers: []
                    }
                };
                cde.naming.forEach(function (n) {
                    if (n.context === 'Question Text')
                        question.label = n.designation;
                });
                if (cde.valueDomain.permissibleValues.length > 0) {
                    // elastic only store 20 pv, retrieve pv when have more than 19 pv.
                    if (cde.valueDomain.permissibleValues.length > 19) {
                        $http.get("/debytinyid/" + cde.tinyId + "/" + cde.version).then(function (result) {
                            result.data.valueDomain.permissibleValues.forEach(function (pv) {
                                question.question.answers.push(pv);
                                question.question.cde.permissibleValues.push(pv);
                            });
                        });
                    } else {
                        cde.valueDomain.permissibleValues.forEach(function (pv) {
                            question.question.answers.push(pv);
                            question.question.cde.permissibleValues.push(pv);
                        });
                    }
                }
                return question;
            }
            else {
                return {};
            }
        }

        function convertFormToSection(form) {
            if (form.formElements) {
                var inForm = {
                    elementType: "form",
                    label: form.naming[0] ? form.naming[0].designation : '',
                    skipLogic: {
                        condition: ''
                    },
                    inForm: {
                        form: {
                            tinyId: form.tinyId,
                            version: form.version,
                            name: form.naming[0] ? form.naming[0].designation : ''
                        }
                    }
                };
                return inForm;
            }
            else {
                return {};
            }
        }

        $scope.sortableOptions = {
            connectWith: ".dragQuestions",
            handle: ".fa.fa-arrows",
            revert: true,
            placeholder: "questionPlaceholder",
            start: function (event, ui) {
                $('.dragQuestions').css('border', '2px dashed grey');
                ui.placeholder.height("20px");
            },
            stop: function () {
                $('.dragQuestions').css('border', '');
            },
            helper: function () {
                return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
            },
            receive: function (e, ui) {
                var elt = ui.item.sortable.moved;
                if (elt.valueDomain) {
                    var question = convertCdeToQuestion(elt);
                    ui.item.sortable.moved = question;
                } else if (elt.naming) {
                    var inForm = convertFormToSection(elt);
                    ui.item.sortable.moved = inForm;
                }
                $scope.stageElt();
            },
            update: function () {
                $scope.stageElt();
            }
        };

        $scope.openNameSelect = function (question, section) {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/form/public/html/selectQuestionName.html',
                controller: 'SelectQuestionNameModalCtrl',
                resolve: {
                    question: function () {
                        return question;
                    },
                    section: function () {
                        return section;
                    }
                }
            });
            modalInstance.result.then(function (selectedName) {
                if (selectedName === question.label)
                    return;
                if (selectedName.length > 0) {
                    question.label = selectedName;
                    question.hideLabel = false;
                } else {
                    question.hideLabel = true;
                }
                $scope.stageElt();
            });
        };

        $scope.checkUom = function (question, index) {
            $timeout(function () {
                if (question.question.uoms[index] === "") {
                    question.question.uoms.splice(index, 1);
                    $scope.stageElt();
                }
            }, 0);
        };

        $scope.canAddUom = function (question) {
            return $scope.canCurate && (!question.question.uoms || question.question.uoms.indexOf("Please specify") < 0);
        };

        $scope.addUom = function (question) {
            if (!question.question.uoms) question.question.uoms = [];
            question.question.uoms.push("Please specify");
            $scope.stageElt();
        };

        $scope.removeElt = function (form, index) {
            form.formElements.splice(index, 1);
            $scope.stageElt();

            if (form.formElements.length === 0) {
                $scope.setToNoneAddMode();
            }
        };

        $scope.removeQuestion = function (section, index) {
            section.formElements.splice(index, 1);
            $scope.stageElt();
        };

        $scope.moveElt = function (index, inc) {
            $scope.elt.formElements.splice(index + inc, 0, $scope.elt.formElements.splice(index, 1)[0]);
            $scope.stageElt();
        };

        $scope.isScore = function (formElt) {
            return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
        };

        $scope.updateCdeVersion = function (question) {
            $http.get('/deByTinyId/' + question.question.cde.tinyId).success(function (result) {
                var newQuestion = convertCdeToQuestion(result);
                $modal.open({
                    animation: false,
                    templateUrl: '/form/public/html/updateCdeRefVersion.html',
                    controller: 'UpdateCdeRefVersionCtrl',
                    resolve: {
                        newQuestion: function () {
                            return newQuestion;
                        },
                        currentQuestion: function () {
                            return question;
                        }
                    }
                }).result.then(function(){
                        question.question = newQuestion.question;
                        question.label = newQuestion.label;
                        $scope.stageElt();
                });
            });
        };


    }]);
