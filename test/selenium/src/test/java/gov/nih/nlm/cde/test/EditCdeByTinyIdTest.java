package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditCdeByTinyIdTest extends NlmCdeBaseTest {

    @Test
    public void editCdeByTinyId() {
        String nameChange = "[name change number 1]";
        mustBeLoggedInAs(ctepCurator_username, password);

        goToCdeByName("Left Lymph Node Positive Total Count");
        clickElement(By.id("naming_tab"));

        editDesignationByIndex(0, nameChange);
        newCdeVersion();

        goToCdeByName("Left Lymph Node Positive Total Count");
        textPresent("General Details");
        textPresent(nameChange);
    }

}
