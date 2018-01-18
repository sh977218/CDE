package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateCdeTest extends BaseClassificationTest {

    @Test
    public void createCde() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        String name = "Abracadabra";
        String definition = "Definition for testUser CDE 1";
        fillOutBasicCreateFields(name, definition, "CTEP", "Submission and Reporting", "Breast Cancer Data Mart");

        textPresent("Submission and Reporting");
        textPresent("Breast Cancer Data Mart");

        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText("Select One");
        textPresent("Please select a steward for the new CDE");

        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText("NINDS");
        addClassificationMethod(new String[]{"NINDS", "Disease", "Traumatic Brain Injury"});
        modalGone();
        textPresent("Traumatic Brain Injury");

        deleteClassification("Disease,Traumatic Brain Injury");
        addClassificationMethod(new String[]{"NINDS", "Disease", "Headache"});
        checkRecentlyUsedClassificationsForNewCde(new String[]{"NINDS", "Disease", "Headache"});

        clickElement(By.id("submit"));

        textPresent(definition);

        goToClassification();

        textPresent("Submission and Reporting");
        textPresent("Breast Cancer Data Mart");

        textPresent("Disease");
        textPresent("Headache");

        goToIdentifiers();
        Assert.assertEquals("", findElement(By.id("dd_version_nlm")).getText());

        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        clickElement(By.partialLinkText("CDE Audit Log"));
        clickElement(By.partialLinkText(name));
        findElement(By.linkText(name));
    }

}
