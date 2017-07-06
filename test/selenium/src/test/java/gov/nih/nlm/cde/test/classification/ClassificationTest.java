package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class ClassificationTest extends BaseClassificationTest {

    @Test
    public void addClassification() {
        mustBeLoggedInAs("classMgtUser", "pass");
        goToCdeByName("Surgical Procedure Other Anatomic Site Performed Indicator");
        clickElement(By.id("classification_tab"));
        _addClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis", "Classification", "Supplemental"});
        checkRecentlyUsedClassifications(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis", "Classification", "Supplemental"});
        hangon(1);
        _addClassificationMethod(new String[]{"NINDS", "Domain",
                "Treatment/Intervention Data", "Therapies"});

        _addExistsClassificationMethod(new String[]{"NINDS", "Disease"});
        _addExistsClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis"});
        _addExistsClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis", "Classification"});
        _addExistsClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis", "Classification", "Supplemental"});


        openClassificationAudit("NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
        textPresent("classMgtUser");
        textPresent("Surgical Procedure Other Anatomic Site Performed Indicator");
        textPresent("add NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
    }

    @Test(dependsOnMethods = {"addClassification"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("cGx6UmQnY8G"), "Actual: " + response);
    }

}
