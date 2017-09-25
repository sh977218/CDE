package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class ReclassifyOrgClassificationTest extends NlmCdeBaseTest {
    String oldClassification = "OldClassification";
    String newClassification = "NewClassification";

    private void addOldClassificationTo(String cdeName) {
        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        textNotPresent(newClassification);
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        textPresent(oldClassification);
        textPresent(newClassification);
        clickElement(By.id("OldClassification-classifyBtn"));
        closeAlert();
    }

    @Test
    public void reclassifyOrgClassification() {
        String cdeName = "Gastrointestinal therapy water flush status";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        new Select(findElement(By.id("orgToManage"))).selectByVisibleText("org / or Org");
        clickElement(By.xpath(getOrgClassificationIconXpath("reclassify", new String[]{"OldClassification"})));
        textPresent("Classify CDEs in Bulk");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        clickElement(By.id("NewClassification-classifyBtn"));
        clickElement(By.id("cancelNewClassifyItemBtn"));

        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        textPresent(newClassification);
        textPresent(oldClassification);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("Classification Audit Log"));
        textPresent("Gastrointestinal therapy water flush status org / or Org > NewClassification");
    }

    @Test(dependsOnMethods = {"reclassifyOrgClassification"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("Z2hYKE_bwar"), "Actual: " + response);
    }
}
