package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CDEUnclassifiedRegStatus extends NlmCdeBaseTest {

    @Test
    public void cdeUnclassifiedRegStatus() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("UnclassifiedCDE");
        startEditRegistrationStatus();
        textPresent("Elements that are not classified (or only classified by TEST");
        Assert.assertEquals(new Select(driver.findElement(By.name("newRegistrationStatus"))).getOptions().size(), 2);
    }

}
