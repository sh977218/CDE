package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class ScrollHistoryTest extends NlmCdeBaseTest {

    private void checkScroll(long value) {
        int i = 0;
        while(Math.abs(Integer.parseUnsignedInt((((JavascriptExecutor) driver)
                .executeScript("return $(window).scrollTop();", "")).toString()) - value) > 10 && i < 10) {
            hangon(1);
            i++;
        }
        if (i == 10) {
            Assert.fail("Assert failed. Expected: " + value + " Actual value: "
                    + ((JavascriptExecutor) driver).executeScript("return $(window).scrollTop();", ""));
        }
    }

    @Test
    public void scrollHistory() {
        searchEltAny("apple", "cde");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(500) + ");", "");
        hangon(1);

        clickElement(By.id("linkToElt_4"));
        findElement(By.id("discussBtn"));

        searchEltAny("patient", "form");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(550) + ");", "");
        hangon(1);

        clickElement(By.id("linkToElt_5"));
        findElement(By.id("discussBtn"));

        searchEltAny("pain", "cde");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(600) + ");", "");
        hangon(1);

        driver.navigate().refresh();

        checkScroll(600L);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();

        checkScroll(550L);

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
    
        checkScroll(500L);
    }
}
