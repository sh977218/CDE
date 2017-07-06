package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.cde.test.boards.BoardTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateFormFromBoardTest extends BoardTest {
    BaseClassificationTest baseClassificationTest = new BaseClassificationTest();

    @Test
    public void createFormFromBoard() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToBoard("Form Board");
        clickElement(By.id("mb.createForm"));
        findElement(By.id("eltName")).sendKeys("New form from boards");
        findElement(By.id("eltDefinition")).sendKeys("New form from boards definition");
        findElement(By.id("formVersion")).sendKeys("1.0");
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText("TEST");
        baseClassificationTest.addClassificationMethod(new String[]{"TEST", "Classify Board", "Classif_Board_Sub"});
        hangon(2);
        clickElement(By.id("submit"));
        textPresent("Incomplete");
        textNotPresent("have newer version");
        textPresent("Form Description");
        textPresent("cdeCompare1");
        textPresent("cdeCompare2");
    }

}
