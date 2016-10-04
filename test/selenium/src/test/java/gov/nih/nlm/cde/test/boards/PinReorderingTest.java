package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinReorderingTest extends BoardTest {

    @Test
    public void reorderPins() {
        mustBeLoggedInAs(classifyBoardUser_username,  password);
        goToBoard("Test Pinning Board");
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        clickElement(By.id("moveDown-0"));
        closeAlert();
        textPresent("Ethnicity USA maternal category", By.id("linkToElt_0"));
        driver.navigate().refresh();
        textPresent("Ethnicity USA maternal category", By.id("linkToElt_0"));
        clickElement(By.id("moveUp-1"));
        closeAlert();
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        driver.navigate().refresh();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        clickElement(By.id("moveTop-2"));
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_0"));
        clickElement(By.id("moveDown-0"));
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_1"));
        clickElement(By.id("moveDown-1"));
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));

        textPresent("Walking ability status", By.id("linkToElt_19"));
        clickElement(By.id("moveDown-19"));
        textPresent("Saved");
        closeAlert();
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));
        clickElement(By.linkText("2"));
        textPresent("Walking ability status", By.id("linkToElt_0"));
        clickElement(By.id("moveTop-0"));
        textPresent("Saved");
        closeAlert();
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_0"));
        clickElement(By.id("moveUp-0"));
        textPresent("Saved");
        closeAlert();
        textPresent("Brief Pain Inventory (BPI) - pain general activity interference scale", By.id("linkToElt_0"));

        clickElement(By.linkText("1"));
        textPresent("Walking ability status", By.id("linkToElt_0"));
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));

    }
}


