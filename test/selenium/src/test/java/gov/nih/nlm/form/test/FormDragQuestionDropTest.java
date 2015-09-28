package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDragQuestionDropTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();
    CreateEditSectionTest sectionTest = new CreateEditSectionTest();

    @Test
    public void dragQuestiondropTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "JFK Coma Recovery Scale- Revised";
        goToFormByName(formName, null);
        textPresent("The CRS-R consists of twenty-three items comprising six hierarchically-arranged subscales addressing auditory, visual, motor, oromotor/verbal, communication and arousal functions. The lowest item on each subscale represents reflexive activity while the highest items represent cognitively-mediated behaviors.");
        findElement(By.linkText("Form Description")).click();
        textPresent("Show Question Search Area");
        sectionTest.addSection("First Section Name", "0 or more");
        sectionTest.addSection("Second Section Name", "1 or more");
        sectionTest.addSection("Third Section Name", "1 or more");
        startAddingQuestions();
        questionTest.addQuestionToSection("Physical exam condition SNOMED CT code", 0);
        questionTest.addSectionToSection(2, 1);
        questionTest.addQuestionToRootSection("Smoking History Ind", 2);
    }
}