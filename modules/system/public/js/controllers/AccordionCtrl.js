angular.module('systemModule').controller('AccordionCtrl',
    ['$scope', '$location', '$window', 'PinModal', function ($scope, $location, $window, PinModal) {

        $scope.PinModal = PinModal.new($scope.module);

        $scope.interruptEvent = function (event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        $scope.view = function (elt, event) {
            $scope.interruptEvent(event);

            if ($scope.module === 'cde') {
                $location.url("deView?tinyId=" + elt.tinyId);
            } else if ($scope.module === 'form') {
                $location.url("formView?tinyId=" + elt.tinyId);
            }
        };

        $scope.viewNewTab = function (elt, event) {
            $scope.interruptEvent(event);

            if ($scope.module === 'cde') {
                $window.open("/deView?tinyId=" + elt.tinyId);
            } else if ($scope.module === 'form') {
                $window.open("/formView?tinyId=" + elt.tinyId);
            }
        };

        $scope.accordionIconAction = function (elt, action, event) {
            $scope.interruptEvent(event);
            switch (action) {
                case "openPinModal":
                    PinModal.openPinModal(elt);
                    break;
                case "quickBoard.add":
                    $scope.quickBoard.add(elt);
                    break;
            }
        };
    }
    ])
;