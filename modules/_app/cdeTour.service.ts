import { Injectable } from '@angular/core';
import { TourService } from 'ngx-ui-tour-md-menu';

const navigationSteps: Array<any> = [
    {
        title: 'Welcome',
        anchorId: 'tour-tip',
        content:
            'Welcome to the NIH CDE Repository. This tour will guide you through the application. If you close this tour, you can restart it here. Tip: You can navigate this tour with keyboard arrows.',
    },
    {
        title: 'CDEs',
        anchorId: 'menu_cdes_link',
        content: 'Click here to start browsing CDEs.',
    },
    {
        title: 'Forms',
        anchorId: 'menu_forms_link',
        content: 'Or here to browse forms.',
    },
    {
        title: 'Boards',
        anchorId: 'myBoardsLink',
        content:
            'Boards allow registered users to group CDEs or Forms. Boards can be private or public. Boards are persistent and will' +
            ' not disappear unless you remove them. The quick board is a volatile board that can be used for temporarily storing CDEs and' +
            ' forms. You can also use the quick board to compare CDEs and Forms.',
    },
    {
        title: 'Help',
        anchorId: 'helpLink',
        content:
            'You can find more help about the site here, or information on our APIs. The tour will now take you to the CDE search' +
            ' page.',
    },
];

const searchResultSteps: Array<any> = [
    {
        title: 'Browse by Organization',
        anchorId: 'search_by_classification_AECC',
        content:
            'These boxes represent classifications. Clicking NLM will browse all CDEs classified by NLM.',
        route: 'cde/search',
        isAsync: true,
    },
    {
        title: 'Search Result',
        anchorId: 'resultListTour',
        content:
            'Browsing can return hundreds of anchorIds sorted by relevance.',
        route: '/cde/search?selectedOrg=NLM',
        isAsync: true,
    },
    {
        title: 'Classification Filter',
        anchorId: 'classificationListHolder',
        content: 'We can continue browsing inside the NLM classification here.',
    },
    {
        title: 'Advanced Classification Filter',
        anchorId: 'excludeFilterModeToggle',
        content:
            'These 2 small icons will let us find content that belongs to any 2 classifications, or even find content that is not' +
            ' under a particular classification.',
    },
    {
        title: 'Remove Filters',
        anchorId: 'classif_crumb',
        content: 'Click here to remove a filter',
    },
    {
        title: 'Registration Status',
        anchorId: 'registrationStatusListHolder',
        content:
            'By default, only Qualified and above statuses will be returned. This can be changed in your preferences (the wheel in' +
            ' the upper right corner).',
    },
    {
        title: 'Data Types',
        anchorId: 'datatypeListHolder',
        content:
            'Finally, we can narrow our results down by datatype. For example, only see CDEs that represent a number.',
    },
];

const cdeSteps: Array<any> = [
    {
        title: 'General Details',
        anchorId: 'general_tab',
        content: 'This section shows an overview of the CDE attributes.',
    },
    {
        title: 'Dates',
        anchorId: 'updated',
        content:
            'CDEs may have a date when they were last imported. If they were updated during that import, updated will show that' +
            ' date. Manual changes also show under updated. Created shows the date that the CDE was created in the NLM repository. If' +
            ' they were created or updated in a external repository, this information will show under Source.',
    },
    {
        title: 'More Like This',
        anchorId: 'mltButton',
        content:
            'This section lists CDEs that are most similar to the CDE currently viewed.',
    },
    {
        title: 'Linked Forms',
        anchorId: 'openLinkedFormsModalBtn',
        content: 'If a CDE is used in Forms, they will be displayed here.',
    },
    {
        title: 'Data Sets',
        anchorId: 'openDataSetModalBtn',
        content:
            'CDEs may be used in research. If datasets are public, they can be found here.',
    },
    {
        title: 'Status',
        anchorId: 'registrationStateDiv',
        content:
            'The registration status represents the maturity level of an anchorId, with Standard and Preferred Standard being' +
            ' highest. Only qualified and above are retrieved in search results by default. When anchorIds are first created, they get an' +
            ' incomplete status.',
    },
    {
        title: 'Permissible Values',
        anchorId: 'permissible-values',
        content:
            'This tab will tell us if a CDE is based on a number, text, value list or other datatype.',
    },
    {
        title: 'Names',
        anchorId: 'naming',
        content:
            'Any CDE may have multiple names. Names help identify the CDE and are also used as question labels on forms. A name' +
            ' can have one or more tags to describe the context of this name.',
    },
    {
        title: 'Classifications',
        anchorId: 'classification',
        content:
            'Classifications describe the way in which an organization may use a CDE or Form. A CDE can have hundreds of' +
            ' classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own' +
            ' classification to it.',
    },
    {
        title: 'Concepts',
        anchorId: 'concepts',
        content:
            'CDEs are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.',
    },
    {
        title: 'Reference Document',
        anchorId: 'reference-documents',
        content: 'This section contains reference documents for the CDE.',
    },
    {
        title: 'Properties',
        anchorId: 'properties',
        content:
            'This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that' +
            ' are required for their process.',
    },
    {
        title: 'Identifiers',
        anchorId: 'identifiers',
        content:
            'CDEs and Forms can be identified using multiple identification sources. When a group uses a CDE by a particular unique' +
            ' (scoped) identifier, it may be stored here.',
    },
    {
        title: 'Attachments',
        anchorId: 'attachments',
        content:
            'If a file is attached to a CDE, it can be viewed or downloaded here.',
    },
    {
        title: 'History',
        anchorId: 'history',
        content:
            'This section shows all prior states of the CDE. Each version can be view as it was at a given date. In addition,' +
            ' differences between versions can be highlighted to easily identify changes over time.',
    },
    {
        title: 'Derivation Rules',
        anchorId: 'derivation-rules',
        content:
            'Derivation Rules are used to connect CDEs together, for example, in the form of a score.',
    },
    {
        title: 'Validation Rules',
        anchorId: 'validation-rules',
        content: 'Validation Rules are used to validate CDE. ',
    },
    {
        title: 'Export',
        anchorId: 'export',
        content: 'CDEs can be exported in JSON or XML Format.',
    },
    {
        title: 'Discuss',
        anchorId: 'discussBtn',
        content:
            'With an account, anyone can interactively discuss an anchorId. Users can reply to comment or resolve them.',
    },
];

const formSteps = [
    {
        title: 'Browse by Classification',
        anchorId: 'tour-tip',
        content: 'Forms are also browsed by Classification',
        route: 'form/search',
    },
    {
        title: 'Search Result',
        anchorId: 'resultListTour',
        content: 'We will now go into a form.',
    },
    {
        title: 'General Details',
        anchorId: 'general_tab',
        content:
            'Forms have similar administrative details to CDE. When rendering is allowed, a preview of the form will display in this' +
            ' tab. There are multiple form rending types including: skip logic, printable forms, tables, and hidden questions. More' +
            ' detail about these features can be found on the Display Profiles tab.',
    },
    {
        title: 'Form anchorId',
        anchorId: 'description_tab',
        content:
            'The repository may not have permission to display all forms. If it does details of form questions and sections are' +
            ' displayed in this tab. Form support logic, selecting possible answer values, scores, repeating questions and many more' +
            ' features. ',
    },
    {
        title: 'Export',
        anchorId: 'export',
        content:
            'Forms can be exported when users are logged in. Available formats are JSON, XML, ODM, and RedCAP.',
    },
];

@Injectable()
export class CdeTourService {
    //    steps = navigationSteps.concat(searchResultSteps).concat(cdeSteps).concat(formSteps);
    steps = [
        {
            title: 'Welcome',
            anchorId: 'tour-tip',
            content:
                'Welcome to the NIH CDE Repository. This tour will guide you through the application. If you close this tour, you can restart it here. Tip: You can navigate this tour with keyboard arrows.',
        },
    ];

    constructor(public tourService: TourService) {}

    takeTour() {
        this.tourService.initialize(this.steps);
        this.tourService.start();
    }
}
