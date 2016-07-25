package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EmbedTest extends NlmCdeBaseTest {

    @Test
    public void embedNinds() {
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Account Management"));
        clickElement(By.id("embeddingTab"));
    }

}
