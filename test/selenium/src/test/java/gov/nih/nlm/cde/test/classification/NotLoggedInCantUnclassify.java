package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NotLoggedInCantUnclassify extends NlmCdeBaseTest {

    @Test
    public void notLoggedInCantUnclassify() {
        mustBeLoggedInAs("nlm", nlm_password);
        goToCdeByName("Lower limb tone findings result");
        clickElement(By.id("classification_tab"));
        textPresent("Assessments");
        Assert.assertTrue(driver.findElements(By.cssSelector(".fa-trash-o")).size() > 0);

        mustBeLoggedOut();
        goToCdeByName("Lower limb tone findings result");
        clickElement(By.id("classification_tab"));
        textPresent("Assessments");
        Assert.assertEquals(driver.findElements(By.cssSelector(".fa-trash-o")).size(), 0);
    }

}
