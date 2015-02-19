package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {
    
    QuestionTest questionTest = new QuestionTest();
    
    @Test
    public void formGetOutdated() {
        mustBeLoggedInAs(ctepCurator_username, password);
        
        resizeWindow(1024, 1150);

        String formName = "Form that gets outdated";
        String formDef = "Fill out carefully!";

        createForm(formName, formDef, null, "CTEP");
        new SectionTest().addSection("Any Section Name", "0 or more");
        startAddingQuestions();

        questionTest.addQuestionToSection("Noncompliant Reason Text", 0);
        questionTest.addQuestionToSection("Cytogenetics Karyotype Mutation Abnormality Cell Count", 0);
        
        saveForm();
        
        textNotPresent("Some CDEs in this form have newer version");
        textNotPresent("(Outdated)");
        
        goToCdeByName("Cytogenetics Karyotype Mutation Abnormality Cell Count");
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        newCdeVersion();
        
        goToFormByName(formName, "Incomplete");
        textPresent("Some CDEs in this form have newer version");
        findElement(By.linkText("Form Description")).click();
        textPresent("Cytogenetics Karyotype Mutation Abnormality Cell Count (Outdated)");
    }

    @Test
    public void formFacets() {
        gotoPublicForms();
        searchForm("FormSearchTest");
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textNotPresent("Vision Deficit Report");        
        textPresent(", Qualified");      
        findElement(By.id("li-blank-Recorded")).click();
        textPresent("Vision Deficit Report");        
        findElement(By.id("li-checked-Qualified")).click(); 
        textPresent("Vision Deficit Report");        
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        findElement(By.id("li-blank-Qualified")).click();     
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");        
        textPresent("Vision Deficit Report");
    }    
    
}
