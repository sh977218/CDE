package gov.nih.nlm.form.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class MeanValue extends NlmCdeBaseTest {

    @Test
    public void meanValue() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        emptyQuickBoardByModule("cde");
        addCdeToQuickBoard("Temperature measurement");
        addCdeToQuickBoard("Temperature maximum daily measurement");

        goToCdeByName("Temperature mean daily measurement");
        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));

        findElement(By.id("newDerivationRule.name")).sendKeys("Mean Derivation Rule");
        new Select(findElement(By.id("newDerivationRule.formula"))).selectByVisibleText("Mean / Average");

        clickElement(By.id("createDerivationRule"));
        newCdeVersion();

        goToFormByName("Mean Value Test");
        findElement(By.name("q1")).sendKeys("8");
        findElement(By.name("q2")).sendKeys("11");
        textPresent("9.5");
    }

}
