import { HttpClient } from '@angular/common/http';
import {
    ApplicationRef,
    Component, ComponentFactoryResolver, ElementRef, EmbeddedViewRef, EventEmitter, forwardRef, Inject, Injector, Output, Renderer2
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu'
import { NavigationEnd, Params, Router } from '@angular/router';
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

const NAV_Z_INDEX_STANDARD = '1000';
const NAV_Z_INDEX_ACTIVE = '1050';

type CdeNavMenuItem = ({ label: string } | { labelFn: () => string }) &
    {
        id: string,
        condition?: () => boolean,
    } &
    ({ link: string, queryParams?: Params } | { children: CdeNavMenuItem[] });
type CdeNavMenu = (CdeNavMenuItem & {
    section: SECTIONS,
})[];

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
    barStates: {
        bar: HTMLElement,
        enteredButton?: boolean,
        isMatMenuOpen?: boolean,
        isMatMenu1Open?: boolean,
        isMatMenu2Open?: boolean,
        prevButtonTrigger?: MatMenuTrigger,
    }[] = [];
    isOrgAuthority = isOrgAuthority;
    isOrgCurator = isOrgCurator;
    isSiteAdmin = isSiteAdmin;
    menuList: CdeNavMenu = [
        {
            label: 'CDEs',
            id: 'menu_cdes_link',
            section: SECTIONS.de,
            link: '/cde/search',
        },
        {
            label: 'Forms',
            id: 'menu_forms_link',
            section: SECTIONS.form,
            link: '/form/search',
        },
        {
            label: 'Create',
            id: 'createEltLink',
            section: SECTIONS.create,
            condition: () => isOrgCurator(this.userService.user),
            children: [
                {
                    label: 'CDE',
                    id: 'createCDELink',
                    link: '/createCde',
                },
                {
                    label: 'Form',
                    id: 'createFormLink',
                    link: '/createForm',
                }
            ],
        },
        {
            label: 'Boards',
            id: 'boardsMenu',
            section: SECTIONS.board,
            children: [
                {
                    labelFn: () => `Quick Board (${this.quickBoardService.numberDataElements + this.quickBoardService.numberForms})`,
                    id: 'menu_qb_link',
                    link: '/quickBoard',
                },
                {
                    label: 'Public Boards',
                    id: 'publicBoardsLink',
                    link: '/boardList',
                },
                {
                    label: 'My Boards',
                    id: 'myBoardsLink',
                    condition: () => !!this.userService.user,
                    link: '/myBoards',
                }
            ]
        },
        {
            label: 'API',
            id: 'apiLink',
            section: SECTIONS.api,
            link: '/api',
        },
        {
            label: 'Help',
            id: 'helpLink',
            section: SECTIONS.help,
            children: [
                {
                    label: 'Video Tutorials',
                    id: 'videosLink',
                    link: '/videos',
                },
                {
                    label: 'Guides',
                    id: 'guidesLink',
                    link: '/guides',
                },
                {
                    label: 'New Features',
                    id: 'whatsNewLink',
                    link: '/whatsNew',
                },
                {
                    label: 'Take a Tour',
                    id: 'takeATourLink',
                    link: '/home',
                    queryParams: {tour: 'yes'}
                },
                {
                    label: 'Resources',
                    id: 'resourcesLink',
                    link: '/resources',
                },
                {
                    label: 'Contact Us',
                    id: 'contactUsLink',
                    link: '/contactUs'
                },
                {
                    label: 'Report a Problem',
                    id: '',
                    link: '',
                }
            ],
        }
    ];
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
        @Inject(forwardRef(() => Renderer2)) private ren: Renderer2,
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

    checkNotificationDrawer() {
        if (this.notificationService.drawer() && !this.notificationService.drawerMouseOver) {
            this.notificationService.drawerClose();
        }
    }

    getBarState(bar: HTMLElement) {
        let barState = this.barStates.filter(b => b.bar === bar)[0];
        if (!barState) {
            barState = {bar}
            this.barStates.push(barState);
        }
        return barState;
    }

    menuClickCleanup(bar: HTMLElement, trigger: MatMenuTrigger, button: MatButton, menu: MatMenu) {
        if ((trigger as any).menuOpen) {
            ((menu._allItems.first as any) as {_elementRef: ElementRef<HTMLElement>})._elementRef.nativeElement.blur();
        } else {
            this.unfocusButton(button);
        }
    }

    menuEnter(bar: HTMLElement, trigger: MatMenuTrigger, menu: MatMenu) {
        const barState = this.getBarState(bar);
        setTimeout(() => {
            if (barState.prevButtonTrigger && barState.prevButtonTrigger !== trigger) {
                barState.prevButtonTrigger.closeMenu();
                barState.prevButtonTrigger = trigger;
                bar.style.zIndex = NAV_Z_INDEX_ACTIVE;
                trigger.openMenu();
                ((menu._allItems.first as any) as {_elementRef: ElementRef<HTMLElement>})._elementRef.nativeElement.blur();
                barState.isMatMenuOpen = true;
                setTimeout(() => {
                    barState.isMatMenuOpen = false;
                }, 100);
            } else if (!barState.isMatMenu1Open) {
                barState.enteredButton = true;
                barState.prevButtonTrigger = trigger;
                bar.style.zIndex = NAV_Z_INDEX_ACTIVE;
                trigger.openMenu();
                ((menu._allItems.first as any) as {_elementRef: ElementRef<HTMLElement>})._elementRef.nativeElement.blur();
            } else {
                barState.enteredButton = true;
                barState.prevButtonTrigger = trigger;
            }
        }, 0);
    }

    menuLeave(bar: HTMLElement, trigger: MatMenuTrigger, button: MatButton) {
        const barState = this.getBarState(bar);
        setTimeout(() => {
            if (barState.enteredButton && !barState.isMatMenu1Open) {
                trigger.closeMenu();
                this.unfocusButton(button);
                if (!barState.isMatMenuOpen) {
                    bar.style.zIndex = NAV_Z_INDEX_STANDARD;
                }
            } else if (!barState.isMatMenu1Open) {
                trigger.closeMenu();
                this.unfocusButton(button);
                bar.style.zIndex = NAV_Z_INDEX_STANDARD;
            } else {
                barState.enteredButton = false;
            }
        }, 100);
    }

    menu1Enter(bar: HTMLElement) {
        const barState = this.getBarState(bar);
        barState.isMatMenu1Open = true;
        if (barState.isMatMenu2Open) {
            barState.isMatMenu2Open = false;
        }
    }

    menu1Leave(bar: HTMLElement, trigger: MatMenuTrigger, button: MatButton) {
        const barState = this.getBarState(bar);
        setTimeout(() => {
            if (!barState.isMatMenu2Open && !barState.enteredButton) {
                barState.isMatMenu1Open = false;
                trigger.closeMenu();
                this.unfocusButton(button);
                if (!barState.isMatMenuOpen) {
                    bar.style.zIndex = NAV_Z_INDEX_STANDARD;
                }
            } else {
                barState.isMatMenu1Open = false;
            }
        }, 80);
    }

    menu2Enter(bar: HTMLElement) {
        const barState = this.getBarState(bar);
        barState.isMatMenu2Open = true;
    }

    menu2Leave(bar: HTMLElement, trigger1: MatMenuTrigger, trigger2: MatMenuTrigger, button: MatButton) {
        const barState = this.getBarState(bar);
        setTimeout(() => {
            if (barState.isMatMenu2Open) {
                trigger1.closeMenu();
                barState.isMatMenu1Open = false;
                barState.isMatMenu2Open = false;
                barState.enteredButton = false;
                this.unfocusButton(button);
            } else {
                barState.isMatMenu2Open = false;
                trigger2.closeMenu();
            }
        }, 100);
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

    unfocusButton(button: MatButton) {
        this.ren.removeClass(button._elementRef.nativeElement, 'cdk-focused');
        this.ren.removeClass(button._elementRef.nativeElement, 'cdk-program-focused');
        button._elementRef.nativeElement.blur();
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
    '/formEdit',
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
    form = 7,
    create = 9,
    board = 13,
    api = 14,
    help = 19,
    searchSettings = 20,
    user = 47,
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
