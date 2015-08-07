angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute'])
.config(function($routeProvider) {
    $routeProvider.
        when('/cde/search', {controller: 'DEListCtrl', templateUrl: '/list', reloadOnSearch: false}).
        when('/quickBoard', {controller: 'QuickBoardCtrl', templateUrl: '/cde/public/html/quickBoard.html'}).
        when('/sdcview', {controller: 'SDCViewCtrl', templateUrl: '/cde/public/html/sdcView.html'}).
        when('/boardExport/:boardId', {controller: 'ExportCtrl', templateUrl: '/cde/public/html/boardExport.html'}).
        when('/cdeSearchExport', {controller: 'DEListCtrl', templateUrl: '/exportCdeSearch'}).
        when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/myboards'}).
        when('/board/:boardId', {controller: 'BoardViewCtrl', templateUrl: '/board'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/boardList'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/createcde'}).
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html'}).
        when('/stats', {controller: 'MainCtrl', templateUrl: '/system/public/html/stats.html'});
    });