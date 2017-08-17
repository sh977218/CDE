import { Component, OnInit, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { AlertService } from "../alert/alert.service";
import { SaveModalComponent } from "../../../../adminItem/public/components/saveModal/saveModal.component";
import { MergeCdeService } from "../../../../core/public/mergeCde.service";

@Component({
    selector: "cde-inbox",
    templateUrl: "inbox.component.html"
})
export class InboxComponent implements OnInit {

    @ViewChild("saveModal") public saveModal: SaveModalComponent;

    constructor(private http: Http,
                private alert: AlertService,
                private mergeSvc: MergeCdeService) {}

    mail: any = {received: [], sent: [], archived: []};
    currentMessage: any;

    ngOnInit () {
        this.getAllMail();
    }

    getMail (type) {
        // TODO make sure it's ordered by date
        this.http.post("/mail/messages/" + type, {}).map(r => r.json()).subscribe(mail => {
            this.mail[type] = mail;
            mail.forEach(msg => msg.humanType = this.decamelize(msg.type));
            this.fetchMRCdes(type);
        });
    };

    getAllMail () {
        this.getMail('received');
        this.getMail('sent');
        this.getMail('archived');
    };

    decamelize (str) {
        let result = str
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
            .toLowerCase();
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    fetchMRCdes (type) {
        let tinyIdList = this.mail[type].map(m => {
            if (m.typeRequest) return m.typeRequest.source.tinyId;
        });
        tinyIdList = tinyIdList.concat(this.mail[type].map(m => {
            if (m.typeRequest) return m.typeRequest.destination.tinyId;
        }));
        this.http.post("/cdesByTinyIdList", tinyIdList).map(r => r.json()).subscribe(result => {
            if (!result) return;
            let cdesKeyValuePair = {};
            result.forEach(cde => cdesKeyValuePair[cde.tinyId] = cde);
            this.mail[type].map(function (message) {
                if (message.type !== "MergeRequest") return;
                message.typeRequest.source.object = cdesKeyValuePair[message.typeRequest.source.tinyId];
                message.typeRequest.destination.object = cdesKeyValuePair[message.typeRequest.destination.tinyId];
            });
        }, () => {});
    }


    closeMessage (message) {
        message.states.unshift({
            "action" : "Approved",
            "date" : new Date(),
            "comment" : ""
        });
        this.http.post('/mail/messages/update', message).subscribe(() => {
            this.alert.addAlert("success", "Message moved to archived.");
            this.getAllMail();
        }, () => {
            this.alert.addAlert("danger", "Message couldn't be retired.");
        });
    }

    approveMergeMessage (message) {
        this.mergeSvc.approveMerge(
            this.currentMessage.typeRequest.source.object,
            this.currentMessage.typeRequest.destination.object,
            this.currentMessage.typeRequest.mergeFields,
            () => {
            this.closeMessage(this.currentMessage);
        });
    };


    showMergeApproveDialog (message) {
        this.currentMessage = message;


    }
    //     $modal.open({
    //         animation: false,
    //         templateUrl: '/system/public/html/saveModal.html',
    //         controller: 'MergeApproveModalCtrl',
    //         resolve: {
    //             elt: function () {
    //                 return message.typeRequest.destination.object;
    //             }, user: function () {
    //                 return userResource.user;
    //             }
    //         }
    //     }).result.then(function () {
    //         $scope.approveMergeMessage(message);
    //     }, function () {
    //     });
    // };


}