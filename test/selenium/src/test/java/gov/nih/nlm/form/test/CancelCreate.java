package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CancelCreate extends NlmCdeBaseTest {

    @Test
    public void cancelCreate() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("createEltLink"));
        clickElement(By.id("createFormLink"));
        clickElement(By.cssSelector("button[color='warn']"));
        textPresent("Browse by Classification");
    }

}
