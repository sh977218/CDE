angular.module('cdeModule').controller('DEListCtrl',
    ['$scope', '$controller', '$http', '$uibModal', 'TourContent', 'userResource', '$timeout', 'QuickBoard', 'PinModal',
    function ($scope, $controller, $http, $modal, TourContent, userResource, $timeout, QuickBoard, PinModal) {
        $scope.module = "cde";
        $scope.quickBoard = QuickBoard;

            $scope.exporters.csv = {id: "csvExport", display: "CSV Export"};

            $scope.includeInAccordion = [
                "/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"
            ];

            $timeout(function () {
                $scope.search("cde");
            }, 0);

            $scope.PinModal = PinModal.new('cde');
        }]);
