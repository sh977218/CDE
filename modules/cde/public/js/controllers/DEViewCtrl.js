import * as deValidator from "../../../../cde/shared/deValidator";

angular.module('cdeModule').controller('DEViewCtrl',
    ['$scope', '$routeParams', '$uibModal', '$window', '$http', '$timeout', 'DataElement',
        'DataElementTinyId', 'isAllowedModel', 'OrgHelpers', '$rootScope', 'TourContent',
        '$q', 'QuickBoard', '$log', 'userResource', 'PinModal', 'AlertService',
        function ($scope, $routeParams, $modal, $window, $http, $timeout, DataElement, DataElementTinyId,
                  isAllowedModel, OrgHelpers, $rootScope, TourContent,
                  $q, QuickBoard, $log, userResource, PinModal, Alert)
{

    $scope.module = 'cde';
    $scope.baseLink = 'deview?tinyId=';
    $scope.eltLoaded = false;
    $scope.detailedView = true;
    $scope.canLinkPv = false;
    $scope.vsacValueSet = [];
    $scope.boards = [];
    $scope.pVTypeheadVsacNameList = [];
    $scope.pVTypeaheadCodeSystemNameList = [];
    $scope.pvLimit = 30;
    $scope.classifSubEltPage = '/system/public/html/classif-sub-elements.html';
    $scope.quickBoard = QuickBoard;

    $scope.PinModal = PinModal.new('cde');

    $scope.canCurate = false;

    $scope.forkCtrlLoadedPromise =  $q.defer();
    $scope.formsCtrlLoadedPromise = $q.defer();
    $scope.derRulesCtrlLoadedPromise = $q.defer();
    $scope.mltCtrlLoadedPromise = $q.defer();
    $scope.historyCtrlLoadedPromise = $q.defer();

    function setCurrentTab(thisTab) {
        $scope.currentTab = thisTab;
    }
    $scope.setCurrentTab = function (thisTab) {
        $scope.currentTab = thisTab;
    };

    $scope.switchCommentMode = function(){
        $scope.deferredEltLoaded.promise.then(function() {
            $scope.commentMode = !$scope.commentMode;
        });
    };
    $scope.getEltId = function () {return $scope.elt.tinyId;};
    $scope.getEltName = function () {return $scope.elt.naming[0].designation;};
    $scope.doesUserOwnElt = function () {
        return userResource.user.siteAdmin ||
            (userResource.user._id && (userResource.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1)
        );
    };
    $scope.getCtrlType = function () {return "cde";};

    $scope.tabs = {
        pvs: {
            heading: "Permissible Values", includes: ['/cde/public/html/permissibleValue.html'],
            select: function (thisTab) {
                // setCurrentTab(thisTab);
            }
        },
        naming: {
            heading: "Naming", includes: ['/system/public/html/naming.html'],
            select: function () {
                OrgHelpers.deferred.promise.then(function () {
                    $scope.allTags = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameTags;
                });
            }
        },
        classification: {
            heading: "Classification", includes: ['/system/public/html/classification.html'],
            select: function (thisTab) {
                // setCurrentTab(thisTab);
            }
        },
        concepts: {
            heading: "Concepts", includes: ['/cde/public/html/concepts.html'],
            select: function (thisTab) {
                // setCurrentTab(thisTab);
            }
        },
        referenceDocument: {
            heading: "Reference Documents", includes: ['/system/public/html/referenceDocument.html'],
            select: function (thisTab) {
                // setCurrentTab(thisTab);
            }
        },
        properties: {
            heading: "Properties", includes: ['/system/public/html/properties.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                OrgHelpers.deferred.promise.then(function () {
                    $scope.allKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
                });
            }
        },
        ids: {
            heading: "Identifiers",
            includes: ['/system/public/html/identifiers.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            }
        },
        attachments: {
            heading: "Attachments", includes: ['/system/public/html/attachments.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            }
        },
        history: {
            heading: "History",
            includes: ['/system/public/html/history.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            }
        },
        derivationRules: {
            heading: "Score / Derivations",
            includes: ['/cde/public/html/derivationRules.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            }
        },
        validRules: {
            heading: "Validation Rules", includes: ['/system/public/html/validRules.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            }
        }
    };

    $scope.deferredEltLoaded = $q.defer();

    $scope.$on('$locationChangeStart', function( event ) {
        if ($scope.elt && $scope.elt.unsaved) {
            var txt = "You have unsaved changes, are you sure you want to leave this page? ";
            if (window.debugEnabled) {
                txt = txt + window.location.pathname;
            }
            var answer = confirm(txt);
            if (!answer) {
                event.preventDefault();
            }
        }
    });

    $scope.reload = function(route) {
        var service;
        var query = {};
        if (route.tinyId) {
            service = DataElementTinyId;
            query = {tinyId: route.tinyId};
            if (route.version) query.version = route.version;
        } else {
            service = DataElement;
            query = {deId: route.cdeId};
        }
        service.get(query, function(de) {
            $scope.elt = de;
            $scope.elt._changeNote = $scope.elt.changeNote;
            delete $scope.elt.changeNote;
            $scope.elt.allValid = true;
            $scope.loadValueSet();
            $scope.canLinkPvFunc();
            $scope.loadBoards();
            $scope.getPVTypeaheadCodeSystemNameList();
            if ($scope.elt.forkOf) {
                $http.get('/forkroot/' + $scope.elt.tinyId).then(function(result) {
                    $scope.rootFork = result.data;
                });
            }
            $scope.elt.usedBy = OrgHelpers.getUsedBy($scope.elt, userResource.user);
            isAllowedModel.setCanCurate($scope);
            isAllowedModel.setDisplayStatusWarning($scope);
            OrgHelpers.deferred.promise.then(function() {
                $scope.orgDetailsInfoHtml = OrgHelpers.createOrgDetailedInfoHtml($scope.elt.stewardOrg.name, $rootScope.orgsDetailedInfo);
            });
            $scope.deferredEltLoaded.resolve();
            if (route.tab) {
                $scope.tabs.more.select();
                $scope.tabs[route.tab].active = true;
            }
            $http.get('/esRecord/' + de.tinyId).then(function onSuccess(response) {
                $scope.elt.flatMeshSimpleTrees = [];
                if (response.data._source.flatMeshSimpleTrees) {
                    response.data._source.flatMeshSimpleTrees.forEach(function (t) {
                        if ($scope.elt.flatMeshSimpleTrees.indexOf(t.split(";").pop()) === -1) $scope.elt.flatMeshSimpleTrees.push(t.split(";").pop());
                    });
                }
            }, function () {});
        }, function (err) {
            $log.error("Unable to retrieve element.");
            $log.error(err);
            Alert.addAlert("danger", "Sorry, we are unable to retrieve this element.");
        });
    };

    $scope.reload($routeParams);

    $scope.sendForkNotification = function() {
        var message = {
            recipient: {recipientType: "stewardOrg", name: $scope.rootFork.stewardOrg.name},
            author: {authorType: "user"},
            type: "Fork Notification",
            typeRequest: {
                source: {id: $scope.elt._id}
                , destination: {tinyId: $scope.elt.tinyId}
            }
        };
        $http.post('/mail/messages/new', message)
            .then(function onSuccess() {
                Alert.addAlert("success", "Notification sent.");
            })
            .catch(function onError() {
                Alert.addAlert("danger", "Unable to notify user. ");
            });
    };

    $scope.classificationToFilter = function() {
         if ($scope.elt) {
             return $scope.elt.classification;
         }
    };

    $scope.save = function() {
        $scope.elt.$save({}, function (elt) {
            $scope.elt = elt;
            $scope.elt._changeNote = $scope.elt.changeNote;
            delete $scope.elt.changeNote;
            $scope.$broadcast("elementReloaded");
            Alert.addAlert("success", "Saved.");
        }, function() {
            Alert.addAlert("danger", "Unable to save element. This issue has been reported.");
        });
    };

    $scope.revert = function(elt) {
        $scope.reload({tinyId: elt.tinyId});
    };

    $scope.isPvInVSet = function(pv) {
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
            if (pv.valueMeaningCode === $scope.vsacValueSet[i].code &&
                pv.codeSystemName === $scope.vsacValueSet[i].codeSystemName &&
                pv.valueMeaningName === $scope.vsacValueSet[i].displayName) {
                    return true;
            }
        }
        return false;
    };

    $scope.validatePvWithVsac = function() {
        var pvs = $scope.elt.valueDomain.permissibleValues;
        if (!pvs) {
            return;
        }
        pvs.forEach(function(pv) {
            pv.isValid = $scope.isPvInVSet(pv);
        });
    };

    $scope.allValid = true;
    $scope.checkPvUnicity = function() {
        $timeout(function() {
            var validObject = deValidator.checkPvUnicity($scope.elt.valueDomain);
            $scope.allValid = validObject.allValid;
            $scope.pvNotValidMsg = validObject.pvNotValidMsg;
        }, 0);
    };

    $scope.runManualValidation = function () {
        delete $scope.showValidateButton;
        $scope.validatePvWithVsac();
        $scope.validateVsacWithPv();
        $scope.checkPvUnicity();
    };

    $scope.runDelayedManualValidation = function() {
        $timeout(function(){
            $scope.runManualValidation();
        },100);
    };

    $scope.isVsInPv = function(vs) {
        var pvs = $scope.elt.valueDomain.permissibleValues;
        if (!pvs) {
            return false;
        }
        var res = false;
        pvs.forEach(function(pv) {
            if (pv.valueMeaningCode === vs.code &&
                pv.codeSystemName === vs.codeSystemName &&
                pv.valueMeaningName === vs.displayName) {
                res = true;
            }
        });
        return res;
    };

    $scope.validateVsacWithPv = function() {
        $scope.vsacValueSet.forEach(function(vsItem) {
            vsItem.isValid = $scope.isVsInPv(vsItem);
        });
    };

    $scope.allVsacMatch = function () {
        var allVsacMatch = true;
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
            allVsacMatch = allVsacMatch && $scope.vsacValueSet[i].isValid;
        }
        return allVsacMatch;
    };

    $scope.loadValueSet = function() {
        var dec = $scope.elt.dataElementConcept;
        if (dec && dec.conceptualDomain && dec.conceptualDomain.vsac) {
            $scope.vsacValueSet = [];
            $http({method: "GET", url: "/vsacBridge/" + dec.conceptualDomain.vsac.id}).then(function onSuccess(response) {
                if (!response.data.error && response.data["ns0:RetrieveValueSetResponse"]) {
                    $scope.elt.dataElementConcept.conceptualDomain.vsac.name = response.data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                    $scope.elt.dataElementConcept.conceptualDomain.vsac.version = response.data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].version;
                    for (var i = 0; i < response.data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'].length; i++) {
                        $scope.vsacValueSet.push(response.data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i]['$']);
                    }
                    if ($scope.vsacValueSet.length < 50 || $scope.elt.valueDomain.permissibleValues < 50) {
                        $scope.validatePvWithVsac();
                        $scope.validateVsacWithPv();
                    } else {
                        $scope.showValidateButton = true;
                    }
                    $scope.getPVTypeheadVsacNameList();
                } else {
                    Alert.addAlert("Error: No data retrieved from VSAC.");
                }
            }).catch(function onError(response) {
                if (response.status === 404) {
                    Alert.addAlert("warning", "Invalid VSAC OID");
                    $scope.elt.dataElementConcept.conceptualDomain.vsac.id = "";
                } else {
                    Alert.addAlert("danger", "Error quering VSAC");
                    $scope.elt.dataElementConcept.conceptualDomain.vsac.id = "";
                }
            });
        }
        $scope.canLinkPvFunc();
    };

    // could prob. merge this into load value set.
    $scope.canLinkPvFunc = function() {
        var dec = $scope.elt.dataElementConcept;
        $scope.canLinkPv = ($scope.canCurate && dec && dec.conceptualDomain && dec.conceptualDomain.vsac && dec.conceptualDomain.vsac.id);
    };


    $scope.loadBoards = function() {
        $http.get("/deBoards/" + $scope.elt.tinyId).then(function(response) {
            $scope.boards = response.data;
        }, function (err) {console.log(err)});
    };

    $scope.getPVTypeheadVsacNameList = function() {
        $scope.pVTypeheadVsacNameList =  $scope.vsacValueSet.map(function(obj) {
            return obj.displayName;
        });
    };

    $scope.getPVTypeaheadCodeSystemNameList = function() {
        $http.get("/permissibleValueCodeSystemList").then(function(response) {
            $scope.pVTypeaheadCodeSystemNameList = response.data;
        }, function (err) {
            console.log(err);
        });
    };

    $scope.copyElt = function() {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/copyModal.html',
            controller: 'CdeCopyModalCtrl',
            resolve: {
                elt: function() {return $scope.elt;}
            }
        }).result.then(function () {}, function() {});
    };

    $scope.validateAndStageElt = function (elt) {
        if (elt.valueDomain.datatype === 'Value List'
            && (!elt.valueDomain.permissibleValues || elt.valueDomain.permissibleValues.length === 0)) {
            $scope.elt.allValid = false;
            $scope.elt.pvNotValidMsg = 'Empty Permissible Values';
            return;
        }
        else {
            $scope.elt.allValid = true;
            delete $scope.elt.pvNotValidMsg;
            elt.unsaved = true;
        }
    }

}]);
