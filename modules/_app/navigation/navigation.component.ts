import { HttpClient } from '@angular/common/http';
import {
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    forwardRef,
    HostListener,
    Inject,
    Renderer2,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Params, Router } from '@angular/router';
import { CdeAppComponent } from '_app/app.component';
import { NotificationService } from '_app/notifications/notification.service';
import { UserService } from '_app/user.service';
import { interruptEvent } from 'non-core/browser';
import { concat, cumulative, range } from 'shared/array';
import { assertTrue } from 'shared/models.model';
import { canClassify, hasPrivilege, isOrgAuthority, isSiteAdmin } from 'shared/security/authorizationShared';

const NAV_Z_INDEX_STANDARD = '1';
const NAV_Z_INDEX_ACTIVE = '1050';

const enum SECTIONS {
    home,
    de,
    form,
    create,
    board,
    about,
    help,
    searchSettings,
    user,
}

const SECTIONS_MAP: { [key in keyof typeof SECTIONS]: string[] } = {
    home: ['/home', '/404'],
    de: ['/cde/search', '/deView'],
    form: ['/form/search', '/formView', '/formEdit'],
    create: ['/createCde', '/createForm', '/collection'],
    board: ['/quickBoard', '/board', '/boardList', '/myBoards'],
    about: ['/about'],
    help: ['/videos', '/guides', '/whatsNew', '/resources', '/api', '/contactUs'],
    searchSettings: ['/searchPreferences'],
    user: [
        '/login',
        '/settings/profile',
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
        '/settings/orgEditor',
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
        '/settings/idSources',
        '/classificationManagement',
        '/siteAudit',
    ],
};
const [sections, sectionIndexes, sectionLabels] = scanSections(SECTIONS_MAP);

type CdeNavMenuItem = ({ label: string } | { labelFn: () => string }) & {
    id: string;
    condition?: () => boolean;
} & ({ link: string; queryParams?: Params } | { children: CdeNavMenuItem[] });
type CdeNavMenu = (CdeNavMenuItem & {
    section: SECTIONS;
})[];

@Component({
    selector: 'cde-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
    interruptEvent = interruptEvent;
    barStates: {
        bar: HTMLElement;
        enteredButton?: boolean;
        isMatMenuOpen?: boolean;
        isMatMenu1Open?: boolean;
        isMatMenu2Open?: boolean;
        prevButtonTrigger?: MatMenuTrigger;
    }[] = [];
    canClassify = canClassify;
    isOrgAuthority = isOrgAuthority;
    isSiteAdmin = isSiteAdmin;
    isMobile: boolean = window.innerWidth < 768;
    showHeader: boolean = true;
    subMenuActive: Record<string, boolean> = {};
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
            condition: () => hasPrivilege(this.userService.user, 'create'),
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
                },
                {
                    label: 'Collection',
                    id: 'collectionLink',
                    link: '/collection',
                },
            ],
        },
        {
            label: 'My Boards',
            id: 'myBoardsLink',
            section: SECTIONS.board,
            link: '/myBoards',
        },
        {
            label: 'About',
            id: 'aboutLink',
            section: SECTIONS.about,
            link: '/about',
        },
        {
            label: 'Help',
            id: 'helpLink',
            section: SECTIONS.help,
            children: [
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
                    label: 'Resources',
                    id: 'resourcesLink',
                    link: '/resources',
                },
                {
                    label: 'Contact Us',
                    id: 'contactUsLink',
                    link: 'https://support.nlm.nih.gov/?from=https://cde.nlm.nih.gov/',
                },
            ],
        },
        {
            label: 'Sign In',
            id: 'signInLink',
            condition: () => window.innerWidth <= 500 && !this.userService.user,
            section: SECTIONS.user,
            link: '/login',
        },
        {
            labelFn: () => (this.userService.user ? this.userService.user.username : ''),
            id: 'usernameLink',
            condition: () => window.innerWidth <= 500 && !!this.userService.user,
            section: SECTIONS.user,
            children: [
                {
                    labelFn: () => (isSiteAdmin(this.userService.user) ? 'Settings' : 'Profile'),
                    id: 'settingsLink',
                    link: '/settings/profile',
                },
                {
                    label: 'Classifications',
                    id: 'classificationsLink',
                    condition: () => canClassify(this.userService.user),
                    link: '/classificationManagement',
                },
                {
                    label: 'Audit',
                    id: 'auditLink',
                    condition: () => isOrgAuthority(this.userService.user),
                    link: '/siteAudit',
                },
            ],
        },
    ];
    sectionActive: SECTIONS = -1;

    constructor(
        @Inject(forwardRef(() => ApplicationRef))
        private appRef: ApplicationRef,
        @Inject(forwardRef(() => CdeAppComponent)) private app: CdeAppComponent,
        @Inject(forwardRef(() => ComponentFactoryResolver))
        private componentFactoryResolver: ComponentFactoryResolver,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => NotificationService))
        public notificationService: NotificationService,
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => UserService)) public userService: UserService,
        @Inject(forwardRef(() => Renderer2)) private ren: Renderer2
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.sectionActive = getWebsiteSection(
                    window.location.pathname,
                    sections,
                    sectionIndexes,
                    sectionLabels
                );
            }
        });
    }

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    getBarState(bar: HTMLElement) {
        let barState = this.barStates.filter(b => b.bar === bar)[0];
        if (!barState) {
            barState = { bar };
            this.barStates.push(barState);
        }
        return barState;
    }

    isActiveSearchSettings() {
        return this.sectionActive === SECTIONS.searchSettings;
    }

    isActiveUserMenu() {
        return this.sectionActive === SECTIONS.user;
    }

    logout() {
        this.userService.clear();
        this.router.navigate(['/login']);
        this.app.ssoLogout(() => {});
        this.http.post('/server/system/logout', {}, { responseType: 'text' }).subscribe();
    }

    menuClickCleanup(bar: HTMLElement, trigger: MatMenuTrigger, button: MatButton, menu: MatMenu) {
        if ((trigger as any).menuOpen) {
            (
                menu._allItems.first as any as {
                    _elementRef: ElementRef<HTMLElement>;
                }
            )._elementRef.nativeElement.blur();
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
                (
                    menu._allItems.first as any as {
                        _elementRef: ElementRef<HTMLElement>;
                    }
                )._elementRef.nativeElement.blur();
                barState.isMatMenuOpen = true;
                setTimeout(() => {
                    barState.isMatMenuOpen = false;
                }, 100);
            } else if (!barState.isMatMenu1Open) {
                barState.enteredButton = true;
                barState.prevButtonTrigger = trigger;
                bar.style.zIndex = NAV_Z_INDEX_ACTIVE;
                trigger.openMenu();
                (
                    menu._allItems.first as any as {
                        _elementRef: ElementRef<HTMLElement>;
                    }
                )._elementRef.nativeElement.blur();
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

    scrollContent(): boolean {
        return this.sectionActive === SECTIONS.home;
    }

    toggleDrawer = () => (document.querySelector('.mdl-layout') as any).MaterialLayout.toggleDrawer();

    unfocusButton(button: MatButton) {
        this.ren.removeClass(button._elementRef.nativeElement, 'cdk-focused');
        this.ren.removeClass(button._elementRef.nativeElement, 'cdk-program-focused');
        button._elementRef.nativeElement.blur();
    }
}

function getWebsiteSection(
    path: string,
    sectionsIn: string[],
    bucketIndexes: number[],
    bucketLabels: SECTIONS[]
): SECTIONS {
    if (!path) {
        return SECTIONS.home;
    }
    const index = sectionsIn.indexOf(path);
    const size = bucketIndexes.length;
    let j = 0;
    while (index >= bucketIndexes[j]) {
        assertTrue(j < size);
        j++;
    }
    return bucketLabels[j];
}

function scanSections(sectionsMap: typeof SECTIONS_MAP): [string[], number[], number[]] {
    const sectionsArray = Object.values(sectionsMap);
    const indexSums = cumulative(sectionsArray, (a, s) => a + s.length, 0);
    return [concat(...sectionsArray), indexSums, range(indexSums.length)];
}
