package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditCdeByTinyIdTest extends NlmCdeBaseTest {

    @Test
    public void editCdeByTinyId() {
        String nameChange = "[name change number 1]";

        mustBeLoggedInAs(ctepCurator_username, password);
        driver.get(baseUrl + "/deView?tinyId=xNugcDxoqKW");
        clickElement(By.id("naming_tab"));

        editDesignationByIndex(0, nameChange);
        newCdeVersion();

        driver.get(baseUrl + "/deView?tinyId=xNugcDxoqKW");
        textPresent("General Details");
        textPresent(nameChange);
    }

}