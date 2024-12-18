import {
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Injector,
    OnDestroy,
    Type,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import { Article } from 'shared/article/article.model';
import { ResourcesRssComponent } from 'resources/resourcesRss.component';
import { NgIf } from '@angular/common';
import { NonCoreModule } from '../non-core/noncore.module';
import { SafeHtmlPipe } from '../non-core/pipes/safeHtml.pipe';

export class HtmlContainer {
    private attached: boolean = false;
    private disposeFn!: () => void;

    constructor(
        private hostElement: Element,
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector
    ) {}

    attach(component: Type<any>): ComponentRef<any> {
        if (this.attached) {
            throw new Error('component has already been attached');
        }

        this.attached = true;
        const childComponentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

        const componentRef = childComponentFactory.create(this.injector);

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

@Component({
    selector: 'cde-resources',
    templateUrl: './resources.component.html',
    imports: [NgIf, NonCoreModule, SafeHtmlPipe],
    standalone: true,
})
export class ResourcesComponent implements OnDestroy {
    containers: HtmlContainer[] = [];
    resource: Article;

    constructor(
        private route: ActivatedRoute,
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector,
        public userService: UserService
    ) {
        this.resource = this.route.snapshot.data.resource;
        this.renderMe();
    }

    renderMe() {
        const waitUntilBodyHtml = setInterval(() => {
            clearInterval(waitUntilBodyHtml);
            if (this.resource.rssFeeds) {
                for (let i = 0; i < this.resource.rssFeeds.length; i++) {
                    const rssFeed = this.resource.rssFeeds[i];
                    const myArea = document.getElementById('rssContent_' + i);
                    if (!myArea) {
                        return;
                    }
                    const myRow = document.createElement('div');
                    myArea.appendChild(myRow);
                    this.addComponentToRow(ResourcesRssComponent, myRow, rssFeed);
                }
            }
        }, 0);
    }

    addComponentToRow(component: Type<any>, row: HTMLElement, param: string) {
        const container = new HtmlContainer(row, this.appRef, this.componentFactoryResolver, this.injector);
        const componentRef = container.attach(component);
        componentRef.instance.rssFeed = param;

        this.containers.push(container);
    }

    ngOnDestroy() {
        this.containers.forEach(container => container.dispose());
    }
}
