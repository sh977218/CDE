package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class ScrollHistoryTest extends NlmCdeBaseTest {

    private void checkScroll(int value) {
        hangon(1);
        int scrollLocation = getCurrentYOffset();
        if (Math.abs(scrollLocation - value) > 10)
            Assert.fail("Assert failed. Expected: " + value + " Actual value: " + scrollLocation);
    }

    @Test
    public void scrollHistory() {
        String elementId = "linkToElt_4";

        searchEltAny("apple", "cde");
        textPresent("Godin Leisure-Time Exercise Questionnaire");
        scrollToViewById(elementId);
        hangon(1);
        int appleOffset = getCurrentYOffset();
        clickElement(By.id(elementId));
        findElement(By.className("mobileViewH1"));

        searchEltAny("patient", "form");
        textPresent("Patient Health Questionnaire");
        scrollToViewById(elementId);
        hangon(1);
        int patientOffset = getCurrentYOffset();
        clickElement(By.id(elementId));
        findElement(By.className("mobileViewH1"));

        searchEltAny("10", "cde");
        textPresent("Test of Memory Malingering (TOMM) - Trial 1 question 10 score");
        scrollToViewById(elementId);
        hangon(1);
        int painOffset = getCurrentYOffset();
        driver.navigate().refresh();
        findElement(By.id("linkToElt_0"));
        checkScroll(painOffset);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        findElement(By.id("linkToElt_0"));
        checkScroll(patientOffset);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        findElement(By.id("linkToElt_0"));
        checkScroll(appleOffset);
    }
}
