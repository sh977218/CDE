package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
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
    ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);


    public void logMessage(String text) {
        MyLog log = new MyLog();
        log.info = text;
        mongoOperation.save(log);
    }

    FindMissingForms(String url) {
        System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        this.url = url;
        this.mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");
    }

    public void run() {
        System.out.println("start url: " + url);
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, 120);
        goToSite(url);
        cdeUtility.checkDataQuality(mongoOperation);
        driver.close();
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
                    logMessage("cannot find domainName, " + " url:" + url + " row:" + i + " formName:" + formName + " with xpath:" + domianSelector1);
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
                logMessage("found form " + formId + " on web:" + form);
                mongoOperation.save(form);
            }
            i++;
        }
        logMessage("total form on the web: " + i);
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
        try {
            Thread.sleep((long) (i * 1000));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }


    private WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

}