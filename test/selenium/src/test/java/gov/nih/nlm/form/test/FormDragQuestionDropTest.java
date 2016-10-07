package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class FormDragQuestionDropTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();
    CreateEditSectionTest sectionTest = new CreateEditSectionTest();

    @Test
    public void dragQuestiondropTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "JFK Coma Recovery Scale- Revised";
        goToFormByName(formName);
        textPresent("The CRS-R consists of twenty-three items comprising six hierarchically-arranged subscales addressing auditory, visual, motor, oromotor/verbal, communication and arousal functions. The lowest item on each subscale represents reflexive activity while the highest items represent cognitively-mediated behaviors.");
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        sectionTest.addSection("First Section Name", "0 or more");
        sectionTest.addSection("Second Section Name", "1 or more");
        sectionTest.addSection("Third Section Name", "1 or more");
        startAddingQuestions();

        String cdeName = "Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score";

        questionTest.addQuestionToSection(cdeName, 0);

        textPresent(cdeName, By.id("section_view_0"));

        List<WebElement> questionsInSection0 = findElements(By.xpath("//*[starts-with(@id, \"question_accordion_0_\")]"));

        String id = null;
        for (WebElement elt : questionsInSection0) {
            if (elt.getText().contains(cdeName)) {
                id = elt.getAttribute("id");
            }
        }
        if (id == null) {
            Assert.fail("Cannot find cde in section");
        }

        clickElement(By.id(id));
        textPresent("25", By.id("dd_minimal_0"));
        textPresent("239", By.id("dd_maximal_0"));

        questionTest.addSectionToSection(2, 1);
        questionTest.addQuestionToRootSection("Smoking History Ind", 2);
    }
}