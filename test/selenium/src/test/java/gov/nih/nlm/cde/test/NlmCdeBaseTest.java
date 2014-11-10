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
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.TimeoutException;
import java.util.Random;

@Listeners({ScreenShotListener.class})
public class NlmCdeBaseTest {

    protected static WebDriver driver;
    public static WebDriverWait wait;
    public static WebDriverWait shortWait;

    protected static String windows_detected_message = "MS Windows Detected\nStarting ./chromedriver.exe";
    protected static String macosx_detected_message = "Max OS X Detected\nStarting ./chromedriver";

    protected static int defaultTimeout = Integer.parseInt(System.getProperty("timeout"));
    protected static String browser = System.getProperty("browser");
    protected static String baseUrl = System.getProperty("testUrl");

    protected static String nlm_username = "nlm";
    protected static String nlm_password = "nlm";
    protected static String cabigAdmin_username = "cabigAdmin";
    protected static String ctepCurator_username = "ctepCurator";
    protected static String test_username = "testuser";
    protected static String test_password = "Test123";
    protected static String history_username = "historyuser";
    protected static String acrin_username = "acrin";
    protected static String ninds_username = "ninds";
    protected static String wguser_username = "wguser";
    protected static String reguser_username = "reguser";
    protected static String boarduser1_username = "boarduser1";
    protected static String boarduser2_username = "boarduser2";
    protected static String boarduserEdit_username = "boarduserEdit";
    protected static String boardUser = "boarduser";
    protected static String pinUser = "pinuser";
    protected static String classificationMgtUser_username = "classificationMgtUser";
    protected static String transferStewardUser_username = "transferStewardUser";

    protected static String password = "pass";

    @BeforeTest
    public void setBaseUrl() {
        hangon(new Random().nextInt(10));
        if (isWindows()) {
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
            System.setProperty("webdriver.ie.driver", "./IEDriverServer.exe");
        } else {
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
        shortWait = new WebDriverWait(driver, 2);
    }

    protected void resizeWindow(int width, int height) {
        driver.manage().window().setSize(new Dimension(width, height));
    }

    protected Dimension getWindowSize() {
        return driver.manage().window().getSize();
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

    protected void addOrg(String orgName, String orgLongName, String orgWGOf) {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        findElement(By.name("newOrgName")).sendKeys(orgName);

        if (orgLongName != null) {
            findElement(By.name("newOrgLongName")).sendKeys(orgLongName);
        }

        if (orgWGOf != null) {
            new Select(findElement(By.id("newOrgWorkingGroup"))).selectByVisibleText("ACRIN");
        }

        findElement(By.id("addOrg")).click();
        Assert.assertTrue(textPresent("Org Added"));
        Assert.assertTrue(textPresent(orgName));

        if (orgLongName != null) {
            Assert.assertTrue(textPresent(orgLongName));
        }
    }

    protected void classify(String org, String classification, String subClassification) {
        findElement(By.id("selectDefault")).click();
        modalHere();
        findElement(By.id("classifySlectOrg-" + org)).click();
        hangon(1);
        findElement(By.cssSelector("[id='addClassification-" + classification + "'] span.fake-link")).click();
        findElement(By.cssSelector("[id='addClassification-" + subClassification + "'] button")).click();
        findElement(By.cssSelector(".modal-dialog .done")).click();
        modalGone();
    }

    protected void gotoClassifMgt() {
        findElement(By.id("username_link")).click();
        hangon(.5);
        findElement(By.linkText("Classifications")).click();
    }

    protected void createClassificationName(String[] categories) {
        scrollToTop();
        findElement(By.id("addClassification")).click();
        modalHere();
        for (int i = 0; i < categories.length - 1; i++) {
            findElement(By.cssSelector("[id='addClassification-" + categories[i] + "'] span.fake-link")).click();
        }
        findElement(By.id("addNewCatName")).sendKeys(categories[categories.length - 1]);
        findElement(By.id("addClassificationButton")).click();
        modalGone();
        String selector = "";
        for (int i = 0; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }

        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-" + selector + "'] .name")).getText().equals(categories[categories.length - 1]));
        closeAlert();
    }

    protected void fillOutBasicCreateFields(String name, String definition, String version, String org, String classification, String subClassification) {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        findElement(By.name("elt.designation")).sendKeys(name);
        findElement(By.name("elt.definition")).sendKeys(definition);
        if (version != null) {
            findElement(By.name("elt.version")).sendKeys(version);
        }
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(org);

        classify(org, classification, subClassification);
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
        goToElementByName(name, "cde");
    }

    protected void goToFormByName(String name) {
        goToElementByName(name, "form");
    }

    protected void goToElementByName(String name, String type) {
        try {
            openEltInList(name, type);
            findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();
            Assert.assertTrue(textPresent("Classification"));
            Assert.assertTrue(textPresent(name));
        } catch (Exception e) {
            hangon(1);
            findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();
            Assert.assertTrue(textPresent("Classification"));
            Assert.assertTrue(textPresent(name));
        }
    }

    protected void openCdeInList(String name) {
        openEltInList(name, "cde");
    }

    protected void openEltInList(String name, String type) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("1 results for");
        textPresent(name);
        findElement(By.id("acc_link_0")).click();
        hangon(1);
    }

    protected void openFormInList(String name) {
        goToFormSearch();
        findElement(By.linkText("Forms")).click();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("1 results for");
        findElement(By.id("acc_link_0")).click();
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
    }

    /*
     * TODO - Find a better way than to wait. I can't find out how to wait for modal to be gone reliably. 
     */
    public void modalGone() {
        hangon(2);
    }

    public void closeAlert() {
        try {
            findElement(By.cssSelector(".alert .close")).click();
        } catch (Exception e) {

        }
    }

    protected void newCdeVersion() {
        findElement(By.id("openSave")).click();
        modalHere();
        findElement(By.name("version")).sendKeys(".1");
        findElement(By.id("confirmNewVersion")).click();
        hangon(2);
    }

    protected void saveCde() {
        findElement(By.id("confirmNewVersion")).click();
        hangon(2);
    }

    public void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    public boolean textPresent(String text, String where) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector(where), text));
        return true;
    }

    public boolean textPresent(String text) {
        return textPresent(text, "BODY");
    }

    public boolean textPresentTrueFalse(String text) {
        return driver.findElement(By.tagName("body")).getText().contains(text);
    }

    public boolean textNotPresent(String text) {
        wait.until(ExpectedConditions.not(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text)));
        return true;
    }

    protected void goHome() {
        driver.get(baseUrl + "/gonowhere");
        driver.get(baseUrl + "/");
        findElement(By.id("selectOrgDropdown"));
    }

    protected void goToCdeSearch() {
        goToSearch("cde");
    }

    protected void goToFormSearch() {
        goToSearch("form");
    }

    protected void goToSearch(String type) {
        driver.get(baseUrl + "/gonowhere");
        driver.get(baseUrl + "/#/" + type + "/search");
        findElement(By.name("ftsearch"));
        showSearchFilters();
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
        goToCdeSearch();
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
        try {
            findElement(By.xpath("//button[text() = 'Log In']")).click();
            findElement(By.linkText(username));
        } catch (NoSuchElementException e) {
            findElement(By.xpath("//button[text() = 'Log In']")).click();
            findElement(By.linkText(username));
        }
    }

    private boolean isWindows() {
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.contains("win");
    }

    public void addToQuickBoard(String cdeName) {
        scrollToTop();
        findElement(By.name("ftsearch")).sendKeys("\"" + cdeName + "\"");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent(cdeName, "#accordionList"));
        findElement(By.id("addToCompare_0")).click();
        hangon(.5);
        findElement(By.name("ftsearch")).clear();
    }

    public void addToCompare(String cdeName1, String cdeName2) {
        goToCdeSearch();
        Assert.assertTrue(textPresent("Quick Board ( empty )"));
        addToQuickBoard(cdeName1);
        addToQuickBoard(cdeName2);
        findElement(By.linkText("Quick Board ( 2 )")).click();
        Assert.assertTrue(textPresent(cdeName1));
        Assert.assertTrue(textPresent(cdeName2));
        findElement(By.id("qb.compare")).click();
    }

    public void scrollToTop() {
        scrollTo("0");
    }

    protected boolean checkElementDoesNotExistByCSS(String selector) {
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        boolean elementVisible;
        try {
            driver.findElement(By.cssSelector(selector));
            elementVisible = false;
        } catch (NoSuchElementException e) {
            elementVisible = true;
        }
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        return elementVisible;
    }

    protected boolean checkElementDoesNotExistById(String id) {
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        boolean elementVisible;
        try {
            driver.findElement(By.id(id));
            elementVisible = false;
        } catch (NoSuchElementException e) {
            elementVisible = true;
        }
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        return elementVisible;
    }

    public void scrollTo(String y) {
        ((JavascriptExecutor) driver).executeScript("scroll(0," + y + ");");
    }

    public void hoverOverElement(WebElement ele) {
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
        textPresent(checkText);
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

    protected void addClassificationMethod(String[] categories) {
        findElement(By.linkText("Classification")).click();
        findElement(By.id("addClassification")).click();
        modalHere();
        findElement(By.id("classifySlectOrg-" + categories[0])).click();

        // Ensures that tree of classifications have finished loading.
        Assert.assertTrue(textPresent(categories[1]));

        for (int i = 1; i < categories.length - 1; i++) {
            findElement(By.cssSelector("[id='addClassification-" + categories[i] + "'] span.fake-link")).click();
        }
        findElement(By.cssSelector("[id='addClassification-" + categories[categories.length - 1] + "'] button")).click();
        closeAlert();
        findElement(By.cssSelector("#addClassificationModalFooter .done")).click();
        hangon(1);
        findElement(By.linkText("Classification")).click();
        String selector = "";
        for (int i = 1; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-" + selector + "'] .name")).getText().equals(categories[categories.length - 1]));
    }

    protected void fillInput(String type, String value) {
        findElement(By.xpath("//label[text()=\"" + type + "\"]/following-sibling::input")).sendKeys(value);
    }


    protected void showSearchFilters() {
        WebElement showHideFilterButton = findElement(By.id("showHideFilters"));
        
        if( "Show Filters".equals(showHideFilterButton.getText()) ) {
            wait.until(ExpectedConditions.elementToBeClickable(By.id("gridView")));
            findElement(By.id("showHideFilters")).click();
        }
    }

}
