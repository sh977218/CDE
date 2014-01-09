package gov.nih.nlm.cde.test;

import org.testng.annotations.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.Assert;

public class NlmCdeBaseTest {
    
    protected static String baseUrl = "http://localhost:3001";
    protected static WebDriver driver;
    
    protected static String nlm_username = "nlm";
    protected static String nlm_password = "nlm";
    protected static String cabigAdmin_username = "cabigAdmin";
    protected static String cabigAdmin_password = "pass";
    protected static String ctepCurator_username = "ctepCurator";
    protected static String ctepCurator_password = "pass";
    protected static String test_username = "testuser";
    protected static String test_password = "Test123";
    protected static String test_reg_auth = "OrgTest1";    
    
    public static WebDriverWait wait;

    @BeforeTest
    public void setBaseUrl() {
        System.setProperty("webdriver.chrome.driver", "./chromedriver");
        driver = new ChromeDriver();
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, 3, 200);
    }
    
    public void loginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
        
    protected void goToCdeByName(String name) {
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch")).sendKeys(name);
        findElement(By.id("search.submit")).click();
        findElement(By.id("list_name_0")).click();
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("More Like This"));
    }
        
    protected void goToFormByName(String name) {
        driver.get(baseUrl + "/");
        findElement(By.id("formsLink")).click();
        findElement(By.name("search.name")).sendKeys(name);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(name)).click();
        findElement(By.linkText("View Full Detail")).click();
    }
    
    protected WebElement findElement(By by) {
        wait.until(ExpectedConditions.presenceOfElementLocated(by));
        return driver.findElement(by);
    }
    
    @AfterTest
    public void endSession() {
        driver.quit();
    }
    
    public void modalHere() {
        wait.until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver webDriver) {
                return webDriver.findElement(By.cssSelector("div.modal")).getCssValue("opacity").equals("1");
            }
        });
    }
    
    /*
    * TODO - Find a better way than to wait. I can't find out how to wait for modal to be gone reliably. 
    */
    public void modalGone()  {
        try {
            Thread.sleep(2000);
        } catch (InterruptedException ex) {
            Logger.getLogger(NlmCdeBaseTest.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElement(By.cssSelector("BODY"), text));
        return driver.findElement(By.cssSelector("BODY")).getText().indexOf(text) > 0;
    }
    
    protected void logout() {
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Log Out")).click();
    }
    
    protected void loginAs(String username, String password) {
        driver.get(baseUrl + "/");
        findElement(By.linkText("Log In")).click();
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys(username);
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys(password);
        findElement(By.cssSelector("input.btn")).click();
        findElement(By.linkText("Account"));
    }
    
}
