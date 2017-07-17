import { Component } from "@angular/core";
import { Http } from "@angular/http";
import * as async from "async";

@Component({
    selector: "cde-native-render-standalone",
    templateUrl: "./nativeRenderStandalone.component.html"
})
export class NativeRenderStandaloneComponent {
    elt: any;
    errorMessage: string;
    selectedProfile: string;
    submitForm: boolean;

    constructor(private http: Http) {
        let args: any = NativeRenderStandaloneComponent.searchParamsGet();
        this.selectedProfile = args.selectedProfile;
        this.submitForm = args.submit !== undefined;

        if ((<any>window).formElt) {
            this.prefetch(null, (<any>window).formElt);
        } else {
            let _id = args.tinyId ? args.tinyId : args._id + "";
            this.http.get('/form/' + _id).map(res => res.json()).subscribe((response) => {
                this.prefetch(null, response);
            }, () => {
                this.prefetch(true);
            });
        }
    }

    fetchWholeForm(form, callback) {
        let maxDepth = 8;
        let depth = 0;
        let loopFormElements = function (form, cb) {
            depth++;
            if (form.formElements) {
                async.forEach(form.formElements, function (fe, doneOne) {
                    if (fe.elementType === 'form') {
                        if (depth < maxDepth) {
                            this.http.get('/formByTinyIdAndVersion/' + fe.inForm.form.tinyId + '/' + fe.inForm.form.version)
                                .map((res: Response) => res.json())
                                .subscribe((response) => {
                                    fe.formElements = response.formElements;
                                    loopFormElements(fe, function () {
                                        depth--;
                                        doneOne();
                                    });
                                });
                        }
                        else doneOne();
                    } else if (fe.elementType === 'section') {
                        loopFormElements(fe, doneOne);
                    } else {
                        if (fe.question.cde.derivationRules)
                            fe.question.cde.derivationRules.forEach(function (derRule) {
                                delete fe.incompleteRule;
                                if (derRule.ruleType === 'score') {
                                    fe.question.isScore = true;
                                    fe.question.scoreFormula = derRule.formula;
                                }
                            });
                        doneOne();
                    }
                }, cb);
            }
            else cb();
        };
        loopFormElements(form, function () {
            callback(form);
        });
    }

    prefetch(error, form = null) {
        if (error) {
            this.errorMessage = "Sorry, we are unable to retrieve this element.";
            return;
        }

        let formCopy = JSON.parse(JSON.stringify(form));
        this.fetchWholeForm(formCopy, (wholeForm) => {
            this.elt = wholeForm;
        });
    }

    static searchParamsGet(): string[] {
        let params: any = {};
        location.search && location.search.substr(1).split('&').forEach(e => {
            let p = e.split('=');
            if (p.length === 2)
                params[p[0]] = decodeURI(p[1]);
            else
                params[p[0]] = null;
        });
        return params;
    }
}
