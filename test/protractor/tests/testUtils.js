module.exports = {

    utils: this,

    loginAs(username, password) {
        element(by.id("login_link")).click();
        let usernameStr = username;
        if (username.length > 17) {
            usernameStr = usernameStr.substring(0, 17) + "...";
        }
        element(by.id("uname")).clear();
        element(by.id("uname")).sendKeys(username);
        element(by.id("passwd")).clear();
        element(by.id("passwd")).sendKeys(password);
        element(by.id("login_button")).click();
        expect(element(by.id("username_link")).getText()).toContain(usernameStr);
    },

    mustBeLoggedInAs: function (username, password) {
        this.loginAs(username, password);
    },

    textPresent: function (text) {
        expect(element(by.css("body")).getText()).toContain(text);
    },

    closeAlert: function () {
        element(by.css("button.close")).click();
    }

};