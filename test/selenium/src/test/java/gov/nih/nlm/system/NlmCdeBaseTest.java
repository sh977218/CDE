package gov.nih.nlm.system;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.browserlaunchers.Sleeper;
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

import static com.jayway.restassured.RestAssured.get;
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
    protected static String pinUser = "pinuser";
    protected static String unpinUser = "unpinuser";
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
    private int totalCdes = 11700;
    private int totalForms = 815;

    private void countElasticElements(Method m) {
        int nbOfCde = 0, nbOfForms = 0, waitTimeCdes = 0, waitTimeForms = 0;
        for (int i = 0; i < 15 && nbOfCde < totalCdes; i++) {
            hangon(waitTimeCdes);
            nbOfCde = Integer.valueOf(get(baseUrl + "/elasticSearch/count").asString());
            System.out.println("nb of cdes: " + nbOfCde);
            waitTimeCdes = 10;
        }
        for (int j = 0; j < 5 && nbOfForms < totalForms; j++) {
            hangon(waitTimeForms);
            nbOfForms = Integer.valueOf(get(baseUrl + "/elasticSearch/form/count").asString());
            System.out.println("nb of forms: " + nbOfForms);
            waitTimeForms = 10;
        }
        System.out.println("Starting " + m.getName() + " in Fork: " + (int) (Math.random() * 1000));
    }

    private void setDriver() {
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
        if ("firefox".equals(browser)) {
            caps = DesiredCapabilities.firefox();
        } else if ("chrome".equals(browser)) {
            ChromeOptions options = new ChromeOptions();
            Map<String, Object> prefs = new HashMap<>();
            prefs.put("download.default_directory", chromeDownloadFolder);
            options.setExperimentalOption("prefs", prefs);
            caps = DesiredCapabilities.chrome();
            caps.setCapability(ChromeOptions.CAPABILITY, options);
        } else if ("ie".equals(browser)) {
            caps = DesiredCapabilities.internetExplorer();
        } else {
            caps = DesiredCapabilities.chrome();
        }

        LoggingPreferences loggingPreferences = new LoggingPreferences();
        loggingPreferences.enable(LogType.BROWSER, Level.ALL);
        caps.setCapability(CapabilityType.LOGGING_PREFS, loggingPreferences);

        caps.setBrowserName(browser);
        baseUrl = System.getProperty("testUrl");
        String hubUrl = System.getProperty("hubUrl");

        URL _hubUrl = null;
        try {
            _hubUrl = new URL(hubUrl);
        } catch (MalformedURLException ex) {
            Logger.getLogger(NlmCdeBaseTest.class.getName()).log(Level.SEVERE,
                    null, ex);
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
        driver.manage().window().maximize();

        System.out.println("downloadFolder: " + downloadFolder);
        System.out.println("chromeDownloadFolder: " + chromeDownloadFolder);


    }

    @BeforeMethod
    public void setUp(Method m) {
        filePerms = new HashSet();
        countElasticElements(m);
        setDriver();
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
        if (driver.getWindowHandles().size() > 1)
            System.out.println(m.getName() + " has " + driver.getWindowHandles().size() + " windows after test");
        driver.quit();
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
            driver.get(baseUrl + "/" + ("cde".equals(type) ? "deview" : "formView") + "/?tinyId=" + tinyId);
            textPresent("More...");
            textPresent(name);
        } else {
            try {
                searchElt(name, type);
                clickElement(By.id("linkToElt_0"));
                textPresent("More...");
                textPresent(name);
                textNotPresent("is archived");
            } catch (Exception e) {
                System.out.println("Element is archived. Will retry...");
                hangon(1);
                searchElt(name, type);
                clickElement(By.id("linkToElt_0"));
                textPresent("More...");
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

    public void waitForDownload(String fileName) {
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
        ((JavascriptExecutor) driver).executeAsyncScript(
                "angular.element('body').injector().get('$timeout')(arguments[arguments.length - 1]);"
                , ""
        );
        try {
            wait.until(ExpectedConditions.elementToBeClickable(by));
            findElement(by).click();
        } catch (StaleElementReferenceException e) {
            hangon(2);
            findElement(by).click();
        } catch (WebDriverException e) {
            JavascriptExecutor javascriptExecutor = (JavascriptExecutor) driver;
            Object yCoordinate = javascriptExecutor.executeScript("return window.scrollY;");
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
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By
                .cssSelector(".modal")));
        hangon(1.5);
    }

    public void closeAlert() {
        try {
            List<WebElement> elts = driver.findElements(By.xpath("//*[@id='alertBar']//*[contains(@class,'cdeAlert')]"));
            for (WebElement elt : elts) {
                elt.click();
            }
        } catch (Exception e) {
            System.out.println("Could not close alert");
        }
    }


    protected void newCdeVersion() {
        newCdeVersion(null);
    }

    protected void newCdeVersion(String changeNote) {
        scrollToEltByCss("#openSave");
        clickElement(By.id("openSave"));
        textPresent("has already been used");
        if (changeNote != null) {
            findElement(By.name("changeNote")).clear();
            findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        }
        findElement(By.name("version")).sendKeys(".1");
        textNotPresent("has already been used");
        clickElement(By.id("confirmNewVersion"));
        textPresent("Saved.");
        closeAlert();
        wait.until(ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated(By.id("openSave"))));
        modalGone();
    }

    public void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
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

    protected void scrollTo(Integer y) {
        String jsScroll = "scroll(0," + Integer.toString(y) + ");";
        String jqueryScroll = "$(window).scrollTop(" + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
        ((JavascriptExecutor) driver).executeScript(jqueryScroll, "");
    }

    private void scrollToEltByCss(String css) {
        String scrollScript = "scrollTo(0, $(\"" + css + "\").offset().top-200)";
        ((JavascriptExecutor) driver).executeScript(scrollScript, "");
    }

    protected void scrollToViewById(String id) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        WebElement element = driver.findElement(By.id(id));
        je.executeScript("arguments[0].scrollIntoView(true);", element);
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
        List<String> tabs2 = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs2.get(i));
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
        clickElement(By.cssSelector("[id='" + classificationId + "'] [title=\"Remove\"]"));
        clickElement(By.cssSelector("[id='okRemoveClassificationModal']"));
        modalGone();
        closeAlert();
    }

    protected void deleteMgtClassification(String classificationId,
                                           String classificationName) {
        clickElement(By.cssSelector("[id='" + classificationId + "'] [title=\"Remove\"]"));
        findElement(By.id("removeClassificationUserTyped")).sendKeys(classificationName);
        clickElement(By.cssSelector("[id='okRemoveClassificationModal']"));
        modalGone();
        closeAlert();
    }

    protected void gotoInbox() {
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Inbox"));
        hangon(0.5);
    }

    protected void selectHistoryAndCompare(Integer leftIndex, Integer rightIndex) {
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + leftIndex + "]"));
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + rightIndex + "]"));
        clickElement(By.id("historyCompareBtn"));
        textPresent("Differences");
    }

    protected void checkInHistory(String field, String oldValue, String newValue) {
        textPresent(field, By.cssSelector("#modificationsList"));
        textPresent(oldValue, By.cssSelector("#modificationsList"));
        textPresent(newValue, By.cssSelector("#modificationsList"));
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
                        By.cssSelector("uib-accordion"), cdeName));
                break;
            } catch (Exception e) {
                clickElement(By.linkText("Next"));
            }

        }
        clickElement(By.xpath("//uib-accordion//span[contains(text(),'" + cdeName + "')]"));
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

    protected void enableBetaFeature() {
        clickElement(By.id("searchSettings"));
        classNotPresent("btn-success", By.id("betaEnabled"));
        classPresent("btn-danger", By.id("betaDisabled"));
        clickElement(By.id("betaEnabled"));
        classPresent("btn-success", By.id("betaEnabled"));
        classNotPresent("btn-danger", By.id("betaDisabled"));
        driver.navigate().back();
    }

    protected void reorderIconTest(String tabName) {
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.xpath(prefix + "moveDown-0" + postfix));
        assertNoElt(By.xpath(prefix + "moveUp-0" + postfix));
        assertNoElt(By.xpath(prefix + "moveTop-0" + postfix));

        findElement(By.xpath(prefix + "moveDown-1" + postfix));
        findElement(By.xpath(prefix + "moveUp-1" + postfix));
        findElement(By.xpath(prefix + "moveTop-1" + postfix));

        assertNoElt(By.xpath(prefix + "moveDown-2" + postfix));
        findElement(By.xpath(prefix + "moveUp-2" + postfix));
        findElement(By.xpath(prefix + "moveTop-2" + postfix));
    }

    protected void showAllTabs() {
        textPresent("More...");
        clickElement(By.id("more_tab"));
        textNotPresent("More...");
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
}
