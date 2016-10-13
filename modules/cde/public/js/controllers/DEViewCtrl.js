angular.module('cdeModule').controller('DEViewCtrl',
    ['$scope', '$routeParams', '$window', '$http', '$timeout', 'DataElement',
        'DataElementTinyId', 'isAllowedModel', 'OrgHelpers', '$rootScope', 'TourContent',
        'CdeDiff', '$q', 'QuickBoard', '$log', 'userResource',
        function($scope, $routeParams, $window, $http, $timeout, DataElement, DataElementTinyId,
                 isAllowedModel, OrgHelpers, $rootScope, TourContent,
                 CdeDiff, $q, QuickBoard, $log, userResource)
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

    $scope.canCurate = false;

    $scope.forkCtrlLoadedPromise =  $q.defer();
    $scope.formsCtrlLoadedPromise = $q.defer();
    $scope.derRulesCtrlLoadedPromise = $q.defer();
    $scope.mltCtrlLoadedPromise = $q.defer();
    $scope.historyCtrlLoadedPromise = $q.defer();

    function setCurrentTab(thisTab) {
        $scope.currentTab = thisTab;
    }

    $scope.switchCommentMode = function(){
        $scope.commentMode = !$scope.commentMode;
    };

    $scope.tabs = {
        general: {
            heading: "General Details",
            includes: ['/cde/public/html/cdeGeneralDetails.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: true
        },
        pvs: {
            heading: "Permissible Values", includes: ['/cde/public/html/valueDomainView.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: true
        },
        naming: {
            heading: "Naming", includes: ['/system/public/html/naming.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                OrgHelpers.deferred.promise.then(function () {
                    $scope.allContexts = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameContexts;
                });
            },
            show: true
        },
        classification: {
            heading: "Classification", includes: ['/system/public/html/elementClassification.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: true
        },
        concepts: {
            heading: "Concepts", includes: ['/cde/public/html/concepts.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        status: {
            heading: "Status", includes: ['/system/public/html/status.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        referenceDocument: {
            heading: "Reference Documents", includes: ['/system/public/html/referenceDocument.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        properties: {
            heading: "Properties", includes: ['/system/public/html/properties.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                OrgHelpers.deferred.promise.then(function () {
                    $scope.allKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
                });
            },
            show: false,
            hideable: true
        },
        ids: {
            heading: "Identifiers", includes: ['/system/public/html/identifiers.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        forms: {
            heading: "Linked Forms", includes: ['/cde/public/html/forms.html'],
            select: function () {
                setCurrentTab();
                $scope.formsCtrlLoadedPromise.promise.then(function() {$scope.$broadcast('loadLinkedForms');});
            },
            show: false,
            hideable: true

        },
        mappingSpecifications: {
            heading: "Mappings", includes: ['/cde/public/html/mappingSpecifications.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        boards: {
            heading: "Boards", includes: ['/cde/public/html/listOfBoards.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        attachments: {
            heading: "Attachments", includes: ['/system/public/html/attachments.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        mlt: {
            heading: "More Like This",
            includes: ['/cde/public/html/deMlt.html'],
            select: function () {
                setCurrentTab();
                $scope.mltCtrlLoadedPromise.promise.then(function() {$scope.$broadcast('loadMlt');});
            },
            show: false,
            hideable: true
        },
        history: {
            heading: "History",
            includes: ['/cde/public/html/cdeHistory.html'],
            select: function () {
                setCurrentTab();
                if ($scope.elt.history && $scope.elt.history.length > 0) {
                    $http.get('/priorcdes/' + $scope.elt._id).success(function (result) {
                        $scope.priorCdes = result.reverse();
                        $scope.priorCdes.splice(0, 0, $scope.elt);
                    });
                }
            },
            show: false,
            hideable: true
        },
        forks: {
            heading: "Forks",
            includes: ['/cde/public/html/forks.html'],
            if: function () {
                return !$scope.elt.isForkOf;
            },
            select: function () {
                setCurrentTab();
                $log.debug("select on forks");
                $scope.forkCtrlLoadedPromise.promise.then(function() {$scope.$broadcast('loadForks');});
            },
            show:false,
            hideable: true
        },
        dataSet: {
            heading: "Dataset",
            includes: ['/cde/public/html/cdeDataset.html'],
            select: function () {
                setCurrentTab();
            },
            show: false,
            hideable: true
        },
        derivationRules: {
            heading: "Score / Derivations",
            includes: ['/cde/public/html/derivationRules.html'],
            select: function () {
                setCurrentTab();
                $scope.derRulesCtrlLoadedPromise.promise.then(function() {$scope.$broadcast('loadDerivationRules');});
            },
            show: false,
            hideable: true
        },
        validRules: {
            heading: "Validation Rules", includes: ['/system/public/html/validRules.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        more: {
            heading: "More...",
            includes: [],
            select: function () {
                $timeout(function () {
                    $scope.tabs.more.show = false;
                    $scope.tabs.more.active = false;
                    $scope.tabs[$scope.currentTab].active = true;
                    Object.keys($scope.tabs).forEach(function(key) {
                        if ($scope.tabs[key].hideable) $scope.tabs[key].show = true;
                    });
                }, 0);
            },
            show: true,
            class: "gray"
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
        $log.debug("loading CDE " + query.tinyId);
        service.get(query, function(de) {
            $log.debug(de);
            $scope.elt = de;
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
            $http.get('/esRecord/' + de.tinyId).success(function (response) {
                $scope.elt.flatMeshSimpleTrees = [];
                if (response._source.flatMeshSimpleTrees) {
                    response._source.flatMeshSimpleTrees.forEach(function (t) {
                        if ($scope.elt.flatMeshSimpleTrees.indexOf(t.split(";").pop()) === -1) $scope.elt.flatMeshSimpleTrees.push(t.split(";").pop());
                    });
                }
            });
        }, function (err) {
            $log.error("Unable to retrieve element.");
            $log.error(err);
            $scope.addAlert("danger", "Sorry, we are unable to retrieve this element.");
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
            .success(function() {
                $scope.addAlert("success", "Notification sent.");
            })
            .error(function() {
                $scope.addAlert("danger", "Unable to notify user. ");
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
            $scope.$broadcast("elementReloaded");
            $scope.addAlert("success", "Saved.");
        }, function() {
            $scope.addAlert("danger", "Unable to save element. This issue has been reported.");
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

    $scope.vsacMappingExists = function() {
        return typeof($scope.elt.dataElementConcept.conceptualDomain) !== "undefined" &&
            typeof($scope.elt.dataElementConcept.conceptualDomain.vsac) !== "undefined";
    };

    $scope.loadValueSet = function() {
        var dec = $scope.elt.dataElementConcept;
        if (dec && dec.conceptualDomain && dec.conceptualDomain.vsac) {
            $scope.vsacValueSet = [];
            $http({method: "GET", url: "/vsacBridge/" + dec.conceptualDomain.vsac.id}).
             error(function(data, status) {
                if (status === 404) {
                   $scope.addAlert("warning", "Invalid VSAC OID");
                   $scope.elt.dataElementConcept.conceptualDomain.vsac.id = "";
                } else {
                   $scope.addAlert("danger", "Error quering VSAC");
                   $scope.elt.dataElementConcept.conceptualDomain.vsac.id = "";
                }
             }).
             success(function(data) {
                if (!data.error && data["ns0:RetrieveValueSetResponse"]) {
                    $scope.elt.dataElementConcept.conceptualDomain.vsac.name = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                    $scope.elt.dataElementConcept.conceptualDomain.vsac.version = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].version;
                    for (var i = 0; i < data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'].length; i++) {
                        $scope.vsacValueSet.push(data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i]['$']);
                    }
                    if ($scope.vsacValueSet.length < 50 || $scope.elt.valueDomain.permissibleValues < 50) {
                        $scope.validatePvWithVsac();
                        $scope.validateVsacWithPv();
                    } else {
                        $scope.showValidateButton = true;
                    }
                    $scope.getPVTypeheadVsacNameList();
                } else {
                    $scope.addAlert("Error: No data retrieved from VSAC.");
                }
             })
             ;
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
        });
    };

    $scope.getPVTypeheadVsacNameList = function() {
        $scope.pVTypeheadVsacNameList =  $scope.vsacValueSet.map(function(obj) {
            return obj.displayName;
        });
    };

    $scope.getPVTypeaheadCodeSystemNameList = function() {
        $http.get("/permissibleValueCodeSystemList").then(function(response) {
            $scope.pVTypeaheadCodeSystemNameList = response.data;
        });
    };

    TourContent.steps = [
        {
            element: "#general_tab"
            , title: "General Details"
            , content: "This section shows an overview of the CDE attributes."
        }
        , {
              element: "#pvs_tab"
              , title: "Permissible Values"
              , placement: "bottom"
              , content: "Click here to see what type of value are allowed by this CDE."
          }
        , {
              element: "#dd_valueType"
              , placement: "top"
              , title: "Value Type"
              , content: "If the value type is 'Value List', then this CDE accepts values from a list. Date, free text, integer are other possibilities. "
          }
        , {
              element: "#naming_tab"
              , title: "Names"
              , placement: "bottom"
              , content: "Any CDE may have multiple names, often given within a particular context."
          }
        , {
              element: "#classification_tab"
              , title: "Classifications"
              , placement: "bottom"
              , content: "Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it."
          }
        , {
              element: "#concepts_tab"
              , title: "Concepts"
              , placement: "bottom"
              , content: "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC."
          }
        , {
              element: "#status_tab"
              , title: "Status"
              , placement: "bottom"
              , content: "This section shows the status of the CDE, and optionally dates and/or administrative status."
        }, {
              element: "#referenceDocument_tab"
              , title: "Reference Document"
              , placement: "bottom"
              , content: "This section contains reference documents for the CDE."
        }, {
              element: "#properties_tab"
              , title: "Properties"
              , placement: "bottom"
              , content: "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process."
          }
        , {
              element: "#ids_tab"
              , title: "Identifiers"
              , placement: "bottom"
              , content: "CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here."
          }
        , {
              element: "#forms_tab"
              , title: "Forms"
              , placement: "bottom"
              , content: "If a the CDE is used in a Form, it will be displayed here. "
          }
        , {
              element: "#mappingSpecifications_tab"
              , title: "Mappings"
              , content: "This section supports mapping of a CDE to external resources such as C-CDA document templates."
              , placement: "bottom"
          }
        , {
              element: "#discussions_tab"
              , title: "Discussions"
              , content: "In this section, registered users are able to post comments on any given CDEs. "
              , placement: "bottom"
          }
        , {
              element: "#boards_tab"
              , title: "Boards"
              , content: "If a CDE is used in a public board, the board will be shown in this section."
              , placement: "bottom"
          }
        , {
              element: "#attachments_tab"
              , title: "Attachments"
              , content: "If a file is attached to a CDE, it can be view or downloaded here."
              , placement: "bottom"
          }
        , {
            element: "#derivationRules_tab"
            , title: "Derivation Rules"
            , content: "Derivation Rules are used to connect CDEs together, for example, in the form of a score."
            , placement: "bottom"
        }
        , {
              element: "#mlt_tab"
              , title: "More Like This"
              , content: "This section lists CDEs that are most similar to the CDE currently viewed."
              , placement: "bottom"
          }
        , {
              element: "#history_tab"
              , title: "History"
              , content: "This section shows all prior states of the CDE."
              , placement: "bottom"
          }
        , {
              element: "#forks_tab"
              , title: "Forks"
              , content: "When a user other than the steward would like to propose a change to an existing CDE, he may create a fork for the CDE. Forked version notifies CDE steward of proposed change.  If steward accepts change, forked CDE will become new CDE."
              , placement: "bottom"
          }

    ];

    $scope.$on("$destroy", function handler() {
        TourContent.stop();
    });


}]);
