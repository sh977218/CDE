package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RemoveOrgClassificationTest extends BaseClassificationTest {

    @Test
    public void removeOrgClassification() {
        String org = "NINDS";
        String[] categories = new String[]{"Domain", "Participant/Subject Characteristics"};
        String classification = "Participant/Subject Characteristics";
        mustBeLoggedInAs(ninds_username, password);
        searchNestedClassifiedCdes();
        textPresent("NINDS (102");
        searchNestedClassifiedForms();
        textPresent("NINDS (34");
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        deleteClassificationUnderPath(categories, classification);
        searchNestedClassifiedCdes();
        hangon(3);
        textNotPresent("NINDS (102");
        searchNestedClassifiedForms();
        hangon(1);
        textNotPresent("NINDS (34");
        openAuditClassification("NINDS > Domain > Participant/Subject Characteristics");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ cdes") || body.contains("942 elements"));
        textPresent("delete NINDS > Domain > Participant/Subject Characteristics");
    }
}
