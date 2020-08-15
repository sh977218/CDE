import { Injectable } from '@angular/core';
import '../../node_modules/bootstrap-tour/build/css/bootstrap-tour.css';
import * as Tour from 'bootstrap-tour/build/js/bootstrap-tour-standalone.min.js';
import { Cb } from 'shared/models.model';

type TourStep = any;

const navigationSteps: Array<any> = [
    {
        title: 'Welcome',
        orphan: true,
        content: 'Welcome to the NIH CDE Repository. This tour will guide you through the application. If you close this tour, you can' +
            ' restart it here. Tip: You can navigate this tour with keyboard arrows.'
    },
    {
        title: 'CDEs',
        element: '#menu_cdes_link',
        content: 'Click here to start browsing CDEs.'
    },
    {
        title: 'Forms',
        element: '#menu_forms_link',
        content: 'Or here to browse forms.'
    },
    {
        title: 'Boards',
        element: '#boardsMenu',
        content: 'Boards allow registered users to group CDEs or Forms. Boards can be private or public. Boards are persistent and will' +
            ' not disappear unless you remove them. The quick board is a volatile board that can be used for temporarily storing CDEs and' +
            ' forms. You can also use the quick board to compare CDEs and Forms.'
    },
    {
        title: 'Help',
        element: '#helpLink',
        content: 'You can find more help about the site here, or information on our APIs. The tour will now take you to the CDE search' +
            ' page.',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#menu_cdes_link', 'totalItems', resolve))
    }
];

const searchResultSteps: Array<any> = [
    {
        title: 'Browse by Classification',
        element: '.mat-tab-label:first-child',
        content: 'CDEs or Forms can be browsed by Classifications. Classifications are ways for content owners to organize their CDEs.'
    },
    {
        title: 'Browse by Topic',
        element: '.mat-tab-label:nth-child(2)',
        content: 'Or by topic. Topics are MeSH terms.'
    },
    {
        title: 'Browse by Organization',
        element: '#search_by_classification_NLM',
        content: 'These boxes represent classifications. Clicking NLM will browse all CDEs classified by NLM.',
        placement: 'left',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#browseOrg-NLM', 'resultList', resolve))
    },
    {
        title: 'Search Result',
        element: '#resultListTour',
        content: 'Browsing can return hundreds of elements sorted by relevance.',
        placement: 'top'
    },
    {
        title: 'Classification Filter',
        element: '#classificationListHolder',
        content: 'We can continue browsing inside the NLM classification here.',
        placement: 'top'
    },
    {
        title: 'Advanced Classification Filter',
        element: '#excludeFilterModeToggle',
        content: 'These 2 small icons will let us find content that belongs to any 2 classifications, or even find content that is not' +
            ' under a particular classification.'
    },
    {
        title: 'Remove Filters',
        element: '#classif_crumb',
        content: 'Click here to remove a filter'
    },
    {
        title: 'Registration Status',
        element: '#registrationStatusListHolder',
        content: 'By default, only Qualified and above statuses will be returned. This can be changed in your preferences (the wheel in' +
            ' the upper right corner).'
    },
    {
        title: 'Data Types',
        element: '#datatypeListHolder',
        content: 'Finally, we can narrow our results down by datatype. For example, only see CDEs that represent a number.'
    },
    {
        title: 'Search Result',
        element: '#linkToElt_0',
        content: 'The tour will now take us to an individual record by clicking its name.',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#linkToElt_0',
            'addToQuickBoard', resolve))
    }
];

const cdeSteps: Array<any> = [
    {
        title: 'General Details',
        element: '#general_tab',
        content: 'This section shows an overview of the CDE attributes.',
        placement: 'bottom'
    },
    {
        title: 'Dates',
        element: '#updated',
        content: 'CDEs may have a date when they were last imported. If they were updated during that import, updated will show that' +
            ' date. Manual changes also show under updated. Created shows the date that the CDE was created in the NLM repository. If' +
            ' they were created or updated in a external repository, this information will show under Source.',
        placement: 'bottom'
    },
    {
        title: 'Sources',
        element: '#sources_0',
        content: 'Many elements were imported from external sources. This section can give useful details about the source, such as' +
            ' copyright, status or created date.',
        placement: 'bottom'
    },

    {
        title: 'Linked Boards',
        element: '#openLinkedBoardsModalBtn',
        content: 'If a CDE is used in public boards, the boards will be shown in this section.',
        placement: 'top'
    },
    {
        title: 'More Like This',
        element: '#mltButton',
        content: 'This section lists CDEs that are most similar to the CDE currently viewed.',
        placement: 'top'
    },
    {
        title: 'Linked Forms',
        element: '#openLinkedFormsModalBtn',
        content: 'If a CDE is used in Forms, they will be displayed here.',
        placement: 'top'
    },
    {
        title: 'Data Sets',
        element: '#openDataSetModalBtn',
        content: 'CDEs may be used in research. If datasets are public, they can be found here.',
        placement: 'top'
    },
    {
        title: 'Status',
        element: '#registrationStateDiv',
        content: 'The registration status represents the maturity level of an element, with Standard and Preferred Standard being' +
            ' highest. Only qualified and above are retrieved in search results by default. When elements are first created, they get an' +
            ' incomplete status.',
        placement: 'top',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#pvs_tab',
            'permissibleValueDiv', resolve))
    },
    {
        title: 'Permissible Values',
        element: '#pvs_tab',
        content: 'This tab will tell us if a CDE is based on a number, text, value list or other datatype.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#naming_tab', 'namingDiv', resolve))
    },
    {
        title: 'Names',
        element: '#naming_tab',
        content: 'Any CDE may have multiple names. Names help identify the CDE and are also used as question labels on forms. A name' +
            ' can have one or more tags to describe the context of this name.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#classification_tab',
            'classificationDiv', resolve))
    },
    {
        title: 'Classifications',
        element: '#classification_tab',
        content: 'Classifications describe the way in which an organization may use a CDE or Form. A CDE can have hundreds of' +
            ' classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own' +
            ' classification to it.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#concepts_tab', 'conceptsDiv', resolve))
    },
    {
        title: 'Concepts',
        element: '#concepts_tab',
        content: 'CDEs are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#referenceDocuments_tab',
            'referenceDocumentsDiv', resolve))
    },
    {
        title: 'Reference Document',
        element: '#referenceDocuments_tab',
        content: 'This section contains reference documents for the CDE.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#properties_tab',
            'propertiesDiv', resolve))
    },
    {
        title: 'Properties',
        element: '#properties_tab',
        content: 'This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that' +
            ' are required for their process.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#ids_tab', 'identifiersDiv', resolve))

    },
    {
        title: 'Identifiers',
        element: '#ids_tab',
        content: 'CDEs and Forms can be identified using multiple identification sources. When a group uses a CDE by a particular unique' +
            ' (scoped) identifier, it may be stored here.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#attachments_tab',
            'attachmentsDiv', resolve))
    },
    {
        title: 'Attachments',
        element: '#attachments_tab',
        content: 'If a file is attached to a CDE, it can be viewed or downloaded here.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#history_tab', 'historyDiv', resolve))
    },
    {
        title: 'History',
        element: '#history_tab',
        content: 'This section shows all prior states of the CDE. Each version can be view as it was at a given date. In addition,' +
            ' differences between versions can be highlighted to easily identify changes over time.',
        placement: 'top',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#rules_tab',
            'derivationRulesDiv', resolve))

    },
    {
        title: 'Derivation Rules',
        element: '#rules_tab',
        content: 'Derivation Rules are used to connect CDEs together, for example, in the form of a score.',
        placement: 'bottom',
    },
    {
        title: 'Validation Rules',
        element: '#rules_tab',
        content: 'Validation Rules are used to validate CDE. ',
        placement: 'bottom'
    },
    {
        title: 'Export',
        element: '#export',
        content: 'CDEs can be exported in JSON or XML Format.',
        placement: 'bottom'
    },
    {
        title: 'Discuss',
        element: '#discussBtn',
        content: 'With an account, anyone can interactively discuss an element. Users can reply to comment or resolve them.',
        placement: 'bottom'
    },
    {
        title: 'Forms',
        orphan: true,
        content: 'We will now continue the tour and show Form features.',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#menu_forms_link',
            'totalItems', resolve))
    }
];

const formSteps = [
    {
        title: 'Browse by Classification',
        element: '.mat-tab-label:first-child',
        content: 'Forms are also browsed by Classification',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#browseOrg-NLM', 'resultList', resolve))
    },
    {
        title: 'Search Result',
        element: '#resultListTour',
        content: 'We will now go into a form.',
        placement: 'top',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#linkToElt_0',
            'addToQuickBoard', resolve))
    },
    {
        title: 'General Details',
        element: '#general_tab',
        content: 'Forms have similar administrative details to CDE. When rendering is allowed, a preview of the form will display in this' +
            ' tab. There are multiple form rending types including: skip logic, printable forms, tables, and hidden questions. More' +
            ' detail about these features can be found on the Display Profiles tab.',
        placement: 'bottom',
        onNext: (tour: TourStep) => new Promise((resolve: Cb) => TourService.clickAndGoNext(tour, '#description_tab',
            'addToQuickBoard', resolve))
    },
    {
        title: 'Form Element',
        element: '#description_tab',
        content: 'The repository may not have permission to display all forms. If it does details of form questions and sections are' +
            ' displayed in this tab. Form support logic, selecting possible answer values, scores, repeating questions and many more' +
            ' features. ',
        placement: 'bottom'
    },
    {
        title: 'Export',
        element: '#export',
        content: 'Forms can be exported when users are logged in. Available formats are JSON, XML, ODM, SDC and RedCAP.',
        placement: 'bottom'
    },
    {
        title: 'Thank you',
        orphan: true,
        content: 'Thank you for taking this tour. Consider creating a free UMLS account to get access to the full suite of features this' +
            ' repository has to offer.',
        placement: 'bottom'
    }
];

@Injectable()
export class TourService {
    static steps = navigationSteps.concat(searchResultSteps).concat(cdeSteps).concat(formSteps);

    static clickAndGoNext(tour: TourStep, clickWhat: string, waitForWhat: string, cb: Cb) {
        (document.querySelector(clickWhat) as any).click();
        TourService.waitForEltId(waitForWhat, cb);
    }

    static waitForEltId(eltId: string, cb: Cb) {
        const checkExist = setInterval(() => {
            if (document.getElementById(eltId)) {
                cb();
                clearInterval(checkExist);
            }
        }, 500);
    }

    static takeATour() {
        const tour = new Tour({
            name: 'CDE-Tour',
            storage: false,
            steps: TourService.steps
        });
        tour.init();
        tour.start(true);
    }

}


