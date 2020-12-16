package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormUnclassifiedRegStatus extends NlmCdeBaseTest {

    @Test
    public void formUnclassifiedRegStatus() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("UnclassifiedForm");
        goToGeneralDetail();
        clickElement(By.id("editStatus"));
        textPresent("Elements that are not classified (or only classified by TEST");
        Assert.assertEquals(new Select(driver.findElement(By.name("newRegistrationStatus"))).getOptions().size(), 2);
    }


}
