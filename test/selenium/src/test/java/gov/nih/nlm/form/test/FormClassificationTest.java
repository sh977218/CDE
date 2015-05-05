package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.ClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormClassificationTest extends BaseFormTest {            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        findElement(By.linkText("Classification")).click();
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");          
        findElement(By.linkText("Participant/Subject History and Family History")).click();
        findElement(By.id("li-blank-Recorded")).click();
        textPresent("Skin Cancer Patient");
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        waitAndClick(By.linkText("Classification"));
        new ClassificationTest().addClassificationMethod(new String[]{"NINDS","Disease","Traumatic Brain Injury"});          
    }  
    
    @Test
    public void classifyFormCdes() {
        resizeWindow(1024, 1300);        
        mustBeLoggedInAs(ninds_username, password);
        
        //Create a new form
        String formName = "Central Nervous System Malign Neoplasm";
        String formDef = "Symptoms, onset, treatment.";
        String formV = "0.1alpha";        
        createForm(formName, formDef, formV, "NINDS");
        new CreateEditSectionTest().addSection("Patient Information", null);
        new CreateEditSectionTest().addSection("Diagnostic Methods", null);
        startAddingQuestions();
        String cde1 = "Informed consent type",
                cde2 = "Person Birth Date",
                cde3 = "Imaging contrast agent name";
        
        
        new QuestionTest().addQuestionToSection(cde1, 0);
        new QuestionTest().addQuestionToSection(cde2, 0);
        new QuestionTest().addQuestionToSection(cde3, 1); 
        hangon(2);
        startAddingQuestions();
        textPresent(cde3);       
        saveForm();
        
        //Modify one of them                        
        goToCdeByName(cde3);
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        newCdeVersion();
        textPresent("[def change number 1]");        
        
        //Classify All
        goToFormByName(formName, "Incomplete");
        textPresent("Some CDEs in this form");
        findElement(By.linkText("Form Description")).click();
        findElement(By.id("classifyAllCdes")).click();
        clickElement(By.cssSelector("[id='addClassification-Disease'] span.fake-link"));        
        clickElement(By.cssSelector("[id='addClassification-Headache'] span.fake-link"));
        clickElement(By.cssSelector("[id='addClassification-Classification'] span.fake-link"));        
        clickElement(By.cssSelector("[id='addClassification-Supplemental'] button"));        
        
        // Verify
        goToCdeByName(cde1);
        findElement(By.linkText("Classification")).click();
        textPresent("Headache");
        textPresent("Supplemental");
        goToCdeByName(cde2);
        findElement(By.linkText("Classification")).click();
        textPresent("Headache");
        textPresent("Supplemental");
        
        goToCdeByName(cde3);
        findElement(By.linkText("Classification")).click();
        textPresent("Headache");
        textPresent("Supplemental");
        findElement(By.linkText("History")).click();
        findElement(By.id("prior-0")).click();
        findElement(By.linkText("Classification")).click();
        textPresent("Headache");
        textPresent("Supplemental");
    }     
}
