package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

public class AdminAddRemoveTags extends NlmCdeBaseTest {

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
        clickElement(By.id("openNewDesignationModalBtn"));
        textPresent("Tags are managed in Org Management > List Management");
        clickElement(By.xpath("//*[@id='newDesignationTags']//input"));
        selectMatSelectDropdownByText("canYouSeeThis");
        clickElement(By.id("cancelNewDesignationBtn"));

        goToTagsManagement();

        removeTagByOrg(orgName, tag);
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        goToNaming();
        clickElement(By.id("openNewDesignationModalBtn"));
        clickElement(By.xpath("//*[@id='newDesignationTags']//input"));
        textNotPresent("canYouSeeThis");
    }


}
