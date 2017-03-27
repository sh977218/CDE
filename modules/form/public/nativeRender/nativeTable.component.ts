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
        this.tableForm.rows = [
            {n: 0, label: "1."}, {n: 1, label: "2."}, {n: 2, label: "3."}, {n: 3, label: "4."}, {n: 4, label: "5."},
            {n: 5, label: "6."}, {n: 6, label: "7."}, {n: 7, label: "8."}, {n: 8, label: "9."}, {n: 9, label: "10."}
        ];
        this.render();
    }

    render() {
        this.sectionNumber = 0;
        let ret = this.renderSection(this.formElement, 0);
        this.setDepth(ret.r);
        this.tableForm.entry = {cspan: 1, rspan: ret.r + 1};
        this.tableForm.q[0].style = this.getSectionStyle(0).answerStyle;
    }

    renderSection(s, level, r = 1, c = 0) {
        let sectionStyle = this.getSectionStyle(this.sectionNumber++);
        let section = {header: true, cspan: c, label: s.label, style: sectionStyle.sectionStyle};
        this.tableForm.s[level].q.push(section);
        let tcontent = this.getSectionLevel(level + 1);
        s.formElements.forEach(f =>  {
            if (f.elementType === "section" || f.elementType === "form") {
                let ret = this.renderSection(f, level + 1);
                r += ret.r;
                c += ret.c;
            }
            else if (f.elementType === "question") {
                c++;
                tcontent.q.push({rspan: r, label: f.label, style: sectionStyle.questionStyle});
                this.tableForm.q.push({type: NativeTableComponent.getQuestionType(f), name: f.questionId, question: f.question, style: sectionStyle.answerStyle});
                if ((!Array.isArray(f.question.answer) || this.tableForm.rows.length !== f.question.answer.length) && this.tableForm.q.slice(-1)[0].type === "list") {
                    f.question.answer = [];
                    this.tableForm.rows.forEach(r => {
                        f.question.answer.push({answer: ""});
                    });
                } else
                    f.question.answer = Array(this.tableForm.rows.length);
            }
        });
        section.cspan = c;
        return {r: r, c: c};
    }
    setDepth(r) {
        this.tableForm.s.forEach((s, level) => {
            s.q.forEach(q => {
                if (!q.header)
                    q.rspan = r - level;
            });
        });
    }
    getSectionLevel(level) {
        if (this.tableForm.s.length <= level)
            this.tableForm.s[level] = {q: []};
        return this.tableForm.s[level];
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
        },
        {
            sectionStyle: {backgroundColor: "#f1f3d8"},
            questionStyle: {backgroundColor: "#f1f3d8"},
            answerStyle: {backgroundColor: "#fcfff5"}
        },
        {
            sectionStyle: {backgroundColor: "#d8f1f3"},
            questionStyle: {backgroundColor: "#d8f1f3"},
            answerStyle: {backgroundColor: "#f5fcff"}
        },
        {
            sectionStyle: {backgroundColor: "#f3d8f1"},
            questionStyle: {backgroundColor: "#f3d8f1"},
            answerStyle: {backgroundColor: "#fff5fc"}
        },
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