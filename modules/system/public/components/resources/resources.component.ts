import {
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Injector, OnDestroy,
    Type
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Article } from 'shared/article/article.model';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';

import { hasRole } from 'shared/system/authorizationShared';
import { ResourcesRssComponent } from 'system/public/components/resources/resourcesRss.component';

@Component({
    selector: 'cde-resources',
    templateUrl: './resources.component.html',
    entryComponents: [ResourcesRssComponent]
})
export class ResourcesComponent implements OnDestroy {
    resource: Article;
    canEdit;

    containers: HtmlContainer[] = [];

    constructor(private http: HttpClient,
                public userService: UserService,
                private alertSvc: AlertService,
                private appRef: ApplicationRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private injector: Injector) {
        this.canEdit = hasRole(this.userService.user, 'DocumentationEditor');

        this.http.get<any>('/server/article/resourcesAndFeed')
            .subscribe(res => {
                this.resource = res;
                setTimeout(() => {
                    this.renderMe();
                }, 0);
            },
            err => this.alertSvc.addAlert('danger', err));
    }

    renderMe() {
        this.resource.rssFeeds.forEach((rssFeed, i) => {
            let myArea = document.getElementById('rssContent_' + i);
            let myRow = document.createElement("div");
            myArea.appendChild(myRow);
            this.addComponentToRow(ResourcesRssComponent, myRow, rssFeed);
        });
    }

    addComponentToRow(component: Type<any>, row: HTMLElement, param: string) {
        let container = new HtmlContainer(row, this.appRef, this.componentFactoryResolver, this.injector);
        let componentRef = container.attach(component);
        componentRef.instance.rssFeed = param;

        this.containers.push(container);
    }

    ngOnDestroy() {
        this.containers.forEach(container => container.dispose());
    }

}

export class HtmlContainer {
    private attached: boolean = false;

    private disposeFn: () => void;

    constructor(
        private hostElement: Element,
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector) {
    }

    attach(component: Type<any>): ComponentRef<any> {
        if (this.attached) {
            throw new Error('component has already been attached');
        }

        this.attached = true;
        const childComponentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

        let componentRef = childComponentFactory.create(this.injector);

        this.appRef.attachView(componentRef.hostView);
        this.disposeFn = () => {
            this.appRef.detachView(componentRef.hostView);
            componentRef.destroy();
        };

        this.hostElement.appendChild((componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0]);

        return componentRef;
    }

    dispose() {
        if (this.attached) {
            this.disposeFn();
        }
    }
}