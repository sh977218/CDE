package gov.nih.nlm.system;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
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
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;

import javax.imageio.ImageIO;
import javax.imageio.stream.FileImageOutputStream;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.awt.image.BufferedImage.TYPE_INT_RGB;

@Listeners({ScreenShotListener.class})
public class NlmCdeBaseTest {

    public static WebDriver driver;
    public static WebDriverWait wait;
    public static WebDriverWait shortWait;

    private static int defaultTimeout = Integer.parseInt(System.getProperty("timeout"));
    protected static String downloadFolder = System.getProperty("seleniumDownloadFolder");
    private static String chromeDownloadFolder = System.getProperty("chromeDownloadFolder");
    protected static String tempFolder = System.getProperty("tempFolder");

    protected static String browser = System.getProperty("browser");
    public static String baseUrl = System.getProperty("testUrl");

    protected static String nlm_username = "nlm";
    protected static String nlm_password = "nlm";
    protected static String cabigAdmin_username = "cabigAdmin";
    protected static String promis_username = "promis";
    protected static String ctepCurator_username = "ctepCurator";
    protected static String test_username = "testuser";
    static String history_username = "historyuser";
    protected static String ninds_username = "ninds";
    protected static String wguser_username = "wguser";
    protected static String reguser_username = "reguser";
    protected static String boarduser1_username = "boarduser1";
    protected static String boardSearchUser_username = "boardsearchuser";
    protected static String boarduser2_username = "boarduser2";
    protected static String boarduserEdit_username = "boarduserEdit";
    protected static String boardUser = "boarduser";
    protected static String formboarduser = "formboarduser";
    protected static String pinUser = "pinuser";
    protected static String unpinUser = "unpinuser";
    protected static String classificationMgtUser_username = "classMgtUser";
    protected static String transferStewardUser_username = "transferStewardUser";
    protected static String anonymousCommentUser2_username = "CommentUser2";
    protected static String anonymousFormCommentUser_username = "FormCommentUser";
    protected static String anonymousCommentUser_password = "pass";
    protected static String commentEditor_username = "commentEditor";
    protected static String commentEditor_password = "pass";
    protected static String attachmentReviewer_username = "attachmentReviewer";
    protected static String ctep_fileCurator_username = "ctep_fileCurator";
    protected static String tableViewUser_username = "tableViewUser";
    protected static String pinAllBoardUser_username = "pinAllBoardUser";
    protected static String testAdmin_username = "testAdmin";
    protected static String classifyBoardUser_username = "classifyBoardUser";
    static String oldUser_username = "oldUser";
    protected static String boardPublisherTest_username = "boardPublisherTest";
    protected static String doublepinuser_username = "doublepinuser";
    protected static String boardBot_username = "boardBot";

    protected static String password = "pass";

    private HashSet<PosixFilePermission> filePerms;

    private String className = this.getClass().getSimpleName();
    private ScheduledExecutorService videoExec;

    private int videoRate = 300;


    ArrayList<String> PREDEFINED_DATATYPE = new ArrayList<String>(Arrays.asList("Value List", "Text", "Date", "Number", "Externally Defined"));

    private void setDriver(String b) {
        if (b == null) b = browser;

        hangon(new Random().nextInt(10));
        String windows_detected_message = "MS Windows Detected\nStarting ./chromedriver.exe";
        if (isWindows()) {
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
            System.setProperty("webdriver.ie.driver", "./IEDriverServer.exe");
        } else {
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver");
        }
        DesiredCapabilities caps;
        if ("firefox".equals(b)) {
            caps = DesiredCapabilities.firefox();
        } else if ("chrome".equals(b)) {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--start-maximized");
            Map<String, Object> prefs = new HashMap<>();
            prefs.put("download.default_directory", chromeDownloadFolder);
            options.setExperimentalOption("prefs", prefs);
            caps = DesiredCapabilities.chrome();
            caps.setCapability(ChromeOptions.CAPABILITY, options);
        } else if ("ie".equals(b)) {
            caps = DesiredCapabilities.internetExplorer();
        } else {
            caps = DesiredCapabilities.chrome();
        }

        LoggingPreferences loggingPreferences = new LoggingPreferences();
        loggingPreferences.enable(LogType.BROWSER, Level.ALL);
        caps.setCapability(CapabilityType.LOGGING_PREFS, loggingPreferences);

        caps.setBrowserName(b);
        baseUrl = System.getProperty("testUrl");
        String hubUrl = System.getProperty("hubUrl");

        URL _hubUrl = null;
        try {
            _hubUrl = new URL(hubUrl);
        } catch (MalformedURLException ex) {
            Logger.getLogger(NlmCdeBaseTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        try {
            driver = new RemoteWebDriver(_hubUrl, caps);
        } catch (SessionNotCreatedException e) {
            hangon(10);
            driver = new RemoteWebDriver(_hubUrl, caps);
        }

        System.out.println("baseUrl: " + baseUrl);
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);

        wait = new WebDriverWait(driver, defaultTimeout, 600);
        shortWait = new WebDriverWait(driver, 5);

        System.out.println("downloadFolder: " + downloadFolder);
        System.out.println("chromeDownloadFolder: " + chromeDownloadFolder);
    }

    @BeforeMethod
    public void setUp(Method m) {
        filePerms = new HashSet();

        if (m.getAnnotation(SelectBrowser.class) != null) {
            setDriver("internet explorer");
        } else {
            setDriver(null);
        }
        filePerms.add(PosixFilePermission.OWNER_READ);
        filePerms.add(PosixFilePermission.OWNER_WRITE);
        filePerms.add(PosixFilePermission.OTHERS_READ);
        filePerms.add(PosixFilePermission.OTHERS_WRITE);
        takeScreenshotsRecordVideo(m);
    }

    private void takeScreenshotsRecordVideo(Method m) {
        if (m.getAnnotation(RecordVideo.class) != null) {
            videoExec = Executors.newSingleThreadScheduledExecutor();
            final String methodName = m.getName();
            System.out.println("methodName in setBaseUrl: " + methodName);
            videoExec.scheduleAtFixedRate(() -> {
                try {
                    File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
                    String dest = "build/tmp/screenshots/" + className + "/" + methodName + "/" + methodName + "_" + new Date().getTime() + ".png";
                    FileUtils.copyFile(srcFile, new File(dest));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }, 0, videoRate, TimeUnit.MICROSECONDS);
        }
    }

    @AfterMethod
    public void generateGif(Method m) {
        if (m.getAnnotation(RecordVideo.class) != null) {
            String methodName = m.getName();
            try {
                File inputScreenshots = new File("build/tmp/screenshots/" + className + "/" + methodName + "/");
                File[] inputScreenshotsArray = inputScreenshots.listFiles();
                File gif = new File("build/gif/" + className + "/" + methodName + ".gif");
                File srcFile = new File(className + "_" + methodName + ".gif");
                GifSequenceWriter writer = new GifSequenceWriter(new FileImageOutputStream(srcFile), TYPE_INT_RGB, videoRate, false);
                assert inputScreenshotsArray != null;
                for (File screenshotFile : inputScreenshotsArray) {
                    writer.writeToSequence(ImageIO.read(screenshotFile));
                }
                writer.close();
                FileUtils.copyFile(srcFile, gif);
            } catch (Exception e) {
                e.printStackTrace();
            }
            videoExec.shutdown();
            hangon(1);
        }
        try {
            if (driver.getWindowHandles().size() > 1)
                System.out.println(m.getName() + " has " + driver.getWindowHandles().size() + " windows after test");
            driver.quit();
        } catch (Exception e) {
        }

    }

    protected void clearStorage() {
        String clearStorage = "localStorage.clear();";
        ((JavascriptExecutor) driver).executeScript(clearStorage, "");
        if (driver.getWindowHandles().size() > 1)
            System.out.println("There are " + driver.getWindowHandles().size() + " windows before test");
    }

    private boolean isUsernameMatch(String username) {
        WebElement usernameLink = findElement(By.id("username_link"));
        String usernameLinkText = usernameLink.getText();
        String usernameStr = username;
        if (usernameLinkText.length() > 17) {
            usernameLinkText = usernameLinkText.substring(0, 17) + "...";
        }
        if (usernameStr.length() > 17) {
            usernameStr = username.substring(0, 17) + "...";
        }
        return usernameLinkText.equals(usernameStr);
    }

    protected void doLogin(String username, String password) {
        findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
        WebElement loginLinkList = driver.findElement(By.id("login_link"));
        if (loginLinkList.isDisplayed()) {
            loginAs(username, password);
        } else {
            if (!isUsernameMatch(username)) {
                logout();
                loginAs(username, password);
            }
        }
    }

    protected void mustBeLoggedInAs(String username, String password) {
        goHome();
        doLogin(username, password);
        goToCdeSearch();
    }

    protected void addOrg(String orgName, String orgLongName, String orgWGOf) {
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Organizations"));
        findElement(By.name("newOrgName")).sendKeys(orgName);

        if (orgLongName != null) {
            findElement(By.name("newOrgLongName")).sendKeys(orgLongName);
        }

        if (orgWGOf != null) {
            new Select(findElement(By.id("newOrgWorkingGroup"))).selectByVisibleText("ACRIN");
        }

        clickElement(By.id("addOrg"));
        textPresent("Org Added");
        textPresent(orgName);

        if (orgLongName != null) {
            textPresent(orgLongName);
        }
    }

    protected void gotoClassificationMgt() {
        clickElement(By.id("username_link"));
        hangon(.5);
        clickElement(By.linkText("Classifications"));
        textPresent("Classifications");
    }

    protected void mustBeLoggedOut() {
        findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
        WebElement loginLinkList = driver.findElement(By.id("login_link"));
        if (!loginLinkList.isDisplayed()) {
            logout();
        }
    }

    protected int getNumberOfResults() {
        return Integer.parseInt(findElement(By.id("searchResultNum")).getText());
    }

    protected void goToCdeByName(String name) {
        goToElementByName(name, "cde");
    }

    protected void goToFormByName(String name) {
        goToElementByName(name, "form");
    }

    private void goToElementByName(String name, String type) {
        String tinyId = EltIdMaps.eltMap.get(name);
        if (tinyId != null) {
            driver.get(baseUrl + "/" + ("cde".equals(type) ? "deView" : "formView") + "/?tinyId=" + tinyId);
            textPresent(name);
        } else {
            try {
                searchElt(name, type);
                clickElement(By.id("linkToElt_0"));
                textPresent(name);
                textNotPresent("is archived");
            } catch (Exception e) {
                System.out.println("Element is archived. Will retry...");
                hangon(1);
                searchElt(name, type);
                clickElement(By.id("linkToElt_0"));
                textPresent(name);
                textNotPresent("is archived");
            }
        }
    }

    protected void openCdeInList(String name) {
        openEltInList(name, "cde");
    }

    public void searchForm(String formName) {
        searchElt(formName, "form");
    }

    protected void assertNoElt(By by) {
        driver.manage().timeouts().implicitlyWait(0, TimeUnit.SECONDS);
        Assert.assertEquals(driver.findElements(by).size(), 0);
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);
    }

    protected void searchEltAny(String name, String type) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");

        // Wait for ng-model of ftsearch to update. Otherwise angular sometime sends incomplete search:  ' "Fluoresc ' instead of ' "Fluorescent sample CDE" '
        hangon(0.5);
        clickElement(By.id("search.submit"));
        try {
            textPresent("results for");
        } catch (Exception e) {
            System.out.println("Failing to find, trying again: " + name);
            findElement(By.id("ftsearch-input")).clear();
            findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
            clickElement(By.id("search.submit"));
            textPresent("results for");
        }
    }


    protected void searchElt(String name, String type) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");

        // Wait for ng-model of ftsearch to update. Otherwise angular sometime sends incomplete search:  ' "Fluoresc ' instead of ' "Fluorescent sample CDE" '
        hangon(0.5);
        clickElement(By.id("search.submit"));
        try {
            textPresent("1 results for");
        } catch (Exception e) {
            System.out.println("Failing to find, trying again: " + name);
            findElement(By.id("ftsearch-input")).clear();
            findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
            clickElement(By.id("search.submit"));
            textPresent("1 results for");
        }
        textPresent(name, By.id("searchResult_0"));
    }

    protected void openEltInList(String name, String type) {
        searchElt(name, type);
        textPresent(name, By.id("searchResult_0"));
    }

    protected void openFormInList(String name) {
        goToFormSearch();
        clickElement(By.linkText("Forms"));
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        clickElement(By.cssSelector("i.fa-search"));
        textPresent("1 results for");
        textPresent(name, By.id("searchResult_0"));
    }

    protected void checkTooltipText(By by, String text) {
        try {
            textPresent(text);
        } catch (TimeoutException e) {
            hoverOverElement(findElement(By.id("searchSettings")));
            hoverOverElement(findElement(by));
            textPresent(text);
        }
    }

    protected WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

    protected void waitForDownload(String fileName) {
        for (int i = 0; i < 30; i++) {
            try {
                String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/" + fileName)));
                if (actual.length() > 0) {
                    i = 30;
                }
            } catch (IOException e) {
                hangon(2);
            }
        }

    }

    protected List<WebElement> findElements(By by) {
        wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(by));
        return driver.findElements(by);
    }

    protected void clickElement(By by) {
        // Wait for angular digest cycle.

        try {
            ((JavascriptExecutor) driver).executeAsyncScript(
                    "angular.element('body').injector().get('$timeout')(arguments[arguments.length - 1]);"
                    , ""
            );
        } catch (Exception e) {
        }
        try {
            wait.until(ExpectedConditions.elementToBeClickable(by));
            findElement(by).click();
        } catch (StaleElementReferenceException e) {
            closeAlert();
            findElement(by).click();
        } catch (WebDriverException e) {
            System.out.println("Exception 1: " + e);
            JavascriptExecutor javascriptExecutor = (JavascriptExecutor) driver;
            // IE does not support scrollY
            Object yCoordinate = javascriptExecutor.executeScript("return typeof window.scrollY === 'undefined' ? window.pageYOffset : window.scrollY;");
            Integer value;
            if (yCoordinate instanceof Double) {
                value = ((Double) yCoordinate).intValue();
            } else {
                Long yCoordinateLong = (Long) yCoordinate;
                value = yCoordinateLong.intValue();
            }
            scrollTo(value + 100);
            try {
                findElement(by).click();
            } catch (WebDriverException e2) {
                System.out.println("Exception 2: " + e2);
                scrollToTop();
                findElement(by).click();
            }
        }
    }

    public void waitForESUpdate() {
        hangon(10);
    }

    /*
     * TODO - Find a better way than to wait. I can't find out how to wait for
     * modal to be gone reliably.
     */
    public void modalGone() {
        hangon(1.5);
    }

    public void closeAlert() {
        try {
            List<WebElement> elts = driver.findElements(By.cssSelector("button.close"));
            if (elts.size() > 0) elts.get(0).click();
        } catch (Exception e) {
            System.out.println("Could not close alert");
        }
    }


    protected void newCdeVersion() {
        newCdeVersion(null);
    }

    protected void newCdeVersion(String changeNote) {
        if (changeNote == null || changeNote == "")
            changeNote = "Change note for change number 1";
        clickElement(By.id("openSave"));
        textPresent("has already been used");
        findElement(By.id("changeNote")).clear();
        findElement(By.id("changeNote")).sendKeys(changeNote);
        findElement(By.name("newVersion")).sendKeys(".1");
        textNotPresent("has already been used");
        clickElement(By.id("confirmSaveBtn"));
        textPresent("Data Element saved.");
        closeAlert();
        modalGone();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
    }

    public void hangon(double i) {
        try {
            Thread.sleep((long) (i * 1000));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private boolean classPresent(String text, By by) {
        return findElement(by).getAttribute("class").contains(text);
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
        wait.until(ExpectedConditions.not(ExpectedConditions.textToBePresentInElementLocated(by, text)));
        return true;
    }

    private boolean classNotPresent(String text, By by) {
        return !findElement(by).getAttribute("class").contains(text);
    }

    protected void goHome() {
        driver.get(baseUrl + "/home");
        textPresent("has been designed to provide access");
    }

    protected void goToCdeSearch() {
        goToSearch("cde");
    }

    protected void goToFormSearch() {
        goToSearch("form");
    }

    protected void goToSearch(String type) {
        driver.get(baseUrl + "/" + type + "/search");
        findElement(By.id("ftsearch-input"));
        textPresent("Browse by Classification");
        if ("form".equals(type)) {
            textPresent("PROMIS / Neuro-QOL");
        }
        textPresent("Cancer Therapy Evaluation Program");
    }

    protected void logout() {
        clickElement(By.id("username_link"));
        clickElement(By.id("user_logout"));
        findElement(By.id("login_link"));
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

    protected void addCdeToQuickBoard(String cdeName) {
        goToCdeByName(cdeName);
        clickElement(By.id("addToQuickBoard"));
        closeAlert();
    }

    protected void addFormToQuickBoard(String formName) {
        searchForm(formName);
        clickElement(By.id("addToCompare_0"));
        closeAlert();
        findElement(By.name("q")).clear();
    }

    protected void addFormToQuickBoardByTinyId(String formName) {
        goToSearch("form");
        String tinyId = EltIdMaps.eltMap.get(formName);
        if (tinyId.length() == 0) {
            System.out.println("form " + formName + " is not present in the eltMap.");
        }
        findElement(By.id("ftsearch-input")).sendKeys(tinyId);
        hangon(0.5);
        clickElement(By.id("search.submit"));
        clickElement(By.id("addToCompare_0"));
        closeAlert();
    }

    public void goToQuickBoardByModule(String module) {
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        clickElement(By.xpath("//*[@id='qb_" + module + "_tab']/a"));
        String quickBoardTabText = ("cde".equals(module) ? "CDE" : "Form") + " QuickBoard (";
        textPresent(quickBoardTabText);
    }

    protected void emptyQuickBoardByModule(String module) {
        if (findElement(By.id("menu_qb_link")).getText().contains("(0)")) return;
        goToQuickBoardByModule(module);
        clickElement(By.id("qb_" + module + "_empty"));
        textPresent(("cde".equals(module) ? "CDE" : "Form") + " QuickBoard (0)");
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        hangon(1);
    }

    protected void addToCompare(String cdeName1, String cdeName2) {
        textPresent("Quick Board (0)");
        addCdeToQuickBoard(cdeName1);
        textPresent("Quick Board (1)");
        addCdeToQuickBoard(cdeName2);
        clickElement(By.linkText("Quick Board (2)"));
        clickElement(By.xpath("//*[@id='qb_cde_tab']/a"));
        textPresent(cdeName1);
        textPresent(cdeName2);
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_cde_compare"));
    }

    public void scrollToTop() {
        scrollTo(0);
    }

    protected boolean checkElementDoesNotExistByCSS(String selector) {
        return !(driver.findElements(By.cssSelector(selector)).size() > 0);
    }

    protected boolean checkElementDoesNotExistByLocator(By locator) {
        return !(driver.findElements(locator).size() > 0);
    }

    protected void scrollTo(Integer y) {
        String jsScroll = "scroll(0," + Integer.toString(y) + ");";
        String jqueryScroll = "$(window).scrollTop(" + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
        ((JavascriptExecutor) driver).executeScript(jqueryScroll, "");
    }

    protected void scrollUpBy(Integer y) {
        String jsScroll = "window.scrollBy(0,-" + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
    }

    protected void scrollDownBy(Integer y) {
        String jsScroll = "window.scrollBy(0," + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
    }

    protected void scrollContainerDownBy(WebElement c, Integer y) {
        String jsScroll = "arguments[0].scrollTop += " + Integer.toString(y) + ";";
        ((JavascriptExecutor) driver).executeScript(jsScroll, c);
    }

    private void scrollToEltByCss(String css) {
        String scrollScript = "scrollTo(0, $(\"" + css + "\").offset().top-200)";
        ((JavascriptExecutor) driver).executeScript(scrollScript, "");
    }

    protected void scrollToViewById(String id) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        je.executeScript("arguments[0].scrollIntoView(true);", findElement(By.id(id)));
        hangon(2);
    }

    protected void scrollToViewByXpath(String xpath) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        je.executeScript("arguments[0].scrollIntoView(true);", findElement(By.xpath(xpath)));
        hangon(2);
    }

    protected void hoverOverElement(WebElement ele) {
        Actions action = new Actions(driver);
        action.moveToElement(ele);
        action.perform();
    }

    void enterUsernamePasswordSubmit(String username, String password, String checkText) {
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys(username);
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys(password);
        clickElement(By.id("login_button"));
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
            findElement(By.xpath("//*[@data-userloaded='loaded-true']"));
            WebElement loginLinkList = driver.findElement(By.id("login_link"));
            if (loginLinkList.isDisplayed()) {
                findElement(By.id("login_link")).click();
                findElement(By.id("uname")).clear();
                findElement(By.id("uname")).sendKeys(username);
                findElement(By.id("passwd")).clear();
                findElement(By.id("passwd")).sendKeys(password);
                clickElement(By.id("login_button"));
            }
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
        List<String> tabs = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }

    protected void fillInput(String type, String value) {
        findElement(By.xpath("//label[text()='" + type + "']/following-sibling::input")).sendKeys(value);
    }

    protected void showSearchFilters() {
        WebElement showHideFilterButton = findElement(By.id("showHideFilters"));

        if ("Show Filters".equals(showHideFilterButton.getText())) {
            wait.until(ExpectedConditions.elementToBeClickable(By
                    .id("gridView")));
            clickElement(By.id("showHideFilters"));
        }
    }

    protected void deleteClassification(String classificationId) {
        clickElement(By.xpath("//*[@id='" + classificationId + "-unclassifyBtn']"));
        clickElement(By.id("confirmDeleteClassificationBtn"));
        modalGone();
        closeAlert();
    }

    protected void deleteMgtClassification(String classificationId, String classificationName) {
        clickElement(By.cssSelector("[id='" + classificationId + "'] [title=\"Remove\"]"));
        findElement(By.id("removeClassificationUserTyped")).sendKeys(classificationName);
        clickElement(By.cssSelector("[id='okRemoveClassificationModal']"));
        modalGone();
        try {
            textPresent("Classification Deleted");
        } catch (TimeoutException e) {
            textPresent("Classification Deleted");
        }
        closeAlert();
    }

    protected void gotoInbox() {
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Inbox"));
        hangon(0.5);
    }

    protected void selectHistoryAndCompare(Integer leftIndex, Integer rightIndex) {
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[td][" + leftIndex + "]"));
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[td][" + rightIndex + "]"));
        clickElement(By.id("historyCompareBtn"));
    }

    protected void openCdeAudit(String cdeName) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("CDE Audit Log"));
        for (Integer i = 0; i < 10; i++) {
            hangon(1);
            try {
                wait.until(ExpectedConditions.textToBePresentInElementLocated(
                        By.cssSelector("ngb-accordion"), cdeName));
                break;
            } catch (Exception e) {
                clickElement(By.linkText("Next"));
            }

        }
        clickElement(By.xpath("//ngb-accordion//a[contains (., '" + cdeName + "')]"));
    }

    protected void setVisibleStatus(String id) {
        goHome();
        clickElement(By.id("searchSettings"));
        clickElement(By.id(id));
        hangon(1);
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved");
        closeAlert();
        goToSearch("cde");
    }

    protected void setLowStatusesVisible() {
        setVisibleStatus("minStatus-Incomplete");
    }

    protected void loadDefaultSettings() {
        clickElement(By.id("searchSettings"));
        clickElement(By.id("loadDefaultSettings"));
        textPresent("Default settings loaded");
        closeAlert();
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        closeAlert();
    }

    protected void editDesignationByIndex(int index, String newDesignation) {
        String designationEditIconXpath = "//*[@id='designation_" + index + "']//*[contains(@class,'fa-edit')]";
        String designationInputXpath = "//*[@id='designation_" + index + "']//input";
        String designationConfirmBtnXpath = "//*[@id='designation_" + index + "']//*[contains(@class,'fa-check')]";
        clickElement(By.xpath(designationEditIconXpath));
        findElement(By.xpath(designationInputXpath)).sendKeys(newDesignation);
        hangon(2);
        clickElement(By.xpath(designationConfirmBtnXpath));
        textNotPresent("Confirm");
    }

    protected void editDefinitionByIndex(int index, String newDefinition, boolean html) {
        String definitionEditIconXpath = "//*[@id='definition_" + index + "']//*[contains(@class,'fa-edit')]";
        String richTextBtnXpath = "//*[@id='definition_" + index + "']//button[contains(text(),'Rich Text')]";
        String definitionTextareaXpath = "//*[@id='definition_" + index + "']//textarea";
        String definitionConfirmBtnXpath = "//*[@id='definition_" + index + "']//*[contains(@class,'fa-check')]";
        clickElement(By.xpath(definitionEditIconXpath));
        if (html) {
            clickElement(By.xpath(richTextBtnXpath));
            textPresent("Characters:");
        }
        findElement(By.xpath(definitionTextareaXpath)).sendKeys(newDefinition);
        hangon(2);
        clickElement(By.xpath(definitionConfirmBtnXpath));
        textNotPresent("Confirm");
    }

    protected void changeDefinitionFormat(int index, boolean isHtml) {
        String definitionEditIconXpath = "//*[@id='definition_" + index + "']//*[contains(@class,'fa-edit')]";
        String richTextBtnXpath = "//*[@id='definition_" + index + "']//button[contains(text(),'Rich Text')]";
        String plainTextBtnXpath = "//*[@id='definition_" + index + "']//button[contains(text(),'Plain Text')]";
        String confirmBtnXpath = "//*[@id='definition_0']//*[contains(@class,'fa-check')]";
        clickElement(By.xpath(definitionEditIconXpath));
        if (isHtml) clickElement(By.xpath(richTextBtnXpath));
        if (!isHtml) clickElement(By.xpath(plainTextBtnXpath));
        clickElement(By.xpath(confirmBtnXpath));
        textNotPresent("Confirm");
    }

    protected void editTagByIndex(int index, String[] tags) {
        String tagsInputXpath = "//*[@id='tags_" + index + "']//input";
        for (String tag : tags) {
            String selectTagXpath = "//span[contains(@class,'select2-results')]/ul//li[text()='" + tag + "']";
            clickElement(By.xpath(tagsInputXpath));
            clickElement(By.xpath(selectTagXpath));
            textPresent(tag);
        }
    }

    protected void editPropertyValueByIndex(int index, String newValue, boolean html) {
        String valueEditIconXpath = "//*[@id='value_" + index + "']//i[contains(@class,'fa fa-edit')]";
        String richTextBtnXpath = "//*[@id='value_" + index + "']//button[contains(text(),'Rich Text')]";
        String valueTextareaXpath = "//*[@id='value_" + index + "']//textarea";
        String valueConfirmBtnXpath = "//*[@id='value_" + index + "']//*[contains(@class,'fa-check')]";
        clickElement(By.xpath(valueEditIconXpath));
        if (html) {
            clickElement(By.xpath(richTextBtnXpath));
        }
        if (newValue != null) findElement(By.xpath(valueTextareaXpath)).sendKeys(newValue);

        hangon(2);
        clickElement(By.xpath(valueConfirmBtnXpath));
        textNotPresent("Confirm");
    }


    protected void addNewName(String designation, String definition, String[] tags) {
        clickElement(By.id("openNewNamingModalBtn"));
        textPresent("Tags are managed in Org Management > List Management");
        findElement(By.name("newDesignation")).sendKeys(designation);
        findElement(By.name("newDefinition")).sendKeys(definition);
        if (tags != null) {
            String tagsInputXpath = "//*[@id='newTags']//input";
            for (String tag : tags) {
                String selectTagXpath = "//span[contains(@class,'select2-results')]/ul//li[text()='" + tag + "']";
                clickElement(By.xpath(tagsInputXpath));
                clickElement(By.xpath(selectTagXpath));
                textPresent(tag);
            }
        }
        clickElement(By.id("createNewNamingBtn"));
        modalGone();
    }

    protected void addNewProperty(String key, String value) {
        clickElement(By.id("openNewPropertyModalBtn"));
        textPresent("Property key are managed in Org Management > List Management");
        new Select(findElement(By.id("newKey"))).selectByVisibleText(key);
        findElement(By.name("newValue")).sendKeys(value);
        hangon(2);
        clickElement(By.id("createNewPropertyBtn"));
        modalGone();
        textPresent("Property Added");
        closeAlert();
    }

    /**
     * This method is used to remove property for cde and form.
     *
     * @param index Index of properties, starting from 0.
     */
    protected void removeProperty(int index) {
        clickElement(By.id("removeProperty-" + index));
        clickElement(By.id("confirmRemoveProperty-" + index));
        textPresent("Property Removed");
        closeAlert();
    }

    protected void addNewReferenceDocument(String id, String title, String uri, String providerOrg, String languageCode, String document) {
        clickElement(By.id("openNewReferenceDocumentModalBtn"));
        findElement(By.name("newId")).sendKeys(id);
        findElement(By.name("newTitle")).sendKeys(title);
        findElement(By.name("newUri")).sendKeys(uri);
        findElement(By.name("newProviderOrg")).sendKeys(providerOrg);
        findElement(By.name("newLanguageCode")).sendKeys(languageCode);
        findElement(By.name("newDocument")).sendKeys(document);
        hangon(2);
        clickElement(By.id("createNewReferenceDocumentBtn"));
        modalGone();
        textPresent("Reference Document Added");
        closeAlert();
    }

    protected void addNewConcept(String cName, String cId, String cSystem, String cType) {
        clickElement(By.id("openNewConceptModalBtn"));
        findElement(By.name("name")).sendKeys(cName);
        findElement(By.name("codeId")).sendKeys(cId);
        if (cSystem != null)
            new Select(driver.findElement(By.id("codeSystem"))).selectByVisibleText(cSystem);
        if (cType != null)
            new Select(driver.findElement(By.id("conceptType"))).selectByVisibleText(cType);
        clickElement(By.id("createNewConceptBtn"));
    }

    protected void addNewIdentifier(String source, String id, String version) {
        clickElement(By.id("openNewIdentifierModalBtn"));
        findElement(By.id("newSource")).sendKeys(source);
        findElement(By.id("newId")).sendKeys(id);
        if (version != null)
            findElement(By.name("version")).sendKeys(version);
        clickElement(By.id("createNewIdentifierBtn"));
        textPresent("Identifier Added");
        closeAlert();
    }

    protected void changeDatatype(String newDatatype) {
        if (PREDEFINED_DATATYPE.contains(newDatatype)) {
            clickElement(By.xpath("//*[@id='datatypeSelect']//span[contains(@class,'select2-selection--single')]"));
            clickElement(By.xpath("(//*[contains(@class,'select2-dropdown')]//*[contains(@class,'select2-results')]//ul//li)[text()='" + newDatatype + "']"));
        } else {
            clickElement(By.xpath("//*[@id='datatypeSelect']//span[contains(@class,'select2-selection--single')]"));
            findElement(By.xpath("//*[contains(@class,'select2-dropdown')]//*[contains(@class,'elect2-search--dropdown')]//input")).sendKeys(newDatatype);
            clickElement(By.xpath("(//*[contains(@class,'select2-dropdown')]//*[contains(@class,'select2-results')]//ul//li)[1]"));
        }
    }

    protected void removeClassificationMethod(String[] categories) {
        String selector = "";
        for (int i = 0; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1)
                selector += ",";
        }
        clickElement(By.xpath("//*[@id='" + selector + "-unclassifyBtn']"));
        textPresent("You are about to delete " + categories[categories.length - 1] + " classification. Are you sure?");
        clickElement(By.id("confirmDeleteClassificationBtn"));
        closeAlert();
        Assert.assertTrue(checkElementDoesNotExistByLocator(By.xpath("//*[@id='" + selector + "']")));
    }

    protected void openClassificationAudit(String name) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("Classification Audit Log"));
        clickElement(By.xpath("(//span[text()=\"" + name + "\" and contains(@class,\"text-info\")])[1]"));
    }

    protected void goToBoard(String boardName) {
        String boardId = EltIdMaps.eltMap.get(boardName);
        if (boardId != null) {
            driver.get(baseUrl + "/board/" + boardId);
            textPresent(boardName);
        } else {
            gotoMyBoards();
            textPresent(boardName);
            clickElement(By.xpath("//*[@id='viewBoard_" + boardName + "']//a"));
            switchTab(1);
            textPresent(boardName, By.xpath("//h3[@id='board_name_" + boardName + "']"));
        }
    }

    protected void gotoMyBoards() {
        clickElement(By.id("boardsMenu"));
        textPresent("My Boards");
        clickElement(By.id("myBoardsLink"));
        textPresent("Add Board");
        hangon(2);
    }

    protected void addIdentifier(String source, String id, String version) {
        clickElement(By.id("ids_tab"));
        clickElement(By.id("openNewIdentifierModalBtn"));
        findElement(By.id("newSource")).sendKeys(source);
        findElement(By.id("newId")).sendKeys(id);
        if (version != null)
            findElement(By.name("version")).sendKeys(version);
        clickElement(By.id("createNewIdentifierBtn"));
        textPresent("Identifier Added");
        closeAlert();
        hangon(1);
    }

    /**
     * This method is used to remove identifier for cde and form.
     *
     * @param index Index of identifiers, starting from 0.
     */
    protected void removeIdentifier(int index) {
        clickElement(By.id("ids_tab"));
        clickElement(By.xpath("removeIdentifier-" + index));
        clickElement(By.xpath("confirmRemoveIdentifier-" + index));
        closeAlert();
    }

}
