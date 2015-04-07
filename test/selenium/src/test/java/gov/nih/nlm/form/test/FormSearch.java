package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearch extends BaseFormTest {
    
    @Test
    public void findFormByCde() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String cdeName = "Therapeutic Procedure Created Date java.util.Date";
        
        String formName = "Find By CDE";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");

        findElement(By.linkText("Form Description")).click();

        new SectionTest().addSection("Answer List Section", null);
        
        startAddingQuestions();
        new QuestionTest().addQuestionToSection(cdeName, 0);
        saveForm();
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Linked Forms")).click();
        
        textPresent(formName);
        
    }
    
}
