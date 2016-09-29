package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinReorderingTest extends BoardTest {

    @Test
    public void pin() {
        mustBeLoggedInAs(classifyBoardUser_username,  password);
        goToBoard("Test Pinning Board");
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");
        clickElement(By.id("moveDown-0"));
        findElement(By.id("linkToElt_0")).getText().equals("Ethnicity USA maternal category");
        driver.navigate().refresh();
        findElement(By.id("linkToElt_0")).getText().equals("Ethnicity USA maternal category");
        clickElement(By.id("moveUp-1"));
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");
        driver.navigate().refresh();
        findElement(By.id("linkToElt_2")).getText().equals("Ethnic Group Category Text");
        clickElement(By.id("moveTop-2"));
        findElement(By.id("linkToElt_0")).getText().equals("Ethnic Group Category Text");
        clickElement(By.id("moveDown-0"));
        clickElement(By.id("moveDown-1"));
        findElement(By.id("linkToElt_2")).getText().equals("Ethnic Group Category Text");
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");

        findElement(By.id("linkToElt_19")).getText().equals("Walking ability status");
        clickElement(By.id("moveDown-19"));
        textPresent("Saved");
        closeAlert();
        findElement(By.id("linkToElt_19")).getText().equals("Urinary tract surgical procedure indicator");
        clickElement(By.linkText("2"));
        findElement(By.id("linkToElt_0")).getText().equals("Walking ability status");
        clickElement(By.id("moveTop-0"));

        textPresent("Saved");
        closeAlert();
        findElement(By.id("linkToElt_0")).getText().equals("Urinary tract surgical procedure indicator");
        clickElement(By.id("moveUp-0"));
        textPresent("Saved");
        closeAlert();
        findElement(By.id("linkToElt_0")).getText().equals("Brief Pain Inventory (BPI) - pain general activity interference scale");

        clickElement(By.linkText("1"));
        findElement(By.id("linkToElt_0")).getText().equals("Walking ability status");
        findElement(By.id("linkToElt_19")).getText().equals("Urinary tract surgical procedure indicator");

    }
}


