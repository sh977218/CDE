import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';


@Component({
    selector: 'cde-daily-usage',
    templateUrl: './dailyUsage.component.html'
})
export class DailyUsageComponent {
    entryLimit: number = 50;
    dailyUsage: any[];

    constructor(
        private http: HttpClient
    ) {}

    generate () {
        this.http.get<any>('/server/log/dailyUsageReportLogs').subscribe(res => {
            this.dailyUsage = res;
            this.dailyUsage.forEach(record => {
                record.daysAgo = DailyUsageComponent.generateDaysAgo(record._id.year, record._id.month, record._id.dayOfMonth);
            });
            this.dailyUsage.sort((u1, u2) => u1.daysAgo - u2.daysAgo);
        });
    }

    static generateDaysAgo (year, month, day) {
        let recordDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        let diffMs = new Date().getTime() - recordDate.getTime();
        let diffDays = diffMs / (3600 * 24 * 1000);
        diffDays = Math.floor(diffDays);
        return diffDays;
    }

    lookupUsername (ip) {
        this.http.get<any>('/usernamesByIp/' + ip).subscribe(usernames => {
            if (usernames.length === 0) usernames = [{username: 'Anonymous'}];
            this.dailyUsage.forEach(d => {
                if (d._id.ip === ip) d.usernames = usernames;
            });
        });
    }

    seeMore () {
        this.entryLimit += 50;
    }
}
