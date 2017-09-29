package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LoginCannotEditSomeTabsTest extends NlmCdeBaseTest {
    @Test
    public void loginCannotEditSomeTabs() {
        String formName = "Draft Form Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("classification_tab"));
        textPresent("Go to current non-draft version to see classifications");
        clickElement(By.id("attachments_tab"));
        textPresent("Go to current non-draft version to see attachments");
        clickElement(By.id("discussBtn"));
        textPresent("Go to current non-draft version to see comments");
    }
}


