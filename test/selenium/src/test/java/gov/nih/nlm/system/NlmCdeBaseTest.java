package gov.nih.nlm.system;

import org.openqa.selenium.*;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.*;

import java.lang.System;
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
    protected static String macosx_detected_message = "Max OS X Detected\nStarting ./chromedriver";

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
    protected static String acrin_username = "acrin";
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
    protected static String createUser_username = "createUser";
    protected static String anonymousCommentUser_username = "CommentUser";
    protected static String anonymousCommentUser2_username = "CommentUser2";
    protected static String anonymousFormCommentUser_username = "FormCommentUser";
    protected static String anonymousCommentUser_password = "pass";
    protected static String commentEditor_username = "commentEditor";
    protected static String commentEditor_password = "pass";
    protected static String attachmentReviewer_username = "attachmentReviewer";
    protected static String ctep_fileCurator_username = "ctep_fileCurator";
    protected static String tableViewUser_username = "tableViewUser";

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

        driver.get(baseUrl);
        driver.manage().timeouts()
                .implicitlyWait(defaultTimeout, TimeUnit.SECONDS);

        wait = new WebDriverWait(driver, defaultTimeout, 200);
        shortWait = new WebDriverWait(driver, 2);

        resizeWindow(1280, 800);
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
    }

    protected void mustBeLoggedOut() {
        findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
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

    protected void goToElementByName(String name, String type) {
        goToElementByName(name, type, null);
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

    protected void openEltInList(String name, String type) {
        openEltInList(name, type, null);
    }

    public void searchElt(String name, String type, String status) {
        goToSearch(type);
        if (status != null) {
            findElement(By.id("li-blank-" + status)).click();
            hangon(2);
        }
        scrollToTop();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        findElement(By.id("search.submit")).click();
        textPresent("1 results for");
        textPresent(name, By.id("acc_link_0"));
    }

    protected void openEltInList(String name, String type, String status) {
        searchElt(name, type, status);
        clickElement(By.id("acc_link_0"));
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
        hangon(1);
    }

    public void closeAlert() {
        try {
            driver.manage().timeouts().implicitlyWait(2, TimeUnit.SECONDS);
            findElement(By.cssSelector("button.close")).click();
            driver.manage().timeouts()
                    .implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
        } catch (Exception e) {
        }
    }

    protected void newCdeVersion() {
        newCdeVersion(null);
    }

    protected void newCdeVersion(String changeNote) {
        findElement(By.id("openSave")).click();
        if (changeNote != null) {
            findElement(By.name("changeNote")).clear();
            findElement(By.name("changeNote")).sendKeys(
                    "Change note for change number 1");
        }
        // assumption is that text is sent before JS can load. So wait 1 sec.
        findElement(By.name("version")).sendKeys(".1");
        textNotPresent("has already been used");
        waitAndClick(By.id("confirmNewVersion"));
        try {
            textPresent("Saved.");
        } catch (Exception e) {
            findElement(By.id("confirmNewVersion")).click();
            textPresent("Saved.");
        }
        closeAlert();
        modalGone();
    }

    public void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    public void textPresent(String text, By by, int timeout) {
        driver.manage().timeouts().implicitlyWait(timeout, TimeUnit.SECONDS);
        textPresent(text, by);
        driver.manage().timeouts()
                .implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
    }

    ;

    public boolean textPresent(String text, By by) {
        if (by != null)
            wait.until(ExpectedConditions.textToBePresentInElementLocated(by,
                    text));
        else
            textPresent(text);
        return true;
    }

    public boolean textPresent(String text) {
        return textPresent(text, By.cssSelector("BODY"));
    }

    public boolean textPresentTrueFalse(String text) {
        return driver.findElement(By.tagName("body")).getText().contains(text);
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
        findElement(By.name("ftsearch"));
        showSearchFilters();
        textPresent("NINDS (");
    }

    protected void goToSearchByMenu() {
        findElement(By.linkText("CDEs")).click();
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
        findElement(By.name("ftsearch")).clear();
        findElement(By.name("ftsearch")).sendKeys("\"" + cdeName + "\"");
        findElement(By.id("search.submit")).click();
        textPresent("1 results for");
        textPresent(cdeName, By.cssSelector("#acc_link_0"));
        findElement(By.id("addToCompare_0")).click();
        hangon(.5);
        findElement(By.name("ftsearch")).clear();
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

    protected boolean checkElementDoesNotExistById(String id) {
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        boolean elementVisible;
        try {
            driver.findElement(By.id(id));
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

    protected void enterUsernamePasswordSubmit(String username,
                                               String password, String checkText) {
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys(username);
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys(password);
        waitAndClick(By.id("login_button"));
        try {
            textPresent(checkText, null, 12);
            // Assumption is that UMLS sometimes throws an error on login. With
            // a socket hangup. login fails, we retry.
        } catch (TimeoutException e) {
            System.out.println("Login failed. Re-trying. error: "
                    + e.getMessage());
            System.out.println("*************checkText:" + checkText);
            hangon(3);
            findElement(By.id("login_button")).click();
            textPresent(checkText);
        }
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

    protected void setLowStatusesVisible(){
        goHome();
        findElement(By.id("searchSettings")).click();
        findElement(By.id("minStatus-Incomplete")).click();
        findElement(By.id("saveSettings")).click();
        goToSearch("cde");
    }
}