package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CopyCdeTest extends BaseClassificationTest {

    @Test
    public void copyCde() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Medication affecting cardiovascular function type exam day indicator");
        showAllTabs();
        clickElement(By.id("forks_tab"));
        textPresent("This element has no forks");
        clickElement(By.id("openCdeCopyModal"));
        textPresent("Please select at least one classification");
        Assert.assertFalse(findElement(By.id("saveCopy")).isEnabled());
        addClassificationToNewCdeMethod(new String[]{"NINDS", "Population", "Adult"});
        clickElement(By.id("saveCopy"));
        hangon(1);
        showAllTabs();
        textPresent("Incomplete", By.id("dd_status"));
        textPresent("Copy of: Medication affecting cardiovascular function type exam day indicator", By.id("nameEdit"));
        
    }

}
