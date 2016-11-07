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
        $scope.$on('loadPriorForms', loadPriorForms);
        $scope.formHistoryCtrlLoadedPromise.resolve();
        $scope.$on('reloadPriorForms', function () {
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

        $scope.versionOptions = {
            title: 'Versions',
            hideSame: true,
            tooltip: ''
        };
        $scope.statusOptions = {
            title: 'Status',
            hideSame: true,
            tooltip: ''
        };
        $scope.stewardOrgNameOptions = {
            title: 'StewardOrg Name',
            hideSame: true,
            tooltip: ''
        };
        $scope.namingOptions = {
            equal: function (a, b) {
                return a.designation === b.designation &&
                    a.definition === b.definition &&
                    a.languageCode === b.languageCode &&
                    a.context.acceptability === b.context.acceptability &&
                    a.context.contextName === b.context.contextName;
            },
            sort: function (a, b) {
                return a.designation.localeCompare(b.designation);
            },
            tooltip: "Sorted by name. New/Removed if any value is modified",
            title: 'Naming',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'designation'},
                {label: 'Definition', property: 'definition'},
                {label: 'Context', property: 'context.contextName'}
            ]
        };
        $scope.dataElementConceptOptions = {
            equal: function (a, b) {
                return a.name === b.name &&
                    a.origin === b.origin &&
                    a.originId === b.originId;
            },
            sort: function (a, b) {
                return a.name.localeCompare(b.name);
            },
            tooltip: 'Sorted by name, New/Removed if any value is modified',
            title: 'Data Element Concepts',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'name'},
                {label: 'Origin', property: 'origin'},
                {label: 'OriginId', property: 'originId'}
            ]
        };
        $scope.propertyConceptOptions = {
            equal: function (a, b) {
                return a.name === b.name &&
                    a.origin === b.origin &&
                    a.originId === b.originId;
            },
            sort: function (a, b) {
                return a.name.localeCompare(b.name);
            },
            tooltip: 'Sorted by name, New/Removed if any value is modified',
            title: 'Property Concepts',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'name'},
                {label: 'Origin', property: 'origin'},
                {label: 'OriginId', property: 'originId'}
            ]
        };
        $scope.objectClassConceptOptions = {
            equal: function (a, b) {
                return a.name === b.name &&
                    a.origin === b.origin &&
                    a.originId === b.originId;
            },
            sort: function (a, b) {
                return a.name.localeCompare(b.name);
            },
            tooltip: 'Sorted by name, New/Removed if any value is modified',
            title: 'ObjectClass Concepts',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'name'},
                {label: 'Origin', property: 'origin'},
                {label: 'OriginId', property: 'originId'}
            ]
        };
        $scope.referenceDocumentsOptions = {
            equal: function (a, b) {
                return a.title === b.title;
            },
            sort: function (a, b) {
                return a.title.localeCompare(b.title);
            },
            title: 'Reference Documents',
            hideSame: true,
            properties: [
                {label: 'Title', property: 'title'},
                {label: 'URI', property: 'uri'},
                {label: 'Provider Org', property: 'providerOrg'},
                {label: 'Language Code', property: 'languageCode'},
                {label: 'Document', property: 'document'}
            ]
        };
        $scope.propertiesOptions = {
            equal: function (a, b) {
                return a.key === b.key &&
                    a.value === b.value &&
                    a.valueFormat === b.valueFormat;
            },
            sort: function (a, b) {
                return a.key.localeCompare(b.key);
            },
            title: 'Properties',
            hideSame: true,
            properties: [
                {label: 'Key', property: 'key'},
                {label: 'Value', property: 'value'}
            ]
        };
        $scope.attachmentsOptions = {
            equal: function (a, b) {
                return a.fileid === b.fileid;
            },
            sort: function (a, b) {
                return a.filename.localeCompare(b.filename);
            },
            title: 'Attachments',
            hideSame: true,
            properties: [
                {label: 'Filename', property: 'filename'},
                {label: 'Size', property: 'filesize'},
                {label: 'Uploaded date', property: 'uploadDate'},
                {label: 'Uploaded by', property: 'uploadedBy.username'}
            ]
        };
        $scope.idsOptions = {
            equal: function (a, b) {
                return a.id === b.id &&
                    a.source === b.source &&
                    a.version === b.version;
            },
            sort: function (a, b) {
                return a.id.localeCompare(b.id);
            },
            title: 'Identifiers',
            hideSame: true,
            properties: [
                {label: 'Source', property: 'source'},
                {label: 'ID', property: 'id'},
                {label: 'Version', property: 'version'}
            ]
        };
        $scope.sourcesOptions = {
            equal: function (a, b) {
                return a.sourceName === b.sourceName &&
                    a.dateCreated === b.dateCreated &&
                    a.dateModified === b.dateModified &&
                    a.registrationStatus === b.registrationStatus &&
                    a.datatype === b.datatype;
            },
            sort: function (a, b) {
                return a.sourceName.localeCompare(b.sourceName);
            },
            title: 'Sources',
            hideSame: true,
            properties: [
                {label: 'Source Name', property: 'sourceName'},
                {label: 'Source Created Date', property: 'dateCreated'},
                {label: 'Source Modified Date', property: 'dateModified'},
                {label: 'Source Status', property: 'registrationStatus'},
                {label: 'Source Data Type', property: 'datatype'}
            ]
        };
        $scope.classificationsOptions = {
            title: 'Classifications',
            hideSame: true
        };
        $scope.valueDomainDatatypeOptions = {
            title: 'Value Type',
            hideSame: false,
            tooltip: ''
        };
        $scope.datatypeValueListOptions = {
            title: 'Value List Data Type',
            hideSame: false,
            tooltip: ''
        };
        $scope.questionOptions = {
            equal: function (a, b) {
                return a.calculated.tinyId === b.calculated.tinyId &&
                    a.calculated.section === b.calculated.section &&
                    a.o.label === b.o.label &&
                    a.o.hideLabel === b.o.hideLabel &&
                    a.calculated.cardinality === b.calculated.cardinality &&
                    a.o.question.required === b.o.question.required &&
                    a.o.question.datatype === b.o.question.datatype &&
                    a.o.question.multiselect === b.o.question.multiselect &&
                    a.o.skipLogic.condition === b.o.skipLogic.condition &&
                    a.calculated.minValue === b.calculated.minValue &&
                    a.calculated.maxValue === b.calculated.maxValue &&
                    a.calculated.precision === b.calculated.precision &&
                    a.o.question.defaultAnswer === b.o.question.defaultAnswer &&
                    angular.equals(a.o.question.uoms, b.o.question.uoms) &&
                    angular.equals(a.o.question.answers, b.o.question.answers);
            },
            doSort: false,
            title: 'Form Description',
            hideSame: true,
            properties: [
                {
                    label: 'Label',
                    property: 'o.label',
                    equal: 'a.o.label === b.o.label'
                },
                {
                    label: 'Tiny Id',
                    property: 'calculated.tinyId',
                    equal: 'a.calculated.tinyId === b.calculated.tinyId',
                    link: true,
                    url: '/#/deview/?tinyId='
                },
                {
                    label: 'Section',
                    property: 'calculated.section',
                    equal: 'a.calculated.section === b.calculated.section'
                },
                {
                    label: 'Hide Label',
                    property: 'o.hideLabel',
                    equal: 'a.o.hideLabel === b.o.hideLabel'},
                {
                    label: 'Required',
                    property: 'o.question.required',
                    equal: 'a.o.question.required === b.o.question.required'
                },
                {
                    label: 'Cardinality',
                    property: 'calculated.cardinality',
                    equal: 'a.calculated.cardinality === b.calculated.cardinality'
                },
                {
                    label: 'Multi-select',
                    property: 'o.question.multiselect',
                    equal: 'a.o.question.multiselect === b.o.question.multiselect'
                },
                {
                    label: 'Show If',
                    property: 'o.skipLogic.condition',
                    equal: 'a.o.skipLogic.condition === b.o.skipLogic.condition'
                },
                {
                    label: 'Default Answer',
                    property: 'o.question.defaultAnswer',
                    equal: 'a.o.question.defaultAnswer === b.o.question.defaultAnswer'
                },
                {
                    label: 'Datatype',
                    property: 'o.question.datatype',
                    equal: 'a.o.question.datatype === b.o.question.datatype'
                },
                {
                    label: 'Min Value',
                    property: 'calculated.minValue',
                    equal: 'a.calculated.minValue === b.calculated.minValue'
                },
                {
                    label: 'Max Value',
                    property: 'calculated.maxValue',
                    equal: 'a.calculated.maxValue === b.calculated.maxValue'
                },
                {
                    label: 'Precision',
                    property: 'calculated.precision',
                    equal: 'a.calculated.precision === b.calculated.precision'
                },
                {
                    label: 'Units of Measure',
                    property: 'o.question.uoms',
                    equal: 'angular.equals(a.o.question.uoms, b.o.question.uoms)'
                },
                {
                    label: 'Answer List',
                    property: 'calculated.answers',
                    displayAs: 'permissibleValue',
                    equal: 'angular.equals(a.o.question.answers, b.o.question.answers)'
                }
            ],
            wipeUseless: $scope.wipeUseless
        };

    }]);