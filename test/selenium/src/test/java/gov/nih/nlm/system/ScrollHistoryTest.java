package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class ScrollHistoryTest extends NlmCdeBaseTest {

    private void checkScroll(int value) {
        hangon(4);
        String scrollLocation = (((JavascriptExecutor) driver)
                .executeScript("return window.pageYOffset", "")).toString();
        if (Math.abs(Double.valueOf(scrollLocation).intValue() - value) > 10)
            Assert.fail("Assert failed. Expected: " + value + " Actual value: " + scrollLocation);
        hangon(4);
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
        checkScroll(painOffset);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        checkScroll(patientOffset);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        checkScroll(appleOffset);
    }
}
