package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateEmptyLogic extends NlmCdeBaseTest {

    @Test
    public void createEmptyLogic() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Behavioral History");
        goToFormDescription();
        startEditQuestionById("question_0-17");
        clickElement(By.tagName("cde-skip-logic"));
        clickElement(By.id("addNewSkipLogicButton"));
        new Select(findElement(By.id("skipLogicLabelSelection_0"))).selectByVisibleText("Date behavioral history taken");
        clickElement(By.id("addNewSkipLogicButton"));
        new Select(findElement(By.id("skipLogicLabelSelection_1"))).selectByVisibleText("Current tobacco use?");
        clickElement(By.id("addNewSkipLogicButton"));
        new Select(findElement(By.id("skipLogicLabelSelection_2"))).selectByVisibleText("Age started tobacco use");
        clickElement(By.id("saveNewSkipLogicButton"));
        textPresent("\"Date behavioral history taken\" = \"\" AND \"Current tobacco use?\" = \"\" AND \"Age started tobacco use\" = \"\"");
    }


}
