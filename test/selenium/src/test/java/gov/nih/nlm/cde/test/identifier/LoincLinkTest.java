package gov.nih.nlm.cde.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LoincLinkTest extends NlmCdeBaseTest {
    @Test
    public void loincLink() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Ethnicity USA maternal category");
        clickElement(By.id("ids_tab"));
        clickElement(By.id("openNewIdentifierModalBtn"));
        findElement(By.name("source")).sendKeys("LOINC");
        findElement(By.name("id")).sendKeys("59362-4");
        clickElement(By.id("createNewIdentifierBtn"));
        closeAlert();
        findElement(By.linkText("59362-4"));
    }
}
