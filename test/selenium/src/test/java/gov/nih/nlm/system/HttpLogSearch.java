package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class HttpLogSearch extends NlmCdeBaseTest {

    @Test
    public void searchHttpLog() {
        String ipTerm = "::ffff:127.0.0.1";
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        findElement(By.name("ip")).sendKeys(ipTerm);
        clickElement(By.id("searchBtn"));
        hangon(3);
        List<WebElement> ips = driver.findElements(By.cssSelector(".ip"));
        for (WebElement ip : ips) {
            Assert.assertTrue(ip.getText().trim().equals(ipTerm));
        }
    }

}
