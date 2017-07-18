package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeOverrideVersionTest extends NlmCdeBaseTest {

    @Test
    public void cdeOverrideVersion() {
        String cdeName = "ATRA Agent Current Report Period Administered Ind-2";
        String nameChange = "[name change number 1]";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        editDesignationByIndex(0, nameChange);

        clickElement(By.id("openSave"));
        textPresent("has already been used");
        clickElement(By.id("overrideVersion"));
        clickElement(By.id("confirmSaveBtn"));

        textPresent("Data Element saved.");
        closeAlert();
        modalGone();

        goToCdeByName(cdeName);
        textPresent(nameChange);
    }

}
