import { Http } from "@angular/http";
import { Component, Inject } from "@angular/core";
import "rxjs/add/operator/map";


@Component({
    selector: "cde-daily-usage",
    templateUrl: "./dailyUsage.component.html"
})

export class DailyUsageComponent {

    constructor(
        private http: Http
    ) {}

    entryLimit: number = 50;
    dailyUsage: any[];

    seeMore () {
        this.entryLimit += 50;
    };

    generate () {
        this.http.get("/logUsageDailyReport").map(r => r.json()).subscribe(res => {
            this.dailyUsage = res;
            this.dailyUsage.forEach(record => {
                // record.daysAgo = this.generateDaysAgo(record._id.year, record._id.month, record._id.dayOfMonth);
            });
            this.dailyUsage.sort((u1, u2) => u1.daysAgo - u2.daysAgo);
        });
    };

    lookupUsername (ip) {
        this.http.get("/usernamesByIp/" + ip).map(r => r.json()).subscribe(usernames => {
            if (usernames.length === 0) usernames = [{username: "Anonymous"}];
            this.dailyUsage.forEach(d => {
                if (d._id.ip === ip) d.usernames = usernames;
            });
        });
    };

    // use moment
    // generateDaysAgo (year, month, day) {
    //     let recordDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    //     let diffMs = new Date().getTime() - recordDate.getTime();
    //     let diffDays = diffMs / (3600 * 24 * 1000);
    //     diffDays = Math.floor(diffDays);
    //     return diffDays;
    // };

}
