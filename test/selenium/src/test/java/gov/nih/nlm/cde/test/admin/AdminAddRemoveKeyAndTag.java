package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddRemoveKeyAndTag extends NlmCdeBaseTest {

    private void addPropertyKeyByOrg(String orgName, String key) {
        WebElement elt = findElement(By.xpath("//*[@id='orgListName-" + orgName + "']//td[2]//input"));
        elt.sendKeys(key);
        elt.sendKeys(Keys.ENTER);
        checkAlert("Org Updated");
    }

    private void removePropertyKeyByOrg(String orgName, String key) {
        clickElement(By.xpath("//tr[@id='orgListName-" + orgName + "']//mat-chip[contains(. , '" + key + "')]//mat-icon"));
        checkAlert("Org Updated");
    }

    /**
     * Think before splitting this code into 2 classes. Running in parralle will cause trouble
     * unless you spend the extra 5 minutes and use 2 different stewards.
     */
    @Test
    public void adminAddRemovePropertyKey() {
        String orgName = "TEST";
        String propertyKey = "doYouSeeThis";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToPropertyKeysManagement();
        addPropertyKeyByOrg(orgName, propertyKey);
        findElement(By.xpath("//tr[@id='orgListName-TEST']//mat-chip[contains(. , 'doYouSeeThis')]"));

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.name("newKey"));
        new Select(findElement(By.name("newKey"))).selectByVisibleText(propertyKey);

        clickElement(By.xpath("//button[text()='Cancel']"));

        goToPropertyKeysManagement();

        removePropertyKeyByOrg(orgName, propertyKey);

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.name("newKey"));

        clickElement(By.name("newKey"));
        Assert.assertEquals(driver.findElements(By.xpath("//*[@name='newKey']//option[@value='doYouSeeThis']")).size(), 0);
    }


    private void addTagByOrg(String orgName, String key) {
        WebElement elt = findElement(By.xpath("//*[@id='orgListName-" + orgName + "']//td[2]//input"));
        elt.sendKeys(key);
        elt.sendKeys(Keys.ENTER);
        checkAlert("Org Updated");
    }

    private void removeTagByOrg(String orgName, String key) {
        clickElement(By.xpath("//tr[@id='orgListName-" + orgName + "']//mat-chip[contains(. , '" + key + "')]//mat-icon"));
        checkAlert("Org Updated");
    }

    @Test
    public void adminAddRemoveTags() {
        String orgName = "TEST";
        String tag = "canYouSeeThis";
        String cdeName = "Distance from Closest Margin Value";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToTagsManagement();
        addTagByOrg(orgName, tag);
        findElement(By.xpath("//tr[@id='orgListName-TEST']//mat-chip[contains(. , 'canYouSeeThis')]"));

        goToCdeByName(cdeName);
        goToNaming();
        clickElement(By.xpath("//button[contains(.,'Add Name')]"));
        textPresent("Tags are managed in Org Management > List Management");
        clickElement(By.xpath("//*[@id='newDesignationTags']//input"));
        selectMatDropdownByText("canYouSeeThis");
        clickElement(By.xpath("//button[text()='Cancel']"));

        goToTagsManagement();

        removeTagByOrg(orgName, tag);
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        goToNaming();
        clickElement(By.xpath("//button[contains(.,'Add Name')]"));
        clickElement(By.xpath("//*[@id='newDesignationTags']//input"));
        textNotPresent("canYouSeeThis");
    }


}
