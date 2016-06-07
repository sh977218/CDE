package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinReorderingTest extends BoardTest {

    @Test
    public void pin() {
        mustBeLoggedInAs(classifyBoardUser_username,  password);
        goToBoard("Test Pinning Board");
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");
        findElement(By.id("moveDown-0")).click();
        findElement(By.id("linkToElt_0")).getText().equals("Ethnicity USA maternal category");
        driver.navigate().refresh();
        findElement(By.id("linkToElt_0")).getText().equals("Ethnicity USA maternal category");
        findElement(By.id("moveUp-1")).click();
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");
        driver.navigate().refresh();
        findElement(By.id("linkToElt_2")).getText().equals("Ethnic Group Category Text");
        findElement(By.id("moveTop-2")).click();
        findElement(By.id("linkToElt_0")).getText().equals("Ethnic Group Category Text");
        findElement(By.id("moveDown-0")).click();
        findElement(By.id("moveDown-1")).click();
        findElement(By.id("linkToElt_2")).getText().equals("Ethnic Group Category Text");
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");





    }
}


