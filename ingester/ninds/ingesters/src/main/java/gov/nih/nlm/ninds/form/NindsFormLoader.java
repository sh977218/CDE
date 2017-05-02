package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.mongodb.core.MongoOperations;

import java.awt.*;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NindsFormLoader implements Runnable {
    private MongoOperations mongoOperation;
    private WebDriver driver;
    private WebDriver classificationDriver;
    private WebDriverWait wait;
    private int page;
    MyLog log;
    private CDEUtility cdeUtility;
    ApplicationContext ctx;
    private Map<String, Integer> formTableHeader = new HashMap<String, Integer>();

    public NindsFormLoader(int p) throws IOException, AWTException {
        System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        this.page = p;
        ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);
        this.mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");
        log = new MyLog();
        this.log.setPageStart(this.page);
        cdeUtility = new CDEUtility();
    }

    @Override
    public void run() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        DesiredCapabilities caps = DesiredCapabilities.chrome();
        caps.setCapability(ChromeOptions.CAPABILITY, options);
        this.driver = new ChromeDriver(options);
        this.classificationDriver = new ChromeDriver(options);
        this.wait = new WebDriverWait(driver, 120);
        long startTime = System.currentTimeMillis();
        goToNindsSiteAndGoToPageOf(page);
        findAndSaveToForms(page);
        cdeUtility.checkDataQuality(mongoOperation);
        long endTime = System.currentTimeMillis();
        long totalTimeInMillis = endTime - startTime;
        long totalTimeInSeconds = totalTimeInMillis / 1000;
        long totalTimeInMinutes = totalTimeInSeconds / 60;
        this.log.setRunTime(totalTimeInMinutes);
        this.log.info.add("finished " + page);
        mongoOperation.save(this.log);
        this.driver.close();
        this.classificationDriver.close();
    }


    private void goToNindsSiteAndGoToPageOf(int page) {
        driver.get(Constants.URL);
        textPresent("If you have difficulty accessing either the proprietary instruments/scales or the external links, please contact the NINDS");
        hangon(10);
        Select pageSizeSelect = new Select(findElement(By.id("ddlPageSize")));
        pageSizeSelect.selectByVisibleText("100");
        hangon(5);
        findElement(By.id("ContentPlaceHolder1_btnClear")).click();
        hangon(5);
        findElement(By.id("ContentPlaceHolder1_btnSearch")).click();
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", findElement(By.id("ContentPlaceHolder1_btnClear")));
        textPresent(Constants.TOTAL_RECORD + " items found.");
        if (page > 15) {
            hangon(10);
            findElement(By.id("ContentPlaceHolder1_lbtnLast")).click();
            textPresent("Page: " + Constants.TOTAL_PAGE + " of " + Constants.TOTAL_PAGE);
            goToPageFromLast(page);
        } else {
            for (int i = 1; i < page; i++) {
                hangon(10);
                findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
                textPresent("Page: " + i + " of " + Constants.TOTAL_PAGE);
            }
        }
    }

    private void goToPageFromLast(int pageStart) {
        for (int n = Constants.TOTAL_PAGE; n > pageStart; n--) {
            findElement(By.id("ContentPlaceHolder1_lbtnPrev")).click();
            int num = n - 1;
            String s = "Page: " + num + " of " + Constants.TOTAL_PAGE;
            textPresent(s);
        }
    }

    private void findAndSaveToForms(int pageStart) {
        String textToBePresent = "Page: " + String.valueOf(pageStart) + " of " + Constants.TOTAL_PAGE;
        textPresent(textToBePresent);
        hangon(5);
        List<WebElement> trs = driver.findElements(By.xpath("//*[@id='ContentPlaceHolder1_dgCRF']/tbody/tr"));
        if (this.formTableHeader.size() == 0)
            getFormTableHeader(trs.get(0));
        for (int row = 1; row < trs.size(); row++) {
            MyForm form = new MyForm();
            form.setPage(pageStart);
            form.setRow(row);
            getForms(form, trs.get(row));
        }
        System.out.println("finished page " + pageStart);
    }


    private void getDomainAndSubDomain(MyForm form) {
        String formId = form.getFormId().trim();
        classificationDriver.get("https://commondataelements.ninds.nih.gov/" + Constants.DISEASE_MAP.get(form.getDiseaseName()));
        String subDomianSelector = "//*[@title=\"" + formId + "\"]/ancestor::tr/preceding-sibling::tr[th[@class=\"subrow\"]][1]";
        String domianSelector = "//*[@title=\"" + formId + "\"]/ancestor::table/preceding-sibling::a[1]";
        String domianSelector1 = "//*[@title=\"" + formId + "\"]/ancestor::table/preceding-sibling::h3[1]/a";
        List<WebElement> subDomains = classificationDriver.findElements(By.xpath(subDomianSelector));
        if (subDomains.size() > 0)
            form.setSubDomainName(cdeUtility.cleanSubDomain(subDomains.get(0).getText().trim()));
        else {
            this.log.info.add("cannot find subDomainName of form: " + form + " of xpath: " + subDomianSelector);
        }
        List<WebElement> domains = classificationDriver.findElements(By.xpath(domianSelector));
        if (domains.size() > 0) {
            form.setDomainName(domains.get(0).getText().trim());
        } else {
            List<WebElement> domains1 = classificationDriver.findElements(By.xpath(domianSelector1));
            if (domains1.size() > 0) {
                form.setDomainName(domains1.get(0).getText().trim());
            } else {
                this.log.info.add("cannot find domainName of form: " + form + " of xpath: " + domianSelector1);
            }
        }
    }

    private void getFormTableHeader(WebElement tr) {
        List<WebElement> ths = tr.findElements(By.xpath("th"));
        for (int column = 0; column < ths.size(); column++) {
            WebElement th = ths.get(column);
            String text = th.getText();
            this.formTableHeader.put(text.trim(), column);
        }
    }

    private void getForms(MyForm form, WebElement tr) {
        List<WebElement> tds = tr.findElements(By.xpath("td"));
        for (int column = 0; column < tds.size(); column++) {
            WebElement td = tds.get(column);
            String text = td.getText().trim();
            if (column == 0) {
                hangon(5);
                List<WebElement> aList = td.findElements(By.cssSelector("a"));
                if (aList.size() > 0) {
                    String downloadLink = aList.get(0).getAttribute("href");
                    form.setDownloadLink(downloadLink);
                    String id = aList.get(0).getAttribute("title");
                    if (id.length() > 0)
                        form.setFormId(id.replace("NOC-", ""));
                    else
                        form.setFormId(downloadLink.split("CrfId=")[1]);
                    List<WebElement> copyrightClass = td.findElements(By.className("copyright"));
                    if (copyrightClass.size() > 0) {
                        form.setCopyright(true);
                    }
                }
                form.setCrfModuleGuideline(cdeUtility.cleanFormName(text));
            }
            if (column == 1)
                form.setDescription(text);
            if (column == 2) {
                List<WebElement> as = td.findElements(By.cssSelector("a"));
                if (as.size() > 0) {
                    WebElement a = as.get(0);
                    getCdes(form, a);
                }
            }
            if (column == 3)
                form.setVersionNum(text);
            if (column == 4)
                form.setVersionDate(text);
            if (column == 5) {
                form.setDiseaseName(text);
            }
            if (column == 6) {
                form.setSubDiseaseName(text);
            }
        }
        getDomainAndSubDomain(form);
        form.setCreateDate(new Date());
        mongoOperation.save(form);
    }

    private void getCdes(MyForm form, WebElement a) {
        a.click();
        hangon(5);
        cdeUtility.switchTab(driver, 1);
        cdeUtility.getCdesList(driver, form);
        String cdesTotalPageStr = findElement(By.id("viewer_ctl01_ctl01_ctl04")).getText();
        int cdesTotalPage = Integer.valueOf(cdesTotalPageStr);
        if (cdesTotalPage > 1) {
            for (int j = 1; j < cdesTotalPage; j++) {
                //if (j == 5) refreshSession();
                findElement(By.xpath("//*[ @id=\"viewer_ctl01_ctl01_ctl05_ctl00\"]/tbody/tr/td/input")).click();
                String temp = "Page " + (j + 1) + " of " + cdesTotalPage;
                textPresent(temp);
                cdeUtility.getCdesList(driver, form);
            }
        }
        cdeUtility.switchTabAndClose(driver, 0);
    }

    private void refreshSession() {
        cdeUtility.switchTab(driver, 0);
        findElement(By.id("ContentPlaceHolder1_lbDownload")).click();
        hangon(5);
        cdeUtility.switchTab(driver, 1);
    }


    private boolean textPresent(String text) {
        try {
            wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text));
        } catch (Exception e) {
            System.out.println("tried finding '" + text + "' once fail. try another. pageStart :" + page);
            wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text));
        }
        return true;
    }

    private void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    private WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

}
