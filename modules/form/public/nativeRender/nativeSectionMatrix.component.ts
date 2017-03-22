import { Component, Input } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";

@Component({
    selector: "cde-native-section-matrix",
    templateUrl: "nativeSectionMatrix.component.html"
})
export class NativeSectionMatrixComponent {
    @Input() formElement: any;
    @Input() numSubQuestions: number;
    @Input() profile: any;

    constructor(public nativeRenderService: NativeRenderService) {
    }
}