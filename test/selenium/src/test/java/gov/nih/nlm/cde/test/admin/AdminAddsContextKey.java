package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AdminAddsContextKey extends NlmCdeBaseTest {
    
    @Test
    @RecordVideo
    public void addRemoveContext() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.cssSelector("#add_org_context_TEST"));
        findElement(By.id("newValue")).sendKeys("canYouSeeThis");
        clickElement(By.id("okValue"));
        textPresent("Org has been updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        textPresent("Contexts are managed in Org Management > List Management");
        clickElement(By.id("newContext"));
        textPresent("canYouSeeThis");

        clickElement(By.id("cancelCreate"));
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));

        scrollToViewById("orgListName-Training");
        clickElement(By.xpath("//span/span[contains(.,'canYouSeeThis')]/i"));
        textPresent("Org has been updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        clickElement(By.id("newContext"));
        textNotPresent("canYouSeeThis");
    }

}
