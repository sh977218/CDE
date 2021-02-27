package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CopyFormButton extends NlmCdeBaseTest {

    @Test
    public void curatorCanCopy() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Ethnic Group Category Text");
        findElement(By.id("copyCdeBtn"));

        goToFormByName("Patient Health Questionnaire-2 (PHQ-2) More Questions");
        findElement(By.id("copyFormBtn"));
    }

    @Test
    public void regUserCantCopy() {
        mustBeLoggedInAs(reguser_username, password);
        goToCdeByName("Ethnic Group Category Text");
        Assert.assertEquals(driver.findElements(By.id("copyCdeBtn")).size(), 0);

        goToFormByName("Patient Health Questionnaire-2 (PHQ-2) More Questions");
        Assert.assertEquals(driver.findElements(By.id("copyFormBtn")).size(), 0);
    }


}
