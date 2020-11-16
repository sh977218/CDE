package gov.nih.nlm.board.form;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateFormFromBoardTest extends NlmCdeBaseTest {
    @Test
    public void createFormFromBoard() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToBoard("Form Board");
        clickElement(By.id("createFormBtn"));
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText("TEST");
        findElement(By.id("eltName")).sendKeys("New form from boards");
        findElement(By.id("eltDefinition")).sendKeys("New form from boards definition");
        findElement(By.id("formVersion")).sendKeys("1.0");
        addClassificationByTree("TEST", new String[]{"Eligibility Criteria", "LABS"}, null);
        findElement(By.linkText("LABS"));
        clickElement(By.id("submit"));
        textPresent("cdeCompare1");
        textPresent("cdeCompare2");
        goToGeneralDetailForm();
        textPresent("Incomplete");
        textNotPresent("have newer version");
    }

}
