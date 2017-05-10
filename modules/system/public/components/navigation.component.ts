import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { SharedService } from "../../../core/public/shared.service";


@Component({
    selector: "cde-navigation",
    templateUrl: "./navigation.component.html"
})
export class NavigationComponent {
    @Input() quickBoardCount: number;
    @Input() userHasMail: boolean;
    @Output() takeATour: EventEmitter<void> = new EventEmitter<void>();
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    authShared = SharedService.auth;

    constructor(@Inject("userResource") public userService) {}

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
