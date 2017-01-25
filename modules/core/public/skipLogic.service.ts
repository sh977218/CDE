import { Injectable } from '@angular/core';

@Injectable()
export class SkipLogicService {
    tokenSplitter(str) {
        var tokens:any = [];
        if (!str) {
            tokens.unmatched = "";
            return tokens;
        }
        str = str.trim();
        var res = str.match(/^"[^"]+"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        var t = res[0];
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
        var newT = res[0].substring(1, t.length - 1);
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
            var innerTokens = this.tokenSplitter(str);
            var outerTokens = tokens.concat(innerTokens);
            outerTokens.unmatched = innerTokens.unmatched;
            return outerTokens;
        } else {
            return tokens;
        }
    }
}
