package gov.nih.nlm.form.test;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class FormClassificationTest extends BaseFormTest {            
    @Test
    public void formClassificationLink() {
        goToFormByName("Skin Cancer Patient");
        findElement(By.linkText("Classification")).click();
        textPresent("Disease");
        textPresent("Headache");
        textPresent("Participant/Subject History and Family History");          
        findElement(By.linkText("Participant/Subject History and Family History")).click();
        textPresent("Participant/Subject History and Family History");   
        textPresent("Skin Cancer Patient");
        textPresent("Vision Deficit Report");               
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs("ninds", "pass");
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        addClassificationMethod(new String[]{"NINDS","Disease","Traumatic Brain Injury"});          
    }  
    
    @Test
    public void classifyFormCdes() {
        resizeWindow(1024, 1300);        
        mustBeLoggedInAs("ninds", "pass");
        
        //Create a new form
        String formName = "Central Nervous System Malign Neoplasm";
        String formDef = "Symptoms, onset, treatment.";
        String formV = "0.1alpha";        
        createForm(formName, formDef, formV, "NINDS");
        new SectionTest().addSection("Patient Information", null);
        new SectionTest().addSection("Diagnostic Methods", null);
        findElement(By.id("startAddingQuestions")).click();
        new QuestionTest().addQuestionToSection("Patient Name", 0);
        new QuestionTest().addQuestionToSection("Person Birth Date", 0);
        new QuestionTest().addQuestionToSection("Imaging contrast agent name", 1); 
        hangon(5);
        findElement(By.id("startAddingQuestions")).click();
        hangon(20);
        textPresent("Imaging contrast agent name");       
        saveForm();
        
        //Modify one of them                        
        goToCdeByName("Imaging contrast agent name");
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(".001");
        saveCde();
        goToCdeByName("Imaging contrast agent name");
        textPresent("[def change number 1]");        
        
        //Classify All
        goToFormByName(formName);
        findElement(By.linkText("Form Description")).click();
        findElement(By.id("classifyAllCdes")).click();
        findElement(By.cssSelector("[id='addClassification-Disease'] span.fake-link")).click();        
        findElement(By.cssSelector("[id='addClassification-Headache'] span.fake-link")).click();
        findElement(By.cssSelector("[id='addClassification-Outcomes and End Points'] span.fake-link")).click();        
        findElement(By.cssSelector("[id='addClassification-Patient Reported Outcomes'] button")).click();        
        
        // Verify
        goToCdeByName("Patient Name");
        findElement(By.linkText("Classification")).click();
        textPresent("Outcomes and End Points");
        textPresent("Patient Reported Outcomes");
        goToCdeByName("Person Birth Date");
        findElement(By.linkText("Classification")).click();
        textPresent("Outcomes and End Points");
        textPresent("Patient Reported Outcomes");
        
        goToCdeByName("Imaging contrast agent name");
        findElement(By.linkText("Classification")).click();
        textPresent("Outcomes and End Points");
        textPresent("Patient Reported Outcomes");
        findElement(By.linkText("History")).click();
        findElement(By.id("prior-0")).click();
        findElement(By.linkText("Classification")).click();
        textPresent("Outcomes and End Points");
        textPresent("Patient Reported Outcomes");
    }     
}
