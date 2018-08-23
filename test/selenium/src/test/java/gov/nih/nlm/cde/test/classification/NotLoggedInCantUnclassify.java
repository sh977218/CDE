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
        goToClassification();
        textPresent("Assessments");
        Assert.assertTrue(driver.findElements(By.xpath("//mat-icon[.  = 'delete_outline']")).size() > 0);

        logout();
        goToCdeByName("Lower limb tone findings result");
        goToClassification();
        textPresent("Assessments");
        Assert.assertEquals(driver.findElements(By.xpath("//mat-icon[.  = 'delete_outline']")).size(), 0);
    }

}
