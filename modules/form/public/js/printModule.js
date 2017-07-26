import * as authShared from "../../../system/shared/authorizationShared";
import * as formShared from "../../../form/shared/formShared";

angular.module("printModule", ['systemModule', 'cdeModule', 'formModule'])

.controller('PrintCtrl',
        ['$scope', '$http', '$q', 'userResource', 'isAllowedModel', '$location', 'AlertService',
function ($scope, $http, $q, userResource, isAllowedModel, $location, Alert) {
    function fetchWholeForm(form, callback) {
        var maxDepth = 8;
        var depth = 0;
        var loopFormElements = function (form, cb) {
            depth++;
            if (form.formElements) {
                async.forEach(form.formElements, function (fe, doneOne) {
                    if (fe.elementType === 'form') {
                        if (depth < maxDepth) {
                            $http.get('/form/' + fe.inForm.form.tinyId + '/version/' + fe.inForm.form.version)
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
                        loopFormElements(fe, doneOne);
                    } else {
                        if (fe.question.cde.derivationRules)
                            fe.question.cde.derivationRules.forEach(function (derRule) {
                                delete fe.incompleteRule;
                                if (derRule.ruleType === 'score') {
                                    fe.question.isScore = true;
                                    fe.question.scoreFormula = derRule.formula;
                                    $scope.inScoreCdes = derRule.inputs;
                                }
                            });
                        doneOne();
                    }
                }, cb);
            }
            else cb();
        };
        loopFormElements(form, function () {
            callback(form);
        });
    }
    $scope.deferredEltLoaded = $q.defer();

    var args = $location.search();
    var _id = args.tinyId?args.tinyId:args._id + "";
    var profileSelected = args.profile;
    var defaultProfile = args.defaultProfile;
    var overrideDisplayType = args.displayType;
    $scope.selectedProfile = args.selectedProfile;
    $scope.submitForm = args.submit;

    var _getElt;
    if (window.formElt) {
        _getElt = function (id, cb) {
            cb(window.formElt);
        }
    } else {
        _getElt = function(id, cb) {
            $http.get("/formById/" + id).then(function (res) {
                cb(res.data);
            }, function () {
                cb()
            });
        }
    }

    _getElt(_id , function (form) {
        var formCopy = angular.copy(form);
        fetchWholeForm(formCopy, function (wholeForm) {
            $scope.elt = wholeForm;
            if (authShared.hasRole(userResource.user, "FormEditor")) {
                isAllowedModel.setCanCurate($scope);
            }
            $scope.formCdeIds = formShared.getFormCdes($scope.elt).map(function (c) {
                return c.tinyId;
            });
            isAllowedModel.setDisplayStatusWarning($scope);

            $scope.formElements = [];
            $scope.formElement = wholeForm;
            $scope.deferredEltLoaded.resolve();
        });
    }, function () {
        Alert.addAlert("danger", "Sorry, we are unable to retrieve this element.");
    });
}]);

