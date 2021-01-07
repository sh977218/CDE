package gov.nih.nlm.system;

import com.paulhammant.ngwebdriver.NgWebDriver;
import io.restassured.http.Cookie;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.interactions.Actions;
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
public class NlmCdeBaseTest implements USERNAME, MAP_HELPER {

    public static WebDriver driver;
    public static WebDriverWait wait;
    public static WebDriverWait shortWait;

    private static int defaultTimeout = Integer.parseInt(System.getProperty("timeout"));
    protected static String downloadFolder = System.getProperty("seleniumDownloadFolder");
    private static String chromeDownloadFolder = System.getProperty("chromeDownloadFolder");
    protected static String tempFolder = System.getProperty("tempFolder");

    protected static String browser = System.getProperty("browser");
    public static String baseUrl = System.getProperty("testUrl");

    private HashSet<PosixFilePermission> filePerms;

    private String className = this.getClass().getSimpleName();
    private ScheduledExecutorService videoExec;

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
            if (u != null) chromeOptions.addArguments("--user-agent=googleBot");
            Map<String, Object> prefs = new HashMap<>();
            prefs.put("download.default_directory", chromeDownloadFolder);
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
        String hubUrl = System.getProperty("hubUrl");

        URL _hubUrl = null;
        try {
            _hubUrl = new URL(hubUrl);
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
//        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);

        wait = new WebDriverWait(driver, defaultTimeout, 600);
        shortWait = new WebDriverWait(driver, 5);

        System.out.println("downloadFolder: " + downloadFolder);
        System.out.println("chromeDownloadFolder: " + chromeDownloadFolder);

        JavascriptExecutor js = (JavascriptExecutor) driver;
        driver.manage().timeouts().setScriptTimeout(9, TimeUnit.SECONDS);
        driver.manage().window().maximize();
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

    protected void assertSearchFilterSelected(String id, boolean state) {
        if (id.startsWith("classif-") || id.startsWith("topic-")) {
            if (state)
                findElement(By.xpath("//*[@id='" + id + "' and (contains(@class, 'treeParent') or contains(@class, 'treeCurrent'))]"));
            else
                findElement(By.xpath("//*[@id='" + id + "' and contains(@class, 'treeChild')]"));
        } else {
            if (state)
                findElement(By.xpath("//*[@id='" + id + "']/*[. = 'check_box']"));
            else
                Assert.assertTrue(driver.findElements(By.xpath("//*[@id='" + id + "']/*[. = 'treeItemIconSelected']")).size() == 0);
        }
    }

    protected void clearStorage() {
        String clearStorage = "localStorage.clear();";
        ((JavascriptExecutor) driver).executeScript(clearStorage, "");
        if (driver.getWindowHandles().size() > 1)
            System.out.println("There are " + driver.getWindowHandles().size() + " windows before test");
    }

    protected void doLogin(String username, String password) {
        loginAs(username, password);
    }

    protected void mustBeLoggedInAs(String username, String password) {
        doLogin(username, password);
    }

    protected void addIdSource(String source, String deLink, String formLink) {
        findElement(By.xpath("//input[@data-placeholder = 'New Id:']")).sendKeys(source);
        clickElement(By.xpath("//button[contains(., 'Add')]"));
        findElement(By.xpath("//tr[td[contains(., '" + source + "')]]//input[contains(@data-placeholder, 'Data Element Link')]")).sendKeys(deLink);
        clickElement(By.xpath("//tr[td[contains(., '" + source + "')]]//input[contains(@data-placeholder, 'Form Link')]")); // save
        hangon(2); // wait for save refresh
        findElement(By.xpath("//tr[td[contains(., '" + source + "')]]//input[contains(@data-placeholder, 'Form Link')]")).sendKeys(formLink);
        clickElement(By.xpath("//tr[td[contains(., '" + source + "')]]//input[contains(@data-placeholder, 'Version')]")); // save
        hangon(2); // wait for save refresh
        textPresent(source);
        Assert.assertEquals(
                findElement(By.xpath("//tr[td[contains(., '" + source + "')]]//input[contains(@data-placeholder, 'Data Element Link')]")).getAttribute("value"),
                deLink
        );
        Assert.assertEquals(
                findElement(By.xpath("//tr[td[contains(., '" + source + "')]]//input[contains(@data-placeholder, 'Form Link')]")).getAttribute("value"),
                formLink
        );
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
        clickElement(By.xpath(xpath + "//mat-icon[normalize-space() = 'delete_outline']"));
        clickElement(By.xpath(xpath + "//mat-icon[normalize-space() = 'check']"));
    }

    protected void gotoClassificationMgt() {
        clickElement(By.id("username_link"));
        hangon(.5);
        clickElement(By.xpath("//button[normalize-space(text())='Classifications']"));
        textPresent("Classifications");
    }

    protected void goToSettings() {
        clickElement(By.id("username_link"));
        textPresent("Settings");
        clickElement(By.xpath("//button[normalize-space(text())='Settings']"));
    }

    protected void goToHelp() {
        clickElement(By.id("helpLink"));
    }

    protected void goToContactUs() {
        goToHelp();
        clickElement(By.id("contactUsLink"));
    }

    protected void goToVideos() {
        goToHelp();
        clickElement(By.id("videosLink"));
    }

    protected void goToStewardTransfer() {
        goToSettings();
        clickElement(By.id("stewardTransfer"));
    }

    protected void goToTagsManagement() {
        goToSettings();
        clickElement(By.id("tagsManagement"));
    }

    protected void goToPropertyKeysManagement() {
        goToSettings();
        clickElement(By.id("propertiesManagement"));
    }

    protected void goToIdSources() {
        goToSettings();
        clickElement(By.id("idSources"));
    }

    protected void goToOrganizations() {
        goToSettings();
        clickElement(By.id("organizations"));
    }

    protected void goToUsers() {
        goToSettings();
        clickElement(By.id("users"));
        textPresent("Create User", By.id("settingsContent"));
    }

    protected void goToResources() {
        goToSettings();
        clickElement(By.id("resources"));
    }

    protected void goToAPI() {
        goToSettings();
        clickElement(By.id("apiLink"));
    }

    protected void goToCurators() {
        goToSettings();
        clickElement(By.id("curators"));
    }

    protected void goToSiteAdmins() {
        goToSettings();
        clickElement(By.id("siteAdmins"));
    }

    protected void goToMyPublishedForms() {
        goToSettings();
        clickElement(By.id("myPublishedForms"));
        textPresent("My Published Forms", By.id("settingsContent"));
    }

    protected void goToViewHistory() {
        goToSettings();
        clickElement(By.id("viewingHistory"));
        textPresent("Viewing History", By.id("settingsContent"));
    }

    protected void goToAdmins() {
        goToSettings();
        clickElement(By.id("admins"));
        textPresent("Admins for this Organization:", By.id("settingsContent"));
    }

    protected void goToMyDrafts() {
        goToSettings();
        clickElement(By.id("myDrafts"));
    }

    protected void goToMyOrgDrafts() {
        goToSettings();
        clickElement(By.id("myOrgDrafts"));
        textPresent("My Organizations' Drafts", By.id("settingsContent"));
    }

    protected void goToAllDrafts() {
        goToSettings();
        clickElement(By.id("allDrafts"));
        textPresent("All Drafts", By.id("settingsContent"));
    }

    protected void goToMyComments() {
        goToSettings();
        clickElement(By.id("myComments"));
    }

    protected void goToMyOrgComments() {
        goToSettings();
        clickElement(By.id("myOrgComments"));
    }

    protected void goToAllComments() {
        goToSettings();
        clickElement(By.id("allComments"));
    }

    protected void goToValidationRules() {
        goToSettings();
        clickElement(By.id("validationRules"));
        textPresent("Add New Rule", By.id("settingsContent"));
    }

    protected void goToServerStatus() {
        goToSettings();
        clickElement(By.id("serverStatus"));
    }

    protected void goToArticles() {
        goToSettings();
        clickElement(By.id("articles"));
    }

    protected void goToProfile() {
        goToSettings();
        clickElement(By.id("profile"));
        textPresent("Profile", By.id("settingsContent"));
    }

    protected void goToNotification() {
        goToSettings();
        clickElement(By.id("notification"));
        textPresent("Notification", By.id("settingsContent"));
    }

    protected int getNumberOfResults() {
        return Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
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

    protected void goToPermissibleValues() {
        clickElement(By.xpath("//li//a[text()='Permissible Values']"));
    }

    protected void goToFormDescription() {
        clickElement(By.id("openFormEditBtn"));
    }

    protected void saveFormEdit() {
        clickElement(By.id("editFormCloseBtn"));
    }

    protected void goToNaming() {
        clickElement(By.xpath("//li//a[text()='Naming']"));
    }

    protected void goToClassification() {
        clickElement(By.xpath("//li//a[text()='Classification']"));
    }

    protected void goToConcepts() {
        clickElement(By.xpath("//li//a[text()='Concepts']"));
    }

    protected void goToReferenceDocuments() {
        clickElement(By.xpath("//li//a[text()='Reference Documents']"));
    }

    protected void goToProperties() {
        clickElement(By.xpath("//li//a[text()='Properties']"));
    }

    protected void goToIdentifiers() {
        clickElement(By.xpath("//li//a[text()='Identifiers']"));
    }

    protected void goToAttachments() {
        clickElement(By.xpath("//li//a[text()='Attachments']"));
    }

    protected void goToDisplayProfiles() {
        clickElement(By.xpath("//li//a[text()='Display Profiles']"));
    }

    protected void goToHistory() {
        clickElement(By.xpath("//li//a[text()='History']"));
    }

    protected void goToScoreDerivations() {
        clickElement(By.xpath("//li//a[text()='Rules']"));
    }

    protected void goToDiscussArea() {
        clickElement(By.id("discussBtn"));
        findElement(By.xpath("//cde-discuss-area"));
        Assert.assertEquals(driver.findElements(By.xpath("//cde-discuss-area")).size(), 1);
    }

    private void goToElementByName(String name, String type) {
        String tinyId = EltIdMaps.eltMap.get(name);
        if (tinyId != null) {
            driver.get(baseUrl + "/" + ("cde".equals(type) ? "deView" : "formView") + "/?tinyId=" + tinyId);
            findElement(By.id("discussBtn"));
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
            textPresent("1 " + ("cde".equals(type) ? "data element" : "form") + " results for");
        } catch (Exception e) {
            System.out.println("Failing to find, trying tinyId: " + name);
            findElement(By.id("ftsearch-input")).clear();
            findElement(By.id("ftsearch-input")).sendKeys("\"" + EltIdMaps.eltMap.get(name) + "\"");
            clickElement(By.id("search.submit"));
            textPresent("1 " + ("cde".equals(type) ? "data element" : "form") + " results for");
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

    protected void openEltInList(String name, String type) {
        searchElt(name, type);
        textPresent(name, By.id("searchResult_0"));
    }

    protected void openFormInList(String name) {
        goToFormSearch();
        clickElement(By.id("menu_forms_link"));
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"" + name + "\"");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));
        textPresent("1 form results for");
        textPresent(name, By.id("searchResult_0"));
    }

    protected void newTab() {
        ((JavascriptExecutor) driver).executeScript("window.open()");
        hangon(5);
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
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(by));
            scrollToView(by);
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
        hangon(4);
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
            driver.findElement(By.xpath("//span[. = 'Dismiss']")).click();
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
        int i = 0;
        while (i < 7) {
            try {
                shortWait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector(".mat-simple-snackbar"), text));
                closeAlert();
                i = 10;
            } catch (TimeoutException e) {
                driver.switchTo().window(driver.getWindowHandle());
                i++;
            }
        }
        if (i != 10) Assert.fail("Failed to find text: " + text + " in alert");
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
        textPresent("has been designed to provide access", By.id("introduction"));
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

    protected void isLoggedOut() {
        findElement(By.id("login_link"));
    }

    protected void isLoginPage() {
        textPresent("We are migrating UMLS Terminology Service (UTS) accounts to a service that will allow you to sign in to UTS using your NIH credentials, Google, Microsoft, Facebook, or another identity provider of your choice.");
    }

    protected void login(String username, String password) {
        openLogin();
        clickElement(By.id("logInButton"));
        int sourceTabIndex = switchTabToLast();
        textPresent("Username:");
        findElement(By.name("username")).sendKeys(username);
        findElement(By.name("password")).sendKeys(password);
        clickElement(By.cssSelector("input[type='submit']"));
        switchTab(sourceTabIndex);
    }

    protected void loginAs(String username, String password) {
        driver.get(baseUrl + "/login");
        clickElement(By.id("logInButton"));
        int sourceTabIndex = switchTabToLast();
        textPresent("Username:");
        findElement(By.name("username")).sendKeys(username);
        findElement(By.name("password")).sendKeys(password);
        clickElement(By.cssSelector("input[type='submit']"));
        switchTab(sourceTabIndex);

        String usernameStr = username.length() > 17 ? username.substring(0, 17) + "..." : username;
        textPresent(usernameStr.toUpperCase(), By.id("username_link"));
    }

    protected void logout() {
        clickElement(By.id("username_link"));
        clickElement(By.xpath("//button[normalize-space(text())='Log Out']"));
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

    protected void addCdeToQuickBoard(String cdeName) {
        goToCdeByName(cdeName);
        clickElement(By.id("addToQuickBoard"));
        checkAlert("Added to QuickBoard!");

    }

    protected void addFormToQuickBoard(String formName) {
        searchForm(formName);
        clickElement(By.id("addToCompare_0"));
        checkAlert("Added to QuickBoard!");
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
        checkAlert("Added to QuickBoard!");
    }

    public void goToQuickBoard() {
        clickElement(By.id("boardsMenu"));
        clickElement(By.id("menu_qb_link"));
    }

    public void goToQuickBoardByModule(String module) {
        goToQuickBoardByModule(module, false);
    }

    public void goToQuickBoardByModule(String module, Boolean menuOpened) {
        if (!menuOpened) {
            clickElement(By.id("boardsMenu"));
        }
        clickElement(By.id("menu_qb_link"));
        if (module.equals("cde")) {
            clickElement(By.xpath("//div[contains(., 'CDE QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
            textPresent("CDE QuickBoard (");
        }
        if (module.equals("form")) {
            clickElement(By.xpath("//div[contains(., 'Form QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
            textPresent("Form QuickBoard (");
        }
    }

    protected void emptyQuickBoardByModule(String module) {
        clickElement(By.id("boardsMenu"));
        if (findElement(By.id("menu_qb_link")).getText().contains("(0)")) return;
        goToQuickBoardByModule(module, true);
        clickElement(By.id("qb_" + module + "_empty"));
        textPresent(("cde".equals(module) ? "CDE" : "Form") + " QuickBoard (0)");
        goToQuickBoard();
        hangon(1);
    }

    protected void addCdeToCompare(String cdeName1, String cdeName2) {
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (0)");
        addCdeToQuickBoard(cdeName1);
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (1)");
        addCdeToQuickBoard(cdeName2);
        clickElement(By.id("boardsMenu"));
        clickElement(By.id("menu_qb_link"));
        clickElement(By.xpath("//div[contains(., 'CDE QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
        textPresent(cdeName1);
        textPresent(cdeName2);
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));
    }

    protected void addFormToCompare(String formName1, String formName2) {
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (0)");
        addFormToQuickBoard(formName1);
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (1)");
        addFormToQuickBoard(formName2);
        clickElement(By.id("boardsMenu"));
        clickElement(By.id("menu_qb_link"));
        clickElement(By.xpath("//div[contains(., 'Form QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
        textPresent(formName1);
        textPresent(formName2);
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));
    }

    protected void mergeCdeBySide(String side) {
        if (side.equalsIgnoreCase("left")) {
            clickElement(By.xpath("//*[contains(@class,'leftObj')]//*[@id='openMergeDataElementModalBtn']"));
        }
        if (side.equalsIgnoreCase("right")) {
            clickElement(By.xpath("//*[contains(@class,'rightObj')]//*[@id='openMergeDataElementModalBtn']"));
        }
    }

    protected void mergeFormBySide(String side) {
        if (side.equalsIgnoreCase("left")) {
            clickElement(By.xpath("//*[contains(@class,'leftObj')]//*[@id='openMergeFormModalBtn']"));
        }
        if (side.equalsIgnoreCase("right")) {
            clickElement(By.xpath("//*[contains(@class,'rightObj')]//*[@id='openMergeFormModalBtn']"));
        }
    }

    protected void refresh() {
        driver.navigate().refresh();
        hangon(2);
    }

    public void scrollToTop() {
        scrollTo(0);
    }

    protected void checkElementDoesNotExistByLocator(By locator) {
        Assert.assertTrue(!(driver.findElements(locator).size() > 0));
    }

    protected void scrollTo(Integer y) {
        String jsScroll = "scroll(0," + Integer.toString(y) + ");";
        ((JavascriptExecutor) driver).executeScript(jsScroll, "");
    }

    protected void scrollDownBy(Integer y) {
        String jsScroll = "document.getElementById('scrollRoot').scrollBy(0," + Integer.toString(y) + ");";
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

    protected int getCurrentYOffset() {
        String scrollLocation = (((JavascriptExecutor) driver)
                .executeScript("return window.pageYOffset", "")).toString();
        return Double.valueOf(scrollLocation).intValue();
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
        ArrayList<String> tabs2 = new ArrayList(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs2.get(switchTo));
        hangon(3);
    }

    protected void switchTab(int i) {
        hangon(1);
        List<String> tabs = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }

    protected int switchTabToLast() {
        hangon(1);
        String currentTab = driver.getWindowHandle();
        List<String> tabs = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(tabs.size() - 1));
        return tabs.indexOf(currentTab);
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

    protected void deleteOrgClassification(String orgName, String[] categories) {
        String classification = categories[categories.length - 1];
        nonNativeSelect("", "Start by choosing your Organization", orgName);
        clickMoreVertIcon(categories);
        clickElement(By.xpath("//button/mat-icon[normalize-space() = 'delete_outline']"));
        findElement(By.id("removeClassificationUserTyped")).sendKeys(classification);
        clickElement(By.id("confirmDeleteClassificationBtn"));
        checkAlert("Classification Deleted");
        Assert.assertEquals(0, driver.findElements(By.xpath("//*[@id='" + String.join(",", categories) + "']")).size());
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
        clickElement(By.xpath("//*[@id='historyTable']/tr[td][" + leftIndex + "]"));
        clickElement(By.xpath("//*[@id='historyTable']/tr[td][" + rightIndex + "]"));
        clickElement(By.id("historyCompareBtn"));
    }

    private void openAudit(String type, String name) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        clickElement(By.xpath("//div[. = '" + type + " Audit Log']"));
        for (Integer i = 0; i < 10; i++) {
            hangon(1);
            try {
                wait.until(ExpectedConditions.textToBePresentInElementLocated(
                        By.cssSelector("mat-accordion"), name));
                break;
            } catch (Exception e) {
                clickElement(By.cssSelector(".mat-paginator-navigation-next"));
            }

        }
        clickElement(By.xpath("//mat-accordion//mat-panel-title[contains (., '" + name + "')]"));
    }

    protected void openAuditClassification(String name) {
        openAudit("Classification", name);
    }

    protected void openAuditDataElement(String name) {
        openAudit("CDE", name);
    }

    protected void openAuditForm(String name) {
        openAudit("Form", name);
    }

    protected void setVisibleStatus(String id) {
        goToSearch("cde");
        clickElement(By.id("searchSettings"));
        clickElement(By.id(id));
        hangon(1);
        clickElement(By.id("saveSettings"));
        checkAlert("Settings saved");
        goToSearch("cde");
    }

    protected void setLowStatusesVisible() {
        setVisibleStatus("minStatus-Incomplete");
    }

    protected void downloadAsFile() {
        clickElement(By.id("searchSettings"));
        clickElement(By.xpath("//label[contains(.,'File')]"));
        clickElement(By.id("saveSettings"));
    }

    protected void downloadAsTab() {
        clickElement(By.id("searchSettings"));
        clickElement(By.xpath("//label[contains(.,'New Tab')]"));
        clickElement(By.id("saveSettings"));
    }

    protected void includeRetiredSetting() {
        clickElement(By.id("searchSettings"));
        clickElement(By.id("includeRetired"));
        clickElement(By.id("saveSettings"));
    }

    protected void loadDefaultTableViewSettings() {
        clickElement(By.id("list_gridView"));
        openTableViewPreferenceModal();
        clickElement(By.id("loadDefaultTableViewSettingsBtn"));
        checkAlert("Default settings loaded");
        closeTableViewPreferenceModal();
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

    protected void editPropertyValueByIndex(int index, String newValue, boolean html) {
        String valueEditIconXpath = "//*[@itemprop='value_" + index + "']//mat-icon[normalize-space() = 'edit']";
        String richTextBtnXpath = "//*[@itemprop='value_" + index + "']//button[. = 'Rich Text']";
        String valueTextareaXpath = "//*[@itemprop='value_" + index + "']//textarea";
        String valueConfirmBtnXpath = "//*[@itemprop='value_" + index + "']//mat-icon[normalize-space() = 'check']";
        clickElement(By.xpath(valueEditIconXpath));
        if (html) {
            clickElement(By.xpath(richTextBtnXpath));
        }
        if (newValue != null) findElement(By.xpath(valueTextareaXpath)).sendKeys(newValue);

        hangon(2);
        clickElement(By.xpath(valueConfirmBtnXpath));
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
        clickElement(By.id("createNewDesignationBtn"));
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
        if (isHtml) clickElement(By.xpath("//*[@id='newDefinition']/button/span[contains(text(),'Rich Text')]"));
        else clickElement(By.xpath("//*[@id='newDefinition']/button/span[contains(text(),'Plain Text')]"));
        if (tags != null) {
            String tagsInputXpath = "//*[@id='newDefinitionTags']//input";
            for (String tag : tags) {
                clickElement(By.xpath(tagsInputXpath));
                selectMatDropdownByText(tag);
                textPresent(tag);
            }
        }
        clickElement(By.id("createNewDefinitionBtn"));
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
            clickElement(By.xpath("//mat-option[. = '" + cType + "']"));
        }
        clickElement(By.id("createNewConceptBtn"));
        modalGone();
    }

    protected void addNewProperty(String key, String value, boolean isHtml) {
        clickElement(By.id("openNewPropertyModalBtn"));
        textPresent("Property keys are managed in Org Management > List Management");
        new Select(findElement(By.id("newKey"))).selectByVisibleText(key);

        findElement(By.xpath("//*[@id='newValue']//textarea")).sendKeys(value);
        if (isHtml) clickElement(By.xpath("//*[@id='newValue']/button/span[contains(text(),'Rich Text')]"));
        else clickElement(By.xpath("//*[@id='newValue']/button/span[contains(text(),'Plain Text')]"));
        hangon(1);
        clickElement(By.id("createNewPropertyBtn"));
        modalGone();
    }

    /**
     * This method is used to remove property for cde and form.
     *
     * @param index Index of properties, starting from 0.
     */
    protected void removeProperty(int index) {
        clickElement(By.id("removeProperty-" + index));
        clickElement(By.id("confirmRemoveProperty-" + index));
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
    }

    protected void addNewIdentifier(String source, String id) {
        addNewIdentifier(source, id, null);
    }

    protected void addNewIdentifier(String source, String id, String version) {
        clickElement(By.id("openNewIdentifierModalBtn"));
        hangon(1);
        new Select(findElement(By.name("source"))).selectByVisibleText(source);
        findElement(By.name("id")).sendKeys(id);
        if (version != null)
            findElement(By.name("version")).sendKeys(version);
        clickElement(By.id("createNewIdentifierBtn"));
        modalGone();
    }

    protected void changeDatatype(String newDatatype) {
        if (PREDEFINED_DATATYPE.contains(newDatatype)) {
            nonNativeSelect("//*[@itemprop='datatype']", "Select data type", newDatatype);
        } else {
            System.out.println("Invalidate data type: " + newDatatype);
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
        checkElementDoesNotExistByLocator(By.xpath("//*[@id='" + selector + "']"));
    }

    protected void goToBoard(String boardName) {
        String boardId = EltIdMaps.eltMap.get(boardName);
        if (boardId != null) {
            driver.get(baseUrl + "/board/" + boardId);
            textPresent(boardName);
        } else {
            gotoMyBoards();
            textPresent(boardName);
            clickElement(By.xpath("//*[@id='viewBoard_" + boardName + "']"));
            textPresent(boardName, By.xpath("//h3[@id='board_name_" + boardName + "']"));
        }
    }

    protected void gotoMyBoards() {
        clickElement(By.id("boardsMenu"));
        clickElement(By.id("myBoardsLink"));
    }

    /**
     * This method is used to remove identifier for cde and form.
     *
     * @param index Index of identifiers, starting from 0.
     */
    protected void removeIdentifier(int index) {
        goToIdentifiers();
        clickElement(By.id("removeIdentifier-" + index));
        clickElement(By.id("confirmRemoveIdentifier-" + index));
    }

    /**
     * This method is used to remove data element concept for cde.
     *
     * @param index Index of concepts, starting from 0.
     */
    protected void removeDataElementConcept(int index) {
        goToConcepts();
        clickElement(By.id("removedataElementConcept-" + index));
    }

    /**
     * This method is used to remove data element concept for cde.
     *
     * @param index Index of concepts, starting from 0.
     */
    protected void removeObjectClassConcept(int index) {
        goToConcepts();
        clickElement(By.id("removeobjectClass-" + index));
    }

    /**
     * This method is used to remove data element concept for cde.
     *
     * @param index Index of concepts, starting from 0.
     */
    protected void removePropertyConcept(int index) {
        goToConcepts();
        clickElement(By.id("removeproperty-" + index));
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
        clickElement(By.id("editStatus"));
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
        clickElement(By.id("saveRegStatus"));
    }

    protected void checkRecentlyUsedClassifications(String org, String[] classificationArray) {
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        clickElement(By.xpath("//div[. = 'By recently added']"));
        String recentlyClassificationString = org;
        for (int i = 0; i < classificationArray.length; i++)
            recentlyClassificationString = recentlyClassificationString + " / " + classificationArray[i];
        textPresent(recentlyClassificationString, By.id("recentlyClassification_0"));
        clickElement(By.xpath("//button[contains(.,'Close')]"));
    }

    protected void addClassificationByTree(String org, String[] classificationArray) {
        addClassificationByTree(org, classificationArray, "Classification added.");
    }

    protected void _addClassificationByTree(String org, String[] classificationArray) {
        _addClassificationByTree(org, classificationArray, "All CDEs Classified.");

    }

    protected void classifyToggle(String[] names) {
        String xmlStr = "";
        for (int i = 0; i < names.length; i++)
            xmlStr += "//tree-node[contains(.,'" + names[i] + "')]";
        clickElement(By.xpath(xmlStr + "//*[contains(@class,'toggle-children-wrapper')]"));
    }

    protected void classifySubmit(String[] classificationArray, String alertText) {
        String xmlStr = "";
        for (int i = 0; i < classificationArray.length; i++)
            xmlStr += "//tree-node[contains(.,'" + classificationArray[i] + "')]";
        clickElement(By.xpath(xmlStr + "//button[contains(.,'Classify')]"));
        if (alertText != null) {
            checkAlert(alertText);
        }
    }

    protected void addClassificationByTree(String org, String[] classificationArray, String alertText) {
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");

        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(org);
        for (int i = 0; i < classificationArray.length - 1; i++) {
            classifyToggle(Arrays.copyOfRange(classificationArray, 0, i + 1));
        }
        classifySubmit(classificationArray, alertText);
        for (int i = 1; i < classificationArray.length; i++)
            textPresent(classificationArray[i], By.xpath("//*[@id='classificationOrg-" + org + "']"));
    }

    protected void _addClassificationByTree(String org, String[] classificationArray, String alertText) {
        clickElement(By.id("openClassifyCdesModalBtn"));
        textPresent("By recently added");

        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(org);
        for (int i = 0; i < classificationArray.length - 1; i++) {
            classifyToggle(Arrays.copyOfRange(classificationArray, 0, i + 1));
        }
        classifySubmit(classificationArray, alertText);
    }

    protected void addExistingClassification(String org, String[] classificationArray) {
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");

        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(org);
        for (int i = 0; i < classificationArray.length - 1; i++) {
            classifyToggle(Arrays.copyOfRange(classificationArray, 0, i + 1));
        }
        classifySubmit(classificationArray, "Classification Already Exists");
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

    protected String getSideBySideXpath(String side, String section, String type, int index) {
        if (side.equalsIgnoreCase("left")) side = "Left";
        if (side.equalsIgnoreCase("right")) side = "Right";

        if (section.equalsIgnoreCase("steward")) section = "Steward";
        if (section.equalsIgnoreCase("status")) section = "Status";
        if (section.equalsIgnoreCase("designation")) section = "Designation";
        if (section.equalsIgnoreCase("definition")) section = "Definition";
        if (section.equalsIgnoreCase("identifiers")) section = "Identifiers";
        if (section.equalsIgnoreCase("reference documents")) section = "Reference Documents";
        if (section.equalsIgnoreCase("properties")) section = "Properties";
        if (section.equalsIgnoreCase("data element concept")) section = "Data Element Concept";
        if (section.equalsIgnoreCase("questions")) section = "Questions";

        if (type.equalsIgnoreCase("fullmatch")) type = "fullMatch";
        if (type.equalsIgnoreCase("partialmatch")) type = "partialMatch";
        if (type.equalsIgnoreCase("notmatch")) type = "notMatch";
        return "(//*[@id='" + section + "']//*[contains(@class,'no" + side + "Padding')]//*[contains(@class,'" + type + "')])[" + index + "]";
    }

    protected void searchNestedClassifiedCdes() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("classification.elements.elements.name:\"Participant/Subject Characteristics\"");
        findElement(By.id("search.submit")).click();
    }

    protected void searchNestedClassifiedForms() {
        goToFormSearch();
        findElement(By.name("q")).sendKeys("classification.elements.elements.name:\"Participant/Subject Characteristics\"");
        findElement(By.id("search.submit")).click();
    }

    protected void clickMoreVertIcon(String[] categories) {
        clickElement(By.xpath("//*[@id='" + String.join(",", categories) + "']/following-sibling::button[normalize-space()='more_vert']"));
    }

    protected void createOrgClassification(String org, String[] categories) {
        nonNativeSelect("", "Start by choosing your Organization", org);
        // create root classification if it doesn't exist
        List<WebElement> rootClassifications = driver.findElements(By.xpath("//*[@id='" + categories[0] + "']"));
        if (rootClassifications.size() == 0) {
            clickElement(By.id("addClassification"));
            findElement(By.id("addChildClassifInput")).sendKeys(categories[0]);
            hangon(2);
            clickElement(By.id("confirmAddChildClassificationBtn"));
            checkAlert("Classification added");
        }
        for (int i = 1; i < categories.length; i++) {
            String[] nextCategories = Arrays.copyOfRange(categories, 0, i + 1);
            String xpath = "//*[@id='" + String.join(",", nextCategories) + "']";
            List<WebElement> nextCategoryList = driver.findElements(By.xpath(xpath));
            if (nextCategoryList.size() == 0) {
                String[] currentCategories = Arrays.copyOfRange(categories, 0, i);

                clickMoreVertIcon(currentCategories);
                clickElement(By.xpath("//button/mat-icon[normalize-space() = 'subdirectory_arrow_left']"));
                findElement(By.id("addChildClassifInput")).sendKeys(nextCategories[nextCategories.length - 1]);
                hangon(2);
                clickElement(By.id("confirmAddChildClassificationBtn"));
                checkAlert("Classification added");
            }
        }
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
        goHome();
        clickElement(By.id("apiLink"));
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

    protected void selectDisplayProfileByName(String name) {
        clickElement(By.id("select_display_profile"));
        clickElement(By.xpath("//button[contains(@class, 'mat-menu-item') and normalize-space(text()) = '" + name + "']"));
    }

    /**
     * This method is used to edit registration status for cde or form.
     *
     * @param index      Permissible Value Index from 0.
     * @param value      Permissible Value.
     * @param codeName   Permissible Value Code Name.
     * @param code       Permissible Value Code.
     * @param codeSystem Permissible Value Code System
     */
    protected void editPermissibleValueByIndex(int index, String value, String codeName, String code, String codeSystem, String codeDescription) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv_" + index)));
        if (value != null) {
            clickElement(By.xpath("//*[@id='pvValue_" + index + "']//i"));
            findElement(By.xpath("//*[@id='pvValue_" + index + "']//input")).sendKeys(value);
            hangon(2);
            clickElement(By.xpath("//*[@id='pvValue_" + index + "']//button[text()='Confirm']"));

        }
        if (codeName != null) {
            clickElement(By.xpath("//*[@id='pvMeaningName_" + index + "']//i"));
            findElement(By.xpath("//*[@id='pvMeaningName_" + index + "']//input")).sendKeys(codeName);
            hangon(2);
            clickElement(By.xpath("//*[@id='pvMeaningName_" + index + "']//button[text()='Confirm']"));
        }
        if (code != null) {
            clickElement(By.xpath("//*[@id='pvMeaningCode_" + index + "']//i"));
            findElement(By.xpath("//*[@id='pvMeaningCode_" + index + "']//input")).sendKeys(codeName);
            hangon(2);
            clickElement(By.xpath("//*[@id='pvMeaningCode_" + index + "']//button[text()='Confirm']"));
        }
        if (codeSystem != null) {
            clickElement(By.xpath("//*[@id='pvCodeSystem_" + index + "']//i"));
            findElement(By.xpath("//*[@id='pvCodeSystem_" + index + "']//input")).sendKeys(codeName);
            hangon(2);
            clickElement(By.xpath("//*[@id='pvCodeSystem_" + index + "']//button[text()='Confirm']"));
        }
        if (codeDescription != null) {
            clickElement(By.xpath("//*[@id='pvMeaningDefinition_" + index + "']//i"));
            findElement(By.xpath("//*[@id='pvMeaningDefinition_" + index + "']//input")).sendKeys(codeName);
            hangon(2);
            clickElement(By.xpath("//*[@id='pvMeaningDefinition_" + index + "']//button[text()='Confirm']"));
        }
    }

    protected void editOrigin(String origin, boolean append) {
        clickElement(By.xpath("//*[@id='origin']//mat-icon[normalize-space() = 'edit']"));
        if (!append) {
            findElement(By.xpath("//*[@id='origin']//input")).clear();
            hangon(2);
        }
        findElement(By.xpath("//*[@id='origin']//input")).sendKeys(origin);
        hangon(2);
        clickElement(By.xpath("//*[@id='origin']//button[text()='Confirm']"));
        textPresent(origin, By.id("origin"));
    }

    protected void checkSearchResultInfo(String term, String classif, String classifAlt, String topic, String status, String datatype) {
        if (term != null) textPresent(term, By.id("term_crumb"));
        if (classif != null) textPresent(classif, By.id("classif_crumb"));
        if (classifAlt != null) textPresent(classifAlt, By.id("classifAlt_filter"));
        if (topic != null) textPresent(topic, By.id("topic_crumb"));
        if (status != null) textPresent(status, By.id("status_crumb"));
        if (datatype != null) textPresent(datatype, By.id("datatype_crumb"));
    }

    protected void deleteDraft() {
        clickElement(By.id("deleteDraftBtn"));
        textPresent("Delete Draft?");
        clickElement(By.id("confirmDeleteBtn"));
        textNotPresent("Delete Draft?");
    }

    protected void openTableViewPreferenceModal() {
        clickElement(By.id("tableViewSettings"));
    }

    protected void closeTableViewPreferenceModal() {
        clickElement(By.id("closeTableViewSettingsBtn"));
    }

    protected void verifyRegistrationStatusOrder(List<WebElement> registrationStatusList) {
        int order = 100;
        for (ListIterator<WebElement> iterator = registrationStatusList.listIterator(); iterator.hasNext(); ) {
            WebElement webElement = iterator.next();
            String status = webElement.getText().trim();
            if (order > 6) order = REG_STATUS_SORT_MAP.get(status);
            int currentOrder = REG_STATUS_SORT_MAP.get(status);
            if (currentOrder < order)
                Assert.fail("Registration status order incorrect. Current:" + currentOrder + " Previous: " + order);
        }
    }

    protected void addComment(String message) {
        findElement(By.id("newCommentTextArea")).sendKeys(message);
        hangon(2);
        clickElement(By.id("commentBtn"));
        isCommentOrReplyExists(message, true);
    }

    protected void replyComment(int index, String message) {
        findElement(By.id("newReplyTextArea_" + index)).sendKeys(message);
        clickElement(By.id("replyBtn_" + index));
        isCommentOrReplyExists(message, true);
    }

    protected void addCommentNeedApproval(String message) {
        findElement(By.name("newCommentTextArea")).sendKeys(message);
        hangon(2);
        clickElement(By.id("commentBtn"));
        textNotPresent(message);
        textPresent("This comment is pending approval");
    }

    protected void replyCommentNeedApproval(int index, String message) {
        findElement(By.id("newReplyTextArea_" + index)).sendKeys(message);
        clickElement(By.id("replyBtn_" + index));
        textNotPresent(message);
        textPresent("This reply is pending approval");
    }

    protected void approveComment(String adminUsername, String adminPassword, String username, String message) {
        mustBeLoggedInAs(adminUsername, adminPassword);
        findElement(By.cssSelector("#notificationLink .mat-badge-content"));
        clickElement(By.id("notificationLink"));
        if (message.length() >= 60) message = message.substring(0, 59).trim();
        clickElement(By.xpath("//*[contains(@class,'taskItem') and contains(.,'" + message
                + "')]//button[contains(@class,'mat-primary')]"));
        textPresent("Approved");
    }

    protected void authorizeComment(String adminUsername, String adminPassword, String username, String message) {
        mustBeLoggedInAs(adminUsername, adminPassword);
        findElement(By.cssSelector("#notificationLink .mat-badge-content"));
        clickElement(By.id("notificationLink"));
        if (message.length() >= 60) message = message.substring(0, 59).trim();
        clickElement(By.xpath("//*[contains(@class,'taskItem') and contains(.,'" + message + "')]//button[contains(.,'Authorize')]"));
        clickElement(By.xpath("//button[contains(.,'Yes')]"));
        textPresent("Role added");
    }

    protected void declineComment(String adminUsername, String adminPassword, String username, String message) {
        mustBeLoggedInAs(adminUsername, adminPassword);
        clickElement(By.id("notificationLink"));
        if (message.length() >= 60) message = message.substring(0, 59).trim();
        clickElement(By.xpath("//*[contains(@class,'taskItem') and contains(.,'" + message
                + "')]//button[contains(@class,'mat-warn')]"));
        textPresent("Declined");
    }

    protected void removeComment(String message) {
        goToDiscussArea();
        String xpath = getCommentIconXpath(message, "comment", "remove");
        clickElement(By.xpath(xpath));
        isCommentOrReplyExists(message, false);
    }

    protected void removeReply(String message) {
        goToDiscussArea();
        String xpath = getCommentIconXpath(message, "reply", "remove");
        clickElement(By.xpath(xpath));
        isCommentOrReplyExists(message, false);
    }

    private void assertClass(By by, String className, boolean contains) {
        for (Integer i = 0; i < 10; i++) {
            try {
                Assert.assertEquals(findElement(by).getAttribute("class").contains(className), contains);
                break;
            } catch (Exception e) {
                if (i == 9)
                    Assert.fail("Could not find class: " + className + ". Actual: " + findElement(by).getAttribute("class"));
                hangon(1);
            }
        }
    }

    protected void resolveReply(String message) {
        String xpath = getCommentIconXpath(message, "reply", "resolve");
        clickElement(By.xpath(xpath));
    }

    protected void resolveComment(String message) {
        goToDiscussArea();
        String xpath = getCommentIconXpath(message, "comment", "resolve");
        clickElement(By.xpath(xpath));
        isCommentOrReplyExists(message, true);
        findElement(By.xpath("//div[normalize-space()='" + message + "']/span[contains(@class, 'strike')]"));
    }

    protected void isReplyStrike(String message, boolean result) {
        findElement(By.xpath("//div[contains(@class, 'replyBody') and normalize-space()='" + message + "']" + (
                result
                        ? "/span[contains(@class,'strike')]"
                        : "/span[not(contains(@class,'strike'))]"
        )));
    }

    protected void reopenReply(String message) {
        String xpath = getCommentIconXpath(message, "reply", "reopen");
        clickElement(By.xpath(xpath));
    }

    protected void reopenComment(String message) {
        goToDiscussArea();
        assertClass(By.xpath("//div[normalize-space()='" + message + "']/span"), "strike", true);
        String xpath = getCommentIconXpath(message, "comment", "reopen");
        clickElement(By.xpath(xpath));
        isCommentOrReplyExists(message, true);
        try {
            wait.until(ExpectedConditions.not(ExpectedConditions.attributeContains(
                    By.xpath("//div[normalize-space()='" + message + "']/span"),
                    "class", "strike")));
        } catch (StaleElementReferenceException e) {
            wait.until(ExpectedConditions.not(ExpectedConditions.attributeContains(
                    By.xpath("//div[normalize-space()='" + message + "']/span"),
                    "class", "strike")));
        }
    }

    private Map<String, String> COMMENT_Title_Case_MAP = new HashMap<String, String>() {
        {
            put("comment", "Comment");
            put("reply", "Reply");
        }
    };

    private String getCommentIconXpath(String message, String messageType, String iconType) {
        String titleCase = COMMENT_Title_Case_MAP.get(messageType);
        return "//div[normalize-space()='" + message + "']/preceding-sibling::div[contains(@class,'" + messageType + "Header')]//*[contains(@id,'" + iconType + titleCase + "_')]";
    }

    protected void checkCurrentCommentByIndex(int index, boolean isCurrent) {
        scrollToViewById("commentDiv_" + index);
        Assert.assertEquals(isCurrent, findElement(By.id("commentDiv_" + index)).getAttribute("class").contains("currentComment"));
    }

    protected void isCommentOrReplyExists(String commentText, boolean exist) {
        if (exist) textPresent(commentText, By.xpath("//cde-comments"));
        else textNotPresent(commentText, By.xpath("//cde-comments"));
    }

    protected void selectQuestionLabelByIndex(String questionId, int index) {
        clickElement(By.xpath("//*[@id='" + questionId + "']//mat-icon[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("Select a question label from a CDE Name");
        clickElement(By.xpath("//*[@id='q_select_name_" + index + "']/div/button"));
    }

    protected void selectQuestionNoLabel(String questionId) {
        clickElement(By.xpath("//*[@id='" + questionId + "']//mat-icon[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("Select a question label from a CDE Name");
        clickElement(By.id("selectQuestionNoLabel"));
    }

    protected void searchUsername(String username) {
        clickElement(By.name("searchUsersInput"));
        findElement(By.name("searchUsersInput")).clear();
        findElement(By.name("searchUsersInput")).sendKeys(username);
        findElements(By.xpath("//*[contains(@id,'mat-autocomplete-')]//mat-option[contains(.,'" + username.toLowerCase() + "')]"));
        clickElement(By.xpath("//*[contains(@id,'mat-autocomplete-')]//mat-option[contains(.,'" + username.toLowerCase() + "')]"));
    }

    protected void createBoardFromQuickBoard(String boardName, String boardDescription) {
        clickElement(By.id("addBoard"));
        if (boardName != null) {
            findElement(By.id("new-board-name")).sendKeys(boardName);
        }
        if (boardDescription != null) {
            findElement(By.id("new-board-description")).sendKeys(boardDescription);
        }
        clickElement(By.id("createBoard"));
        checkAlert("Board created");
    }

    protected Cookie getCurrentCookie() {
        String connectSid = "";
        Set<org.openqa.selenium.Cookie> cookies = driver.manage().getCookies();
        for (org.openqa.selenium.Cookie cookie : cookies) {
            connectSid = cookie.getValue();
            System.out.println("cookie: " + cookie.toString());
        }
        Cookie myCookie = new Cookie.Builder("connect.sid", connectSid).build();
        return myCookie;

    }

    protected void nonNativeSelect(String xpathParent, String selectLabel, String optionText) {
        String xpathSelect = xpathParent + (selectLabel.length() > 0
                ? "//mat-select[following-sibling::*[contains(@class,'mat-form-field-label-wrapper')]/label[contains(.,'" + selectLabel + "')]]"
                : "//mat-select[following-sibling::*[contains(@class,'mat-form-field-label-wrapper')][not(label)]]"
        );
        clickElement(By.xpath(xpathSelect));
        selectMatDropdownByText(optionText);
        findElement(By.xpath(xpathSelect + "//*[contains(@class,'mat-select-value')][contains(.,'" + optionText + "')]"));
    }

    protected void propertyEditText(String property, String text) {
        clickElement(By.xpath("//*[@itemprop='" + property + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@itemprop='" + property + "']//input")).clear();
        findElement(By.xpath("//*[@itemprop='" + property + "']//input")).sendKeys(text);
        clickElement(By.xpath("//*[@itemprop='" + property + "']//button/mat-icon[normalize-space() = 'check']"));
        textPresent(text, By.xpath("//*[@itemprop='" + property + "']"));
    }

    protected void selectMatDropdownByText(String text) {
        clickElement(By.xpath("//mat-option[normalize-space() = '" + text + "']"));
    }

    protected void reorderBySection(String section, String direction, int index) {
        String capDirection = direction.substring(0, 1).toUpperCase() + direction.substring(1);
        String xpath = "//*[@id='" + section + "-div']//*[contains(@class,'move" + capDirection + "-" + index + "')]";
        clickElement(By.xpath(xpath));
    }
}
