package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriverException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RenameOrgClassificationTest extends BaseClassificationTest {

    @Test
    public void renameOrgClassification() {
        String org = "NINDS";
        String[] categories1 = new String[]{"Domain", "Protocol Experience"};
        String[] categories2 = new String[]{"Domain", "Protocol Experiencies"};
        String classification = "Protocol Experiencies";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        renameClassificationUnderPath(categories1, classification);
        expandOrgClassification(org);
        expandOrgClassificationUnderPath(categories2);
        findElement(By.xpath("//*[@id='Domain,Protocol Experiencies']"));
        findElement(By.xpath("//*[@id='Domain,Protocol Experiencies,Participant/Subject Identification, Eligibility, and Enrollment']"));
        clickElement(By.xpath("//*[@id='Domain,Protocol Experiencies,Participant/Subject Identification, Eligibility, and Enrollment']"));
        switchTab(1);
        textPresent(classification);
        switchTabAndClose(0);

        openAuditClassification("NINDS > Domain > Protocol Experience");
        textPresent("rename NINDS > Domain > Protocol Experience to Protocol Experiencies");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("1281 elements"));
    }

}
