package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriverException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RenameClassificationTest extends NlmCdeBaseTest {

    @Test
    public void renameClassification() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        clickElement(By.xpath(getOrgClassificationIconXpath("rename", new String[]{"Domain", "Protocol Experience"})));
        findElement(By.id("newClassificationName")).clear();
        // .clear doesn't trigger modal changes. this is trick
        findElement(By.id("newClassificationName")).sendKeys("a");
        findElement(By.id("newClassificationName")).sendKeys(Keys.BACK_SPACE);
        textPresent("Name is required");
        clickElement(By.id("cancelRenameClassificationBtn"));
        modalGone();
        clickElement(By.xpath(getOrgClassificationIconXpath("rename", new String[]{"Domain", "Protocol Experience"})));
        findElement(By.id("newClassificationName")).sendKeys(Keys.BACK_SPACE);
        findElement(By.id("newClassificationName")).sendKeys("ies;");
        textPresent("Classification Name cannot contain ;");
        findElement(By.id("newClassificationName")).sendKeys(Keys.BACK_SPACE);
        clickElement(By.id("confirmRenameClassificationBtn"));
        textPresent("Renaming in progress.");
        closeAlert();
        try {
            textPresent("Renaming complete.");
            closeAlert();
        } catch (WebDriverException e) {
            textPresent("Renaming complete.");
            closeAlert();
        }
        findElement(By.xpath("//*[@id='Domain,Protocol Experiencies']"));
        findElement(By.xpath("//*[@id='Domain,Protocol Experiencies,Participant/Subject Identification, Eligibility, and Enrollment']"));
        clickElement(By.xpath("//*[@id='Domain,Protocol Experiencies,Participant/Subject Identification, Eligibility, and Enrollment']"));
        switchTab(1);
        textPresent("Protocol Experiencies");
        switchTabAndClose(0);

        openClassificationAudit("NINDS > Domain > Protocol Experience");
        textPresent("rename NINDS > Domain > Protocol Experience to Protocol Experiencies");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("1281 elements"));
    }

}
