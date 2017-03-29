angular.module('formModule').controller('FormViewSectionCtrl', ['$scope',
    function ($scope) {
        $scope.nbOfEltsLimit = 5;
        $scope.raiseLimit = function(formElements) {
            if (formElements) {
                if ($scope.nbOfEltsLimit < formElements.length) {
                    $scope.nbOfEltsLimit += 5;
                } else {
                    $scope.nbOfEltsLimit = Infinity;
                }
            }
        };

        $scope.repeatOptions = [
            {label: "", value: ""},
            {label: "Set Number of Times", value: "N"},
            {label: "Over first question", value: "F"}
        ];
        $scope.getRepeatOption = function(section) {
            if (!section.repeat)
                return "";
            if (section.repeat[0] === 'F')
                return 'F';
            else
                return 'N';
        };
        $scope.getRepeatNumber = function(section) {
            return parseInt(section.repeat);
        };
        $scope.setRepeat = function() {
            if ($scope.section.repeatOption === "F")
                $scope.section.repeat = "First Question";
            else if ($scope.section.repeatOption === "N")
                $scope.section.repeat = ($scope.section.repeatNumber ? $scope.section.repeatNumber.toString() : "");
        };
        $scope.getRepeatLabel = function (section) {
            if (section.repeat == null)
                return "";
            if (section.repeat[0] === 'F')
                return "over First Question";
            return parseInt(section.repeat) + " times";
        };
        $scope.section.repeatOption = $scope.getRepeatOption($scope.section);
        $scope.section.repeatNumber = $scope.getRepeatNumber($scope.section);
    }]);
