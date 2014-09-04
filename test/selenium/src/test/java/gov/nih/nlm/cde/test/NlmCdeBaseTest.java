package gov.nih.nlm.cde.test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.*;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.browserlaunchers.Sleeper;

@Listeners({ScreenShotListener.class})
public class NlmCdeBaseTest {
    protected static String baseUrl = System.getProperty("testUrl");
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
    protected static String ninds_username = "ninds";
    protected static String ninds_password = "pass";
    protected static String classificationMgtUser_username = "classificationMgtUser";
    protected static String classificationMgtUser_password = "pass";
    
    protected static String windows_detected_message = "MS Windows Detected\nStarting ./chromedriver.exe";    
    protected static String macosx_detected_message = "Max OS X Detected\nStarting ./chromedriver";     
    
    protected static int defaultTimeout = Integer.parseInt(System.getProperty("timeout"));
    protected static String browser = System.getProperty("browser");
          
    public static WebDriverWait wait;
    
    protected String module = "cde";

    @BeforeTest
    public void setBaseUrl() {
        if (isWindows()){
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
            System.setProperty("webdriver.ie.driver", "./IEDriverServer.exe");
        }
        else {
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver");
        }
        DesiredCapabilities caps;
        switch (browser) {
            case "firefox":
                caps = DesiredCapabilities.firefox();
            break;
            case "chrome":
                caps = DesiredCapabilities.chrome();
            break;
            case "ie":
                caps = DesiredCapabilities.internetExplorer();
            break;
            default: 
                caps = DesiredCapabilities.chrome();
        }        
        caps.setCapability("chrome.switches", Arrays.asList("--enable-logging", "--v=1"));
        LoggingPreferences logPrefs = new LoggingPreferences();
        logPrefs.enable(LogType.BROWSER, Level.ALL);
        caps.setCapability(CapabilityType.LOGGING_PREFS, logPrefs);        
        switch (browser) {
            case "firefox":
                driver = new FirefoxDriver(caps);
            break;
            case "chrome":
                driver = new ChromeDriver(caps);      
            break;
            case "ie":
                driver = new InternetExplorerDriver(caps);
            break;
        }
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, defaultTimeout, 200);
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
        
    protected void goToElementByName(String name) {
        openEltInList(name);
        findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();
        Assert.assertTrue(textPresent("Classification"));
        Assert.assertTrue(textPresent(name));
    }  

    protected void openEltInList(String name) {
        goToSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        findElement(By.cssSelector("i.fa-search")).click();
        Assert.assertTrue(textPresent("1 results for"));
        Assert.assertTrue(textPresent(name));
        findElement(By.id("acc_link_0")).click();
        hangon(1);
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
        hangon(2);
    }
    
    /*
    * TODO - Find a better way than to wait. I can't find out how to wait for modal to be gone reliably. 
    */
    public void modalGone()  {
        hangon(2);
    }
    
    public void closeAlert() {
        try {
            findElement(By.cssSelector(".alert .close")).click();
        } catch(Exception e) {
                    
        }
    }
    
    protected void saveCde() {
        modalHere();
        findElement(By.id("confirmSave")).click();
        hangon(2);
    }
    
    public void hangon(double i)  {
        Sleeper.sleepTight((long)(i * 1000));
    }
    
    public boolean textPresent(String text, String where) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector(where), text));
        return true;
    }  
    
    public boolean textPresent(String text) {
        return textPresent(text, "BODY");
    }
    
    public boolean textNotPresent(String text){
        wait.until(ExpectedConditions.not(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text)));
        return true;
    }
    
    protected void goHome() {
        driver.get(baseUrl + "/gonowhere");
        driver.get(baseUrl + "/");
        findElement(By.id("selectOrgDropdown"));
    }
    
    protected void goToSearch() {
        driver.get(baseUrl + "/gonowhere");
        driver.get(baseUrl + "/#/"+this.module+"/search");
        findElement(By.name("ftsearch"));
        Assert.assertTrue(textPresent("Qualified ("));
    }
    
    protected void goToSearchByMenu() {
        findElement(By.linkText("CDEs")).click();
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
        goToSearch();
        try {
            findElement(By.linkText("Log In")).click();
        } catch (NoSuchElementException e) {
            logout();
            findElement(By.linkText("Log In")).click();            
        }
        hangon(1);
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys(username);
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys(password);
        findElement(By.xpath("//button[text() = 'Log in']")).click();
//        hangon(1);
        findElement(By.linkText(username));
    }
    
    private boolean isWindows(){
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.contains("win");
    }
    
    public void addToQuickBoard(String cdeName) {
        scrollToTop();
        findElement(By.name("ftsearch")).sendKeys("\""+cdeName+"\"");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent(cdeName, "#accordionList"));
        findElement(By.id("addToCompare_0")).click();
        hangon(.5);
        findElement(By.name("ftsearch")).clear();
    }
    
    public void addToCompare(String cdeName1, String cdeName2) {
        goToSearch();
        Assert.assertTrue(textPresent("Quick Board ( empty )"));
        addToQuickBoard(cdeName1);
        addToQuickBoard(cdeName2);
        findElement(By.linkText("Quick Board ( 2 )")).click();
        Assert.assertTrue(textPresent(cdeName1));
        Assert.assertTrue(textPresent(cdeName2));      
        findElement(By.id("qb.compare")).click();
    }
        
    public void scrollToTop() {
        scrollTo( "0" );
    }
    
    protected boolean checkElementDoesNotExistByCSS(String selector) {
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        boolean elementVisible;
        try {
            driver.findElement(By.cssSelector(selector));
            elementVisible = false;
        } catch(NoSuchElementException e) {
            elementVisible = true;
        }
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        return elementVisible;
    }

    protected boolean checkElementDoesNotExistById( String id ) {
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        boolean elementVisible;
        try {
            driver.findElement(By.id(id));
            elementVisible = false;
        } catch(NoSuchElementException e) {
            elementVisible = true;
        }
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        return elementVisible;
    }

    public void scrollTo( String y ) {
        ((JavascriptExecutor)driver).executeScript("scroll(0," + y + ");");
    }
    
    public void hoverOverElement( WebElement ele ) {
        Actions action = new Actions(driver);
        action.moveToElement(ele);
        action.perform();
    }

    
    protected void enterUsernamePasswordSubmit(String username, String password, String checkText) {
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys(username);
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys(password);
        findElement(By.cssSelector("button.btn")).click();
        Assert.assertTrue(textPresent(checkText));
    }
    
    protected void switchTabAndClose(int i) {
        ArrayList<String> tabs2 = new ArrayList(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs2.get(i));
    }
    
    protected void switchTab(int i) {
        ArrayList<String> tabs2 = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs2.get(i));
    }
    
}
