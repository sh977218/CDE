angular.module('cdeModule').controller('DEViewCtrl',
    ['$scope', '$routeParams', '$window', '$http', '$timeout', 'DataElement',
        'DataElementTinyId', 'PriorCdes', 'isAllowedModel', 'OrgHelpers', '$rootScope', 'TourContent', 'CdeDiff', '$q', 'QuickBoard',
        function($scope, $routeParams, $window, $http, $timeout, DataElement, DataElementTinyId, PriorCdes,
                 isAllowedModel, OrgHelpers, $rootScope, TourContent, CdeDiff, $q, QuickBoard)
{

    $scope.module = 'cde';
    $scope.baseLink = '#/deview?tinyId=';
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

    $scope.tabs = {
        general: {heading: "General Details"},
        pvs: {heading: "Permissible Values"},
        naming: {heading: "Naming"},
        classification: {heading: "Classification"},
        concepts: {heading: "Concepts"},
        status: {heading: "Status"},
        referenceDocument: {heading: "Reference Document"},
        properties: {heading: "Properties"},
        mappingSpecifications: {heading: "Mappings"},
        ids: {heading: "Identifiers"},
        forms: {heading: "Linked Forms"},
        discussions: {heading: "Discussions"},
        boards: {heading: "Boards"},
        attachments: {heading: "Attachments"},
        mlt: {heading: "More Like This"},
        history: {heading: "History"},
        forks: {heading: "Forks"}
    };
    $scope.resolveCdeLoaded = null;
    $scope.cdeLoadedPromise = $q(function(resolve, reject) {
        $scope.resolveCdeLoaded = resolve;
    });

    $scope.$on('$locationChangeStart', function( event ) {
        if ($scope.elt && $scope.elt.unsaved) {
            var answer = confirm("You have unsaved changes, are you sure you want to leave this page?");
            if (!answer) {
                event.preventDefault();
            }
        }
    });

    $scope.loadPriorCdes = function() {
        PriorCdes.getCdes({cdeId: $scope.elt._id}, function(dataElements) {
            $scope.priorCdes = dataElements;
        });
    };

    $scope.reload = function(route, cb) {
        var service = DataElement;
        var query = {};
        if (route.cdeId) query = {deId: route.cdeId};
        else if (route.tinyId) {
            service = DataElementTinyId;
            query = {tinyId: route.tinyId};
            if (route.version) query.version = route.version;
        }
        service.get(query, function(de) {
            $scope.elt = de;
            $scope.loadValueSet();
            $scope.canLinkPvFunc();
            $scope.loadBoards();
            $scope.getPVTypeaheadCodeSystemNameList();
            $scope.loadPriorCdes();
            if ($scope.elt.forkOf) {
                $http.get('/forkroot/' + $scope.elt.tinyId).then(function(result) {
                    $scope.rootFork = result.data;
                });
            };
            isAllowedModel.setCanCurate($scope);
            isAllowedModel.setDisplayStatusWarning($scope);
            $scope.orgDetailsInfoHtml = OrgHelpers.createOrgDetailedInfoHtml($scope.elt.stewardOrg.name, $rootScope.orgsDetailedInfo);
            $scope.resolveCdeLoaded();
        }, function () {
            $scope.addAlert("danger", "Sorry, we are unable to retrieve this element.");
        });
        if (route.tab) {
            $scope.tabs[route.tab].active = true;
        }
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
            .success(function(result) {
                $scope.addAlert("success", "Notification sent.");
            })
            .error(function(result) {
                $scope.addAlert("danger", "Unable to notify user. ");
            });
    };

    $scope.classificationToFilter = function() {
         if ($scope.elt) {
             return $scope.elt.classification;
         }
    };

    $scope.save = function() {
        $scope.elt.$save({}, function (elt, headers) {
            $scope.elt = elt;
            $scope.loadPriorCdes();
        }, function(resp) {
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
        })
    };

    $scope.allVsacMatch = function () {
        var allVsacMatch = true;
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
            allVsacMatch = allVsacMatch && $scope.vsacValueSet[i].isValid;
        }
        return allVsacMatch;
    };

    $scope.vsacMappingExists = function() {
        return typeof($scope.elt.dataElementConcept.conceptualDomain) !== "undefined"
            && typeof($scope.elt.dataElementConcept.conceptualDomain.vsac) !== "undefined";
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
             success(function(data, status) {
                if (data.error) {

                }
                 else if (data === "") {
                } else {
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
            element: "a:contains('General Details')"
            , title: "General Details"
            , content: "This section shows an overview of the CDE attributes."
        }
        , {
              element: "a:contains('Permissible Values')"
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
              element: "a:contains('Naming')"
              , title: "Names"
              , placement: "bottom"
              , content: "Any CDE may have multiple names, often given within a particular context."
          }
        , {
              element: "#classificationTab"
              , title: "Classifications"
              , placement: "bottom"
              , content: "Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it."
          }
        , {
              element: "a:contains('Concepts')"
              , title: "Concepts"
              , placement: "bottom"
              , content: "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC."
          }
        , {
              element: "a:contains('Status')"
              , title: "Status"
              , placement: "bottom"
              , content: "This section shows the status of the CDE, and optionally dates and/or administrative status."
        }, {
              element: "a:contains('Reference Document')"
              , title: "Reference Document"
              , placement: "bottom"
              , content: "This section contains reference documents for the CDE."
        }, {
              element: "a:contains('Properties')"
              , title: "Properties"
              , placement: "bottom"
              , content: "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process."
          }
        , {
              element: "a:contains('Identifiers')"
              , title: "Identifiers"
              , placement: "bottom"
              , content: "CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here."
          }
        , {
              element: "a:contains('Linked Forms')"
              , title: "Forms"
              , placement: "bottom"
              , content: "If a the CDE is used in a Form, it will be displayed here. "
          }
        , {
              element: "a:contains('Mappings')"
              , title: "Mappings"
              , content: "This section supports mapping of a CDE to external resources such as C-CDA document templates."
              , placement: "bottom"
          }
        , {
              element: "a:contains('Discussions')"
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
              element: "a:contains('Attachments')"
              , title: "Attachments"
              , content: "If a file is attached to a CDE, it can be view or downloaded here."
              , placement: "bottom"
          }
        , {
              element: "a:contains('More Like This')"
              , title: "More Like This"
              , content: "This section lists CDEs that are most similar to the CDE currently viewed."
              , placement: "bottom"
          }
        , {
              element: "a:contains('History')"
              , title: "History"
              , content: "This section shows all prior states of the CDE."
              , placement: "bottom"
          }
        , {
              element: "a:contains('Forks')"
              , title: "Forks"
              , content: "When a user other than the steward would like to propose a change to an existing CDE, he may create a fork for the CDE. Forked version notifies CDE steward of proposed change.  If steward accepts change, forked CDE will become new CDE."
              , placement: "bottom"
          }

    ];

    $scope.$on("$destroy", function handler() {
        TourContent.stop();
    });


}]);
