import { HttpClient } from '@angular/common/http';
import {
    ApplicationRef,
    Component, ComponentFactoryResolver, EmbeddedViewRef, EventEmitter, forwardRef, Inject, Injector, Output
} from '@angular/core';
import { LoginService } from '_app/login.service';
import '_app/navigation/navigation.global.scss';
import { NotificationService } from '_app/notifications/notification.service';
import { NotificationDrawerPaneComponent } from '_app/notifications/notificationDrawerPane.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { Feedback } from 'ngx-feedback2/entity/feedback';
import { isOrgAuthority, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-navigation',
    templateUrl: './navigation.component.html',
})
export class NavigationComponent {
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();
    isOrgAuthority = isOrgAuthority;
    isOrgCurator = isOrgCurator;
    isSiteAdmin = isSiteAdmin;

    feedbackDescription = `Describe your issue here. Please include a way to contact you, it will help us troubleshoot the issue. `;

    constructor(
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => ApplicationRef)) private appRef: ApplicationRef,
        @Inject(forwardRef(() => ComponentFactoryResolver)) private componentFactoryResolver: ComponentFactoryResolver,
        @Inject(forwardRef(() => Injector)) private injector: Injector,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => LoginService)) public loginSvc: LoginService,
        @Inject(forwardRef(() => NotificationService)) private notificationService: NotificationService,
        @Inject(forwardRef(() => QuickBoardListService)) public quickBoardService: QuickBoardListService,
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
