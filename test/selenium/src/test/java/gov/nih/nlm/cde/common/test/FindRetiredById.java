package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FindRetiredById extends NlmCdeBaseTest {

    private void changeStatusAndCheckVisibility() {
        String url = driver.getCurrentUrl();
        clickElement(By.id("status_tab"));
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        textPresent("Retired elements are not returned in searches");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        driver.get(url);
    }

    @Test
    public void retiredCdeById() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Skull fracture anatomic site");

        changeStatusAndCheckVisibility();
        textPresent("this data element is retired.");
    }


    @Test
    public void retiredFormById() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("PTSD Checklist - Civilian (PCL-C)");

        changeStatusAndCheckVisibility();
        textPresent("this form is retired.");
    }

}