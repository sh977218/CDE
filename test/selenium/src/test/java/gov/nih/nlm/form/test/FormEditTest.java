package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormEditTest extends BaseFormTest {
    
    QuestionTest questionTest = new QuestionTest();
    
    //@Test
    public void formGetOutdated() {
        mustBeLoggedInAs(ctepCurator_username, password);
        
        resizeWindow(1024, 1150);

        String formName = "Form that gets outdated";
        String formDef = "Fill out carefully!";

        createForm(formName, formDef, null, "CTEP");
        new CreateEditSectionTest().addSection("Any Section Name", "0 or more");
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
    
}
