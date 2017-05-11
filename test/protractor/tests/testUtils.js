module.exports = {

    utils: this,


    loginAs(username, password) {

    },

    mustBeLoggedInAs: function (username, password) {
        // findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
        let loginLink = element(by.id("login_link"));
        if (loginLinkList) {
            this.loginAs(username, password);
        } else {
            // if (!isUsernameMatch(username)) {
            //     logout();
            //     loginAs(username, password);
            // }
        }

    }

};