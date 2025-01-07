package gov.nih.nlm.system;

import com.paulhammant.ngwebdriver.NgWebDriver;
import io.restassured.http.Cookie;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
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
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.attribute.PosixFilePermission;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import static java.awt.image.BufferedImage.TYPE_INT_RGB;

@Listeners({ScreenShotListener.class})
public class NlmCdeBaseTest implements USERNAME, MAP_HELPER {

    public static WebDriver driver;
    public static WebDriverWait wait;
    public static WebDriverWait shortWait;
    public static boolean hubLogged = false;

    private static final int defaultTimeout = Integer.parseInt(System.getProperty("timeout"));
    protected static String tempFolder = System.getProperty("tempFolder");

    protected static String browser = System.getProperty("browser");
    public static String baseUrl = System.getProperty("testUrl");

    private HashSet<PosixFilePermission> filePerms;

    private String className = this.getClass().getSimpleName();
    private ScheduledExecutorService videoExec;

    private String hubUrl;
    protected final ObjectMapper mapper = new ObjectMapper();
    protected final TypeReference<HashMap<String, Object>> typeRef = new TypeReference<HashMap<String, Object>>() {
    };

    private int videoRate = 300;

    private NgWebDriver ngdriver;

    private void setDriver(String b, String u) {
        if (b == null) b = browser;

        hangon(new Random().nextInt(10));
        String windows_detected_message = "MS Windows Detected";
        if (isWindows()) {
            System.out.println(windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
            System.setProperty("webdriver.ie.driver", "./IEDriverServer.exe");
        } else {
            System.out.println("None " + windows_detected_message);
            System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        }
        MutableCapabilities caps;
        System.out.println("Starting " + b.trim());
        if ("firefox".equals(b)) {
            caps = new FirefoxOptions();
        } else if ("chrome".equals(b)) {
            ChromeOptions chromeOptions = new ChromeOptions();
            if (u != null) {
                chromeOptions.addArguments("--user-agent=googleBot");
//                chromeOptions.addArguments("ignore-certificate-errors");
                chromeOptions.addArguments("(--test-type");
            }
            Map<String, Object> prefs = new HashMap<>();
            prefs.put("profile.default_content_settings.geolocation", 2);
            chromeOptions.setExperimentalOption("prefs", prefs);
            chromeOptions.addArguments("disable-shared-workers");
            chromeOptions.addArguments("start-maximized");
            chromeOptions.addArguments("unsafely-treat-insecure-origin-as-secure");
            caps = chromeOptions;
        } else if ("ie".equals(b)) {
            caps = new EdgeOptions();
        } else {
            caps = new ChromeOptions();
        }

        LoggingPreferences loggingPreferences = new LoggingPreferences();
        loggingPreferences.enable(LogType.BROWSER, Level.ALL);
        caps.setCapability(CapabilityType.LOGGING_PREFS, loggingPreferences);

        baseUrl = System.getProperty("testUrl");
        this.hubUrl = System.getProperty("hubUrl");

        URL _hubUrl = null;
        try {
            _hubUrl = new URL(this.hubUrl);
        } catch (MalformedURLException ex) {
            Logger.getLogger(NlmCdeBaseTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        try {
            driver = new RemoteWebDriver(_hubUrl, caps);
        } catch (Exception e) {
            hangon(10);
            driver = new RemoteWebDriver(_hubUrl, caps);
        }

        System.out.println("baseUrl: " + baseUrl);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(defaultTimeout));

        wait = new WebDriverWait(driver, Duration.ofSeconds(defaultTimeout));
        shortWait = new WebDriverWait(driver, Duration.ofSeconds(5));

        JavascriptExecutor js = (JavascriptExecutor) driver;
        driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(9));
        this.logGridVersions((RemoteWebDriver) driver);
        ngdriver = new NgWebDriver(js);
    }

    @BeforeMethod
    public void setUp(Method m) {
        filePerms = new HashSet();
        String browserName = null, userAgent = null;
        if (m.getAnnotation(SelectBrowser.class) != null)
            browserName = "internet explorer";
        if (m.getAnnotation(SelectUserAgent.class) != null)
            userAgent = "bot";
        setDriver(browserName, userAgent);

        filePerms.add(PosixFilePermission.OWNER_READ);
        filePerms.add(PosixFilePermission.OWNER_WRITE);
        filePerms.add(PosixFilePermission.OTHERS_READ);
        filePerms.add(PosixFilePermission.OTHERS_WRITE);
        takeScreenshotsRecordVideo(m);

        this.logGridNodeName(((RemoteWebDriver) driver), m.getName());
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
    public void tearDown(Method m) {
        String methodName = m.getName();
        System.out.println("TEST Complete: " + className + "." + methodName);

        // coverage
        String data = (String) (((JavascriptExecutor) driver).executeScript("return JSON.stringify(window.__coverage__);"));
        if (data != null) {
            try {
                FileUtils.writeStringToFile(new File("build/.nyc_output/" + methodName + ".json"), data, "UTF-8");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // generate gif
        if (m.getAnnotation(RecordVideo.class) != null) {
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
            System.out.println(e);
        }

    }

    protected void logGridVersions(RemoteWebDriver rd) {
        if (NlmCdeBaseTest.hubLogged) {
            return;
        }
        NlmCdeBaseTest.hubLogged = true;

        try {
            String sessionId = rd.getSessionId().toString();
            String nodeName = null;
            // For Selenium 4 Grid
            String requestData = "{\"query\":\"{ grid {uri version} nodesInfo { nodes { uri version osInfo { name } } } }\"}";
            URL url = new URL(new URL(this.hubUrl), "/graphql");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.getOutputStream().write(requestData.getBytes());
            InputStream is = null;
            try {
                is = conn.getInputStream();
            } catch (FileNotFoundException e) {
                System.out.println("The /graphql endpoint is not available, probably Selenium 3 Grid is used");
            }
            if (is != null) {
                System.out.println(IOUtils.toString(is, StandardCharsets.UTF_8));
            } else { // For Selenium 3 Grid
                url = new URL(new URL(this.hubUrl), "/status");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                System.out.println(IOUtils.toString(conn.getInputStream(), StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            System.out.println("Error determining the Grid hub version");
            System.out.println(e);
        }
    }

    protected void logGridNodeName(RemoteWebDriver rd, String testName) {
        try {
            String sessionId = rd.getSessionId().toString();
            String nodeName = null;
            // For Selenium 4 Grid
            String requestData = "{\"query\":\"{ session (id: \\\"" + sessionId + "\\\") { uri } } \"}";
            URL url = new URL(new URL(this.hubUrl), "/graphql");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.getOutputStream().write(requestData.getBytes());
            InputStream is = null;
            try {
                is = conn.getInputStream();
            } catch (FileNotFoundException e) {
                System.out.println("The /graphql endpoint is not available, probably Selenium 3 Grid is used");
            }
            if (is != null) {
                Map<String, Object> response = mapper.readValue(is, typeRef);
                Map<?, ?> responseData = (Map<?, ?>) response.get("data");
                Map<?, ?> responseSession = (Map<?, ?>) responseData.get("session");
                nodeName = (String) responseSession.get("uri");
            } else { // For Selenium 3 Grid
                url = new URL(new URL(this.hubUrl), "/grid/api/testsession?session=" + sessionId);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                Map<String, Object> response = mapper.readValue(conn.getInputStream(), typeRef);
                nodeName = (String) response.get("proxyId");
            }
            System.out.println("Test " + testName + " (session " + sessionId + ") uses Grid node " + nodeName);
        } catch (Exception e) {
            System.out.println("Error determining the Grid node name");
            System.out.println(e);
        }
    }

    protected String cssInputCheckboxChecked = "[type='checkbox']:checked";
    protected String cssInputCheckboxNotChecked = "[type='checkbox']:not(:checked)";
    protected String cssInputRadioChecked = "[type='radio']:checked";

    protected void doLogin(String username, String password) {
        loginAs(username, password);
    }

    protected void mustBeLoggedInAs(String username, String password) {
        doLogin(username, password);
    }

    protected void addOrg(String orgName, String orgLongName, String orgWGOf) {
        goToOrganizations();
        findElement(By.name("newOrgName")).sendKeys(orgName);

        if (orgLongName != null) {
            findElement(By.name("newOrgLongName")).sendKeys(orgLongName);
        }

        if (orgWGOf != null) {
            new Select(findElement(By.id("newOrgWorkingGroup"))).selectByVisibleText("ACRIN");
        }

        clickElement(By.id("addOrg"));
        checkAlert("Saved");
        textPresent(orgName);

        if (orgLongName != null) {
            textPresent(orgLongName);
        }
    }

    protected void deleteWithConfirm(String xpath) {
        clickElement(By.xpath(xpath + "//mat-icon" + xpathText("delete_outline")));
        clickElement(By.xpath(xpath + "//mat-icon" + xpathText("check")));
    }

    protected void dtPropertyValueContains(String dtXpath, String title, String value) {
        findElement(By.xpath(dtXpath + xpathContains(title) + xpathDtValue + xpathContains(value)));
    }

    protected void generalDetailsPropertyValueContains(String title, String value) {
        dtPropertyValueContains(xpathGeneralDetailsProperty(), title, value);
    }

    protected void goToUserMenu() {
        scrollToTop();
        hoverOverElement(findElement(By.id("username_link")));
    }

    protected void gotoClassificationMgt() {
        goToUserMenu();
        clickElement(By.xpath("//button[@role='menuitem'][span[normalize-space()='Classifications']]"));
        textPresent("Classifications");
    }

    protected void goToSettings() {
        goToUserMenu();
        clickElement(By.id("user_settings"));

        hangon(.5);
        if (driver.findElements(By.xpath("//button[normalize-space()='Guides']")).size() > 0) {
            clickElement(By.id("helpLink"));
        }
        textNotPresent("Guides");
    }

    protected void goToStewardTransfer() {
        goToSettings();
        clickElement(By.id("stewardTransfer"));
    }

    protected void goToOrganizations() {
        goToSettings();
        clickElement(By.id("manageOrganizations"));
    }

    protected void goToAdmins() {
        goToSettings();
        clickElement(By.id("admins"));
        textPresent("Admins for this Organization:", By.id("settingsContent"));
    }

    protected void goToProfile() {
        goToSettings();
        clickElement(By.id("profile"));
        textPresent("Profile", By.id("settingsContent"));
    }

    protected void goToCdeByName(String name) {
        goToElementByName(name, "cde");
    }

    protected void goToFormByName(String name) {
        goToElementByName(name, "form");
    }

    protected void goToPreview() {
        driver.navigate().to(driver.getCurrentUrl());
        clickElement(By.xpath("//li//a[text()='Preview']"));
    }

    protected void goToGeneralDetail() {
        clickElement(By.xpath("//li//a[text()='General Details']"));
    }

    protected void goToCdeSummary() {
        clickElement(By.xpath("//li//a[text()='CDE Summary']"));
    }

    protected void goToFormDescription() {
        clickElement(By.id("openFormEditBtn"));
    }

    protected void saveFormEdit() {
        clickElement(By.xpath("//button[contains(.,'Back to Preview')]"));
    }

    protected void goToNaming() {
        clickElement(By.xpath("//li//a[text()='Other Names & Definitions']"));
    }

    protected void goToClassification() {
        clickElement(By.xpath("//li//a[text()='Classification']"));
    }

    protected void goToConcepts() {
        clickElement(By.xpath("//li//a[text()='Concepts']"));
    }


    protected void goToIdentifiers() {
        clickElement(By.xpath("//li//a[text()='Identifiers']"));
    }

    protected void goToAttachments() {
        By by = By.xpath("//li//a[text()='Attachments']");
        if (findElementsSize(by) > 0) {
            clickElement(by);
        }
    }

    protected void goToRelatedContent() {
        By by = By.xpath("//li//a[text()='Related Content']");
        if (findElementsSize(by) > 0) {
            clickElement(by);
        }
    }

    protected void goToMoreLikeThis() {
        clickElement(By.xpath("//*[@id='mat-tab-label-0-1']"));
    }

    protected void goToDatasets() {
        clickElement(By.xpath("//*[@id='mat-tab-label-0-2']"));
    }

    protected void goToHistory() {
        clickElement(By.xpath("//li/a[text()='History']"));
        findElement(By.xpath("//li[a[text()='History']][contains(@class,'active')]"));
    }

    private void goToElementByName(String name, String type) {
        String tinyId = EltIdMaps.eltMap.get(name);
        if (tinyId != null) {
            driver.get(baseUrl + "/" + ("cde".equals(type) ? "deView" : "formView") + "/?tinyId=" + tinyId);
            isView();
            textPresent(name);
        } else {
            try {
                searchElt(name, type);
                hangon(1);
                clickElement(By.id("linkToElt_0"));
                isView();
                textPresent(name);
                textNotPresent("is archived");
            } catch (Exception e) {
                System.out.println("Element is archived. Will retry...");
                hangon(1);
                searchElt(name, type);
                clickElement(By.id("linkToElt_0"));
                isView();
                textPresent(name);
                textNotPresent("is archived");
            }
        }
    }

    protected void isView() {
        findElement(By.id("addToBoard"));
    }

    public void moveMouseToCoordinate(Integer x, Integer y) {
        PointerInput mouse = new PointerInput(PointerInput.Kind.MOUSE, "default mouse");
        Sequence actions = new Sequence(mouse, 0)
                .addAction(mouse.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));
        ((RemoteWebDriver) driver).perform(Collections.singletonList(actions));
    }

    protected void assertNoElt(By by) {
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(0));
        Assert.assertEquals(driver.findElements(by).size(), 0);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(defaultTimeout));
    }

    protected void searchElt(String name, String type) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");

        // Wait for ng-model of ftsearch to update. Otherwise angular sometime sends incomplete search:  ' "Fluoresc ' instead of ' "Fluorescent sample CDE" '
        hangon(0.5);
        clickElement(By.id("search.submit"));
        try {
            textPresent("1 results. Sorted by relevance.");
        } catch (Exception e) {
            System.out.println("Failing to find, trying tinyId: " + name);
            findElement(By.id("ftsearch-input")).clear();
            findElement(By.id("ftsearch-input")).sendKeys("\"" + EltIdMaps.eltMap.get(name) + "\"");
            clickElement(By.id("search.submit"));
            textPresent("1 results. Sorted by relevance.");
        }

        // counteract save summary/table view
        try {
            textPresent(name, By.id("searchResult_0"));
        } catch (Exception e) {
            if (driver.findElements(By.id("list_summaryView")).size() > 0)
                clickElement(By.id("list_summaryView"));
            textPresent(name, By.id("searchResult_0"));
        }
    }

    protected void checkTooltipText(By by, String text) {
        try {
            hoverOverElement(findElement(by));
            textPresent(text);
        } catch (TimeoutException e) {
            hoverOverElement(findElement(By.id("searchSettings")));
            hoverOverElement(findElement(by));
            textPresent(text);
        }
    }

    protected WebElement findElement(By by) {
        if (ngdriver != null) ngdriver.waitForAngularRequestsToFinish();
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

    protected int findElementsSize(By by) {
        return driver.findElements(by).size();
    }

    protected List<WebElement> findElements(By by) {
        wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(by));
        return driver.findElements(by);
    }

    protected void clickElement(By by) {
        clickElement(by, "");
    }

    protected void clickElement(By by, String errorText) {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(by));
            scrollToView(by);
            wait.until(ExpectedConditions.elementToBeClickable(by));
            findElement(by).click();
        } catch (StaleElementReferenceException e) {
            closeAlert();
            findElement(by).click();
        } catch (ElementClickInterceptedException e) {
            hangon(.5);
            if (!e.getMessage().contains("Other element would receive the click")) {
                scrollDownBy(500);
            } else if (driver.findElements(By.xpath("//button[normalize-space()='Log Out']")).size() > 0
                    || driver.findElements(By.xpath("//button[normalize-space()='Guides']")).size() > 0
                    || driver.findElements(By.xpath("//button[normalize-space()='Form']")).size() > 0) {
                // clear navigation hover menu
                moveMouseToCoordinate(0, 0);
            }
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

    /*
     * TODO - Find a better way than to wait. I can't find out how to wait for
     * modal to be gone reliably.
     */
    public void modalGone() {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-dialog-container")));
    }

    public void closeAlert() {
        try {
            driver.findElement(By.xpath("//button[. = 'Dismiss']")).click();
        } catch (Exception e) {
            System.out.println("Could not close alert - " + e.getMessage());
        }
    }

    public void closeAlert(String containing) {
        try {
            driver.findElement(By.xpath("//simple-snack-bar[contains(.,'" + containing + "')]//button[. = 'Dismiss']")).click();
        } catch (Exception e) {
            System.out.println("Could not close alert - " + e.getMessage());
        }
    }

    protected void newCdeVersion(String changeNote) {
        newVersion(changeNote);
        checkAlert("Data Element saved.");
    }

    protected void newCdeVersion() {
        newCdeVersion(null);
    }

    protected void newFormVersion(String changeNote) {
        newVersion(changeNote);
        modalGone();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
    }

    protected void newFormVersion() {
        newFormVersion(null);
    }

    protected void newVersion(String changeNote) {
        if (changeNote == null || changeNote.equals("")) changeNote = "Change note for change number 1";
        clickElement(By.id("openSave"));

        int i = 5;
        while (i >= 0) {
            if (i == 0) Assert.fail("Unexpected y value");
            if (driver.findElement(By.id("newVersion")) == null) {
                hangon(1);
                i--;
            } else i = -1;
        }

        if (findElement(By.id("newVersion")).getText().length() > 0) textPresent("has already been used");
        findElement(By.id("changeNote")).clear();
        findElement(By.id("changeNote")).sendKeys(changeNote);
        findElement(By.name("newVersion")).sendKeys(".1");
        textNotPresent("has already been used");
        hangon(5);
        clickElement(By.id("confirmSaveBtn"));
    }

    /**
     * @param i second(s) to wait
     */
    public void hangon(double i) {
        try {
            Thread.sleep((long) (i * 1000));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    protected void checkAlert(String text) {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[contains(@class,'mat-mdc-snack-bar-container')]")));
        closeAlert(text);
    }

    public void textPresent(String text, By by) {
        ScheduledExecutorService bringToFrontExec = Executors.newSingleThreadScheduledExecutor();
        bringToFrontExec.scheduleAtFixedRate(() -> {
            ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        }, 3, 3, TimeUnit.SECONDS);
        try {
            wait.until(ExpectedConditions.textToBePresentInElementLocated(by, text));
        } finally {
            bringToFrontExec.shutdown();
        }
    }

    public void textPresent(String text) {
        textPresent(text, By.cssSelector("BODY"));
    }

    public boolean textNotPresent(String text) {
        return textNotPresent(text, By.cssSelector("BODY"));
    }

    public boolean textNotPresent(String text, By by) {
        if (driver.findElements(by).size() == 0) return true;
        wait.until(ExpectedConditions.not(ExpectedConditions.textToBePresentInElementLocated(by, text)));
        return true;
    }

    protected void goHome() {
        driver.get(baseUrl);
        textPresent("Supports the NIH Data Management and Sharing Policy");
    }

    protected void goToCdeSearch() {
        goToSearch("cde");
    }

    protected void goToFormSearch() {
        goToSearch("form");
    }

    protected void goToSearch(String type) {
        driver.get(baseUrl + "/" + type + "/search");
        isSearchWelcome();
        textPresent("PROMIS / Neuro-QOL");
    }

    protected void isSearchWelcome() {
        findElement(By.id("ftsearch-input"));
        textPresent("Enter a phrase/text or explore");
        textPresent("REFINE");
        textPresent("RESULTS");
    }

    protected void isLoggedOut() {
        findElement(By.id("login_link"));
    }

    protected void isLoginPage() {
        textPresent("We are migrating UMLS Terminology Service (UTS) accounts to a service that will allow you to sign in to UTS using your NIH credentials, Google, Microsoft, Facebook, or another identity provider of your choice.");
    }

    protected void login(String username, String password) {
        openLogin();
        clickElement(By.xpath("//button[text()='Sign In']"));
        String sourceTab = switchTabToLast();
        textPresent("Username:");
        findElement(By.name("username")).sendKeys(username);
        findElement(By.name("password")).sendKeys(password);
        clickElement(By.cssSelector("input[type='submit']"));
        switchTabHandle(sourceTab);
        textPresent(username.toUpperCase(), By.id("username_link"));
    }

    protected void loginAs(String username, String password) {
        if (driver.getCurrentUrl().equals("data:,")) { // starting page, blank
            driver.get(baseUrl + "/login");
        } else if (driver.findElements(By.id("login_link")).size() > 0) {
            openLogin();
        } else {
            logout();
        }
        clickElement(By.xpath("//button[text()='Sign In']"));
        String sourceTab = switchTabToLast();
        textPresent("Username:");
        findElement(By.name("username")).sendKeys(username);
        findElement(By.name("password")).sendKeys(password);
        clickElement(By.cssSelector("input[type='submit']"));

        switchTabHandle(sourceTab);
        findElement(By.id("username_link"));
        String usernameStr = username.length() > 17 ? username.substring(0, 17) + "..." : username;
        textPresent(usernameStr.toUpperCase(), By.id("username_link"));
    }

    protected void logout() {
        goToUserMenu();
        clickElement(By.xpath("//button[@role='menuitem'][span[normalize-space()='Log Out']]"));
        isLoggedOut();
        isLoginPage();
    }

    protected void openLogin() {
        clickElement(By.id("login_link"));
        isLoginPage();
    }

    private boolean isWindows() {
        String OS = System.getProperty("os.name").toLowerCase();
        return OS.contains("win");
    }

    public void scrollToTop() {
        scrollTo(0);
    }

    protected void scrollTo(Integer y) {
        String jsScroll = "scroll(0," + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
    }

    protected void scrollDownBy(Integer y) {
        String jsScroll = "scrollBy(0," + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
    }

    protected void scrollToView(By by) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        je.executeScript("arguments[0].scrollIntoView();", findElement(by));
        scrollDownBy(-50); // clear form edit toolbar
    }

    protected void scrollToViewById(String id) {
        scrollToView(By.xpath("//*[@id='" + id + "']"));
        findElement(By.id(id));
    }

    protected void hoverOverElement(WebElement ele) {
        Actions action = new Actions(driver);
        action.moveToElement(ele);
        action.perform();
    }

    /**
     * This method is used to close current tab and switch to desired tab.
     *
     * @param switchTo switch to tab index, starting from 0;
     */
    protected void switchTabAndClose(int switchTo) {
        hangon(1);
        ArrayList<String> tabs2 = new ArrayList<String>(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs2.get(switchTo));
        hangon(3);
    }

    protected void switchTab(int i) {
        hangon(1);
        List<String> tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }

    protected void switchTabHandle(String handle) {
        hangon(1);
        driver.switchTo().window(handle);
    }

    protected String switchTabToLast() {
        String currentTab = driver.getWindowHandle();
        Set<String> tabs = driver.getWindowHandles();
        Assert.assertTrue(tabs.size() > 0);
        String lastElement = null;
        for (String tab : tabs) {
            lastElement = tab;
        }
        driver.switchTo().window(lastElement);
        return currentTab;
    }

    protected void showSearchFilters() {
        WebElement showHideFilterButton = findElement(By.id("showHideFilters"));

        if ("Show Filters".equals(showHideFilterButton.getText())) {
            wait.until(ExpectedConditions.elementToBeClickable(By
                    .id("gridView")));
            clickElement(By.id("showHideFilters"));
        }
    }

    protected void inlineEdit(String path, String string) {
        clickElement(By.xpath(path + "//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath(path + "//input")).clear();
        findElement(By.xpath(path + "//input")).sendKeys(string);
        clickElement(By.xpath(path + "//button[contains(text(),'Confirm')]"));
        textPresent(string, By.xpath(path));
    }

    /*
       @param leftIndex an index starts from 1
       @param rightIndex an index starts from 1
     */
    protected void selectHistoryAndCompare(Integer leftIndex, Integer rightIndex) {
        Assert.assertTrue(!findElement(By.id("historyCompareBtn")).isEnabled());
        By compareButtonBy = By.id("historyCompareBtn");
        String xpathTr = "//*[@id='historyTable']/tbody/tr[td]";
        clickElement(By.xpath(xpathTr + "[" + leftIndex + "]//td//mat-checkbox"));
        clickElement(By.xpath(xpathTr + "[" + rightIndex + "]//td//mat-checkbox"));
        findElement(By.xpath(xpathTr + "[" + leftIndex + "]//td//mat-checkbox" + xpathMatCheckboxChecked));
        findElement(By.xpath(xpathTr + "[" + rightIndex + "]//td//mat-checkbox"+ xpathMatCheckboxChecked));
        Assert.assertTrue(findElement(By.id("historyCompareBtn")).isEnabled());
        clickElement(compareButtonBy);
        findElement(By.className("cdk-overlay-pane"));
    }

    protected void editDesignationByIndex(int index, String newDesignation, String[] tags) {
        String designationEditIconXpath = "//*[@itemprop='designation_" + index + "']//mat-icon[normalize-space() = 'edit']";
        String designationInputXpath = "//*[@itemprop='designation_" + index + "']//input";
        String designationConfirmBtnXpath = "//*[@itemprop='designation_" + index + "']//mat-icon[normalize-space() = 'check']";
        if (newDesignation != null) {
            clickElement(By.xpath(designationEditIconXpath));
            hangon(1);
            findElement(By.xpath(designationInputXpath)).sendKeys(newDesignation);
            hangon(2);
            clickElement(By.xpath(designationConfirmBtnXpath));
            textNotPresent("Confirm");
        }
        if (tags != null) {
            String tagsInputXpath = "//*[@itemprop='designationTags_" + index + "']//input";
            for (String tag : tags) {
                clickElement(By.xpath(tagsInputXpath));
                selectMatDropdownByText(tag);
                textPresent(tag);
            }
        }
    }

    protected void editDefinitionByIndex(int index, String newDefinition, boolean html) {
        String definitionEditIconXpath = "//*[@itemprop='definition_" + index + "']//mat-icon[normalize-space() = 'edit']";
        String richTextBtnXpath = "//*[@itemprop='definition_" + index + "']//button[. = 'Rich Text']";
        String definitionTextareaXpath = "//*[@itemprop='definition_" + index + "']//textarea";
        String definitionConfirmBtnXpath = "//*[@itemprop='definition_" + index + "']//mat-icon[normalize-space() = 'check']";
        clickElement(By.xpath(definitionEditIconXpath));
        if (html) {
            clickElement(By.xpath(richTextBtnXpath));
            textPresent("Characters:");
        }
        findElement(By.xpath(definitionTextareaXpath)).sendKeys(newDefinition);
        clickElement(By.xpath(definitionConfirmBtnXpath));
        textNotPresent("Confirm");
    }

    protected void addNewDesignation(String designation, String[] tags) {
        clickElement(By.xpath("//button[contains(.,'Add Name')]"));
        textPresent("Tags are managed in Org Management > List Management");
        findElement(By.name("newDesignation")).sendKeys(designation);
        if (tags != null) {
            String tagsInputXpath = "//*[@id='newDesignationTags']//input";
            for (String tag : tags) {
                clickElement(By.xpath(tagsInputXpath));
                selectMatDropdownByText(tag);
                textPresent(tag);
            }
        }
        clickSaveButton();
        if (tags != null) {
            for (String tag : tags) {
                textPresent(tag);
            }
        }
    }

    protected void addNewDefinition(String definition, boolean isHtml, String[] tags) {
        clickElement(By.xpath("//button[contains(.,'Add Definition')]"));
        hangon(1);
        textPresent("Tags are managed in Org Management > List Management");
        findElement(By.xpath("//*[@id='newDefinition']//textarea")).sendKeys(definition);
        if (isHtml) clickElement(By.xpath("//*[@id='newDefinition']//button[contains(text(),'Rich Text')]"));
        else clickElement(By.xpath("//*[@id='newDefinition']//button[contains(text(),'Plain Text')]"));
        if (tags != null) {
            String tagsInputXpath = "//*[@id='newDefinitionTags']//input";
            for (String tag : tags) {
                clickElement(By.xpath(tagsInputXpath));
                selectMatDropdownByText(tag);
                textPresent(tag);
            }
        }
        clickSaveButton();
        if (tags != null) {
            for (String tag : tags) {
                textPresent(tag);
            }
        }
    }

    protected void addNewConcept(String cName, String cId, String cType) {
        clickElement(By.id("openNewConceptModalBtn"));
        hangon(1);
        findElement(By.id("name")).sendKeys(cName);
        findElement(By.id("codeId")).sendKeys(cId);
        if (cType != null) {
            clickElement(By.id("conceptType"));
            selectMatDropdownByText(cType);
        }
        clickSaveButton();
        modalGone();
    }

    protected void addNewIdentifier(String source, String id, String version) {
        clickElement(By.id("openNewIdentifierModalBtn"));
        hangon(1);
        new Select(findElement(By.id("newSource"))).selectByVisibleText(source);
        findElement(By.id("newId")).sendKeys(id);
        if (version != null)
            findElement(By.name("version")).sendKeys(version);
        clickSaveButton();
        modalGone();
    }

    protected void gotoMyBoards() {
        scrollToTop();
        textPresent("My Boards");
        clickElement(By.id("myBoardsLink"));
        textPresent("Add Board");
        textNotPresent("Sign up for an account");
    }

    /**
     * This method is used to edit registration status for cde or form.
     *
     * @param status             Registration Status.
     * @param effectiveDate      Effective Date.
     * @param untilDate          Until Date.
     * @param administrativeNote Administrative Note.
     * @param unresolvedIssue    Unresolved Issue.
     */
    protected void editRegistrationStatus(String status, String effectiveDate, String untilDate, String administrativeNote, String unresolvedIssue) {
        startEditRegistrationStatus();
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText(status);
        if (status.equals("Preferred Standard"))
            textPresent("Preferred Standard elements cannot be edited by their stewards");
        if (status.equals("Standard"))
            textPresent("Standard elements cannot be edited by their stewards");
        if (status.equals("Qualified"))
            textPresent("Qualified elements should be well defined and are visible to the public by default.");
        if (status.equals("Recorded"))
            textPresent("Recorded elements are not visible by default.");
        if (status.equals("Candidate"))
            textPresent("Candidate elements are not visible by default.");
        if (status.equals("Incomplete"))
            textPresent("Incomplete indicates an element that is not fully defined. Incomplete elements are not visible by default.");
        if (status.equals("Retired"))
            textPresent("Retired elements are not returned in searches");
        if (effectiveDate != null && effectiveDate.length() > 0)
            findElement(By.name("newEffectiveDate")).sendKeys(effectiveDate);
        if (untilDate != null && untilDate.length() > 0)
            findElement(By.name("newUntilDate")).sendKeys(untilDate);
        if (administrativeNote != null && administrativeNote.length() > 0)
            findElement(By.name("newAdministrativeNote")).sendKeys(administrativeNote);
        if (unresolvedIssue != null && unresolvedIssue.length() > 0)
            findElement(By.name("newUnresolvedIssue")).sendKeys(unresolvedIssue);
        clickSaveButton();
        modalGone();
    }

    protected void classifyToggle(String[] classificationArray) {
        String id = String.join(",", classificationArray);
        clickElement(By.xpath("//*[@id='" + id + "']/../../preceding-sibling::tree-node-expander//span"));
    }

    protected void classifySubmit(String[] classificationArray, String alertText) {
        String id = String.join(",", classificationArray);
        clickElement(By.xpath("//*[@id='" + id + "']/button[contains(.,'Classify')]"));
        if (alertText != null) {
            checkAlert(alertText);
        }
    }

    public void startEditQuestionById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionLabel')]"));
    }

    public void saveEditQuestionById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'questionLabel')]"));
    }


    public void startEditSectionById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'sectionLabel')]"));
    }

    public void saveEditSectionById(String id) {
        clickElement(By.xpath("//*[@id='" + id + "']//*[contains(@class,'sectionLabel')]"));
    }

    protected void editStewardOrgAndCancel(String newStewardOrg) {
        clickElement(By.xpath("//*[@itemprop='steward']//mat-icon"));
        new Select(findElement(By.xpath("//*[@itemprop='steward']//select"))).selectByVisibleText(newStewardOrg);
        clickElement(By.xpath("//*[@itemprop='steward']//button[contains(text(),'Discard')]"));
        textNotPresent(newStewardOrg);
    }

    protected void editStewardOrgAndSave(String newStewardOrg) {
        clickElement(By.xpath("//*[@itemprop='steward']//mat-icon"));
        new Select(findElement(By.xpath("//*[@itemprop='steward']//select"))).selectByVisibleText(newStewardOrg);
        clickElement(By.xpath("//*[@itemprop='steward']//button[contains(text(),'Confirm')]"));
        textPresent(newStewardOrg);
    }

    private void clickIFrameElement(By by) {
        int num_try = 0;
        boolean clickable = false;
        while (!clickable) {
            try {
                num_try++;
                findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
                wait.until(ExpectedConditions.presenceOfElementLocated(by));
                findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
                findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
                clickable = true;
            } catch (Exception e) {
                System.out.println("   exception: " + e);
                clickable = num_try == 10;
            }
        }
        hangon(2);
        driver.findElement(by).click();
    }

    private void sendKeyIFrameElement(By by, String key) {
        int num_try = 0;
        boolean clickable = false;
        while (!clickable) {
            try {
                num_try++;
                findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
                wait.until(ExpectedConditions.visibilityOfElementLocated(by));
                findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
                findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
                clickable = true;
            } catch (Exception e) {
                System.out.println("   exception: " + e);
                clickable = num_try == 10;
            }
        }
        hangon(2);
        driver.findElement(by).sendKeys(key);
        hangon(5);
    }


    protected void swaggerApi(String api, String text, String tinyId, String version) {
        driver.get(baseUrl + "/api");
        hangon(1);
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        // it appears selenium has issues scrolling inside iframe, this might give us room
        if (api.indexOf("form") == 0) {
            clickElement(By.cssSelector("a[href='#/CDE']"));
        }
        findElement(By.xpath("//*[@id='" + SWAGGER_API_TYPE.get(api) + "']//a")).click();
        findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
        clickIFrameElement(By.xpath("//button[. = 'Try it out ']"));
        sendKeyIFrameElement(By.xpath("//*[@id='" + SWAGGER_API_TYPE.get(api) + "']//input"), tinyId);
        if (version != null)
            sendKeyIFrameElement(By.xpath("(//*[@id='" + SWAGGER_API_TYPE.get(api) + "']//input)[2]"), version);
        clickIFrameElement(By.xpath("//button[. = 'Execute']"));
        findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
        findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
        textPresent(text, By.xpath("(//*[@id='" + SWAGGER_API_TYPE.get(api) + "']//*[@class='response']//pre)[1]"));
    }

    protected void deleteDraft() {
        clickElement(By.id("deleteDraftBtn"));
        textPresent("Delete Draft?");
        clickElement(By.xpath("//button[text()='Delete']"));
        textNotPresent("Delete Draft?");
    }

    protected void closeTableViewPreferenceModal() {
        clickElement(By.id("closeTableViewSettingsBtn"));
    }

    protected void selectQuestionLabelByIndex(String questionId, int index, Consumer<Integer> extraChecksFunc) {
        clickElement(By.xpath("//*[@id='" + questionId + "']//mat-icon[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("Select a question label from a CDE Name");
        if (extraChecksFunc != null) {
            extraChecksFunc.accept(index);
        }
        clickElement(By.xpath("//button[@id='q_select_name_" + index + "']"));
    }

    protected void searchUsername(String searchUsername) {
        searchUsername(searchUsername, searchUsername);
    }

    protected void searchUsername(String searchUsername, String foundUsername) {
        clickElement(By.name("searchUsersInput"));
        findElement(By.name("searchUsersInput")).clear();
        findElement(By.name("searchUsersInput")).sendKeys(searchUsername);
        findElements(By.xpath(xpathMatAutocomplete + xpathMatDropdownByText(foundUsername.toLowerCase())));
        clickElement(By.xpath(xpathMatAutocomplete + xpathMatDropdownByText(foundUsername.toLowerCase())));
    }

    protected void startEditRegistrationStatus() {
        clickElement(By.xpath(xpathRegistrationStatusEditable()));
    }

    protected String xpathRegistrationStatusEditable() {
        return "//h3[contains(.,'Status')][button]";
    }

    protected Cookie getCurrentCookie() {
        String connectSid = "";
        Set<org.openqa.selenium.Cookie> cookies = driver.manage().getCookies();
        for (org.openqa.selenium.Cookie cookie : cookies) {
            String cookieName = cookie.getName();
            String cookieValue = cookie.getValue();
            System.out.println("cookieName: " + cookieName);
            if (cookieName.equals("connect.sid")) {
                connectSid = cookieValue;
                System.out.println("connect.sid: " + connectSid.toString());
            }
        }
        return new Cookie.Builder("connect.sid", connectSid).build();
    }

    protected void nativeSelect(By bySelect, String optionText) {
        new Select(findElement(bySelect)).selectByVisibleText(optionText);
        textPresent(optionText, bySelect);
    }

    protected void selectMatSelectByLabel(String xpathParent, String selectLabel, String optionText) {
        String xpathSelect = xpathParent + (selectLabel.length() > 0
                ? "//mat-select[ancestor::mat-form-field//mat-label[text()='" + selectLabel + "']]"
                : "//mat-select[ancestor::mat-form-field[not(//mat-label)]]"
        );
        clickElement(By.xpath(xpathSelect));
        selectMatDropdownByText(optionText);
        findElement(By.xpath(xpathSelect + "//*[contains(@id,'mat-select-value-')][contains(., '" + optionText + "')]"));
    }

    protected void selectMatSelectByPlaceholder(String xpathParent, String selectPlaceholder, String optionText) {
        String xpathSelect = xpathParent + "//mat-select[@placeholder='" + selectPlaceholder + "']";
        clickElement(By.xpath(xpathSelect));
        selectMatDropdownByText(optionText);
        findElement(By.xpath(xpathSelect + "//*[contains(@id,'mat-select-value-')][contains(., '" + optionText + "')]"));
    }

    protected void selectMatDropdownByText(String text) {
        clickElement(By.xpath(xpathMatDropdownByText(text)));
    }

    protected String xpathContains(String value) {
        return "[contains(.,'" + value + "')]";
    }

    protected String xpathDtValue = "/following-sibling::dd[1]";

    protected String xpathGeneralDetailsProperty() {
        return "//h2[@id='general-details']/following-sibling::dl/dt";
    }

    protected String xpathMatAutocomplete = "//*[contains(@id,'mat-autocomplete-')]";

    protected String xpathMatCheckboxChecked = "[contains(@class,'mat-mdc-checkbox-checked')]";

    protected String xpathMatDropdownByText(String text) {
        return "//mat-option[normalize-space() = '" + text + "']";
    }

    protected String xpathMatDropdownByTextPartial(String text) {
        return "//mat-option[contains(.,'" + text + "')]";
    }

    protected String xpathText(String text) {
        return "[normalize-space() = '" + text + "']";
    }

    protected void clickSaveButton() {
        clickElement(By.xpath("//button[normalize-space(text())='Save']"));
    }

    protected void clickCancelButton() {
        clickElement(By.xpath("//button[normalize-space(text())='Cancel']"));
    }
}
