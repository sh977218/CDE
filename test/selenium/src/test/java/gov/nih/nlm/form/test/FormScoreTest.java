package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.boards.QuickBoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormScoreTest extends BaseFormTest {

    private QuickBoardTest qbTest = new QuickBoardTest();
    private QuestionTest questionTest = new QuestionTest();

    @Test
    public void score() {
        mustBeLoggedInAs(ninds_username, password);
        qbTest.emptyQuickBoard();
        addToQuickBoard("ALS Severity Score (ALSSS) - lower extremity walk score");
        addToQuickBoard("ALS Severity Score (ALSSS) - swallow score");
        addToQuickBoard("ALS Severity Score (ALSSS) - speech score");

        goToCdeByName("ALS Severity Score (ALSSS) - total score value");
        findElement(By.id("addNewScore")).click();
        textPresent("All 3 CDEs in your quickboard.");
        findElement(By.id("newDerivationRule.name")).sendKeys("ALSSS Score");
        findElement(By.id("createDerivationRule")).click();
        newCdeVersion();

        createForm("ALS Score", "ALS Score Form", null, "NINDS");

        findElement(By.linkText("Form Description")).click();
        addSection("Score Section", "0 or more");

        startAddingQuestions();
        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - total score value", 0);

        textPresent("The following CDEs are part of a score but are missing from this form:");
        textPresent("id: sM8jogVQnQ4");
        textPresent("id: 1UKGTUmNnKe");
        textPresent("id: XB9n8SaUX79");

    }

}
