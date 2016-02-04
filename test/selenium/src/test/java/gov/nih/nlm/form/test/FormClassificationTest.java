package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.classification.ClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormClassificationTest extends BaseFormTest {            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        clickElement(By.id("classification_tab"));
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");
        clickElement(By.linkText("Participant/Subject History and Family History"));
        textPresent("Skin Cancer Patient");
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        clickElement(By.id("classification_tab"));
        new ClassificationTest().addClassificationMethod(new String[]{"NINDS","Disease","Traumatic Brain Injury"});          
    }  
    
    @Test
    public void classifyFormCdes() {
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName("Deployment Risk and Resiliency Inventory, Version 2 (Combat)");
        clickElement(By.id("classification_tab"));
        clickElement(By.id("classifyAllCdes"));
        clickElement(By.cssSelector("[id='addClassification-ABTC'] span.fake-link"));
        clickElement(By.cssSelector("[id='addClassification-ABTC 0904'] button"));
        
        // Verify
        goToCdeByName("Deployment Risk and Resilience Inventory 2 (DRRI-2) - Combat Experiences - Combat patrol frequency scale");
        clickElement(By.id("classification_tab"));
        textPresent("ABTC");
        textPresent("ABTC 0904");

        goToCdeByName("Deployment Risk and Resilience Inventory 2 (DRRI-2) - Combat Experiences - Witness enemy serious injury casuality frequency scale");
        clickElement(By.id("classification_tab"));
        textPresent("ABTC");
        textPresent("ABTC 0904");

    }
}
