package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.boards.QuickBoardTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

import java.util.List;

public class FormScoreTest extends BaseFormTest {

    private QuickBoardTest qbTest = new QuickBoardTest();
    private QuestionTest questionTest = new QuestionTest();

    @Test
    public void score() {
        mustBeLoggedInAs(ninds_username, password);
        qbTest.emptyQuickBoard();
        addToQuickBoard("ALS Severity Score (ALSSS) - lower extremity walk score");
        addToQuickBoard("ALS Severity Score (ALSSS) - swallow score");
        addToQuickBoard("ALS Severity Score (ALSSS) - upper extremity dress hygiene score");

        goToCdeByName("ALS Severity Score (ALSSS) - total score value");
        findElement(By.linkText("Score / Derivations")).click();
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
        textPresent("id: cu-0EyndDn2");
        textPresent("id: 5h29ApPjjzE");
        textPresent("id: h7pThcFJv2r");
        textPresent("Score: ALS Severity Score (ALSSS) - total score value (Incomplete Rule)");


        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - upper extremity dress hygiene score", 0);
        textNotPresent("id: cu-0EyndDn2");
        textPresent("id: 5h29ApPjjzE");
        textPresent("id: h7pThcFJv2r");
        textPresent("Score: ALS Severity Score (ALSSS) - total score value (Incomplete Rule)");

        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - lower extremity walk score", 0);
        questionTest.addQuestionToSection("ALS Severity Score (ALSSS) - swallow score", 0);

        textNotPresent("id: cu-0EyndDn2");
        textNotPresent("id: 5h29ApPjjzE");
        textNotPresent("id: h7pThcFJv2r");
        textNotPresent("Incomplete Rule");

        textPresent("ALS Severity Score (ALSSS) - swallow score (part of score)");
        textPresent("ALS Severity Score (ALSSS) - lower extremity walk score (part of score)");
        textPresent("ALS Severity Score (ALSSS) - upper extremity dress hygiene score");

        saveForm();
        waitForESUpdate();
        goToFormByName("ALS Score");

        findElement(By.linkText("General Details")).click();
        textPresent("Score: Incomplete answers");

        WebElement scoreSection = findElement(By.id("formRenderSection_Score Section"));
        List<WebElement> selects = scoreSection.findElements(By.tagName("select"));
        new Select(selects.get(0)).selectByValue("string:2");
        new Select(selects.get(1)).selectByValue("string:4");
        new Select(selects.get(2)).selectByValue("string:7");
        textPresent("Score: 13");
        
    }

}
