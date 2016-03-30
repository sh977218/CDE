exports.command = function(cssSelector){
    this.waitForElementVisible(cssSelector);
    this.click(cssSelector);
}; 