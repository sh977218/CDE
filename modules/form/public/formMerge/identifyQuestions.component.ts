import { Http, Response } from "@angular/http";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";

@Component({
    selector: "identify-questions",
    templateUrl: "./identifyQuestions.component.html"
})
export class IdentifyQuestionsComponent {

    @ViewChild("identifyQuestionsModal") public identifyQuestionsModal: ModalDirective;

    constructor(private http: Http) {
    }
    openIdentifyQuestions () {
        this.identifyQuestionsModal.show();
    }
}