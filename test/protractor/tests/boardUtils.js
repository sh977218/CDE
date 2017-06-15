const u = require('./testUtils');

module.exports = {

    utils: this,


    goToMyBoards: function () {
        element(by.id("boardsMenu")).click();
        u.textPresent("My Boards");
        element(by.id("myBoardsLink")).click();
        u.textPresent("Add Board");
    }

};