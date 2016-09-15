angular.module('formModule').controller
('FormViewCtrl', ['$scope', '$routeParams', 'Form', 'isAllowedModel', '$uibModal', 'BulkClassification', '$http', '$timeout', 'userResource', '$log', '$q', 'ElasticBoard', 'OrgHelpers',
    function ($scope, $routeParams, Form, isAllowedModel, $modal, BulkClassification, $http, $timeout, userResource, $log, $q, ElasticBoard, OrgHelpers) {
    $scope.module = "form";
    $scope.baseLink = 'formView?tinyId=';
    $scope.addCdeMode = false;
    $scope.openCdeInNewTab = true;
    $scope.classifSubEltPage = '/system/public/html/classif-sub-elements.html';
    $scope.formLocalRender = window.formLocalRender;
    $scope.formLoincRender = window.formLoincRender;
    $scope.formLoincRenderUrl = window.formLoincRenderUrl;

    $scope.formHistoryCtrlLoadedPromise = $q.defer();

    var converter = new LFormsConverter(); // jshint ignore:line

    $scope.lfOptions = {showCodingInstruction: true};

    $scope.setRenderFormat = function (format) {
        $scope.renderWith = format;
    };

    function setCurrentTab(thisTab) {
        $scope.currentTab = thisTab;
    }

    $scope.tabs = {
        general: {
            heading: "General Details",
            includes: ['/form/public/html/formGeneralDetail.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: true
        },
        description: {
            heading: "Form Description",
            includes: ['/form/public/html/formDescription.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                $scope.nbOfEltsLimit = 5;
            },
            show: true
        },
        naming: {
            heading: "Naming",
            includes: ['/system/public/html/naming.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                $scope.allContexts = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameContexts;
            },
            show: true
        },
        classification: {
            heading: "Classification",
            includes: ['/form/public/html/formClassification.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: true
        },
        cdeList: {
            heading: "CDE List",
            includes: ['/form/public/html/cdeList.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                console.log("CDE LIST Selected");
                $timeout($scope.$broadcast('loadFormCdes'), 0);
            },
            show: false,
            hideable: true
        },
        displayProfiles: {
            heading: "Display Profiles",
            includes: ['/form/public/html/displayProfiles.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        status: {
            heading: "Status",
            includes: ['/system/public/html/status.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        referenceDocument: {
            heading: "Reference Documents",
            includes: ['/system/public/html/referenceDocument.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        properties: {
            heading: "Properties",
            includes: ['/system/public/html/properties.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
                $scope.allKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
            },
            show: false,
            hideable: true
        },
        ids: {
            heading: "Identifiers",
            includes: ['/system/public/html/identifiers.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        discussions: {
            heading: "Discussions",
            includes: ['/system/public/html/comments.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        boards: {
            heading: "Boards",
            includes: [], select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        attachments: {
            heading: "Attachments",
            includes: ['/system/public/html/attachments.html'],
            select: function (thisTab) {
                setCurrentTab(thisTab);
            },
            show: false,
            hideable: true
        },
        history: {
            heading: "History",
            includes: ['/form/public/html/formHistory.html'],
            select: function () {
                setCurrentTab();
                $scope.formHistoryCtrlLoadedPromise.promise.then(function() {$scope.$broadcast('loadPriorForms');});
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
                    Object.keys($scope.tabs).forEach(function (key) {
                        if ($scope.tabs[key].hideable) $scope.tabs[key].show = true;
                    });
                }, 0);
            },
            show: true,
            class: "gray"
        }
    };

    $scope.setToAddCdeMode = function () {
        $scope.addCdeMode = true;
    };

    $scope.setToNoneAddCdeMode = function () {
        $scope.addCdeMode = false;
    };

    var route = $routeParams;

    $scope.resultPerPage = 10;

    var query;
    if (route._id) query = {formId: route._id, type: '_id'};
    if (route.formId) query = {formId: route.formId, type: '_id'};
    if (route.tinyId) query = {formId: route.tinyId, type: 'tinyId'};

    $scope.formPreviewRendered = false;
    $scope.renderPreview = function () {
        $scope.formPreviewRendered = true;
        $scope.formPreviewLoading = true;
        converter.convert('wholeForm/' + $scope.elt.tinyId, function (lfData) {
                $scope.lfData = new LFormsData(lfData); //jshint ignore:line
                $scope.$apply($scope.lfData);
                $scope.formPreviewLoading = false;
            },
            function (err) {
                $scope.error = err;
            });
    };

    $scope.raiseLimit = function() {
        if ($scope.formCdeIds) {
            if ($scope.nbOfEltsLimit < $scope.formCdeIds.length) {
                $scope.nbOfEltsLimit += 5;
            }
        }
    };

    function fetchWholeForm(form, callback) {
        var maxDepth = 8;
        var depth = 0;
        var loopFormElements = function (form, cb) {
            if (form.formElements) {
                async.forEach(form.formElements, function (fe, doneOne) { // jshint ignore:line
                    if (fe.elementType === 'form') {
                        depth++;
                        if (depth < maxDepth) {
                            $http.get('/formByTinyIdAndVersion/' + fe.inForm.form.tinyId + '/' + fe.inForm.form.version).then(function (result) {
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
                    } else {
                        doneOne();
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

    $scope.reload = function () {
        Form.get(query, function (form) {
            var formCopy = angular.copy(form);
            fetchWholeForm(formCopy, function (wholeForm) {
                $scope.elt = wholeForm;
                if (exports.hasRole(userResource.user, "FormEditor")) {
                    isAllowedModel.setCanCurate($scope);
                }
                $scope.formCdeIds = exports.getFormCdes($scope.elt).map(function (c) {
                    return c.tinyId;
                });
                isAllowedModel.setDisplayStatusWarning($scope);
                areDerivationRulesSatisfied();
                //setDefaultValues();
                if ($scope.formCdeIds.length < 21) $scope.renderPreview();

                if (route.tab) {
                    $scope.tabs.more.select();
                    $timeout(function () {
                        $scope.tabs[route.tab].active = true;
                    }, 0);
                }
                $scope.$broadcast("elementReloaded");
            });
        }, function () {
            $scope.addAlert("danger", "Sorry, we are unable to retrieve this element.");
        });
    };

    $scope.switchEditQuestionsMode = function () {
        $scope.addCdeMode = !$scope.addCdeMode;

        if ($scope.addCdeMode) {
            $scope.setToAddCdeMode();
        } else {
            $scope.setToNoneAddCdeMode();
        }
    };

    $scope.revert = function () {
        $scope.reload();
    };

    $scope.stageElt = function () {
        areDerivationRulesSatisfied();
        $scope.elt.unsaved = true;
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
        });

    };

    $scope.updateSkipLogic = function (section) {
        if (!section.skipLogic) return;
        section.skipLogic.condition = "'" + section.skipLogic.condition1 + "' = '" + section.skipLogic.condition3 + "'";
        $scope.stageElt();
    };

    var tokenSplitter = function (str) {
        var tokens = [];
        if (!str) {
            tokens.unmatched = str;
            return tokens;
        }
        str = str.trim();
        var res = str.match(/^"([^"]+)"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        var t = res[0];
        str = str.substring(t.length).trim();
        t = t.substring(1, t.length - 1);
        tokens.push(t);
        res = str.match(/^=/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        tokens.push(t);
        str = str.substring(t.length).trim();
        res = str.match(/^".+"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        t = t.substring(1, t.length - 1);
        tokens.push(t);

        tokens.unmatched = str;
        return tokens;
    };

    $scope.getCurrentOptions = function (currentContent, previousQuestions, thisQuestion) {
        var filterFunc = function (e1) {
            return e1.toLowerCase().indexOf(tokens.unmatched.toLowerCase()) > -1 &&
                (!thisQuestion || e1.trim().toLowerCase().replace(/"/g, "") !== thisQuestion.label.trim().toLowerCase().replace(/"/g, ""));
        };
        var tokens = tokenSplitter(currentContent);
        if (tokens.length === 0) return $scope.languageOptions("question", previousQuestions).filter(filterFunc);
        if (tokens.length === 1) return $scope.languageOptions("operator", previousQuestions).map(function (e1) {
            return currentContent + " " + e1;
        });
        if (tokens.length === 2) return $scope.languageOptions("answer", previousQuestions, null, tokens[0]).filter(filterFunc).map(function (e1) {
            return "\"" + tokens[0] + "\" " + tokens[1] + " " + e1;
        });
        $scope.skipLogicError = 'has error';
    };


    $scope.languageOptions = function (languageMode, previousLevel, index, questionName) {
        if (!previousLevel) return;
        if (languageMode === 'question') return previousLevel.filter(function (q, i) {
            //Will assemble a list of questions
            if (i === index) return false; //Exclude myself
            if (q.elementType !== "question") return false; //This element is not a question, ignore
            if (q.question.datatype !== 'Number' && (!q.question.answers || q.question.answers.length === 0)) return false; //This question has no permissible answers, ignore
            return true;
        }).map(function (q) {
            return '"' + q.label + '" ';
        });
        if (languageMode === 'operator') return ["= ", "< ", "> "];
        if (languageMode === 'answer') {
            var questions = previousLevel.filter(function (q) {
                if (q.label && questionName)
                    return q.label.trim() === questionName.trim();
            });
            if (questions.length <= 0) return [];
            var question = questions[0];
            if (question.question.datatype === 'Number') {
                return [];
            }
            else if (question.question.datatype === 'Value List') {
                var answers = question.question.answers;
                return answers.map(function (a) {
                    return '"' + a.permissibleValue + '"';
                });
            } else return [];
        }
        if (languageMode === 'conjuction') return ["AND", "OR"];
        return [];
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
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/cde/public/html/selectBoardModal.html',
            controller: 'SelectBoardModalCtrl',
            resolve: {
                boards: function () {
                    return $scope.boards;
                }
            }
        });

        modalInstance.result.then(function (selectedBoard) {
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
            $http.post('/pinFormCdes', data).success(function () {
                $scope.addAlert("success", "All elements pinned.");
                ElasticBoard.loadMyBoards(filter);
            }).error(function () {
                $scope.addAlert("danger", "Not all elements were not pinned!");
            });
        }, function () {
        });
    };

    $scope.reload();

    $scope.save = function () {
        $log.debug("Saving Form.");
        $scope.elt.$save({}, function () {
            $scope.reload();
            $log.debug("Form saved");
            $scope.addAlert("success", "Saved.");
        }, function (err) {
            $log.error("Unable to save form. " + $scope.elt.tinyId);
            $log.error(JSON.stringify(err));
            $scope.addAlert("danger", "Unable to save element. This issue has been reported.");
        });
    };

    $scope.dragSortableOptions = {
        handle: ".fa.fa-arrows"
    };

}]);