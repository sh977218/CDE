package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddRemovePropertyKey extends NlmCdeBaseTest {

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
        clickElement(By.id("newKey"));
        new Select(findElement(By.id("newKey"))).selectByVisibleText(propertyKey);

        clickElement(By.id("cancelNewPropertyBtn"));

        goToPropertyKeysManagement();

        removePropertyKeyByOrg(orgName, propertyKey);

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));

        clickElement(By.id("newKey"));
        Assert.assertEquals(driver.findElements(By.xpath("//*[@id='newKey']//option[@value='doYouSeeThis']")).size(), 0);
    }

}
