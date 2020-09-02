import { HttpClient } from '@angular/common/http';
import {
    ApplicationRef,
    Component, ComponentFactoryResolver, EmbeddedViewRef, EventEmitter, forwardRef, Inject, Injector, Output
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { LoginService } from '_app/login.service';
import '_app/navigation/navigation.global.scss';
import { NotificationService } from '_app/notifications/notification.service';
import { NotificationDrawerPaneComponent } from '_app/notifications/notificationDrawerPane.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import _isEmpty from 'lodash/isEmpty';
import { Feedback } from 'ngx-feedback2/entity/feedback';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { isOrgAuthority, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';

export interface BreadCrumb {
    label: string;
    queryParams?: Params;
    routeParams?: Params;
    url: string;
}

@Component({
    selector: 'cde-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();
    breadcrumbs$: Observable<BreadCrumb[]>;
    isOrgAuthority = isOrgAuthority;
    isOrgCurator = isOrgCurator;
    isSiteAdmin = isSiteAdmin;

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) protected route: ActivatedRoute,
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => ApplicationRef)) private appRef: ApplicationRef,
        @Inject(forwardRef(() => ComponentFactoryResolver)) private componentFactoryResolver: ComponentFactoryResolver,
        @Inject(forwardRef(() => Injector)) private injector: Injector,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => LoginService)) public loginSvc: LoginService,
        @Inject(forwardRef(() => NotificationService)) private notificationService: NotificationService,
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

        this.breadcrumbs$ = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            distinctUntilChanged(),
            map(event => buildBreadCrumb(this.route.root))
        );
    }

    breadCrumbToLink(breadcrumb: BreadCrumb) {
        const link: (string | Params)[] = [breadcrumb.url];
        if (breadcrumb.routeParams) {
            link.push(breadcrumb.routeParams);
        }
        return link;
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

function buildBreadCrumb(route: ActivatedRoute): BreadCrumb[] {
    const actualCrumb: BreadCrumb[] = parseRoute(route);
    const displayCrumb: BreadCrumb[] = [{label: 'Home', url: '/'}];
    actualCrumb.forEach(a => {
        switch (a.label) {
            case 'Home':
                break;
            case 'Data Element Search':
            case 'Form Search':
                displayCrumb.push(a.label === 'Data Element Search'
                    ? {label: 'CDEs', url: '/cde/search'}
                    : {label: 'Forms', url: '/form/search'}
                );
                if (a.queryParams && !_isEmpty(a.queryParams)) {
                    let query = '';
                    const addToQuery = (s: string) => {
                        query += query
                            ? ' and ' + s
                            : s
                    };
                    if (a.queryParams.q) {
                        addToQuery('"' + a.queryParams.q + '"');
                    }
                    if (a.queryParams.selectedOrg) {
                        addToQuery(a.queryParams.selectedOrg
                            + (a.queryParams.classification ? ' > ' + a.queryParams.classification.split(';').join(' > ') : '')
                        );
                    }
                    if (a.queryParams.selectedOrgAlt) {
                        addToQuery(a.queryParams.selectedOrgAlt);
                    }
                    if (a.queryParams.excludeOrgs) {
                        query += ' not ' + a.queryParams.excludeOrgs;
                    }
                    if (a.queryParams.meshTree) {
                        addToQuery(a.queryParams.meshTree);
                    }
                    if (a.queryParams.regStatuses) {
                        addToQuery(a.queryParams.regStatuses);
                    }
                    if (a.queryParams.datatypes) {
                        addToQuery(a.queryParams.datatypes);
                    }
                    displayCrumb.push({...a, label: 'Search [' + query + ']'});
                }
                break;
            case 'Data Element View':
            case 'Form View':
                displayCrumb.push(a.label === 'Data Element View'
                    ? {label: 'CDEs', url: '/cde/search'}
                    : {label: 'Forms', url: '/form/search'}
                );
                displayCrumb.push({...a, label: 'View [' + (a.queryParams?.tinyId || a.queryParams?.cdeId || a.queryParams?.formId) + ']'});
                break;
            case 'Contact Us':
            case 'Guides':
            case 'Resources':
            case 'Videos':
            case 'What\'s New':
                displayCrumb.push({label: 'Help', url: '/guides'});
                if (a.label !== 'Guides') {
                    displayCrumb.push(a);
                }
                break;
            default:
                displayCrumb.push(a);
        }
    });
    return displayCrumb;
}

function parseRoute(route: ActivatedRoute, url: string = '', breadcrumbs: BreadCrumb[] = []): BreadCrumb[] {
    if (route.snapshot.routeConfig?.path) {
        const label = route.snapshot.data.title || route.snapshot.data.breadcrumb || 'Home';
        const queryParams = route.snapshot.queryParams;
        const routeParams = route.snapshot.params;
        const path = route.snapshot.routeConfig?.path || '';

        url = `${url}${path}/`;
        breadcrumbs.push({
            label,
            queryParams,
            routeParams,
            url,
        });
    }
    return route.firstChild
        ? parseRoute(route.firstChild, url, breadcrumbs)
        : breadcrumbs;
}
