package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class AddDeleteOrgClassificationTest extends NlmCdeBaseTest {
    @Test
    public void cdeAddClassification() {
        String cdeName = "Surgical Procedure Other Anatomic Site Performed Indicator";
        String[] classificationArray1 = new String[]{"Disease", "Myasthenia Gravis", "Classification", "Supplemental"};
        String[] classificationArray2 = new String[]{"Domain", "Treatment/Intervention Data", "Therapies"};

        String[] classificationArray3 = new String[]{"Disease"};
        String[] classificationArray4 = new String[]{"Disease", "Myasthenia Gravis"};
        String[] classificationArray5 = new String[]{"Disease", "Myasthenia Gravis", "Classification"};

        mustBeLoggedInAs("classMgtUser", "pass");
        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        addClassificationByTree("NINDS", classificationArray1);
        checkRecentlyUsedClassifications("NINDS", classificationArray1);

        addClassificationByTree("NINDS", classificationArray2);


        addExistingClassification("NINDS", classificationArray3);
        addExistingClassification("NINDS", classificationArray4);
        addExistingClassification("NINDS", classificationArray5);
        addExistingClassification("NINDS", classificationArray1);

        openClassificationAudit("NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
        textPresent("classMgtUser");
        textPresent("Surgical Procedure Other Anatomic Site Performed Indicator");
        textPresent("add NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
    }


    @Test(dependsOnMethods = {"cdeAddClassification"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("cGx6UmQnY8G"), "Actual: " + response);
    }

}
