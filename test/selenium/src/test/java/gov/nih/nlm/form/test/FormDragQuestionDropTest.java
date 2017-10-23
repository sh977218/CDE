package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDragQuestionDropTest extends QuestionTest {
    @Test
    public void dragQuestionDropTest() {

        mustBeLoggedInAs(ninds_username, password);
        String formName = "JFK Coma Recovery Scale- Revised";
        goToFormByName(formName);
        goToFormDescription();
        addSectionTop("Third Section Name", null);
        addSectionTop("Second Section Name", null);
        addSectionTop("First Section Name", null);

        String cdeName = "Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score";
        addQuestionToSection(cdeName, 0);
        textPresent(cdeName, By.id("question_0_0"));

        addSectionToSection(2, 1);
        addQuestionToSection("Smoking History Ind", 1);
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textPresent("At least: 25", By.xpath("//*[@id='question_0_0']"));
        textPresent("At most: 239", By.xpath("//*[@id='question_0_0']"));
    }
}