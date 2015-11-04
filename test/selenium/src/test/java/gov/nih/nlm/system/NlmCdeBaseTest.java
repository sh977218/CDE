package gov.nih.nlm.system;

import org.openqa.selenium.*;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.*;

import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

@Listeners({ScreenShotListener.class})
public class NlmCdeBaseTest {

    protected static WebDriver driver;
    public static WebDriverWait wait;
    public static WebDriverWait shortWait;

    protected static String windows_detected_message = "MS Windows Detected\nStarting ./chromedriver.exe";

    protected static int defaultTimeout = Integer.parseInt(System
            .getProperty("timeout"));

    protected static String browser = System.getProperty("browser");
    public static String baseUrl = System.getProperty("testUrl");

    protected static String nlm_username = "nlm";
    protected static String nlm_password = "nlm";
    protected static String cabigAdmin_username = "cabigAdmin";
    protected static String ctepCurator_username = "ctepCurator";
    protected static String test_username = "testuser";
    protected static String test_password = "Test123";
    protected static String history_username = "historyuser";
    protected static String ninds_username = "ninds";
    protected static String wguser_username = "wguser";
    protected static String reguser_username = "reguser";
    protected static String boarduser1_username = "boarduser1";
    protected static String boardSearchUser_username = "boardsearchuser";
    protected static String boarduser2_username = "boarduser2";
    protected static String boarduserEdit_username = "boarduserEdit";
    protected static String boardUser = "boarduser";
    protected static String pinUser = "pinuser";
    protected static String docEditor = "docEditor";
    protected static String classificationMgtUser_username = "classMgtUser";
    protected static String transferStewardUser_username = "transferStewardUser";
    protected static String anonymousCommentUser_username = "CommentUser";
    protected static String anonymousCommentUser2_username = "CommentUser2";
    protected static String anonymousFormCommentUser_username = "FormCommentUser";
    protected static String anonymousCommentUser_password = "pass";
    protected static String commentEditor_username = "commentEditor";
    protected static String commentEditor_password = "pass";
    protected static String attachmentReviewer_username = "attachmentReviewer";
    protected static String ctep_fileCurator_username = "ctep_fileCurator";
    protected static String tableViewUser_username = "tableViewUser";
    protected static String pinAllBoardUser_username = "pinAllBoardUser";
    protected static String exportBoardUser_username = "exportBoardUser";


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
        if ("firefox".equals(browser)) {
            caps = DesiredCapabilities.firefox();
        } else if ("chrome".equals(browser)) {
            caps = DesiredCapabilities.chrome();
        } else if ("ie".equals(browser)) {
            caps = DesiredCapabilities.internetExplorer();
        } else {
            caps = DesiredCapabilities.chrome();
        }

        LoggingPreferences loggingprefs = new LoggingPreferences();
        loggingprefs.enable(LogType.BROWSER, Level.ALL);
        caps.setCapability(CapabilityType.LOGGING_PREFS, loggingprefs);

        caps.setBrowserName(browser);
        baseUrl = System.getProperty("testUrl");
        String hubUrl = System.getProperty("hubUrl");

        try {
            driver = new RemoteWebDriver(new URL(hubUrl), caps);
        } catch (MalformedURLException ex) {
            Logger.getLogger(NlmCdeBaseTest.class.getName()).log(Level.SEVERE,
                    null, ex);
        }

        System.out.println("baseUrl: " + baseUrl);
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);

        wait = new WebDriverWait(driver, defaultTimeout, 200);
        shortWait = new WebDriverWait(driver, 2);

        resizeWindow(1280, 800);
    }

    @AfterMethod
    public void countTabs(Method method) {
        if (driver.getWindowHandles().size() > 1)
            System.out.println(method.getName() + " has " + driver.getWindowHandles().size() + " windows after test");
    }

    @BeforeMethod
    public void clearStorage() {
        String clearStorage = "localStorage.clear();";
        ((JavascriptExecutor) driver).executeScript(clearStorage, "");
        if (driver.getWindowHandles().size() > 1)
            System.out.println("There are " + driver.getWindowHandles().size() + " windows before test");
    }

    protected void resizeWindow(int width, int height) {
        driver.manage().window().setSize(new Dimension(width, height));
    }

    protected Dimension getWindowSize() {
        return driver.manage().window().getSize();
    }

    protected void mustBeLoggedInAs(String username, String password) {
        goHome();
        findElement(By.xpath("//*[@data-userloaded='loaded-true']"));

        WebElement loginLinkList = driver.findElement(By.id("login_link"));
        if (loginLinkList.isDisplayed()) {
            loginAs(username, password);
        } else {
            WebElement unameLink = findElement(By.id("username_link"));
            String unameStr = unameLink.getText();
            String usernameStr = username;
            if (unameStr.length() > 17) {
                unameStr = unameStr.substring(0, 17) + "...";
            }
            if (usernameStr.length() > 17) {
                usernameStr = username.substring(0, 17) + "...";
            }
            if (!unameStr.equals(usernameStr)) {
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
            new Select(findElement(By.id("newOrgWorkingGroup")))
                    .selectByVisibleText("ACRIN");
        }

        findElement(By.id("addOrg")).click();
        textPresent("Org Added");
        textPresent(orgName);

        if (orgLongName != null) {
            textPresent(orgLongName);
        }
    }

    protected void gotoClassifMgt() {
        findElement(By.id("username_link")).click();
        hangon(.5);
        findElement(By.linkText("Classifications")).click();
        textPresent("Manage Classifications");
    }

    protected void mustBeLoggedOut() {
        findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
        WebElement loginLinkList = driver.findElement(By.id("login_link"));
        if (!loginLinkList.isDisplayed()) {
            logout();
        }
    }

    protected void goToCdeByName(String name) {
        goToCdeByName(name, null);
    }

    protected void goToCdeByName(String name, String status) {
        goToElementByName(name, "cde", status);
    }

    protected void goToFormByName(String name) {
        goToFormByName(name, null);
    }

    protected void goToFormByName(String name, String status) {
        goToElementByName(name, "form", status);
    }

    protected void goToElementByName(String name, String type, String status) {
        try {
            searchElt(name, type, status);
            clickElement(By.id("eyeLink_0"));
            textPresent("Classification");
            textPresent(name);
            textNotPresent("is archived");
        } catch (Exception e) {
            System.out.println("Element is archived. Will retry...");
            hangon(1);
            searchElt(name, type, status);
            clickElement(By.id("eyeLink_0"));
            textPresent("Classification");
            textPresent(name);
            textNotPresent("is archived");
        }
    }

    protected void openCdeInList(String name) {
        openCdeInList(name, null);
    }

    protected void openCdeInList(String name, String status) {
        openEltInList(name, "cde", status);
    }

    public void searchCde(String cdeName) {
        searchElt(cdeName, "cde", null);
    }

    public void searchElt(String name, String type, String status) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        hangon(0.5); // Wait for ng-model of ftsearch to update. Otherwise angular sometime sends incomplete search:  ' "Fluoresc ' instead of ' "Fluorescent sample CDE" '
        findElement(By.id("search.submit")).click();
        if (status != null) {
            hangon(2);
            findElement(By.id("li-blank-" + status)).click();
        }
        textPresent("1 results for");
        textPresent(name, By.id("acc_link_0"));
    }

    protected void openEltInList(String name, String type, String status) {
        searchElt(name, type, status);
        clickElement(By.id("acc_link_0"));
        textPresent("View Full Detail");
        wait.until(ExpectedConditions.elementToBeClickable(By
                .id("openEltInCurrentTab_0")));
    }

    protected void openFormInList(String name) {
        goToFormSearch();
        findElement(By.linkText("Forms")).click();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("1 results for");
        textPresent(name, By.id("accordionList"));
        findElement(By.id("acc_link_0")).click();
    }

    public void checkTooltipText(By by, String text) {
        try {
            textPresent(text);
        } catch (TimeoutException e) {
            goToCdeSearch();
            hoverOverElement(findElement(By.id("searchSettings")));
            hoverOverElement(findElement(by));
            textPresent(text);
        }
    }

    protected WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

    public void waitAndClick(By by) {
        wait.until(ExpectedConditions.elementToBeClickable(by));
        findElement(by).click();
    }

    protected void clickElement(By by) {
        try {
            findElement(by).click();
        } catch (StaleElementReferenceException e) {
            hangon(2);
            findElement(by).click();
        } catch (WebDriverException e) {
            JavascriptExecutor executor = (JavascriptExecutor) driver;
            Integer value = (int) (long) executor.executeScript("return window.scrollY;");
            scrollTo(value + 100);
            try {
                findElement(by).click();
            } catch (WebDriverException e2) {
                scrollToTop();
                findElement(by).click();
            }

        }
    }

    @AfterTest
    public void endSession() {
        driver.quit();
    }

    public void waitForESUpdate() {
        hangon(10);
    }

    /*
     * TODO - Find a better way than to wait. I can't find out how to wait for
     * modal to be gone reliably.
     */
    public void modalGone() {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By
                .cssSelector(".modal")));
        hangon(1.5);
    }

    public void closeAlert() {
        try {
            driver.manage().timeouts().implicitlyWait(2, TimeUnit.SECONDS);
            findElement(By.cssSelector("button.close")).click();
            driver.manage().timeouts()
                    .implicitlyWait(defaultTimeout, TimeUnit.SECONDS); } catch (Exception e) {
            System.out.println("Could not close alert");
        }
    }

    protected void newCdeVersion() {
        newCdeVersion(null);
    }

    protected void newCdeVersion(String changeNote) {
        scrollToEltByCss("#openSave");
        clickElement(By.id("openSave"));
        if (changeNote != null) {
            findElement(By.name("changeNote")).clear();
            findElement(By.name("changeNote")).sendKeys(
                    "Change note for change number 1");
        }
        findElement(By.name("version")).sendKeys(".1");
        textNotPresent("has already been used");
        waitAndClick(By.id("confirmNewVersion"));
        try {
            textPresent("Saved.");
        } catch (Exception e) {
        }
        wait.until(ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated(By.id("openSave"))));
        closeAlert();
        modalGone();
    }

    public void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    public boolean textPresent(String text, By by) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(by, text));
        return true;
    }

    public boolean textPresent(String text) {
        return textPresent(text, By.cssSelector("BODY"));
    }

    public boolean textNotPresent(String text) {
        return textNotPresent(text, By.cssSelector("BODY"));
    }

    public boolean textNotPresent(String text, By by) {
        wait.until(ExpectedConditions.not(ExpectedConditions
                .textToBePresentInElementLocated(by, text)));
        return true;
    }

    protected void goHome() {
        // gonowhere gets rid of possible alert.
        driver.get(baseUrl + "/gonowhere");
        textPresent("Nothing here");

        driver.get(baseUrl + "/#/home");
        textPresent("has been designed to provide access");
        hangon(.5);
    }

    protected void goToCdeSearch() {
        goToSearch("cde");
    }

    protected void goToFormSearch() {
        goToSearch("form");
    }

    protected void goToSearch(String type) {
        driver.get(baseUrl + "/gonowhere");
        textPresent("Nothing here");
        driver.get(baseUrl + "/#/" + type + "/search");
        findElement(By.id("ftsearch-input"));
        textPresent("Browse by classification");
        textPresent("Cancer Therapy Evaluation Program");
    }

    protected void goToQuickBoard() {
        driver.get(baseUrl + "/#/quickBoard");
    }

    protected void logout() {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Log Out")).click();
        findElement(By.linkText("Log In"));
        textPresent("Please Log In");
    }

    protected void loginAs(String username, String password) {
        findElement(By.id("login_link")).click();
        String usernameStr = username;
        if (username.length() > 17) {
            usernameStr = usernameStr.substring(0, 17) + "...";
        }
        enterUsernamePasswordSubmit(username, password, usernameStr);
    }

    private boolean isWindows() {
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.contains("win");
    }

    public void addToQuickBoard(String cdeName) {
        searchCde(cdeName);
        findElement(By.id("addToCompare_0")).click();
        hangon(.5);
        findElement(By.name("q")).clear();
    }

    public void addToCompare(String cdeName1, String cdeName2) {
        goToCdeSearch();
        textPresent("Quick Board ( empty )");
        addToQuickBoard(cdeName1);
        addToQuickBoard(cdeName2);
        findElement(By.linkText("Quick Board ( 2 )")).click();
        textPresent(cdeName1);
        textPresent(cdeName2);
        findElement(By.id("qb.compare")).click();
    }

    public void scrollToTop() {
        scrollTo(0);
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
        driver.manage().timeouts()
                .implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        return elementVisible;
    }

    public void scrollTo(Integer y) {
        String jsScroll = "scroll(0," + Integer.toString(y) + ");";
        String jqueryScroll = "$(window).scrollTop(" + Integer.toString(y)
                + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
        ((JavascriptExecutor) driver).executeScript(jqueryScroll, "");
    }

    public void scrollToEltByCss(String css) {
        String scrollScript = "scrollTo(0, $(\"" + css + "\").offset().top-200)";
        ((JavascriptExecutor) driver).executeScript(scrollScript, "");
    }

    public void scrollToViewById(String id) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        WebElement element = driver.findElement(By.id(id));
        je.executeScript("arguments[0].scrollIntoView(true);", element);
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
        waitAndClick(By.id("login_button"));
        try {
            textPresent(checkText);
            // sometimes an issue with csrf, need to reload the whole page.
        } catch (TimeoutException e) {
            // csrf collision, wait random before re-trying
            hangon(new Random().nextInt(10));
            System.out.println("Login failed. Re-trying. error: "
                    + e.getMessage());
            System.out.println("*************checkText:" + checkText);
            goHome();
            findElement(By.id("login_link")).click();
            findElement(By.id("uname")).clear();
            findElement(By.id("uname")).sendKeys(username);
            findElement(By.id("passwd")).clear();
            findElement(By.id("passwd")).sendKeys(password);
            waitAndClick(By.id("login_button"));
            textPresent(checkText);
        }
    }

    protected void switchTabAndClose(int i) {
        hangon(1);
        ArrayList<String> tabs2 = new ArrayList(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs2.get(i));
        hangon(3);
    }

    protected void switchTab(int i) {
        hangon(1);
        ArrayList<String> tabs2 = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs2.get(i));
    }

    protected void fillInput(String type, String value) {
        findElement(
                By.xpath("//label[text()=\"" + type
                        + "\"]/following-sibling::input")).sendKeys(value);
    }

    protected void showSearchFilters() {
        WebElement showHideFilterButton = findElement(By.id("showHideFilters"));

        if ("Show Filters".equals(showHideFilterButton.getText())) {
            wait.until(ExpectedConditions.elementToBeClickable(By
                    .id("gridView")));
            findElement(By.id("showHideFilters")).click();
        }
    }

    protected void deleteClassification(String classificationId) {
        driver.findElement(
                By.cssSelector("[id='" + classificationId
                        + "'] [title=\"Remove\"]")).click();
        driver.findElement(By.cssSelector("[id='okRemoveClassificationModal']"))
                .click();
        modalGone();
        closeAlert();
    }

    protected void deleteMgtClassification(String classificationId,
                                           String classifName) {
        driver.findElement(
                By.cssSelector("[id='" + classificationId
                        + "'] [title=\"Remove\"]")).click();
        driver.findElement(By.id("removeClassificationUserTyped")).sendKeys(
                classifName);
        driver.findElement(By.cssSelector("[id='okRemoveClassificationModal']"))
                .click();
        modalGone();
        closeAlert();
    }

    protected void gotoInbox() {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Inbox")).click();
        hangon(0.5);
    }

    protected void showHistoryDiff(Integer prev) {
        findElement(
                By.xpath("//table[@id = 'historyTable']//tr[" + (prev + 1)
                        + "]//td[4]/a")).click();
    }

    protected void showHistoryFull(Integer prev) {
        findElement(
                By.xpath("//table[@id = 'historyTable']//tr[" + (prev + 1)
                        + "]//td[5]/a")).click();
    }

    protected void confirmCdeModification(String field, String oldValue,
                                          String newValue) {
        confirmFieldName(field);
        confirmPreviousValue(oldValue);
        confirmNewValue(newValue);
    }

    protected void confirmFieldName(String fieldName) {
        textPresent(fieldName, By.cssSelector("#modificationsList"));
    }

    protected void confirmPreviousValue(String value) {
        textPresent(value, By.cssSelector("#modificationsList"));

    }

    protected void confirmNewValue(String value) {
        textPresent(value, By.cssSelector("#modificationsList"));
    }

    protected void checkInHistory(String field, String oldValue, String newValue) {
        scrollToTop();
        findElement(By.linkText("History")).click();
        hangon(1);
        showHistoryDiff(0);
        confirmCdeModification(field, oldValue, newValue);
    }

    protected void openCdeAudit(String cdeName) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();
        findElement(By.linkText("CDE Audit Log")).click();
        for (Integer i = 0; i < 10; i++) {
            hangon(1);
            try {
                wait.until(ExpectedConditions.textToBePresentInElementLocated(
                        By.cssSelector("accordion"), cdeName));
                break;
            } catch (Exception e) {
                findElement(By.linkText("Next")).click();
            }

        }
        findElement(
                By.xpath("//accordion//span[contains(text(),'" + cdeName
                        + "')]")).click();
    }

    protected void setVisibleStatus(String id) {
        goHome();
        findElement(By.id("searchSettings")).click();
        findElement(By.id(id)).click();
        scrollTo(1000);
        findElement(By.id("saveSettings")).click();
        textPresent("Settings saved");
        closeAlert();
        goToSearch("cde");
    }

    protected void setLowStatusesVisible() {
        setVisibleStatus("minStatus-Incomplete");
    }

    protected void reorderIconTest(String tabName) {
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.xpath(prefix + "moveDown-0" + postfix));
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-0" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-0" + postfix)).size(), 0);

        findElement(By.xpath(prefix + "moveDown-1" + postfix));
        findElement(By.xpath(prefix + "moveUp-1" + postfix));
        findElement(By.xpath(prefix + "moveTop-1" + postfix));

        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-2" + postfix)).size(), 0);
        driver.findElement(By.xpath(prefix + "moveUp-2" + postfix));
        findElement(By.xpath(prefix + "moveTop-2" + postfix));
    }
}
