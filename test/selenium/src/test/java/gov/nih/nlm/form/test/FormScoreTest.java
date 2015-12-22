package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.CdeQuickBoardTest1;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

import java.util.List;

public class FormScoreTest extends BaseFormTest {

    private CdeQuickBoardTest1 qbTest = new CdeQuickBoardTest1();
    private QuestionTest questionTest = new QuestionTest();

    @Test
    public void score() {
        mustBeLoggedInAs(ninds_username, password);
        qbTest.emptyQuickBoardByModule("form");
        addCdeToQuickBoard("ALS Severity Score (ALSSS) - lower extremity walk score");
        addCdeToQuickBoard("ALS Severity Score (ALSSS) - swallow score");
        addCdeToQuickBoard("ALS Severity Score (ALSSS) - upper extremity dress hygiene score");

        textPresent("Quick Board (3)"); goToCdeByName("ALS Severity Score (ALSSS) - total score value");
        clickElement(By.linkText("Score / Derivations"));
        clickElement(By.id("addNewScore"));
        textPresent("All 3 CDEs in your quickboard.");
        findElement(By.id("newDerivationRule.name")).sendKeys("ALSSS Score");
        clickElement(By.id("createDerivationRule"));
        newCdeVersion();

        createForm("ALS Score", "ALS Score Form", null, "NINDS");

        clickElement(By.linkText("Form Description"));
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

        clickElement(By.linkText("General Details"));
        textPresent("Score: Incomplete answers");

        WebElement scoreSection = findElement(By.id("formRenderSection_Score Section"));
        List<WebElement> selects = scoreSection.findElements(By.tagName("select"));
        new Select(selects.get(0)).selectByValue("string:2");
        new Select(selects.get(1)).selectByValue("string:4");
        new Select(selects.get(2)).selectByValue("string:7");
        textPresent("Score: 13");

    }

}
