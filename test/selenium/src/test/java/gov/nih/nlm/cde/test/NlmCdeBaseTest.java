package gov.nih.nlm.cde.test;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.*;

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
        LoggingPreferences logPrefs = new LoggingPreferences();
        logPrefs.enable(LogType.BROWSER, Level.ALL);
        caps.setCapability(CapabilityType.LOGGING_PREFS, logPrefs);        
        driver = new ChromeDriver(caps);
        driver.get(baseUrl);
        driver.manage().window().setSize(new Dimension(1024,800));
        driver.manage().timeouts().implicitlyWait(8, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, 8, 200);
    }
    
    protected void mustBeLoggedInAs(String username, String password) {
        WebElement loginLinkList = driver.findElement(By.id("login_link"));
        if (loginLinkList.isDisplayed()) {
            loginAs(username, password);
        } else {
            WebElement unameLink = driver.findElements(By.id("username_link")).get(0);
            if (!unameLink.getText().equals(username)) {
                logout();
                loginAs(username, password);
            } 
        }
    }
    
    protected void mustBeLoggedOut() {
        WebElement loginLinkList = driver.findElement(By.id("login_link"));
        if (!loginLinkList.isDisplayed()) {
            logout();
        }
    }

    public void loginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
        
    protected void goToCdeByName(String name) {
        goHome();
        openCdeInList(name);
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("More Like This"));
        Assert.assertTrue(textPresent(name));
    }
        
    
    protected void openCdeInList(String name) {
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys(name);
        Assert.assertEquals(findElement(By.id("ftsearch-input")).getAttribute("value"), name);
        findElement(By.cssSelector("i.fa-search")).click();
        Assert.assertTrue(textPresent(name));
        findElement(By.id("acc_link_0")).click();
        hangon(0.5);
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
    
    protected void saveCde() {
        findElement(By.id("confirmSave")).click();
        hangon(2);
    }
    
    public void hangon(double i)  {
        try {
            Thread.sleep((long)(i * 1000));
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
        Assert.assertTrue(textPresent("Qualified ("));
    }
    
    protected void logout() {
        try {
            findElement(By.id("username_link")).click();
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
        findElement(By.linkText(username));
    }
    
    private boolean isWindows(){
        String OS = System.getProperty("os.name").toLowerCase();
        return (OS.indexOf("win") >= 0);
    }
    
    public void addToCompare(String cdeName1, String cdeName2) {
        goHome();
        Assert.assertTrue(textPresent("Compare ( empty )"));
        findElement(By.name("ftsearch")).sendKeys(cdeName1);
        findElement(By.id("search.submit")).click();
        findElement(By.linkText(cdeName1)).click();
        hangon(.5);
        findElement(By.id("compare_0")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_0")));
        Assert.assertTrue(textPresent("Compare ( 1 )"));
        findElement(By.name("ftsearch")).clear();
        findElement(By.name("ftsearch")).sendKeys(cdeName2);
        hangon(1);
        findElement(By.id("search.submit")).click();
        hangon(2);
        findElement(By.linkText(cdeName2)).click();
        hangon(.5);
        findElement(By.id("compare_0")).click();   
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_0")));        
        Assert.assertTrue(textPresent("Compare ( full )"));
        findElement(By.id("acc_link_2")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_2")));
        findElement(By.linkText("Compare ( full )")).click();   
    }      
    
}
