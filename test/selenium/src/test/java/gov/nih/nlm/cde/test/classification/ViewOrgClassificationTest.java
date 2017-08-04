package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ViewOrgClassificationTest extends NlmCdeBaseTest {
    @Test
    public void viewOrgClassifications() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Classifications"));
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByVisibleText("PS&CC");
        textPresent("edu.fccc.brcf.domain");
        textNotPresent("Magnetic Resonance Imaging (MRI)");
        new Select(findElement(By.cssSelector("select"))).selectByVisibleText("ACRIN");
        textPresent("Magnetic Resonance Imaging (MRI)");
        textNotPresent("edu.fccc.brcf.domain");
    }
}
