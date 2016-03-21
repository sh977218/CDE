package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddUmlsPv extends NlmCdeBaseTest {

    @Test
    public void addUmlsPv() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator");
        clickElement(By.id("pvs_tab"));
        clickElement(By.partialLinkText("Add Permissible Value"));
        clickElement(By.id("valueMeaningNameInput"));
        findElement(By.id("valueMeaningNameInput")).sendKeys("Female");
    }


}
