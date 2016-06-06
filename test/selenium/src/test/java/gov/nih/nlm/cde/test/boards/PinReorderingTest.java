package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinReorderingTest extends BoardTest {

    @Test
    public void pin() {
        //Essentially, what this code does is that it ensures that we are able to move down a CDE, and check that we have done so successfully.
        //We're probably going to want to expand on this though, as it's really bare bones
        mustBeLoggedInAs(classifyBoardUser_username,  password);
        goToBoard("Test Pinning Board");
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");
        findElement(By.id("moveDown-0"));
        findElement(By.id("linkToElt_0")).getText().equals("Ethnicity USA maternal category");

    }
}


