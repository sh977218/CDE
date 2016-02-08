package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FindRetiredById extends NlmCdeBaseTest {

    private void changeStatusAndCheckVisibility() {
        String url = driver.getCurrentUrl();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.xpath("//*[@id='editStatus']"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        clickElement(By.id("saveRegStatus"));
        closeAlert();

        driver.get(url);
    }

    @Test
    public void retiredCdeById() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Skull fracture anatomic site");
        showAllTabs();
        changeStatusAndCheckVisibility();
        textPresent("this data element is retired.");
    }


    @Test
    public void retiredFormById() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("PTSD Checklist - Civilian (PCL-C)");
        showAllTabs();
        changeStatusAndCheckVisibility();
        textPresent("this form is retired.");
    }

}