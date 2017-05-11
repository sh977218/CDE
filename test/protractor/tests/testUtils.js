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
    },

    mustBeLoggedInAs: function (username, password) {
        // findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
        let loginLink = element(by.id("login_link"));
        if (loginLink) {
            this.loginAs(username, password);
        } else {
            // if (!isUsernameMatch(username)) {
            //     logout();
            //     loginAs(username, password);
            // }
        }

    }

};