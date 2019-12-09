import {
    ApplicationRef, Component, ComponentFactoryResolver, EmbeddedViewRef, EventEmitter, Injector, Output
} from '@angular/core';
import { LoginService } from '_app/login.service';
import { NotificationService } from '_app/notifications/notification.service';
import { NotificationDrawerPaneComponent } from '_app/notifications/notificationDrawerPane.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { isOrgAuthority, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';
import './navigation.scss';
import '../../../node_modules/material-design-lite/material.css';
import '../../../node_modules/material-design-lite/material.js';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'alert/alert.service';
import { Feedback } from 'ng-feedback2/entity/feedback';

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

    constructor(private appRef: ApplicationRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private injector: Injector,
                private notificationService: NotificationService,
                private http: HttpClient,
                private alert: AlertService,
                public userService: UserService,
                public quickBoardService: QuickBoardListService,
                public loginSvc: LoginService) {
        // create drawer
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(NotificationDrawerPaneComponent)
            .create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);
    }

    checkNotificationDrawer() {
        if (this.notificationService.drawer() && !this.notificationService.drawerMouseOver) {
            this.notificationService.drawerClose();
        }
    }
    toggleDrawer = () => (document.querySelector('.mdl-layout') as any).MaterialLayout.toggleDrawer();

    onFeedback(event: Feedback) {
        this.http.post('/server/log/feedback/report', {feedback: {
                description: event.description,
                screenshot: event.screenshot,
                userAgent: window.navigator.userAgent
            }, }).subscribe(() =>
            this.alert.addAlert('success', 'Thank you for your feedback'));
    }

}
