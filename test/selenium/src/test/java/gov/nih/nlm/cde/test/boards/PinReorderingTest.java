package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinReorderingTest extends BoardTest {

    @Test
    public void pin() {

        goToCdeByName("Medication affecting cardiovascular function type exam day indicator");
        clickElement(By.id("addToBoard"));
        findElement(By.linkText("Blood Board")).click();
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToCdeByName("Ethnicity USA maternal category");
        clickElement(By.id("addToBoard"));
        findElement(By.linkText("Blood Board")).click();
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToCdeByName("Person Gender Text Type");
        clickElement(By.id("addToBoard"));
        findElement(By.linkText("Blood Board")).click();
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToCdeByName("Deployment Risk and Resilience Inventory 2 (DRRI-2) - Combat Experiences - Witness enemy serious injury casuality frequency scale");
        clickElement(By.id("addToBoard"));
        findElement(By.linkText("Blood Board")).click();
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToCdeByName("School special accommodation indicator");
        clickElement(By.id("addToBoard"));
        findElement(By.linkText("Blood Board")).click();
        textPresent("Added to Board");
        modalGone();
        closeAlert();

        goToBoard("Blood Board");
        textPresent("Medication affecting cardiovascular function type exam day indicator");
        textPresent("Ethnicity USA maternal category");
        textPresent("Person Gender Text Type");
        textPresent("Deployment Risk and Resilience Inventory 2 (DRRI-2) - Combat Experiences - Witness enemy serious injury casuality frequency scale");
        textPresent("School special accommodation indicator");


        //Essentially, what this code does is that it ensures that we are able to move down a CDE, and check that we have done so successfully.
        //We're probably going to want to expand on this though, as it's really bare bones
        findElement(By.id("linkToElt_0")).getText().equals("Medication affecting cardiovascular function type exam day indicator");
        findElement(By.id("moveDown-0"));
        findElement(By.id("linkToElt_0")).getText().equals("Ethnicity USA maternal category");

    }
}