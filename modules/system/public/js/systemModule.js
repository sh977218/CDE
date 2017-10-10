angular.module("cdeAppModule", ['systemModule']);

angular.module('systemModule', ['ngSanitize', 'LocalStorageModule'])
    .config(['$logProvider', function ($logProvider) {
        $logProvider.debugEnabled(window.debugEnabled);
    }])
    .config(['$rootScopeProvider', function ($rootScopeProvider) {
        $rootScopeProvider.digestTtl(50);
    }])
    // .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
    //     $locationProvider.html5Mode({enabled: true, requireBase: false});
    //     $routeProvider.when('/', {
    //         redirectTo: function () {
    //             if (!window.loggedIn) return "/home";
    //             return "/cde/search";
    //         }
    //     }).when('/triggerClientException', {
    //         controller:  ['$scope', function() {trigger.error();}],
    //         template: 'An exception in your browser has been triggered.'
    //     });
    // }])
;

angular.module('systemModule').config(["$provide", function ($provide) {
    var previousException;
    var lock = false;
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector',
        function ($delegate, $injector) {
            return function (exception, cause) {
                $delegate(exception, cause);
                if (previousException && exception.toString() === previousException.toString()) return;
                previousException = exception;
                try {
                    if (exception.message.indexOf("[$compile:tpload]") > -1) return;
                    if (!lock) {
                        lock = true;
                        $injector.get('$http').post('/logClientException', {
                            stack: exception.stack,
                            message: exception.message,
                            name: exception.name,
                            url: window.location.href
                        });
                        $injector.get('$timeout')(function () {
                            lock = false;
                        }, 5000);
                    }
                } catch (e) {

                }
            };
        }]);
}]);

