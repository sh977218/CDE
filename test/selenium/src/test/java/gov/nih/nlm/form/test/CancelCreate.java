package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CancelCreate extends NlmCdeBaseTest {

    @Test
    public void cancelCreate() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createFormLink"));
        clickCancelButton();
        isSearchWelcome();
    }

}
