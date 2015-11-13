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

            $scope.namingProperties = ['designation', 'definition', 'context'];
            $scope.referenceDocumentProperties = ['title', 'uri', 'providerOrg', 'languageCode', 'document'];
            $scope.propertiesProperties = ['key', 'value'];
            $scope.dataElementConceptProperties = ['concepts', 'conceptualDomain'];
            $scope.stewardOrgProperties = ['name'];
            $scope.registrationStateProperties = ['registrationStatus'];
            $scope.createdByProperties = ['username'];

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
            var wipeUseless = function (o) {
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
            };

            $scope.eltsToCompare[0].questions = [];
            flatFormQuestions($scope.eltsToCompare[0], $scope.eltsToCompare[0].questions);
            wipeUseless($scope.eltsToCompare[0]);

            $scope.eltsToCompare[1].questions = [];
            flatFormQuestions($scope.eltsToCompare[1], $scope.eltsToCompare[1].questions);
            wipeUseless($scope.eltsToCompare[1]);

            $scope.questionProperties = ['elementType', 'label', 'datatype', 'cde'];

        }
    ])
;