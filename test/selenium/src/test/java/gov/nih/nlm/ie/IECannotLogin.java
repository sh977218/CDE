package gov.nih.nlm.ie;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IECannotLogin extends NlmCdeBaseTest {

    @SelectBrowser
    @Test
    public void ieCannotLogin() {
        clickElement(By.id("login_link"));
        textPresent("Internet Explorer is no longer supported to");
    }

}
