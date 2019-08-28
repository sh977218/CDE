import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-active-bans',
    templateUrl: './activeBans.component.html'
})
export class ActiveBansComponent {
    ipList: any;

    constructor(private http: HttpClient) {
        this.refresh();
    }

    refresh() {
        this.http.get('/activeBans').subscribe((result: any) => this.ipList = result.ipList);
    }

    remove(ip: string) {
        this.http.post('/removeBan', {ip}).subscribe(() => this.refresh());
    }
}
