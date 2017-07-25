package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateFormFromBoardTest extends BaseClassificationTest {

    @Test
    public void createFormFromBoard() {
        String boardName = "Form Board";
        String newFormName = "New form from boards";
        String newFormDefinition = "New form from boards definition";
        String newFormVersion = "1.0";
        String classificationOrg = "TEST";
        String[] classificationArray = new String[]{"Classify Board", "Classif_Board_Sub"};
        mustBeLoggedInAs(testAdmin_username, password);
        goToBoard(boardName);
        clickElement(By.id("mb.createForm"));
        findElement(By.id("eltName")).sendKeys(newFormName);
        findElement(By.id("eltDefinition")).sendKeys(newFormDefinition);
        findElement(By.id("formVersion")).sendKeys(newFormVersion);
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(classificationOrg);
        addClassificationByTree(classificationOrg, classificationArray);
        clickElement(By.id("submit"));
        textPresent("Incomplete");
        textNotPresent("have newer version");
        textPresent("Form Description");
        textPresent("cdeCompare1");
        textPresent("cdeCompare2");
    }

}
