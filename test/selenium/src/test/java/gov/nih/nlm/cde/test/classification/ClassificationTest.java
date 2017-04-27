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

        _addClassificationMethod(new String[]{"NINDS", "Disease"});
        textPresent("Classification Already Exists");
        _addClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis"});
        textPresent("Classification Already Exists");
        _addClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis", "Classification"});
        textPresent("Classification Already Exists");
        _addClassificationMethod(new String[]{"NINDS", "Disease",
                "Myasthenia Gravis", "Classification", "Supplemental"});
        textPresent("Classification Already Exists");

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

    private void removeClassificationMethod(String[] categories) {
        String selector = "";
        for (int i = 0; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1)
                selector += ",";
        }
        clickElement(By.id(selector + "-unclassifyBtn"));
        textPresent("You are about to delete " + categories[categories.length - 1] + " classification. Are you sure?");
        clickElement(By.id("confirmDeleteClassificationBtn"));
        closeAlert();
        Assert.assertTrue(checkElementDoesNotExistByLocator(By.id(selector)));
    }

    @Test
    public void deleteClassification() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName("Spectroscopy geometry location not applicable indicator");
        clickElement(By.id("classification_tab"));
        findElement(By.id("Domain,Assessments and Examinations,Imaging Diagnostics"));
        removeClassificationMethod(new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics"});

        findElement(By.id("Domain,Assessments and Examinations"));
        removeClassificationMethod(new String[]{"Disease", "Myasthenia Gravis"});
        textNotPresent("Myasthenia Gravis");
        openClassificationAudit("NINDS > Disease > Myasthenia Gravis");
        textPresent("classMgtUser");
        textPresent("delete NINDS > Disease > Myasthenia Gravis");
    }

    @Test
    public void classificationLink() {
        goToCdeByName("Spectroscopy water signal removal filter text");
        clickElement(By.id("classification_tab"));
        clickElement(By.id("Disease,Amyotrophic Lateral Sclerosis,Domain,Assessments and Examinations,Imaging Diagnostics"));
        showSearchFilters();
        textPresent("Classification");
        textPresent(" NINDS (114)");
        textPresent("Imaging Diagnostics");
    }

}
