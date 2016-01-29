package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.classification.ClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class WorkingGroupTest3 extends BaseClassificationTest {

    @Test
    public void wgRegStatus() {
        mustBeLoggedInAs(wguser_username, password);
        new CdeCreateTest().createBasicCde("WG Test CDE", "Def", "WG-TEST", "WG Classif", "WG Sub Classif");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        List<WebElement> options = new Select(driver.findElement(By.name("registrationStatus"))).getOptions();
        for (WebElement option : options) {
            Assert.assertNotEquals("Qualified", option.getText());
            Assert.assertNotEquals("Recorded", option.getText());
        }
    }

    @Test
    public void wgClassificationsInvisible() {
        mustBeLoggedInAs(wguser_username, password);
        goToCdeByName("Specimen Block Received Count");
        showAllTabs();
        clickElement(By.id("classification_tab"));
        new ClassificationTest().addClassificationMethod(new String[]{"WG-TEST", "WG Classif", "WG Sub Classif"});
        textPresent("WG Sub Classif");
        logout();
        goToCdeByName("Specimen Block Received Count");
        showAllTabs();
        clickElement(By.id("classification_tab"));
        textNotPresent("WG Sub Classif");
    }


}
