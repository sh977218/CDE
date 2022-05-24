package gov.nih.nlm.system.loggers;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UsageLog extends NlmCdeBaseTest {

    @Test
    public void usageLogs() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToAudit();

        clickElement(By.xpath("//div[. = 'Usage']"));
        clickElement(By.id("search.submit"));
        textPresent("Days Ago");
        clickElement(By.xpath("//button[contains(.,'Reveal')]"));
    }

}
