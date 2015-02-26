package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgtTest extends BaseClassificationTest {
    private void searchNestedClassifiedCdes() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("classification.elements.elements.name:Epilepsy");
        findElement(By.id("search.submit")).click();    
    }
    
    private void searchNestedClassifiedForms() {
        goToFormSearch();
        findElement(By.name("ftsearch")).sendKeys("classification.elements.elements.name:Epilepsy");
        findElement(By.id("search.submit")).click();    
    }    

    private void deleteNestedClassifTree() {
        deleteMgtClassification("classification-Disease,Epilepsy","Epilepsy");
        Assert.assertTrue(textNotPresent("Epilepsy"));
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
        new Select(findElement(By.cssSelector("select"))).selectByValue("caBIG");
        textPresent("gov.nih.nci.cananolab.domain.characterization.invitro");
        textNotPresent("Common Terminology Criteria for Adverse Events v3.0");
        hangon(3);
        new Select(findElement(By.cssSelector("select"))).selectByValue("CTEP");
        textPresent("Common Terminology Criteria for Adverse Events v3.0");
        textNotPresent("gov.nih.nci.cananolab.domain.characterization.invitro");        
    }
    
    @Test
    public void removeClassificationMgt() {
        mustBeLoggedInAs(ninds_username, password);
        searchNestedClassifiedCdes();
        Assert.assertTrue(textPresent("NINDS (8"));
        searchNestedClassifiedForms();
        Assert.assertTrue(textPresent("NINDS (40)"));
        gotoClassifMgt();
        
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy'] .name")).getText().equals("Epilepsy"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy,Classification'] .name")).getText().equals("Classification"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy,Classification,Supplemental'] .name")).getText().equals("Supplemental"));    

        deleteNestedClassifTree();  
        searchNestedClassifiedCdes();
        hangon(3);
        Assert.assertTrue(textNotPresent("NINDS (8)"));
        searchNestedClassifiedForms();
        hangon(1);
        Assert.assertTrue(textNotPresent("NINDS (40)"));
    }
    
    @Test
    public void addNestedClassification() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassifMgt();
        Assert.assertTrue(textPresent("Headache"));
        createClassificationName(org, new String[]{"Domain","Assessments and Examinations","Imaging Diagnostics","MRI"});
        modalGone();
        createClassificationName(org, new String[]{"Domain","Assessments and Examinations","Imaging Diagnostics","MRI","Contrast T1"});
        modalGone();
    }
    
    @Test
    public void link() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassifMgt();
        Assert.assertTrue(textPresent("Headache"));

    }
}
