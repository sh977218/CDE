import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

type DailyUsage = any;

@Component({
    selector: 'cde-daily-usage',
    templateUrl: './dailyUsage.component.html',
    styleUrls: ['./dailyUsage.component.scss'],
})
export class DailyUsageComponent {
    entryLimit: number = 50;
    dailyUsage?: DailyUsage[];

    constructor(
        private http: HttpClient
    ) {}

    generate() {
        this.http.get<DailyUsage[]>('/server/log/dailyUsageReportLogs').subscribe(res => {
            this.dailyUsage = res;
            this.dailyUsage.forEach(record => {
                record.daysAgo = DailyUsageComponent.generateDaysAgo(record._id.year, record._id.month, record._id.dayOfMonth);
            });
            this.dailyUsage.sort((u1, u2) => u1.daysAgo - u2.daysAgo);
        });
    }

    lookupUsername(dailyUsage: DailyUsage[], ip: string) {
        this.http.get<any>('/server/siteAdmin/usernamesByIp/' + ip).subscribe(usernames => {
            if (usernames.length === 0) {
                usernames = [{username: 'Anonymous'}];
            }
            dailyUsage.forEach(d => {
                if (d._id.ip === ip) {
                    d.usernames = usernames;
                }
            });
        });
    }

    seeMore() {
        this.entryLimit += 50;
    }

    static generateDaysAgo(year: number, month: number, day: number) {
        const recordDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const diffMs = new Date().getTime() - recordDate.getTime();
        let diffDays = diffMs / (3600 * 24 * 1000);
        diffDays = Math.floor(diffDays);
        return diffDays;
    }
}
