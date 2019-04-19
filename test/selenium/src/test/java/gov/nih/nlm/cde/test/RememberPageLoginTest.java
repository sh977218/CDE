package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RememberPageLoginTest extends NlmCdeBaseTest {

    @Test
    public void rememberLoginPage() {
        goToCdeByName("Intracranial procedure type other text");
        textPresent("Specify in text for the intracranial procedure type if it is not listed above");
        clickElement(By.id("login_link"));
        findElement(By.id("uname")).sendKeys(ninds_username);
        findElement(By.id("passwd")).sendKeys(password);
        clickElement(By.id("login_button"));
        textPresent("Specify in text for the intracranial procedure type if it is not listed above");
    }

}
