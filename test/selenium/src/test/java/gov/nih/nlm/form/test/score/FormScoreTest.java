package gov.nih.nlm.form.test.score;

import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormScoreTest extends QuestionTest {

    @Test
    public void formScore() {
        mustBeLoggedInAs(testEditor_username, password);
        String formName = "ALS Score Form";
        goToFormByName(formName);

        goToFormDescription();
        addSectionBottom("Score Section", null);
        addQuestionToSection("ALS Severity Score (ALSSS) - total score value", 0);
        textPresent("The following CDEs are part of a score but are missing from this form:");
        textPresent("id: cu_0EyndDn2");
        textPresent("id: 5h29ApPjjzE");
        textPresent("id: h7pThcFJv2r");
        textPresent("(Incomplete Rule)", By.id("question_0-0"));

        addQuestionToSection("ALS Severity Score (ALSSS) - upper extremity dress hygiene score", 0);
        textNotPresent("id: cu-0EyndDn2");
        textPresent("id: 5h29ApPjjzE");
        textPresent("id: h7pThcFJv2r");
        textPresent("(Incomplete Rule)", By.id("question_0-1"));

        addQuestionToSection("ALS Severity Score (ALSSS) - lower extremity walk score", 0);
        addQuestionToSection("ALS Severity Score (ALSSS) - swallow score", 0);
        textNotPresent("id: cu_0EyndDn2");
        textNotPresent("id: 5h29ApPjjzE");
        textNotPresent("id: h7pThcFJv2r");
        textNotPresent("Incomplete Rule", By.id("question_0-2"));

        textPresent("Swallowing (part of score)");
        textPresent("Lower extremity and walking (part of score)");
        textPresent("Upper extremity dressing and hygiene (part of score)");
    }

}
