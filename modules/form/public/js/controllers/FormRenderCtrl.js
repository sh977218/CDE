angular.module('formModule')
.controller('FormRenderCtrl',
    ['$scope', '$http', '$routeParams', '$window',
    function ($scope, $http, $routeParams, $window)
{

    var reload = function(id) {
        $http.get('/form/' + id).then(function(result) {
            $scope.elt = result.data;
            delete $scope.elt.attachments;
            delete $scope.elt.classification;
            delete $scope.elt.comments;
            delete $scope.elt.created;
            delete $scope.elt.createdBy;
            delete $scope.elt.history;
            delete $scope.elt.properties;
            delete $scope.elt.registrationState;
            delete $scope.elt.stewardOrg;
        });
    };


    if ($routeParams.id) {
        reload($routeParams);
    } 
    
    $scope.addSection = function(section, formElements, index) {
        var newElt =  JSON.parse(JSON.stringify(section));
        newElt.isCopy = true;
        formElements.splice(index + 1, 0, newElt);
    };

    $scope.removeSection = function(index) {
        $scope.elt.formElements.splice(index, 1);
    };

    $scope.canRepeat = function(formElt) {
        return formElt.cardinality === '*' || formElt.cardinality === '+';
    };

    $scope.isIe = function() {
        var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /MSIE/i};
        return browsers['ie'].test($window.navigator.userAgent);
    };

    var stripFieldsOut = function(elt) {
        delete elt.cardinality;
        delete elt.$$hashKey;
        if (elt.elementType === 'section') {
            delete elt.question;
        }
        if (elt.question) {
            delete elt.question.answers;
            delete elt.question.uoms;
            delete elt.question.required;
            delete elt.question.datatype;
            if (elt.question.cde) {
                delete elt.question.cde.permissibleValues;
            }
            if (elt.question.otherPleaseSpecify) {
                if (!elt.question.otherPleaseSpecify.value) {
                    delete elt.question.otherPleaseSpecify;
                } else {
                    delete elt.question.otherPleaseSpecify.value;
                }
            }
        }
        if (elt.formElements) {
            for (var i = 0; i < elt.formElements.length; i++) {
                stripFieldsOut(elt.formElements[i]);
            }
        }
    };


    $scope.exportStr = function() {
        if (!$scope.isIe()) {
            var formData = JSON.parse(JSON.stringify($scope.elt));
            if (formData.formElements) {
                for (var i = 0; i < formData.formElements.length; i++) {
                    stripFieldsOut(formData.formElements[i]);
                }
            }
            $scope.encodedStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
        } else {
            alert("For security reasons, this feature is not supported in IE. ");
            $scope.encodedStr = '/';
        }
    };

    $scope.evaluateSkipLogic = function(rule, formElements) {
        if (!rule) return true;
        if (rule.indexOf("AND")>-1) {
            var firstRule = /.+AND/.exec(rule)[0].slice(0,-4);
            var secondRule = /AND.+/.exec(rule)[0].substr(4,100);
            return $scope.evaluateSkipLogic(firstRule, formElements) && $scope.evaluateSkipLogic(secondRule, formElements);
        }
        if (rule.indexOf("OR")>-1) {
            var firstRule = /.+OR/.exec(rule)[0].slice(0,-3);
            var secondRule = /OR.+/.exec(rule)[0].substr(3,100);
            return $scope.evaluateSkipLogic(firstRule, formElements) || $scope.evaluateSkipLogic(secondRule, formElements);
        }
        var question = /^"[^""]+"/.exec(rule)[0].substr(1,100).slice(0,-1);
        var operator = /=|<|>/.exec(rule)[0];
        var expectedAnswer = /"[^""]+"$/.exec(rule)[0].substr(1,100).slice(0,-1);
        var realAnswer = formElements.filter(function(element) {
            if (element.elementType !== 'question') return;
            if (element.label !== question) return;
            return true;
        })[0].question.answer;
        if (operator === '=') return realAnswer === expectedAnswer;
        if (operator === '<') return parseInt(realAnswer) < parseInt(expectedAnswer);
        if (operator === '>') return parseInt(realAnswer) > parseInt(expectedAnswer);
    };

}]);