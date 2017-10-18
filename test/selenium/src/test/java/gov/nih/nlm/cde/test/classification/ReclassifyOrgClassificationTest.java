package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class ReclassifyOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void reclassifyOrgClassification() {
        String oldClassification = "OldClassification";
        String newClassification = "NewClassification";
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
        goToClassification();
        textPresent(newClassification);
        textPresent(oldClassification);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("Classification Audit Log"));
        textPresent("Gastrointestinal therapy water flush status org / or Org > NewClassification");
    }

    @Test(dependsOnMethods = {"reclassifyOrgClassification"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2017-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("HyQz9G0oYaE"), "Actual: " + response);
    }
}
