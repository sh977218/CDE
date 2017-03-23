import { Component, Input, OnInit } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";

@Component({
    selector: "cde-native-table",
    templateUrl: "./nativeTable.component.html"
})
export class NativeTableComponent implements OnInit {
    @Input() formElement: any;

    sectionNumber: number;
    tableForm: any = {
        s: [{q: []}],
        q: [{type: "label", style: {}}]
    };

    constructor(public nativeRenderService: NativeRenderService) {
    }

    ngOnInit() {
        this.render();
    }

    render() {
        this.sectionNumber = 0;
        let ret = this.renderSection(this.formElement, this.tableForm, this.tableForm.s[0].q);
        this.tableForm.entry = {cspan: 1, rspan: ret.r + 1};
        this.tableForm.rows = [
            {label: "1."}, {label: "2."}, {label: "3."}, {label: "4."}, {label: "5."},
            {label: "6."}, {label: "7."}, {label: "8."}, {label: "9."}, {label: "10."}
        ];
    }

    renderSection(s, t, thead, r = 1, c = 0) {
        let sectionStyle = this.getSectionStyle(this.sectionNumber++);
        let section = {header: true, cspan: c, label: s.label, style: sectionStyle.sectionStyle};
        thead.push(section);
        let sectionContent = {q: []};
        t.s.push(sectionContent);
        s.formElements.forEach(f =>  {
            if (f.elementType === "section" || f.elementType === "form") {
                let ret = this.renderSection(f, t, sectionContent.q);
                r += ret.r;
                c += ret.c;
            }
            else if (f.elementType === "question") {
                c++;
                sectionContent.q.push({rspan: r, label: f.label, style: sectionStyle.questionStyle});
                t.q.push({type: NativeTableComponent.getQuestionType(f), name: f.questionId, question: f.question, style: sectionStyle.answerStyle});
                if (!Array.isArray(f.question.answer))
                    f.question.answer = [];
            }
        });
        sectionContent.q.forEach(q => {
            if (!q.header)
                q.rspan = r;
        });
        section.cspan = c;
        return {r: r, c: c};
    }

    theme: Array<any> = [
        {
            sectionStyle: {backgroundColor: "#d7f3da"},
            questionStyle: {backgroundColor: "#d7f3da"},
            answerStyle: {backgroundColor: "#f6fff9"}
        },
        {
            sectionStyle: {backgroundColor: "#dad7f3"},
            questionStyle: {backgroundColor: "#dad7f3"},
            answerStyle: {backgroundColor: "#f9f6ff"}
        },
        {
            sectionStyle: {backgroundColor: "#f3dad7"},
            questionStyle: {backgroundColor: "#f3dad7"},
            answerStyle: {backgroundColor: "#fff9f6"}
        }
    ];
    getSectionStyle(i) {
        return this.theme[i % this.theme.length];
    }

    static getQuestionType(fe) {
        switch (fe.question.datatype) {
            case "Value List":
                if (fe.question.multiselect)
                    return "mlist";
                else
                    return "list";
            case "Date":
                return "date";
            case "Number":
                return "number";
            default:
                return "text";
        }
    }
}