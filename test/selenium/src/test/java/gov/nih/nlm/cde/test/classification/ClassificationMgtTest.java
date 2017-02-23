package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgtTest extends BaseClassificationTest {

    private void searchNestedClassifiedCdes() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("classification.elements.elements.name:Facioscapulohumeral muscular dystrophy");
        findElement(By.id("search.submit")).click();
    }

    private void searchNestedClassifiedForms() {
        goToFormSearch();
        findElement(By.name("q")).sendKeys("classification.elements.elements.name:Facioscapulohumeral muscular dystrophy");
        findElement(By.id("search.submit")).click();
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
        textPresent("NINDS (6");
        searchNestedClassifiedForms();
        Assert.assertTrue(getNumberOfResults() > 40);
        gotoClassificationMgt();

        Assert.assertTrue(findElement(By.cssSelector("[id='classification-Disease,Facioscapulohumeral muscular dystrophy'] .name")).getText().equals("Facioscapulohumeral muscular dystrophy"));
        Assert.assertTrue(findElement(By.cssSelector("[id='classification-Disease,Facioscapulohumeral muscular dystrophy,Classification'] .name")).getText().equals("Classification"));
        Assert.assertTrue(findElement(By.cssSelector("[id='classification-Disease,Facioscapulohumeral muscular dystrophy,Classification,Supplemental'] .name")).getText().equals("Supplemental"));

        deleteMgtClassification("classification-Disease,Facioscapulohumeral muscular dystrophy", "Facioscapulohumeral muscular dystrophy");
        textNotPresent("Facioscapulohumeral muscular dystrophy");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Facioscapulohumeral muscular dystrophy']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Facioscapulohumeral muscular dystrophy,Assessments and Examinations']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Facioscapulohumeral muscular dystrophy,Assessments and Examinations,Imaging Diagnostics']");

        searchNestedClassifiedCdes();
        hangon(3);
        textNotPresent("NINDS (6)");
        searchNestedClassifiedForms();
        hangon(1);
        textNotPresent("NINDS (22)");

        openClassificationAudit("NINDS > Disease > Facioscapulohumeral muscular dystrophy");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("942 elements"));
        textPresent("delete NINDS > Disease > Facioscapulohumeral muscular dystrophy");
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
