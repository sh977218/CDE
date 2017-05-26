import { Component, Input } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";
import { FormElement } from "../form.model";

@Component({
    selector: "cde-native-section-matrix",
    templateUrl: "nativeSectionMatrix.component.html"
})
export class NativeSectionMatrixComponent {
    @Input() formElement: FormElement;
    @Input() numSubQuestions: number;

    constructor(public nativeRenderService: NativeRenderService) {
    }
}