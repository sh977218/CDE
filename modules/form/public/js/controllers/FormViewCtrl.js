import * as authShared from "../../../../system/shared/authorizationShared";
import * as formShared from "../../../../form/shared/formShared";

angular.module('formModule').controller
('FormViewCtrl', ['$scope', '$routeParams', 'Form', 'isAllowedModel', '$uibModal', 'BulkClassification',
        '$http', '$timeout', 'userResource', '$log', '$q', 'ElasticBoard', 'OrgHelpers', 'PinModal', 'Alert',
    function ($scope, $routeParams, Form, isAllowedModel, $modal, BulkClassification,
              $http, $timeout, userResource, $log, $q, ElasticBoard, OrgHelpers, PinModal, Alert) {

    $scope.module = "form";
    $scope.baseLink = 'formView?tinyId=';
    $scope.addMode = undefined;
    $scope.openCdeInNewTab = true;
    $scope.classifSubEltPage = '/system/public/html/classif-sub-elements.html';
    $scope.formLoading = true;
    $scope.formLocalRender = window.formLocalRender;
    $scope.formLoincRender = window.formLoincRender;
    $scope.formLoincRenderUrl = window.formLoincRenderUrl;

    $scope.deferredEltLoaded = $q.defer();
    $scope.isFormValid = true;

    $scope.pinModal = PinModal.new('cde');
    $scope.formPinModal = PinModal.new('form');

    $scope.getEltId = function () {return $scope.elt.tinyId;};
    $scope.getEltName = function () {return $scope.elt.naming[0].designation;};
    $scope.getCtrlType = function () {return "form";};
    $scope.doesUserOwnElt = function () {
        return userResource.user.siteAdmin ||
            (userResource.user._id && (userResource.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1)
            );
    };

    $scope.switchCommentMode = function(){
        $scope.commentMode = !$scope.commentMode;
    };

    $scope.lfOptions = {
        showCodingInstruction: true
    };

    $scope.setCurrentTab = function (thisTab) {
        $scope.currentTab = thisTab;
    };
        
    $scope.tabs = {
        general: {
            heading: "General Details",
            includes: ['/form/public/html/formGeneralDetail.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        },
        description: {
            heading: "Form Description",
            includes: ['/form/public/html/formDescription.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
                $scope.nbOfEltsLimit = 1;
            }
        },
        naming: {
            heading: "Naming",
            includes: ['/system/public/html/naming.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
                $scope.allTags = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameTags;
            }
        },
        classification: {
            heading: "Classification",
            includes: ['/system/public/html/classification.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        },
        displayProfiles: {
            heading: "Display Profiles",
            includes: ['/form/public/html/displayProfiles.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        },
        referenceDocument: {
            heading: "Reference Documents",
            includes: ['/system/public/html/referenceDocument.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        },
        properties: {
            heading: "Properties",
            includes: ['/system/public/html/properties.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
                $scope.allKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
            }
        },
        ids: {
            heading: "Identifiers",
            includes: ['/system/public/html/identifiers.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        },
        attachments: {
            heading: "Attachments",
            includes: ['/system/public/html/attachments.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        },
        history: {
            heading: "History",
            includes: ['/form/public/html/formHistory.html'],
            select: function (thisTab) {
                $scope.setCurrentTab(thisTab);
            }
        }
    };

    $scope.setToAddCdeMode = function () {
        $scope.addMode = $scope.addMode === 'cde' ? undefined : 'cde';
    };

    $scope.setToAddFormMode = function () {
        $scope.addMode = $scope.addMode === 'form' ? undefined : 'form';
    };

    $scope.setToNoneAddMode = function () {
        $scope.addMode = undefined;
    };

    var route = $routeParams;

    $scope.resultPerPage = 10;

    var query;
    if (route._id) query = {formId: route._id, type: '_id'};
    if (route.formId) query = {formId: route.formId, type: '_id'};
    if (route.tinyId) query = {formId: route.tinyId, type: 'tinyId'};

    $scope.isIe = function () {
        return [].find === undefined;
    };

    $scope.raiseLimit = function(formElements) {
        if (formElements) {
            if ($scope.nbOfEltsLimit < formElements.length) {
                $scope.nbOfEltsLimit += 1;
            } else {
                $scope.nbOfEltsLimit = Infinity;
            }
        }
    };

    function fetchWholeForm(form, callback) {
        var maxDepth = 8;
        var depth = 0;
        var loopFormElements = function (form, cb) {
            depth++;
            if (form.formElements) {
                async.forEach(form.formElements, function (fe, doneOne) {
                    if (fe.elementType === 'form') {
                        if (depth < maxDepth) {
                            $http.get('/formByTinyIdAndVersion/' + fe.inForm.form.tinyId + '/' + fe.inForm.form.version)
                                .then(function (result) {
                                    fe.formElements = result.data.formElements;
                                    loopFormElements(fe, function () {
                                        depth--;
                                        doneOne();
                                    });
                            });
                        }
                        else doneOne();
                    } else if (fe.elementType === 'section') {
                        loopFormElements(fe, function () {
                            doneOne();
                        });
                    } else if (fe.elementType === 'question') {
                        doneOne();
                    } else {
                        Alert.addAlert("warning", "Unknown formElement.elementType" + fe.elementType);
                    }
                }, function doneAll() {
                    cb();
                });
            }
            else {
                cb();
            }
        };
        loopFormElements(form, function () {
            callback(form);
        });
    }

    var setDefaultAnswer = function (section) {
        section.formElements.forEach(function (fe) {
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                setDefaultAnswer(fe);
            } else if (fe.elementType === 'question'){
                if (fe.question.datatype === 'Number' && !Number.isNaN(fe.question.defaultAnswer)) {
                    fe.question.answer = Number.parseFloat(fe.question.defaultAnswer);
                } else {
                    fe.question.answer = fe.question.defaultAnswer
                }
            }
        });
    };

    $scope.reload = function () {
        $scope.formLoading = true;
        Form.get(query, function (form) {
            var formCopy = angular.copy(form);
            fetchWholeForm(formCopy, function (wholeForm) {
                $scope.elt = wholeForm;
                $scope.elt._changeNote = $scope.elt.changeNote;
                delete $scope.elt.changeNote;
                $scope.formLoading = false;
                userResource.getPromise().then(function () {
                    if (authShared.hasRole(userResource.user, "FormEditor")) {
                        isAllowedModel.setCanCurate($scope);
                    }
                });
                $scope.formCdeIds = formShared.getFormCdes($scope.elt).map(function (c) {
                    return c.tinyId;
                });
                isAllowedModel.setDisplayStatusWarning($scope);
                areDerivationRulesSatisfied();
                //setDefaultValues();
                $scope.deferredEltLoaded.resolve();
                if (route.tab) {
                    $scope.tabs.more.select();
                    $timeout(function () {
                        $scope.tabs[route.tab].active = true;
                    }, 0);
                }
                $scope.formElements = [];
                $scope.formElement = wholeForm;
                $scope.$broadcast('eltReloaded');
                setDefaultAnswer(wholeForm);
            });
        }, function () {
            $scope.addAlert("danger", "Sorry, we are unable to retrieve this element.");
        });
    };

    $scope.revert = function () {
        $scope.reload();
    };

    $scope.stageElt = function () {
        areDerivationRulesSatisfied();
        $scope.validateForm();
        $scope.elt.unsaved = true;
    };

    $scope.setIsValid = function (valid) {
        $scope.isFormValid = valid;
    };

    $scope.cachePut = function (event) {
        $scope.cache.put(event.key, event.value);
    };

    $scope.classificationToFilter = function () {
        if ($scope.elt) {
            return $scope.elt.classification;
        }
    };

    $scope.openAddCdeClassificationModal = function () {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/classifyElt.html',
            controller: 'AddClassificationModalCtrl',
            resolve: {
                module: function () {
                    return $scope.module;
                },
                orgName: function () {
                    return undefined;
                },
                userOrgs: function () {
                    return userResource.userOrgs;
                }
                , cde: function () {
                    return $scope.elt;
                },
                pathArray: function () {
                    return undefined;
                }
                , addClassification: function () {
                    return {
                        addClassification: function (newClassification) {
                            var ids = [];
                            var getChildren = function (element) {
                                if (element.elementType === 'section') {
                                    element.formElements.forEach(function (e) {
                                        getChildren(e);
                                    });
                                } else if (element.elementType === 'question') {
                                    ids.push({
                                        id: element.question.cde.tinyId,
                                        version: element.question.cde.version
                                    });
                                }
                            };
                            $scope.elt.formElements.forEach(function (e) {
                                getChildren(e);
                            });
                            BulkClassification.classifyTinyidList(ids, newClassification, function () {
                                $scope.addAlert("success", "CDEs classified!");
                            });
                        }
                    };
                }
            }
        }).result.then(function () {
        }, function () {
        });

    };

    $scope.missingCdes = [];
    $scope.inScoreCdes = [];
    var areDerivationRulesSatisfied = function () {
        $scope.missingCdes = [];
        $scope.inScoreCdes = [];
        var allCdes = {};
        var allQuestions = [];
        var doFormElement = function (formElt) {
            if (formElt.elementType === 'question') {
                allCdes[formElt.question.cde.tinyId] = formElt.question.cde;
                allQuestions.push(formElt);
            } else if (formElt.elementType === 'section') {
                formElt.formElements.forEach(doFormElement);
            }
        };
        $scope.elt.formElements.forEach(doFormElement);
        allQuestions.forEach(function (quest) {
            if (quest.question.cde.derivationRules)
                quest.question.cde.derivationRules.forEach(function (derRule) {
                    delete quest.incompleteRule;
                    if (derRule.ruleType === 'score') {
                        quest.question.isScore = true;
                        quest.question.scoreFormula = derRule.formula;
                        $scope.inScoreCdes = derRule.inputs;
                    }
                    derRule.inputs.forEach(function (input) {
                        if (!allCdes[input]) {
                            $scope.missingCdes.push({tinyId: input});
                            quest.incompleteRule = true;
                        }
                    });
                });
        });
    };

    $scope.pinAllCdesModal = function () {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/selectBoardModal.html',
            controller: 'SelectBoardModalCtrl',
            resolve: {
                type: function () {
                    return 'cde';
                }
            }
        }).result.then(function (selectedBoard) {
            var filter = {
                reset: function () {
                    this.tags = [];
                    this.sortBy = 'updatedDate';
                    this.sortDirection = 'desc';
                },
                sortBy: '',
                sortDirection: '',
                tags: []
            };
            var data = {
                board: selectedBoard,
                formTinyId: $scope.elt.tinyId
            };
            $http.post('/pinFormCdes', data).then(function onSuccess() {
                $scope.addAlert("success", "All elements pinned.");
                ElasticBoard.loadMyBoards(filter);
            }).catch(function onError() {
                $scope.addAlert("danger", "Not all elements were not pinned!");
            });
        }, function () {
        });
    };

    $scope.reload();

    $scope.save = function () {
        $scope.elt.$save({}, function () {
            $scope.reload();
            $scope.addAlert("success", "Saved.");
        }, function (err) {
            $log.error("Unable to save form. " + $scope.elt.tinyId);
            $log.error(JSON.stringify(err));
            $scope.addAlert("danger", "Unable to save element. This issue has been reported.");
        });
    };

    $scope.validateForm = function () {
        $scope.isFormValid = true;
        var loopFormElements = function (form) {
            if (form.formElements) {
                form.formElements.forEach(function (fe) {
                    if (fe.skipLogic && fe.skipLogic.error) {
                        $scope.isFormValid = false;
                        return;
                    }
                    loopFormElements(fe);
                })
            }
        };
        loopFormElements($scope.elt);
    };

    $scope.copyElt = function() {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/copyModal.html',
            controller: 'FormCopyModalCtrl',
            resolve: {
                elt: function() {return $scope.elt;}
            }
        }).result.then(function () {
        }, function () {
        });
    };

    $scope.preparePublishExport = function () {
        $modal.open({
            animation: false,
            templateUrl: '/form/public/html/publishedFormExportModal.html',
            controller: ['$scope', function($scope) {
                $scope.formInput = {};
            }]
        }).result.then(function (formInput) {
            $http.post("/publishForm", {
                formId: $scope.elt._id,
                publishedFormName: formInput.publishedFormName,
                endpointUrl: formInput.endpointUrl
            }).then(function () {
                Alert.addAlert("info", "Done. Go to your profile to see all your published forms");
            });
        }, function () {
        });
    };

}]);