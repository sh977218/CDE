package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.Date;
import java.util.List;

public class FindMissingForms implements Runnable {
    MongoOperations mongoOperation;
    WebDriver driver;
    WebDriverWait wait;
    String url;
    MyLog log = new MyLog();
    CDEUtility cdeUtility = new CDEUtility();
    String diseaseName;

    FindMissingForms(String url, MongoOperations mongoOperation) {
        System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        this.url = url;
        this.mongoOperation = mongoOperation;
    }

    @Override
    public void run() {
        System.out.println("start url: " + url);
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, 120);
        long startTime = System.currentTimeMillis();
        goToSite(url);
        cdeUtility.checkDataQuality(mongoOperation, url);
        driver.close();
        long endTime = System.currentTimeMillis();
        long totalTimeInMillis = endTime - startTime;
        long totalTimeInSeconds = totalTimeInMillis / 1000;
        long totalTimeInMinutes = totalTimeInSeconds / 60;
        log.setRunTime(totalTimeInMinutes);
        mongoOperation.save(log);
    }


    public void goToSite(String url) {
        driver.get(url);
        String diseaseNameOuterXPath = "//*[@id=\"bcrumbTab\"]/following-sibling::h2[1]";
        String diseaseNameInnerXPath = "//*[@id=\"bcrumbTab\"]/following-sibling::h2[1]/p";
        List<WebElement> diseaseNameOuterList = driver.findElements(By.xpath(diseaseNameOuterXPath));
        List<WebElement> diseaseNameInnerList = driver.findElements(By.xpath(diseaseNameInnerXPath));
        if (diseaseNameOuterList.size() == 1 && diseaseNameInnerList.size() == 1) {
            String diseaseNameOuter = diseaseNameOuterList.get(0).getText();
            String diseaseNameInner = diseaseNameInnerList.get(0).getText();
            this.diseaseName = diseaseNameOuter.replace(diseaseNameInner, "").trim();
        } else if (diseaseNameOuterList.size() == 1 && diseaseNameInnerList.size() == 0) {
            String diseaseNameOuter = diseaseNameOuterList.get(0).getText();
            this.diseaseName = diseaseNameOuter;
        } else {
            System.out.println("cannot find disease on the page. url:" + this.url);
            System.out.println("diseaseNameOuterXPath size: " + diseaseNameOuterXPath);
            System.out.println("diseaseNameOuterList size: " + diseaseNameOuterList.size());
            System.out.println("diseaseNameInnerXPath size: " + diseaseNameInnerXPath);
            System.out.println("diseaseNameInnerList size: " + diseaseNameInnerList.size());
            System.exit(1);
        }
        String formsXPathTh = "//*[@class='cdetable']/tbody/tr/th[@scope='row']";
        List<WebElement> formList = driver.findElements(By.xpath(formsXPathTh));
        int i = 1;
        for (WebElement we : formList) {
            MyForm form = new MyForm();
            form.setUrl(url);
            form.setRow(i);
            List<WebElement> aList = we.findElements(By.xpath("/a"));
            List<WebElement> copyrightList = we.findElements(By.className("copyright"));
            if (copyrightList.size() > 0) {
                form.setCopyright(true);
            }
            String formId, downloadLink = "";
            if (aList.size() > 0) {
                formId = aList.get(0).getAttribute("title");
                downloadLink = aList.get(0).getAttribute("href");
            } else {
                String id = we.getAttribute("id");
                formId = id.replace("form", "");
            }
            String formName = cdeUtility.cleanFormName(we.getText());
            String domainName = null, subDomainName = null;
            String thisElementXpath = "(//*[@class='cdetable']/tbody/tr/th[@scope='row'])";
            String subDomianSelector = thisElementXpath + "[" + i + "]/ancestor::tr/preceding-sibling::tr[th[@class=\"subrow\"]][1]";
            String domianSelector = thisElementXpath + "[" + i + "]/ancestor::table/preceding-sibling::a[1]";
            String domianSelector1 = thisElementXpath + "[" + i + "]/ancestor::table/preceding-sibling::h3[1]/a";
            List<WebElement> subDomains = driver.findElements(By.xpath(subDomianSelector));
            if (subDomains.size() > 0)
                subDomainName = cdeUtility.cleanSubDomain(subDomains.get(0).getText().trim());
            List<WebElement> domainList = driver.findElements(By.xpath(domianSelector));
            if (domainList.size() > 0)
                domainName = domainList.get(0).getText().trim();
            else {
                List<WebElement> domainList1 = driver.findElements(By.xpath(domianSelector1));
                if (domainList1.size() > 0) {
                    domainName = domainList1.get(0).getText().trim();
                } else
                    log.info.add("cannot find domainName, " + " url:" + url + " row:" + i + " formName:" + formName + " with xpath:" + domianSelector1);
            }
            form.setFormId(formId);
            form.setCrfModuleGuideline(formName);
            form.setDownloadLink(downloadLink);
            form.setDomainName(domainName);
            form.setSubDomainName(subDomainName);
            Query searchUserQuery = new Query(Criteria.where("formId").is(formId).and("domainName").is(domainName).and("subDomainName").is(subDomainName));
            MyForm existingForm = mongoOperation.findOne(searchUserQuery, MyForm.class);
            String cdeLinkXPath = "//*[@class='cdetable']/tbody/tr[th[@id='form" + formId + "']]/td/a";
            List<WebElement> cdeLinks = driver.findElements(By.xpath(cdeLinkXPath));
            if (existingForm == null) {
                form.setDiseaseName(this.diseaseName);
                if (cdeLinks.size() > 0) {
                    getCdes(form, cdeLinks.get(0));
                }
                form.setCreateDate(new Date());
                log.info.add("found form on web:" + form);
                log.info.add(formId);
                mongoOperation.save(form);
            }
            i++;
        }
        log.info.add("total form on the web: " + i);
    }


    private void getCdes(MyForm form, WebElement a) {
        a.click();
        hangon(5);
        cdeUtility.switchTab(driver, 1);
        String subDiseaseName = "";
        String subDiseaseXPath = "//td//div[contains(text(), 'SubDisease: ')]";
        List<WebElement> subDiseaseList = driver.findElements(By.xpath(subDiseaseXPath));
        if (subDiseaseList.size() > 0) {
            String subDiseaseNameText = subDiseaseList.get(0).getText();
            subDiseaseName = subDiseaseNameText.replace("SubDisease:", "").trim();
        }
        form.setSubDiseaseName(subDiseaseName);
        Query searchUserQuery = new Query(Criteria.where("formId").is(form.getFormId())
                .and("crfModuleGuideline").is(form.getCrfModuleGuideline())
                .and("domainName").is(form.getDomainName())
                .and("subDomainName").is(form.getSubDomainName())
                .and("diseaseName").is(form.getDiseaseName())
                .and("subDiseaseName").and(form.getSubDiseaseName()));
        MyForm existingForm = mongoOperation.findOne(searchUserQuery, MyForm.class);
        if (existingForm != null) return;
        cdeUtility.getCdesList(driver, form);
        String cdesTotalPageStr = findElement(By.id("viewer_ctl01_ctl01_ctl04")).getText();
        int cdesTotalPage = Integer.valueOf(cdesTotalPageStr);
        if (cdesTotalPage > 1) {
            for (int j = 1; j < cdesTotalPage; j++) {
                findElement(By.xpath("//*[ @id=\"viewer_ctl01_ctl01_ctl05_ctl00\"]/tbody/tr/td/input")).click();
                String temp = "Page " + (j + 1) + " of " + cdesTotalPage;
                textPresent(temp);
                cdeUtility.getCdesList(driver, form);
            }
        }
        cdeUtility.switchTabAndClose(driver, 0);
    }


    boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text));
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