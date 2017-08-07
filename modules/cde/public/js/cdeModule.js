angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute', 'cdeTemplates', 'boardTemplates']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/cde/search', {
            controller: 'ListCtrl',
            subCtrl: 'DEListCtrl',
            templateUrl: '/system/public/html/list.html',
            reloadOnSearch: false,
            title: "Find Common Data Elements",
            keywords: 'cde, common data element, promis, neuro-qol, phenx, ahrq, ninds, repository',
            description: 'Repository of Common Data Elements (CDE). Search CDEs recommended by NIH. See their use in Protocol Forms.'
        }).
        when('/quickBoard', {controller: 'QuickBoardCtrl', templateUrl: '/cde/public/html/quickBoard.html', title: "Quickboard"}).
        when('/sdcview', {controller: ['$scope', '$routeParams', function($scope, $routeParams) {
            $scope.cdeId = $routeParams.cdeId;
        }], template: '<cde-sdc-view [cde-id]="cdeId"></cde-sdc-view>'}).
        when('/cdeSearchExport', {controller: 'DEListCtrl', templateUrl: '/cde/public/html/exportCdeSearch.html'}).
        when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/cde/public/html/myBoards.html'}).
        when('/board/:boardId', {controller: 'SwitchListViewCtrl', templateUrl: '/board/public/html/boardView.html'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/cde/public/html/boardList.html'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/cde/public/html/createCde.html'}).
        when('/deView', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
            keywords: 'cde, common data element, question, detail, value set, description',
            description: "Detailed view of selected Common Data Element (CDE)."}).
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
            keywords: 'cde, common data element, question, detail, value set, description',
            description: "Detailed view of selected Common Data Element (CDE)."}).
        when('/cdeStatusReport', {controller: 'ExportCtrl', templateUrl: '/system/public/html/cdeStatusReport.html'})
        ;
    }]);

// Angular 2 upgraded
angular.module('cdeModule').directive('cdeAccordionList', function () {
    return {
        scope: {cdes: '=', ejsPage: '=', module: '='},
        template: require('../html/cdeAccordionList.html')};
});

import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";

import {BoardCdeSummaryListComponent} from "../components/searchResults/boardCdeSummaryList.component";
angular.module('cdeModule').directive('cdeBoardCdeSummaryList', downgradeComponent({component: BoardCdeSummaryListComponent, inputs: ['board', 'cdes', 'currentPage', 'totalItems'], outputs: ['reload']}));

import {CreateBoardComponent} from "../../../board/public/components/createBoard/createBoard.component";
angular.module('systemModule').directive('cdeCreateBoard', downgradeComponent({component: CreateBoardComponent, inputs: [], outputs: []}));

import {RegistrationValidatorService} from "../components/validationRules/registrationValidator.service";
angular.module('systemModule').factory('RegStatusValidator', downgradeInjectable(RegistrationValidatorService));

import {CdeSummaryListComponent} from "../components/searchResults/cdeSummaryList.component";
angular.module('cdeModule').directive('cdeCdeSummaryList', downgradeComponent({component: CdeSummaryListComponent, inputs: ['cdes'], outputs: []}));

import {CreateDataElementComponent} from "../components/createDataElement.component";
angular.module('cdeModule').directive('cdeCreateDataElement', downgradeComponent({component: CreateDataElementComponent, inputs: ['elt'], outputs: ['cancel','modelChange']}));

import {DataElementViewComponent} from "../components/dataElementView.component";
angular.module('cdeModule').directive('cdeDataElementView', downgradeComponent({component: DataElementViewComponent, inputs: ['elt'], outputs: ['reload','stageElt']}));

import {CdeAccordionListNg2Component} from "../components/cdeAccordionListNg2.component";
angular.module('cdeModule').directive('cdeAccordionListNg2', downgradeComponent({component: CdeAccordionListNg2Component, inputs: ['cdes'], outputs: []}));

import {ValidRulesComponent} from "../components/validationRules/validRules.component";
angular.module('cdeModule').directive('cdeValidRules', downgradeComponent({component: ValidRulesComponent, inputs: ['elt'], ouputs: []}));

import {SdcViewComponent} from "../components/sdcView/sdcView.component"
angular.module('cdeModule').directive('cdeSdcView', downgradeComponent({component: SdcViewComponent, inputs: ['cdeId'], ouputs: []}));

import {CreateFormFromBoardComponent} from "../../../board/public/components/createFormFromBoard.component";
angular.module('systemModule').directive('cdeCreateFormFromBoard', downgradeComponent({component: CreateFormFromBoardComponent, inputs: ['board'], outputs: []}));
