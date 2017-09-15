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
        textPresent("NINDS (9");
        searchNestedClassifiedForms();
        Assert.assertTrue(getNumberOfResults() > 40);
        gotoClassificationMgt();
        deleteOrgClassification("NINDS", new String[]{"Disease", "Epilepsy"});
        searchNestedClassifiedCdes();
        hangon(3);
        textNotPresent("NINDS (9)");
        searchNestedClassifiedForms();
        hangon(1);
        textNotPresent("NINDS (44)");
        openClassificationAudit("NINDS > Disease > Epilepsy");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("942 elements"));
        textPresent("delete NINDS > Disease > Epilepsy");
    }
}
