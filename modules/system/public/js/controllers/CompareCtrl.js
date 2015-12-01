angular.module('cdeModule').controller('CompareCtrl',
    ['$scope', 'QuickBoard',
        function ($scope, QuickBoard) {
            $scope.compareView = true;
            $scope.pvLimit = 30;

            $scope.initCache();
            $scope.openAllCompareModel = $scope.cache.get("openAllCompare");
            $scope.quickBoard = QuickBoard;

            $scope.openAllCompare = function (newValue) {
                $scope.openAllCompareModel = newValue;

                for (var i = 0; i < $scope.cdes.length; i++) {
                    $scope.cdes[i].isOpen = $scope.openAllCompareModel;
                }
                $scope.cache.put("openAllCompare", $scope.openAllCompareModel);
            };

            $scope.canCurate = false;

            function lowerCompare(item1, item2) {
                if (item1 === undefined && item2 === undefined) {
                    return true;
                } else if (item1 === undefined || item2 === undefined) {
                    return false;
                } else {
                    return item1.toLowerCase() === item2.toLowerCase();
                }
            }

            $scope.isPvInList = function (pv, list, callback) {
                for (var i = 0; i < list.length; i++) {
                    if (lowerCompare(pv.permissibleValue, list[i].permissibleValue) &&
                        pv.valueMeaningCode === list[i].valueMeaningCode &&
                        pv.codeSystemName === list[i].codeSystemName &&
                        lowerCompare(pv.valueMeaningName, list[i].valueMeaningName)) {
                        return callback(true);
                    }
                }
                return callback(false);
            };

            $scope.comparePvs = function (list1, list2) {
                for (var i = 0; i < list1.length; i++) {
                    $scope.isPvInList(list1[i], list2, function (wellIsIt) {
                        list1[i].isValid = wellIsIt;
                    });
                }
            };

            if ($scope.module === 'cde') {
                $scope.cdes = $scope.eltsToCompare;
                $scope.comparePvs($scope.cdes[1].valueDomain.permissibleValues, $scope.cdes[0].valueDomain.permissibleValues);
                $scope.comparePvs($scope.cdes[0].valueDomain.permissibleValues, $scope.cdes[1].valueDomain.permissibleValues);
            }


            $scope.namingOption = {
                properties: [
                    {label: 'Name', property: 'designation'}, {
                        label: 'Definition',
                        property: 'definition'
                    }, {label: 'Context', property: 'context.contextName'}
                ]
            };
            $scope.referenceDocumentOption = {
                properties: [
                    {label: 'Title', property: 'title'},
                    {label: 'URI', property: 'uri'},
                    {
                        label: 'Provider Org',
                        property: 'providerOrg'
                    },
                    {label: 'Language Code', property: 'languageCode'},
                    {label: 'Document', property: 'document'}
                ]
            };
            $scope.propertiesOption = {
                properties: [
                    {label: 'Key', property: 'key'},
                    {label: 'Value', property: 'value'}
                ]
            };
            $scope.dataElementConceptOption = {
                properties: [
                    {label: 'Name', property: 'name'},
                    {label: 'Origin', property: 'origin'},
                    {label: 'OriginId', property: 'originId'}
                ]
            };
            $scope.stewardOrgOption = {properties: [{label: 'Steward', property: 'name'}]};
            $scope.registrationStateOption = {properties: [{label: 'Status', property: 'registrationStatus'}]};

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
            $scope.questionOption = {
                equal: function (a, b) {
                    if (a.question.cde.tinyId === b.question.cde.tinyId) return true;
                    else return false;
                },
                properties: [{label: 'Label', property: 'label'},
                    {label: 'CDE', property: 'question.cde.tinyId', link: true, url: '/#/deview/?tinyId='},
                    {label: 'Unit of Measurement', property: 'question.uoms'},
                    {label: 'Answer', property: 'question.answers', displayAs: 'valueMeaningName'}
                ]
            };
            $scope.eltsToCompare[0].questions = [];
            flatFormQuestions($scope.eltsToCompare[0], $scope.eltsToCompare[0].questions);
            exports.wipeUseless($scope.eltsToCompare[0]);

            $scope.eltsToCompare[1].questions = [];
            flatFormQuestions($scope.eltsToCompare[1], $scope.eltsToCompare[1].questions);
            exports.wipeUseless($scope.eltsToCompare[1]);
        }
    ])
;