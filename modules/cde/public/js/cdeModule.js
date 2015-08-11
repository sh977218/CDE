angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute'])
.config(function($routeProvider) {
    $routeProvider.
        when('/cde/search', {controller: 'DEListCtrl', templateUrl: '/system/public/html/list.html', reloadOnSearch: false}).
        when('/quickBoard', {controller: 'QuickBoardCtrl', templateUrl: '/cde/public/html/quickBoard.html'}).
        when('/sdcview', {controller: 'SDCViewCtrl', templateUrl: '/cde/public/html/sdcView.html'}).
        when('/boardExport/:boardId', {controller: 'ExportCtrl', templateUrl: '/cde/public/html/boardExport.html'}).
        when('/cdeSearchExport', {controller: 'DEListCtrl', templateUrl: '/cde/public/html/exportCdeSearch.html'}).
        when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/cde/public/html/myBoards.html'}).
        when('/board/:boardId', {controller: 'BoardViewCtrl', templateUrl: '/cde/public/html/board.html'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/cde/public/html/boardList.html'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/cde/public/html/createCde.html'}).
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html'}).
        when('/stats', {controller: 'MainCtrl', templateUrl: '/system/public/html/stats.html'});
    });