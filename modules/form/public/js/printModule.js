var authShared = require('../../../system/shared/authorizationShared');
var formShared = require('../../../form/shared/formShared');

angular.module("printModule", ['systemModule', 'cdeModule', 'formModule', 'articleModule'])

.controller('PrintCtrl',
        ['$scope', '$http', '$q', 'userResource', 'isAllowedModel', '$location', 'Alert',
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
                        loopFormElements(fe, doneOne);
                    } else doneOne();
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
    $scope.submitForm = args.submit;

    if (window.formElt) {
        _getElt = function (id, cb) {
            cb(window.formElt);
        }
    } else {
        _getElt = function(id, cb) {
            $http.get("/form/" + id).then(function (res) {
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
            //setDefaultValues();
            $scope.deferredEltLoaded.resolve();
            $scope.formElements = [];
            $scope.formElement = wholeForm;

            if (profileSelected > 0 && $scope.elt.displayProfiles.length > profileSelected)
                $scope.elt.displayProfiles = $scope.elt.displayProfiles[$scope.displayProfiles];
            if (defaultProfile || $scope.elt.displayProfiles.length === 0)
                $scope.elt.displayProfiles = [{
                    name: "Default Config",
                    displayInstructions: true,
                    displayNumbering: true,
                    sectionsAsMatrix: true,
                    displayType: 'Follow-up',
                    numberOfColumns: 4
                }];
            if ((overrideDisplayType === 'Follow-up' || overrideDisplayType === 'Dynamic') && $scope.elt.displayProfiles[0])
                $scope.elt.displayProfiles[0].displayType = overrideDisplayType;

        });
    }, function () {
        Alert.addAlert("danger", "Sorry, we are unable to retrieve this element.");
    });
}]);

