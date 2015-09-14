angular.module('systemModule').controller('AccordionCtrl', ['$scope', '$location', '$window', function ($scope, $location, $window) {

    $scope.interruptEvent = function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    $scope.view = function (elt, event) {
        $scope.interruptEvent(event);

        if ($scope.module === 'cde') {
            $location.url("deview?tinyId=" + elt.tinyId);
        } else if ($scope.module === 'form') {
            $location.url("formView?tinyId=" + elt.tinyId);
        }
    };

    $scope.viewNewTab = function (elt, event) {
        $scope.interruptEvent(event);

        if ($scope.module === 'cde') {
            $window.open("/#/deview?tinyId=" + elt.tinyId);
        } else if ($scope.module === 'form') {
            $window.open("/#/formView?tinyId=" + elt.tinyId);
        }
    };


    $scope.accordionIconAction = function (elt, action, event) {
        $scope.interruptEvent(event);
        switch (action) {
            case "openPinModal":
                $scope.openPinModal(elt);
                break;
            case "quickBoard.add":
                $scope.quickBoard.add(elt);
                break;
        }
    };


    $scope.findQuestions = function (fe) {
        var n = 0;
        if (fe.formElements != undefined) {
            for (var i = 0; i < fe.formElements.length; i++) {
                var thisfe = fe.formElements[i];
                if (thisfe.elementType) {
                    if (thisfe.elementType === 'question') {
                        n++;
                    }
                    else {
                        n = $scope.findQuestions(thisfe);
                    }
                }
            }
        }
        return n;
    }
    $scope.form.numQuestions = $scope.findQuestions($scope.form);

}
])
;