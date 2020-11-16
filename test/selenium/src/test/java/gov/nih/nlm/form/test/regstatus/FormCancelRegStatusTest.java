package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FormCancelRegStatusTest extends NlmCdeBaseTest {
    @Test
    public void formCancelRegStatus() {
        String formName = "AED Resistance Log";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToGeneralDetailForm();
        textPresent("Qualified");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText("Recorded");
        clickElement(By.id("cancelRegStatus"));
        modalGone();
        goToFormByName(formName);
        goToGeneralDetailForm();
        textPresent("Qualified", By.cssSelector("[itemprop='registrationStatus']"));
    }

}
