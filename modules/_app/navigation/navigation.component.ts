import { HttpClient } from '@angular/common/http';
import {
    ApplicationRef,
    Component, ComponentFactoryResolver, EmbeddedViewRef, EventEmitter, forwardRef, Inject, Injector, Output, ViewChild
} from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { LoginService } from '_app/login.service';
import '_app/navigation/navigation.global.scss';
import { NotificationService } from '_app/notifications/notification.service';
import { NotificationDrawerPaneComponent } from '_app/notifications/notificationDrawerPane.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { Feedback } from 'ngx-feedback2/entity/feedback';
import { interruptEvent } from 'non-core/browser';
import { isOrgAuthority, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();
    feedbackDescription = `Describe your issue here. Please include a way to contact you, it will help us troubleshoot the issue. `;
    interruptEvent = interruptEvent;
    isOrgAuthority = isOrgAuthority;
    isOrgCurator = isOrgCurator;
    isSiteAdmin = isSiteAdmin;
    SECTIONS = SECTIONS;
    sectionActive: SECTIONS = SECTIONS.home;

    constructor(
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => ApplicationRef)) private appRef: ApplicationRef,
        @Inject(forwardRef(() => ComponentFactoryResolver)) private componentFactoryResolver: ComponentFactoryResolver,
        @Inject(forwardRef(() => Injector)) private injector: Injector,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => LoginService)) public loginSvc: LoginService,
        @Inject(forwardRef(() => NotificationService)) public notificationService: NotificationService,
        @Inject(forwardRef(() => QuickBoardListService)) public quickBoardService: QuickBoardListService,
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => UserService)) public userService: UserService,
    ) {
        // create drawer
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(NotificationDrawerPaneComponent)
            .create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.sectionActive = getWebsiteSection(window.location.pathname);
            }
        });
    }

    quickBoardMetaInfo() {
        return `Quick Board (${this.quickBoardService.numberDataElements + this.quickBoardService.numberForms})`;
    }

    checkNotificationDrawer() {
        if (this.notificationService.drawer() && !this.notificationService.drawerMouseOver) {
            this.notificationService.drawerClose();
        }
    }

    toggleDrawer = () => (document.querySelector('.mdl-layout') as any).MaterialLayout.toggleDrawer();

    onFeedback(event: Feedback) {
        this.http.post('/server/log/feedback/report', {
            feedback: {
                description: event.description,
                screenshot: event.screenshot,
                userAgent: window.navigator.userAgent
            },
        }).subscribe(() =>
            this.alert.addAlert('success', 'Thank you for your feedback'));
    }
}

const SECTION_LIST: readonly string[] = Object.freeze([
    // home
    '/home',
    '/404',
    // de
    '/cde/search',
    '/deView',
    // form
    '/form/search',
    '/formView',
    // create
    '/createCde',
    '/createForm',
    // board
    '/quickBoard',
    '/board',
    '/boardList',
    '/myBoards',
    // api
    '/api',
    // help
    '/videos',
    '/guides',
    '/whatsNew',
    '/resources',
    '/contactUs',
    // search settings
    '/searchPreferences',
    // user
    '/login',
    '/settings/profile',
    '/settings/notification',
    '/settings/viewingHistory',
    '/settings/publishedForms',
    '/settings/myDrafts',
    '/settings/myOrgDrafts',
    '/settings/allDrafts',
    '/settings/myComments',
    '/settings/myOrgComments',
    '/settings/allComments',
    '/settings/orgAdmin',
    '/settings/orgCurator',
    '/settings/orgsEdit',
    '/settings/tagsManagement',
    '/settings/propertiesManagement',
    '/settings/statusValidationRules',
    '/settings/stewardOrgTransfer',
    '/settings/users',
    '/settings/articles',
    '/settings/resources',
    '/settings/siteAdmins',
    '/settings/serverStatus',
    '/settings/fhirApps',
    '/settings/idSources',
    '/classificationManagement',
    '/siteAudit',
]);

enum SECTIONS { // one more than last index
    home = 2,
    de  = 4,
    form = 6,
    create  = 8,
    board = 12,
    api = 13,
    help = 18,
    searchSettings = 19,
    user = 46,
}

function getWebsiteSection(path: string): SECTIONS {
    if (!path) {
        return SECTIONS.home;
    }
    const index = SECTION_LIST.indexOf(path);
    if (index < 0) {
        return SECTIONS.home;
    }
    if (index < SECTIONS.home) {
        return SECTIONS.home;
    }
    if (index < SECTIONS.de) {
        return SECTIONS.de;
    }
    if (index < SECTIONS.form) {
        return SECTIONS.form;
    }
    if (index < SECTIONS.create) {
        return SECTIONS.create;
    }
    if (index < SECTIONS.board) {
        return SECTIONS.board;
    }
    if (index < SECTIONS.api) {
        return SECTIONS.api;
    }
    if (index < SECTIONS.help) {
        return SECTIONS.help;
    }
    if (index < SECTIONS.searchSettings) {
        return SECTIONS.searchSettings;
    }
    return SECTIONS.user;
}
