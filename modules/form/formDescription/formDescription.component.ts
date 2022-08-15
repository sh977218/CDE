import 'form/formDescription/formDescription.global.scss';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from '@circlon/angular-tree-component';
import { ITreeOptions } from '@circlon/angular-tree-component/lib/defs/api';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { areDerivationRulesSatisfied } from 'core/form/fe';
import { convertFormToSection } from 'core/form/form';
import { FormSearchModalComponent } from 'form/form-search-modal/form-search-modal.component';
import { copySectionAnimation } from 'form/formDescription/copySectionAnimation';
import { QuestionSearchModalComponent } from 'form/question-search-modal/question-search-modal.component';
import { LocatableError } from 'form/formView/formView.component';
import { isEmpty } from 'lodash';
import { convertCdeToQuestion } from 'nativeRender/form.service';
import { scrollTo, waitRendered } from 'non-core/browser';
import { LocalStorageService } from 'non-core/localStorage.service';
import { addFormIds, iterateFeSync } from 'shared/form/fe';
import { CdeForm, FormElement, FormOrElement, FormSection } from 'shared/form/form.model';
import { canEditCuratedItem } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-form-description',
    templateUrl: './formDescription.component.html',
    animations: [copySectionAnimation],
    styleUrls: ['./formDescription.component.scss'],
})
export class FormDescriptionComponent implements OnInit {
    @ViewChild(TreeComponent) tree!: TreeComponent;
    dragActive: boolean = false;
    elt: CdeForm;
    formElementEditing: {formElement?: FormElement, formElements?: FormElement[], index?: number} = {};
    isMobile: boolean = false;
    isModalOpen: boolean = false;
    missingCdes: string[] = [];
    topSpacing: number;
    treeOptions: ITreeOptions = {
        allowDrag: (element: TreeNode) => !FormDescriptionComponent.isSubForm(element)
            || element.data.elementType === 'form' && !FormDescriptionComponent.isSubForm(element.parent),
        allowDrop: (element, {parent, index}) => {
            return element !== parent && parent.data.elementType !== 'question' && (!element
                || !element.ref && (element.data.elementType !== 'question' || parent.data.elementType === 'section')
                || element.ref === 'section' || element.ref === 'form' || element.ref === 'pasteSection'
                || (element.ref === 'question' && parent.data.elementType === 'section')
            ) && !FormDescriptionComponent.isSubForm(parent);
        },
        actionMapping: {
            mouse: {
                drag: () => this.dragActive = true,
                dragEnd: () => this.dragActive = false,
                drop: (tree: TreeModel, node: TreeNode, $event: any, {from, to}: any) => {
                    if (from.ref) {
                        this.formElementEditing = {
                            formElements: to.parent.data.formElements,
                            index: to.index
                        };
                        if (from.ref === 'section') {
                            const newSection = new FormSection();
                            this.formElementEditing.formElement = newSection;
                            this.addFormElement(newSection);
                        } else if (from.ref === 'question') {
                            this.openQuestionSearch();
                        } else if (from.ref === 'form') {
                            this.openFormSearch();
                        } else if (from.ref === 'pasteSection') {
                            const copiedSection: FormSection = this.localStorageService.getItem('sectionCopied');
                            this.formElementEditing.formElement = copiedSection;
                            this.addFormElement(copiedSection);
                        } else {
                            TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                            addFormIds(this.elt);
                            this.updateTree();
                            // this.onEltChange.emit(); treeEvent will handle
                        }
                    } else {
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                        addFormIds(this.elt);
                        this.updateTree();
                        this.dragActive = false;
                        // this.onEltChange.emit(); treeEvent will handle
                    }
                }
            }
        },
        childrenField: 'formElements',
        displayField: 'label',
        isExpandedField: 'expanded'
    };
    updateDataCredit: number = 0;
    validationErrors: LocatableError[] = [];

    constructor(private router: Router,
                private route: ActivatedRoute,
                private _hotkeysService: HotkeysService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                public userService: UserService,
                private alert: AlertService,
                public matDialog: MatDialog) {
        this.elt = this.route.snapshot.data.form;
        this.addExpanded(this.elt);
        addFormIds(this.elt);
        this.missingCdes = areDerivationRulesSatisfied(this.elt);
        CdeForm.validate(this.elt);
        this.onResize();
    }

    ngOnInit(): void {
        this._hotkeysService.add([
            new Hotkey('q', (event: KeyboardEvent): boolean => {
                if (!this.isModalOpen && !isEmpty(this.formElementEditing) &&
                    this.formElementEditing.formElement && this.formElementEditing.formElement.elementType === 'question') {
                    this.formElementEditing.index++;
                    this.openQuestionSearch('add');
                }
                return false;
            })
        ]);

        const fragment = this.route.snapshot.fragment;
        if (fragment) {
            this.scrollToDescriptionId(fragment);
        }

    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    addExpanded(fe: FormOrElement) {
        fe.expanded = true;
        const expand = (fe: FormElement) => {
            fe.expanded = true;
        };
        iterateFeSync(fe, undefined, expand, expand);
    }

    addFormElement(fe: FormElement) {
        if (this.formElementEditing.formElements) {
            this.formElementEditing.formElements.splice(this.formElementEditing.index, 0, fe);
        }
        addFormIds(this.elt);
        this.updateTree();
        // this.onEltChange.emit(); treeEvent will handle
    }

    hasCopiedSection() {
        return this.localStorageService.getItem('sectionCopied');
    }

    navHeight() {
        return this.isMobile ? 110 : 132;
    }

    @HostListener('window:resize')
    onResize() {
        this.isMobile = window.innerWidth < 768;
        this.scrollToolbar();
    }

    openFormSearch() {
        const diaRef = this.matDialog.open(FormSearchModalComponent, {width: '1200px'});
        const sub = diaRef.componentInstance.selectedForm
            .subscribe(form => {
                const inForm = convertFormToSection(form);
                this.addExpanded(inForm);
                this.formElementEditing.formElement = inForm;
                this.addFormElement(inForm);
                this.setCurrentEditing(this.formElementEditing.formElements, inForm, this.formElementEditing.index);
            })
        diaRef.afterClosed()
            .subscribe(res => sub.unsubscribe());
    }

    openQuestionSearch(questionModelMode = 'search') {
        const diaRef = this.matDialog.open(QuestionSearchModalComponent, {
            width: '1200px', height: '800',
            data: {questionModelMode}
        });
        const sub = diaRef.componentInstance.selectedQuestion
            .subscribe(de => {
                convertCdeToQuestion(de, question => {
                    if (!question) {
                        return;
                    }
                    question.formElements = [];
                    question.expanded = true;
                    question.edit = true;
                    this.addFormElement(question);
                    this.setCurrentEditing(this.formElementEditing.formElements, question, this.formElementEditing.index);
                    waitRendered(
                        () => !!document.getElementById('question_' + question.feId),
                        () => scrollTo('question_' + question.feId)
                    );
                });
            })
        diaRef.afterClosed()
            .subscribe(res => sub.unsubscribe());
    }

    saveEdit() {
        this.http.put('/server/form/draft/' + this.elt.tinyId, this.elt)
            .subscribe((elt: any) => {
                this.missingCdes = areDerivationRulesSatisfied(this.elt);
                CdeForm.validate(this.elt);
                this.alert.addAlert('success', 'Saved');
                this.elt.__v = elt.__v;
            }, error => {
                this.alert.httpErrorMessageAlert(error);
                this.alert.addAlert('danger', 'Cannot save this old version. Reload and redo.')
            });
    }

    @HostListener('window:scroll')
    scrollEvent() {
        this.scrollToolbar();
    }

    scrollToolbar() {
        const nav = this.navHeight();
        this.topSpacing = (window.pageYOffset > nav ? 0 : (nav - window.pageYOffset));
    }

    scrollToDescriptionId(id: string) {
        setTimeout(scrollTo, 0, id);
    }

    setCurrentEditing(formElements: FormElement[], formElement: FormElement, index: number) {
        if (isEmpty(this.formElementEditing.formElement)) {
            this.formElementEditing = {
                formElement,
                formElements,
                index
            };
        } else {
            if (this.formElementEditing.formElement === formElement) {
                this.formElementEditing = {};
            } else {
                this.formElementEditing.formElement.edit = false;
                this.formElementEditing = {
                    formElement,
                    formElements,
                    index
                };
            }
        }
    }

    treeEvents(event: any) {
        if (event && event.eventName === 'updateData' && this.updateDataCredit === 0) {
            this.saveEdit();
        }
        if (event && event.eventName === 'moveNode') {
            this.updateDataCredit++;
            setTimeout(() => this.updateDataCredit = 0, 100);
        }
    }

    updateTree() {
        this.tree.treeModel.update();
        // @TODO: if node passed in, expand all node only, else no expand
        this.tree.treeModel.expandAll();
    }

    static isSubForm(node: TreeNode): boolean {
        let n = node;
        while (n && n.data && n.data.elementType !== 'form' && n.parent) {
            n = n.parent;
        }
        return n && n.data && n.data.elementType === 'form';
    }

}
