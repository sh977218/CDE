angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute', 'cdeTemplates', 'boardTemplates']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/cde/search', {
            controller: 'SearchCtrl',
            reloadOnSearch: false,
            template: '<cde-cde-search [reloads]="searchReloadCount"></cde-cde-search>',
            title: "Find Common Data Elements",
            keywords: 'cde, common data element, promis, neuro-qol, phenx, ahrq, ninds, repository',
            description: 'Repository of Common Data Elements (CDE). Search CDEs recommended by NIH. See their use in Protocol Forms.'
        }).
        when('/cde', {
            redirectTo: '/cde/search'
        }).
        when('/quickBoard', {template: '<cde-quick-board></cde-quick-board>', title: "Quickboard"}).
        when('/sdcview', {controller: ['$scope', '$routeParams', function($scope, $routeParams) {
            $scope.cdeId = $routeParams.cdeId;
        }], template: '<cde-sdc-view [cde-id]="cdeId"></cde-sdc-view>'}).
        when('/myboards', {template: '<cde-my-boards></cde-my-boards>'}).
        when('/board/:boardId', {controller: ['$scope', '$routeParams', function($scope, $routeParams) {
            $scope.boardId = $routeParams.boardId;
        }], template: '<cde-board-view [board-id]="boardId"></cde-board-view>'}).
        when('/boardList', {template: '<cde-public-boards></cde-public-boards>'}).
        when('/createCde', {template:' <cde-create-data-element></cde-create-data-element>'}).
        when('/deView', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
            keywords: 'cde, common data element, question, detail, value set, description',
            description: "Detailed view of selected Common Data Element (CDE)."}).
        when('/deView', {controller: ['$scope', '$routeParams',
            function ($scope, $routeParams) {
                $scope.cbLocChange = function (cb) {
                    $scope.cbMethod = cb;
                };
                $scope.routeParams  = $routeParams;
                $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
                    $scope.cbMethod.fn(event, oldUrl, $scope.cbMethod.elt);
                });
            }], template: '<cde-data-element-view [route-params]="routeParams" (h)="cbLocChange($event)"></cde-data-element-view>'}).
        when('/cdeStatusReport', {controller: ['$scope', '$routeParams',
            function ($scope, $routeParams) {
                $scope.searchSettings  = JSON.parse($routeParams.searchSettings);
            }], template: '<cde-cde-status-report [search-settings]="searchSettings"></cde-cde-status-report>'
        });
    }]);

import {downgradeComponent} from "@angular/upgrade/static";

import {BoardCdeSummaryListComponent} from "../components/listView/boardCdeSummaryList.component";
angular.module('cdeModule').directive('cdeBoardCdeSummaryList',
    downgradeComponent({component: BoardCdeSummaryListComponent, inputs: ['board', 'cdes', 'module', 'currentPage', 'totalItems'], outputs: ['reload']}));

import {CreateBoardComponent} from "../../../board/public/components/createBoard/createBoard.component";
angular.module('systemModule').directive('cdeCreateBoard', downgradeComponent({component: CreateBoardComponent, inputs: [], outputs: []}));

import {QuickBoardComponent} from "../../../quickBoard/public/quickBoard.component";
angular.module('cdeModule').directive('cdeQuickBoard', downgradeComponent({component: QuickBoardComponent, inputs: [], outputs: []}));

import {CreateDataElementComponent} from "../components/createDataElement.component";
angular.module('cdeModule').directive('cdeCreateDataElement', downgradeComponent({component: CreateDataElementComponent, inputs: ['elt'], outputs: ['cancel','modelChange']}));

import {CdeSearchComponent} from "../components/search/cdeSearch.component";
angular.module('systemModule').directive('cdeCdeSearch', downgradeComponent({component: CdeSearchComponent,
    inputs: ['reloads'], outputs: []}));

import {DataElementViewComponent} from "../components/dataElementView.component";
angular.module('cdeModule').directive('cdeDataElementView', downgradeComponent({component: DataElementViewComponent, inputs: ['elt'], outputs: ['reload','stageElt']}));

import {CdeAccordionListNg2Component} from "../components/cdeAccordionListNg2.component";
angular.module('cdeModule').directive('cdeAccordionListNg2', downgradeComponent({component: CdeAccordionListNg2Component, inputs: ['cdes'], outputs: []}));

import {ValidRulesComponent} from "../components/validationRules/validRules.component";
angular.module('cdeModule').directive('cdeValidRules', downgradeComponent({component: ValidRulesComponent, inputs: ['elt'], ouputs: []}));

import {SdcViewComponent} from "../components/sdcView/sdcView.component";
angular.module('cdeModule').directive('cdeSdcView', downgradeComponent({component: SdcViewComponent, inputs: ['cdeId'], ouputs: []}));

import {CreateFormFromBoardComponent} from "../../../board/public/components/createFormFromBoard.component";
angular.module('systemModule').directive('cdeCreateFormFromBoard', downgradeComponent({component: CreateFormFromBoardComponent, inputs: ['board'], outputs: []}));

import { ListViewComponent } from "../../../search/listView/listView.component";
angular.module('cdeModule').directive('cdeListView', downgradeComponent({component: ListViewComponent,
    inputs: ['board', 'currentPage', 'location', 'elts', 'listView', 'module', 'totalItems'], outputs: ['add', 'listViewChange']}));

import { ListViewControlsComponent } from "../../../search/listView/listViewControls.component";
angular.module('cdeModule').directive('cdeListViewControls', downgradeComponent({component: ListViewControlsComponent,
    inputs: ['listView'], outputs: ['listViewChange']}));

import { CdeStatusReportComponent } from "../components/statusReport/cdeStatusReport.component";
angular.module('cdeModule').directive('cdeCdeStatusReport', downgradeComponent({component: CdeStatusReportComponent,
    inputs: ['searchSettings'], outputs: []}));

import { MyBoardsComponent } from "../../../board/public/components/myBoards/myBoards.component";
angular.module('cdeModule').directive('cdeMyBoards', downgradeComponent({component: MyBoardsComponent, inputs: [], ouputs: []}));

import { BoardViewComponent } from "../../../board/public/components/boardView/boardView.component";
angular.module('cdeModule').directive('cdeBoardView', downgradeComponent({component: BoardViewComponent, inputs: ['boardId'], ouputs: []}));
