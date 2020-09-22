import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import _cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'cde-inline-area-edit',
    templateUrl: './inlineAreaEdit.component.html',
    styles: [`
        button {
            display: inline-block;
            margin-bottom: 0;
            font-weight: normal;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            border: 1px solid #cccccc;
            white-space: nowrap;
            color: #333333;
            background-color: #ffffff;
            padding: 5px 10px;
            font-size: 12px;
            line-height: 1.5;
            border-radius: 3px;
        }

        mat-icon {
            font-size: 16px;
            height: 16px;
            width: 16px;
            vertical-align: middle;
        }
    `]
})
export class InlineAreaEditComponent implements OnInit, AfterViewInit {
    @Input() model!: string;
    @Input() inputType = 'text';
    @Input() isAllowed = false;
    @Input() enableTextTruncate = true;
    @Output() modelChange = new EventEmitter<string>();
    @Input() defFormat = '';
    @Output() defFormatChange = new EventEmitter<string>();
    editMode?: boolean;
    value!: string;
    localFormat?: string;

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        this.value = _cloneDeep(this.model);
        this.localFormat = _cloneDeep(this.defFormat);
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
        this.value = _cloneDeep(this.model);
        this.localFormat = _cloneDeep(this.defFormat);
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    setHtml(html: boolean) {
        this.localFormat = html ? 'html' : '';
    }

    static isInvalidHtml(html: string) {
        const allowUrls = [(window as any).publicUrl, (window as any).urlProd];
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
