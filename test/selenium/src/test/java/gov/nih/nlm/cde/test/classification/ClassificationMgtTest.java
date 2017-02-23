package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgtTest extends BaseClassificationTest {
    private void searchNestedClassifiedCdes() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("classification.elements.elements.name:Epilepsy");
        findElement(By.id("search.submit")).click();
    }

    private void searchNestedClassifiedForms() {
        goToFormSearch();
        findElement(By.name("q")).sendKeys("classification.elements.elements.name:Epilepsy");
        findElement(By.id("search.submit")).click();
    }

    private void deleteNestedClassifTree() {
        deleteMgtClassification("classification-Disease,Epilepsy", "Epilepsy");
        textNotPresent("Epilepsy");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Epilepsy']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Epilepsy,Assessments and Examinations']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Epilepsy,Assessments and Examinations,Imaging Diagnostics']");
    }

    @Test
    public void viewOrgClassifications() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByVisibleText("PS&CC");
        textPresent("edu.fccc.brcf.domain");
        textNotPresent("Magnetic Resonance Imaging (MRI)");
        new Select(findElement(By.cssSelector("select"))).selectByVisibleText("ACRIN");
        textPresent("Magnetic Resonance Imaging (MRI)");
        textNotPresent("edu.fccc.brcf.domain");
    }

    @Test
    public void removeClassificationMgt() {
        mustBeLoggedInAs(ninds_username, password);
        searchNestedClassifiedCdes();
        textPresent("NINDS (9");
        searchNestedClassifiedForms();
        Assert.assertTrue(getNumberOfResults() > 40);
        gotoClassificationMgt();

        Assert.assertTrue(findElement(By.cssSelector("[id='classification-Disease,Epilepsy'] .name")).getText().equals("Epilepsy"));
        Assert.assertTrue(findElement(By.cssSelector("[id='classification-Disease,Epilepsy,Classification'] .name")).getText().equals("Classification"));
        Assert.assertTrue(findElement(By.cssSelector("[id='classification-Disease,Epilepsy,Classification,Supplemental'] .name")).getText().equals("Supplemental"));

        deleteNestedClassifTree();
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

    @Test
    public void addNestedClassification() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        textPresent("Headache");
        createClassificationName(org, new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics", "MRI"});
        modalGone();
        createClassificationName(org, new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics", "MRI", "Contrast T1"});
        modalGone();
    }

    @Test
    public void link() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        textPresent("Headache");
    }
}
