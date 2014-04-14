package gov.nih.nlm.cde.test;

import java.util.Arrays;
import org.testng.annotations.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;

@Listeners({ScreenShotListener.class})
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
    protected static String history_username = "historyuser";
    protected static String history_password = "pass";
    protected static String windows_detected_message = "MS Windows Detected\nStarting ./chromedriver.exe";    
    protected static String macosx_detected_message = "Max OS X Detected\nStarting ./chromedriver";     
    
    
    public static WebDriverWait wait;

    @BeforeTest
    public void setBaseUrl() {
        if (isWindows()){
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        }
        else {
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver");
        }
        DesiredCapabilities caps = DesiredCapabilities.chrome();
        caps.setCapability("chrome.switches", Arrays.asList("--enable-logging", "--v=1"));
        driver = new ChromeDriver(caps);
        driver.get(baseUrl);
        driver.manage().window().setSize(new Dimension(1024,800));
        driver.manage().timeouts().implicitlyWait(6, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, 6, 200);
    }
    
    public void loginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
        
    protected void goToCdeByName(String name) {
        goHome();
        findElement(By.id("ftsearch-input")).sendKeys(name);
        // TODO. Selenium doesn't seem to always send keys. Don't know why. Maybe catch and retry?
        Assert.assertEquals(findElement(By.id("ftsearch-input")).getAttribute("value"), name);
//        findElement(By.id("search.submit")).click();
        findElement(By.cssSelector("i.fa-search")).click();
        Assert.assertTrue(textPresent(name));
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("More Like This"));
    }
        
    protected void goToFormByName(String name) {
        goHome();
        findElement(By.id("formsLink")).click();
        findElement(By.name("search.name")).sendKeys(name);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(name)).click();
        findElement(By.linkText("View Full Detail")).click();
    }
    
    protected WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
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
        hangon(2);
    }
    
    public void hangon(int i)  {
        try {
            Thread.sleep(i * 1000);
        } catch (InterruptedException ex) {
            Logger.getLogger(NlmCdeBaseTest.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text));
        return driver.findElement(By.cssSelector("BODY")).getText().indexOf(text) >= 0;
    }
    
    public boolean textNotPresent(String text){
        return driver.findElement(By.cssSelector("BODY")).getText().indexOf(text) < 0;
    }
    
    protected void goHome() {
        driver.get(baseUrl + "/gonowhere");
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch"));
    }
    
    protected void logout() {
        try {
            findElement(By.linkText("Account")).click();
            findElement(By.linkText("Log Out")).click();
            findElement(By.linkText("Log In"));
        } catch (TimeoutException e) {
            
        } 
    }
    
    protected void loginAs(String username, String password) {
        goHome();
        try {
            findElement(By.linkText("Log In")).click();
        } catch (TimeoutException e) {
            logout();
            findElement(By.linkText("Log In")).click();            
        }
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys(username);
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys(password);
        findElement(By.cssSelector("button.btn")).click();
        findElement(By.linkText("Account"));
    }
    
    private boolean isWindows(){
        String OS = System.getProperty("os.name").toLowerCase();
        return (OS.indexOf("win") >= 0);
    }
    
}
