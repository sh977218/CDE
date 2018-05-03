package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddRemoveTags extends NlmCdeBaseTest {

    private void addPropertyKeyByOrg(String orgName, String key) {
        String xpath = "//*[@id='orgListName-" + orgName + "']//td[2]//input";
        clickElement(By.xpath(xpath));
        selectNgSelectDropdownByText(key);
        checkAlert("Org Updated");
    }

    private void removePropertyKeyByOrg(String orgName, String key) {
        String xpath = "//tr[@id='orgListName-" + orgName + "']//td[2]/ng-select/div/div//div[contains(.,'" + key + "')]/span[1]";
        clickElement(By.xpath(xpath));
        checkAlert("Org Updated");
    }

    private void addTagByOrg(String orgName, String key) {
        String xpath = "//*[@id='orgListName-" + orgName + "']//td[3]//input";
        clickElement(By.xpath(xpath));
        selectNgSelectDropdownByText(key);
        checkAlert("Org Updated");
    }

    private void removeTagByOrg(String orgName, String key) {
        String xpath = "//tr[@id='orgListName-" + orgName + "']//td[3]/ng-select/div/div//div[contains(.,'" + key + "')]/span[1]";
        clickElement(By.xpath(xpath));
        checkAlert("Org Updated");
    }

    @Test
    public void adminAddRemoveTags() {
        String orgName = "TEST";
        String tag = "canYouSeeThis";
        String cdeName = "Distance from Closest Margin Value";
        mustBeLoggedInAs(nlm_username, nlm_password);
        openUserMenu();
        goToOrgManagement();
        goToListManagement();
        addTagByOrg(orgName, tag);
        findElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]/ng-select/div/div//div[contains(.,'doYouSeeThis')]/span"));

        goToCdeByName(cdeName);
        goToNaming();
        clickElement(By.id("openNewNamingModalBtn"));
        textPresent("Tags are managed in Org Management > List Management");
        clickElement(By.xpath("//*[@id='newTags']//input"));
        clickElement(By.xpath("//span[contains(@class,'select2-results')]/ul//li[text()='canYouSeeThis']"));
        clickElement(By.id("cancelNewNamingBtn"));

        openUserMenu();
        goToOrgManagement();
        goToListManagement();

        removeTagByOrg(orgName, tag);
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        goToNaming();
        clickElement(By.id("openNewNamingModalBtn"));
        clickElement(By.xpath("//*[@id='newTags']//input"));
        textNotPresent("canYouSeeThis");

    }

    @Test
    public void adminAddRemovePropertyKey() {
        String orgName = "TEST";
        String propertyKey = "doYouSeeThis";
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        addPropertyKeyByOrg(orgName, propertyKey);
        findElement(By.xpath("//tr[@id='orgListName-TEST']//td[2]/ng-select/div/div//div[contains(.,'doYouSeeThis')]/span"));

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));
        findElement(By.xpath("//option[@value='doYouSeeThis']"));
        findElement(By.xpath("//option[@value='propKey0']"));

        clickElement(By.id("cancelNewPropertyBtn"));

        openUserMenu();
        goToOrgManagement();
        goToListManagement();

        removePropertyKeyByOrg(orgName, propertyKey);

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));

        clickElement(By.xpath("//option[@value='propKey0']"));
        Assert.assertEquals(driver.findElements(By.xpath("//option[@value='doYouSeeThis']")).size(), 0);
    }

}
