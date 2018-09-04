package gov.nih.nlm.form.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class MeanValue extends NlmCdeBaseTest {

    @Test
    public void meanValue() {
        String cdeName1 = "Temperature measurement";
        String cdeName2 = "Temperature maximum daily measurement";
        String scoreCdeName = "Temperature mean daily measurement";
        String formName = "Mean Value Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        emptyQuickBoardByModule("cde");
        addCdeToQuickBoard(cdeName1);
        addCdeToQuickBoard(cdeName2);

        goToCdeByName(scoreCdeName);
        goToScoreDerivations();
        clickElement(By.id("addNewScore"));

        findElement(By.id("newDerivationRule.name")).sendKeys("Mean Derivation Rule");
        new Select(findElement(By.id("newDerivationRule.formula"))).selectByVisibleText("Mean (Average)");

        clickElement(By.id("createDerivationRule"));
        newCdeVersion();

        goToFormByName(formName);
        clickElement(By.id("preview_tab"));
        findElement(By.name("0-0")).sendKeys("8");
        findElement(By.name("0-1")).sendKeys("11");
        textPresent("9.5");
    }

}
