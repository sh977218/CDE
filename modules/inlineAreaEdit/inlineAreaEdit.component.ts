import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector: 'cde-inline-area-edit',
    templateUrl: './inlineAreaEdit.component.html',
})
export class InlineAreaEditComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() model!: string;
    @Input() isAllowed = false;
    @Input() bypassSanitize = false;
    @Input() enableTextTruncate = true;
    @Output() modelChange = new EventEmitter<string>();
    @Input() defFormat: 'html' | '' = '';
    @Output() defFormatChange = new EventEmitter<string>();
    editMode?: boolean;
    value!: string;
    localFormat: 'html' | '' = '';

    constructor(private elementRef: ElementRef) {}

    ngOnInit(): void {
        this.value = this.model;
        this.localFormat = this.defFormat;
    }

    ngAfterViewInit() {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'https://cdn.ckeditor.com/4.14.1/standard-all/ckeditor.js';
        this.elementRef.nativeElement.appendChild(s);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.model) {
            this.value = this.model;
        }
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
        this.value = this.model;
        this.localFormat = this.defFormat;
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    setHtml(html: boolean) {
        this.localFormat = html ? 'html' : '';
    }

    static isInvalidHtml(html: string) {
        const allowUrls = [environment.publicUrl, (window as any).urlProd];
        const srcs = html.match(/src\s*=\s*["'](.+?)["']/gi);
        if (srcs) {
            for (const src of srcs) {
                const urls = src.match(/\s*["'](.+?)["']/gi);
                if (urls) {
                    for (const url of urls) {
                        let allow = false;
                        allowUrls.forEach(allowUrl => {
                            const index = url.indexOf(allowUrl);
                            if (index > -1) {
                                allow = true;
                            }
                        });
                        return !allow;
                    }
                }
            }
        }
        return false;
    }
}
