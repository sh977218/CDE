package gov.nih.nlm.form.test.score;

import gov.nih.nlm.cde.test.quickboard.CdeQuickBoardTest1;
import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormScoreTest extends BaseFormTest {

    private CdeQuickBoardTest1 qbTest = new CdeQuickBoardTest1();
    private QuestionTest questionTest = new QuestionTest();

    @Test
    public void score() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "ALS Score Form";
        goToFormByName(formName);

        clickElement(By.id("description_tab"));
        addSection("Score Section", "0 or more", "bottom");

        startAddingQuestions();
        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - total score value", 0);

        textPresent("The following CDEs are part of a score but are missing from this form:");
        textPresent("id: cu-0EyndDn2");
        textPresent("id: 5h29ApPjjzE");
        textPresent("id: h7pThcFJv2r");
        textPresent("(Incomplete Rule)", By.id("question_0_0"));


        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - upper extremity dress hygiene score", 0);
        textNotPresent("id: cu-0EyndDn2");
        textPresent("id: 5h29ApPjjzE");
        textPresent("id: h7pThcFJv2r");
        textPresent("(Incomplete Rule)", By.id("question_0_0"));

        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - lower extremity walk score", 0);
        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - swallow score", 0);

        textNotPresent("id: cu-0EyndDn2");
        textNotPresent("id: 5h29ApPjjzE");
        textNotPresent("id: h7pThcFJv2r");
        textNotPresent("Incomplete Rule", By.id("question_0_0"));

        clickElement(By.id("resetSearch"));
        textPresent("ALS Severity Score (ALSSS) - swallow score (part of score)");
        textPresent("ALS Severity Score (ALSSS) - lower extremity walk score (part of score)");
        textPresent("ALS Severity Score (ALSSS) - upper extremity dress hygiene score");
    }

}
