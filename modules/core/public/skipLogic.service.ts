import { Injectable } from "@angular/core";

@Injectable()
export class SkipLogicService {
    tokenSplitter(str) {
        let tokens: any = [];
        if (!str) {
            tokens.unmatched = "";
            return tokens;
        }
        str = str.trim();
        let res = str.match(/^"[^"]+"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        let t = res[0];
        str = str.substring(t.length).trim();
        t = t.substring(1, t.length - 1);
        tokens.push(t);

        res = str.match(/^(>=|<=|=|>|<)/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        tokens.push(t);
        str = str.substring(t.length).trim();

        res = str.match(/^"([^"]*)"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        let newT = res[0].substring(1, t.length - 1);
        tokens.push(newT);
        str = str.substr(t.length).trim();

        res = str.match(/^((\bAND\b)|(\bOR\b))/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        tokens.push(t);
        str = str.substring(t.length).trim();

        tokens.unmatched = str;

        if (str.length > 0) {
            let innerTokens = this.tokenSplitter(str);
            let outerTokens = tokens.concat(innerTokens);
            outerTokens.unmatched = innerTokens.unmatched;
            return outerTokens;
        } else {
            return tokens;
        }
    }
}
