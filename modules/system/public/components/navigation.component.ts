import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "cde-navigation",
    templateUrl: "./navigation.component.html"
})
export class NavigationComponent {
    @Input() quickBoardCount: number;
    @Input() canCreateForms: boolean;
    @Input() isOrgAdmin: boolean;
    @Input() isOrgAuthority: boolean;
    @Input() isOrgCurator: boolean;
    @Input() user: any;
    @Input() userHasMail: boolean;
    @Output() takeATour: EventEmitter<void> = new EventEmitter<void>();
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
