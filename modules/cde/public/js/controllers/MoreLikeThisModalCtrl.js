angular.module('cdeModule').controller('MoreLikeThisModalCtrl',
    ['$scope', '$http', '$location', '$log', 'DataElementQuickBoard', 'PinModal',
        function ($scope, $http, $location, $log, QuickBoard, PinModal) {
            $scope.quickBoard = QuickBoard;
            $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"];
            $scope.module = "cde";
            $scope.view = function (cde, event) {
                $scope.interruptEvent(event);
                $location.url("deview?tinyId=" + cde.tinyId);
                $dismiss();
            };
            $scope.PinModal = PinModal.new('cde');
        }]);