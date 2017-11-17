package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RemoveOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void removeOrgClassification() {
        mustBeLoggedInAs(ninds_username, password);
        searchNestedClassifiedCdes();
        textPresent("NINDS (102");
        searchNestedClassifiedForms();
        textPresent("NINDS (34");
        gotoClassificationMgt();
        deleteOrgClassification("NINDS", new String[]{"Domain", "Participant/Subject Characteristics"});
        searchNestedClassifiedCdes();
        hangon(3);
        textNotPresent("NINDS (102");
        searchNestedClassifiedForms();
        hangon(1);
        textNotPresent("NINDS (34");
        openClassificationAudit("NINDS > Domain > Participant/Subject Characteristics");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("942 elements"));
        textPresent("delete NINDS > Domain > Participant/Subject Characteristics");
    }
}
