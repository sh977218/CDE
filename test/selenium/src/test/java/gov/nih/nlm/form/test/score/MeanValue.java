package gov.nih.nlm.form.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class MeanValue extends NlmCdeBaseTest {

    @Test
    public void meanValue() {
        String cdeName = "Temperature mean daily measurement";
        String formName = "Mean Value Test";
        String cdeName1 = "Temperature measurement";
        String cdeName2 = "Temperature maximum daily measurement";
        mustBeLoggedInAs(nlm_username, nlm_password);
        emptyQuickBoardByModule("cde");
        addCdeToQuickBoard(cdeName1);
        addCdeToQuickBoard(cdeName2);

        goToCdeByName(cdeName);
        goToScoreDerivations();
        clickElement(By.id("addNewScore"));

        findElement(By.id("newDerivationRule.name")).sendKeys("Mean Derivation Rule");
        new Select(findElement(By.id("newDerivationRule.formula"))).selectByVisibleText("Mean (Average)");

        clickElement(By.id("createDerivationRule"));
        newCdeVersion();

        goToFormByName(formName);
        clickElement(By.id("preview_tab"));
        findElement(By.name("q1")).sendKeys("8");
        findElement(By.name("q2")).sendKeys("11");
        textPresent("9.5");
    }

}
