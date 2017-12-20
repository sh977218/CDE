package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class ScrollHistoryTest extends NlmCdeBaseTest {

    private void checkScroll(int value) {
        hangon(5);
        String scrollLocation = (((JavascriptExecutor) driver)
                .executeScript("return window.pageYOffset;", "")).toString();
        if (Math.abs(Integer.parseUnsignedInt(scrollLocation) - value) > 10)
            Assert.fail("Assert failed. Expected: " + value + " Actual value: " + scrollLocation);
    }

    @Test
    public void scrollHistory() {
        searchEltAny("apple", "cde");
        textPresent("Godin Leisure-Time Exercise Questionnaire");
        scrollTo(500);

        // cannot use clickElement() because it scrolls
        findElement(By.id("linkToElt_4")).click();
        findElement(By.id("discussBtn"));

        searchEltAny("patient", "form");
        textPresent("Patient Health Questionnaire");
        scrollTo(550);

        // cannot use clickElement() because it scrolls
        findElement(By.id("linkToElt_5")).click();
        findElement(By.id("discussBtn"));

        searchEltAny("pain", "cde");

        textPresent("Brief Pain Inventory");
        scrollTo(600);

        driver.navigate().refresh();
        checkScroll(600);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        checkScroll(550);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        checkScroll(500);
    }
}
