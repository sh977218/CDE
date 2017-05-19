package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RandomDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void randomDatatype() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "CTC Adverse Event Apnea Grade";
        goToCdeByName(cdeName);
        clickElement(By.linkText("Permissible Values"));
        clickElement(By.id("editDatatype"));
        findElement(By.name("datatypeFreeText")).clear();
        findElement(By.name("datatypeFreeText")).sendKeys("java.lang.Date");
        clickElement(By.id("confirmDatatype"));
        newCdeVersion();

        textPresent("java.lang.Date");

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("java.lang.Date");
    }
}
