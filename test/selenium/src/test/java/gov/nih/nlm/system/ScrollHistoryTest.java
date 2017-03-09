package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class ScrollHistoryTest extends NlmCdeBaseTest {

    private void checkScroll(long value) {
        int i = 0;
        while(!((JavascriptExecutor) driver).executeScript("return $(window).scrollTop();", "").equals(value) && i < 10) {
            hangon(1);
            i++;
        }
        if (i == 10) {
            Assert.fail();
        }
    }


    @Test
    public void scrollHistory() {
        searchEltAny("apple", "cde");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(500) + ");", "");
        hangon(1);

        clickElement(By.id("linkToElt_4"));
        hangon(1);

        searchEltAny("patient", "form");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(550) + ");", "");
        hangon(1);

        clickElement(By.id("linkToElt_5"));
        hangon(1);

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
