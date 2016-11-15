angular.module('formModule').controller('FormDiffCtrl', ['$scope', '$http', 'PriorForms', 'ClassificationUtil',
    function ($scope, $http, PriorForms, ClassificationUtil) {
        $scope.showVersioned = false;
        $scope.showHistory = false;
        $scope.selectedObjs = {length: 0, selected: {}};
        $scope.selectedIds = [];

        $scope.nullsToFront = function (obj) {
            return (angular.isDefined(obj.updated) ? 'b' : 'a');
        };

        var loadPriorForms = function () {
            if (!$scope.priorForms) {
                if ($scope.elt.history && $scope.elt.history.length > 0) {
                    PriorForms.getForms({formId: $scope.elt._id}, function (forms) {
                        $scope.priorForms = forms;
                    });
                }
            }
        };
        $scope.$on('openHistoryTab', loadPriorForms);
        $scope.formHistoryCtrlLoadedPromise.resolve();
        $scope.$on('eltReloaded', function () {
            delete $scope.priorForms;
            loadPriorForms();
        });

        $scope.setSelected = function (id) {
            $scope.showHistory = false;
            var index = $scope.selectedIds.indexOf(id);
            if (index === -1) {
                $scope.selectedIds.splice(0, 0, id);
                if ($scope.selectedIds.length > 2) $scope.selectedIds.length = 2;
            } else {
                $scope.selectedIds.splice(index, 1);
            }
            $scope.selectedIds.sort(function (a, b) {
                return a < b;
            });
        };

        $scope.isSelected = function (id) {
            return $scope.selectedIds.indexOf(id) > -1;
        };

        $scope.clickView = function (e, url, url1) {
            e.stopPropagation();
            window.open(url + url1);
        };

        var flatFormQuestions = function (fe, questions) {
            if (fe.formElements != undefined) {
                fe.formElements.forEach(function (e) {
                    if (e.elementType && e.elementType === 'question') {
                        delete e.formElements;
                        questions.push(JSON.parse(JSON.stringify(e)));
                    }
                    else flatFormQuestions(e, questions);
                })
            }
        };

        function extractFormItems(tree, section, targetArray) {
            if (tree.formElements) {
                tree.formElements.forEach(function (elem) {
                    switch (elem.elementType) {
                        case "question":
                            targetArray.push({
                                o: elem,
                                calculated: {
                                    tinyId: elem.question.cde.tinyId,
                                    section: section,
                                    answers: (elem.question.answers.length > 2 ?
                                        elem.question.answers.slice(0, 2).concat({permissibleValue: '...'}) :
                                        elem.question.answers),
                                    cardinality: {
                                        "0": {
                                            "1": "0 or 1",
                                            "-1": "0 or more"
                                        },
                                        "1": {
                                            "1": "Exactly 1",
                                            "-1": "1 or more"
                                        }
                                    }[elem.cardinality.min][elem.cardinality.max],
                                    showIf: (elem.skipLogic ? elem.skipLogic.condition : ''),
                                    minValue:
                                        (elem.question.datatypeNumber ? elem.question.datatypeNumber.minValue : ''),
                                    maxValue:
                                        (elem.question.datatypeNumber ? elem.question.datatypeNumber.maxValue : ''),
                                    precision:
                                        (elem.question.datatypeNumber ? elem.question.datatypeNumber.precision : '')
                                }
                            });
                            break;
                        case "form":
                            targetArray.push({
                                o: elem,
                                calculated: {
                                    tinyId: elem.inForm.form.tinyId,
                                    section: section
                                }
                            });
                            break;
                        case "section":
                            targetArray.push({
                                o: elem,
                                calculated: {
                                    section: (section ? section + " => " + elem.label : elem.label)
                                }
                            });
                            extractFormItems(elem, (section ? section + " => " + elem.label : elem.label), targetArray);
                            break;
                    }
                });
            }
        }

        function createDiff() {
            if (!$scope.leftCopy._id || !$scope.rightCopy._id) return;
            ClassificationUtil.sortClassification($scope.leftCopy);
            ClassificationUtil.sortClassification($scope.rightCopy);
            $scope.leftCopy.flatClassifications = ClassificationUtil.flattenClassification($scope.leftCopy);
            $scope.rightCopy.flatClassifications = ClassificationUtil.flattenClassification($scope.rightCopy);

            $scope.leftForm = [];
            $scope.rightForm = [];
            extractFormItems($scope.leftCopy, "", $scope.leftForm);
            extractFormItems($scope.rightCopy, "", $scope.rightForm);

            $scope.leftDatatypeObj = {
                obj: 'datatypeForm',
                p: {
                    title: 'Data Type Form', hideSame: false,
                    properties: [
                        {label: 'Minimum Value', property: 'minValue'},
                        {label: 'Maximum Value', property: 'maxValue'},
                        {label: 'Precision', property: 'precision'}
                    ],
                    tooltip: ''
                }
            };
            $scope.showHistory = true;
        }

        $scope.viewDiff = function () {
            if ($scope.selectedIds.length !== 2 || !$scope.selectedIds[0] || !$scope.selectedIds[1]) {
                $scope.addAlert("danger", "Select two to compare.");
            } else {
                $scope.leftCopy = $scope.rightCopy = {};
                $http.get('/formById/' + $scope.selectedIds[0]).then(function (result) {
                    $scope.leftCopy = result.data;
                    createDiff();
                });
                $http.get('/formById/' + $scope.selectedIds[1]).then(function (result) {
                    $scope.rightCopy = result.data;
                    createDiff();
                });
            }
        };

        $scope.questionOptions = {
            equal: function (a, b) {
                return a.calculated.tinyId === b.calculated.tinyId &&
                    a.calculated.section === b.calculated.section;
            },
            doSort: false,
            title: 'Form Description',
            hideSame: true,
            properties: [
                {
                    label: 'Label',
                    property: 'o.label',
                    getProperty: function (p) { return p.o.label; }
                },
                {
                    label: 'Tiny Id',
                    property: 'calculated.tinyId',
                    getProperty: function (p) { return p.calculated.tinyId; },
                    link: true,
                    url: '/#/deview/?tinyId='
                },
                {
                    label: 'Section',
                    property: 'calculated.section',
                    getProperty: function (p) { return p.calculated.section; }
                },
                {
                    label: 'Hide Label',
                    property: 'o.hideLabel',
                    getProperty: function (p) { return p.o.hideLabel; }
                },
                {
                    label: 'Required',
                    property: 'o.question.required',
                    getProperty: function (p) { return p.o.question.required; }
                },
                {
                    label: 'Cardinality',
                    property: 'calculated.cardinality',
                    getProperty: function (p) { return p.calculated.cardinality; }
                },
                {
                    label: 'Multi-select',
                    property: 'o.question.multiselect',
                    getProperty: function (p) { return p.o.question.multiselect; }
                },
                {
                    label: 'Show If',
                    property: 'calculated.showIf',
                    getProperty: function (p) { return p.calculated.showIf; }
                },
                {
                    label: 'Default Answer',
                    property: 'o.question.defaultAnswer',
                    getProperty: function (p) { return p.o.question.defaultAnswer; }
                },
                {
                    label: 'Datatype',
                    property: 'o.question.datatype',
                    getProperty: function (p) { return p.o.question.datatype; }
                },
                {
                    label: 'Min Value',
                    property: 'calculated.minValue',
                    getProperty: function (p) { return p.calculated.minValue; }
                },
                {
                    label: 'Max Value',
                    property: 'calculated.maxValue',
                    getProperty: function (p) { return p.calculated.maxValue; }
                },
                {
                    label: 'Precision',
                    property: 'calculated.precision',
                    getProperty: function (p) { return p.calculated.precision; }
                },
                {
                    label: 'Units of Measure',
                    property: 'o.question.uoms',
                    getProperty: function (p) { return p.o.question.uoms; }
                },
                {
                    label: 'Answer List',
                    property: 'calculated.answers',
                    getProperty: function (p) { return p.o.question.answers; },
                    displayAs: 'permissibleValue'
                }
            ],
            wipeUseless: $scope.wipeUseless
        };

    }]);