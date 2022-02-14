import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import 'inlineAreaEdit/inlineAreaEdit.global.scss';
import { deepCopy } from 'shared/util';

@Component({
    selector: 'cde-inline-area-edit',
    templateUrl: './inlineAreaEdit.component.html',
})
export class InlineAreaEditComponent implements OnInit, AfterViewInit {
    @Input() model!: string;
    @Input() isAllowed = false;
    @Input() enableTextTruncate = true;
    @Output() modelChange = new EventEmitter<string>();
    @Input() defFormat: 'html' | '' = '';
    @Output() defFormatChange = new EventEmitter<string>();
    editMode?: boolean;
    value!: string;
    localFormat: 'html' | '' = '';

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        this.value = deepCopy(this.model);
        this.localFormat = deepCopy(this.defFormat);
    }

    ngAfterViewInit() {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'https://cdn.ckeditor.com/4.14.1/standard-all/ckeditor.js';
        this.elementRef.nativeElement.appendChild(s);
    }

    confirmSave() {
        if (InlineAreaEditComponent.isInvalidHtml(this.value)) {
            alert('Error. Img src may only be a relative url starting with /data');
        } else {
            this.editMode = false;
            this.defFormatChange.emit(this.localFormat);
            this.modelChange.emit(this.value);
        }
    }

    discard() {
        this.value = deepCopy(this.model);
        this.localFormat = deepCopy(this.defFormat);
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    setHtml(html: boolean) {
        this.localFormat = html ? 'html' : '';
    }

    static isInvalidHtml(html: string) {
        const allowUrls = [window.publicUrl, window.urlProd];
        const srcs = html.match(/src\s*=\s*["'](.+?)["']/ig);
        if (srcs) {
            for (const src of srcs) {
                const urls = src.match(/\s*["'](.+?)["']/ig);
                if (urls) {
                    for (const url of urls) {
                        let allow = false;
                        allowUrls.forEach(allowUrl => {
                            const index = url.indexOf(allowUrl);
                            if (index > -1) { allow = true; }
                        });
                        return !allow;
                    }
                }
            }
        }
        return false;
    }
}
