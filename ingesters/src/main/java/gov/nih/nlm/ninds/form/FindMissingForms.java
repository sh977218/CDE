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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class FindMissingForms implements Runnable {
    MongoOperations mongoOperation;
    WebDriver driver;
    WebDriverWait wait;
    String url;
    MyLog log = new MyLog();

    FindMissingForms(String url, MongoOperations mongoOperation) {
        System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, 120);
        this.url = url;
        this.mongoOperation = mongoOperation;
    }

    @Override
    public void run() {
        goToSite(url);
        driver.close();
        mongoOperation.save(log);
    }

    public void goToSite(String url) {
        driver.get(url);
        String formsXPathTh = "//*[@class='cdetable']/tbody/tr/th[@scope='row']";
        List<WebElement> formList = driver.findElements(By.xpath(formsXPathTh));
        int i = 1;
        for (WebElement we : formList) {
            if (i != 60) {
                i++;
                continue;
            }
            MyForm form = new MyForm();
            form.setUrl(url);
            form.setRow(i);
            List<WebElement> aList = we.findElements(By.xpath("/a"));
            String formId, downloadLink = "";
            if (aList.size() > 0) {
                String temp = we.getText();
                formId = aList.get(0).getAttribute("title");
                downloadLink = aList.get(0).getAttribute("href");
            } else {
                String id = we.getAttribute("id");
                formId = id.replace("form", "");
            }
            String formName = we.getText().trim();
            String domainName = null, subDomainName = null;
            String subDomianSelector = "//*[normalize-space(text())=\"" + formName + "\"]/ancestor::tr/preceding-sibling::tr[th[@class=\"subrow\"]][1]";
            String domianSelector = "//*[normalize-space(text())=\"" + formName + "\"]/ancestor::table/preceding-sibling::a[1]";
            List<WebElement> subDomains = driver.findElements(By.xpath(subDomianSelector));
            if (subDomains.size() > 0)
                subDomainName = cleanSubDomain(subDomains.get(0).getText().trim());
            List<WebElement> domains = driver.findElements(By.xpath(domianSelector));
            if (domains.size() > 0)
                domainName = domains.get(0).getText().trim();
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
                log.info.add("found form on web:" + form);
                log.info.add(formId);
                if (cdeLinks.size() > 0) {
                    getCdes(form, cdeLinks.get(0));
                }
                form.setCreateDate(new Date());
                mongoOperation.save(form);
            }
            i++;
        }
    }


    private String cleanSubDomain(String s) {
        String result = s;
        String[] badStrings = {"The NINDS strongly encourages researchers to use these NIH-developed materials for NINDS-sponsored research, when appropriate. Utilization of these resources will enable greater consistency for NINDS-sponsored research studies. These tools are free of charge.",
                "See \"CRF Search\" to find all Imaging forms under Subdomain option.",
                "See \"CRF Search\" to find all Non-Imaging forms under Subdomain option.",
                "See \"CRF Search\" to find Surgeries and Other Procedures forms under Subdomain option.",
                "See \"CRF Search\" to find all History of Disease/Injury Event forms under Subdomain option.",
                "See \"CRF Search\" to find all Classification forms under Subdomain option.",
                "See \"CRF Search\" to find all Second Insults forms under Subdomain option.",
                "See \"CRF Search\" to find all Discharge forms under Subdomain option."};
        for (String badString : badStrings) {
            result = result.replace(badString, "").trim();
        }
        return result;
    }

    void getCdes(MyForm form, WebElement a) {
        a.click();
        hangon(5);
        switchTab(1);
        String diseaseName = "", subDiseaseName = "";
        String diseaseXPath = "//td//div[contains(text(), 'Disease: ')]";
        String subDiseaseXPath = "//td//div[contains(text(), 'SubDisease: ')]";
        List<WebElement> diseaseList = driver.findElements(By.xpath(diseaseXPath));
        if (diseaseList.size() > 0) {
            String diseaseNameText = diseaseList.get(0).getText();
            diseaseName = diseaseNameText.replace("Disease:", "").trim();
            form.setDiseaseName(diseaseName);
        }
        List<WebElement> subDiseaseList = driver.findElements(By.xpath(subDiseaseXPath));
        if (subDiseaseList.size() > 0) {
            String subDiseaseNameText = subDiseaseList.get(0).getText();
            subDiseaseName = subDiseaseNameText.replace("SubDisease:", "").trim();
            form.setSubDiseaseName(subDiseaseName);
        }
        Query searchUserQuery = new Query(Criteria.where("formId").is(form.getFormId())
                .and("crfModuleGuideline").is(form.getCrfModuleGuideline())
                .and("domainName").is(form.getDomainName())
                .and("subDomainName").is(form.getSubDomainName())
                .and("diseaseName").is(form.getDiseaseName())
                .and("subDiseaseName").and(form.getSubDiseaseName()));
        MyForm existingForm = mongoOperation.findOne(searchUserQuery, MyForm.class);
        if (existingForm != null) return;
        getCdesList(form);
        String cdesTotalPageStr = findElement(By.id("viewer_ctl01_ctl01_ctl04")).getText();
        int cdesTotalPage = Integer.valueOf(cdesTotalPageStr);
        if (cdesTotalPage > 1) {
            for (int j = 1; j < cdesTotalPage; j++) {
                findElement(By.xpath("//*[ @id=\"viewer_ctl01_ctl01_ctl05_ctl00\"]/tbody/tr/td/input")).click();
                String temp = "Page " + (j + 1) + " of " + cdesTotalPage;
                textPresent(temp);
                getCdesList(form);
            }
        }
        switchTabAndClose(0);
    }

    void getCdesList(MyForm form) {
        String selector = "//tbody[tr/td/div[text() = 'CDE ID']]/tr";
        List<WebElement> trs = driver.findElements(By.xpath(selector));
        for (int i = 2; i < trs.size(); i++) {
            WebElement tr = trs.get(i);
            List<WebElement> tds = tr.findElements(By.cssSelector("td"));
            int index = 1;
            Cde cde = new Cde();
            int noise = 0;
            for (WebElement td : tds) {
                String text = td.getText().replace("\"", " ").trim();
                if (index == 1) {
                    cde.cdeId = text;
                }
                if (index == 2) {
                    cde.cdeName = text;
                }
                if (index == 3) {
                    cde.variableName = text;
                }
                if (index == 4) {
                    cde.definitionDescription = text;
                }
                if (index == 5) {
                    cde.questionText = text;
                }
                if (index == 6) {
                    cde.permissibleValue = text;
                }
                if (index == 7) {
                    cde.permissibleDescription = text;
                }
                if (index == 8) {
                    cde.dataType = text;
                }
                if (index == 9) {
                    cde.instruction = text;
                }
                if (index == 10) {
                    cde.reference = text;
                }
                if (index == 11) {
                    cde.population = text;
                }
                if (index == 12) {
                    cde.classification = text;
                }
                if (index == 13) {
                    cde.versionNum = text;
                }
                if (index == 14) {
                    cde.versionDate = text;
                }
                if (index == 15) {
                    cde.aliasesForVariableName = text;
                }
                if (index == 16) {
                    cde.crfModuleGuideline = text;
                }
                if (index == 17) {
                    List<WebElement> table = td.findElements(By.cssSelector("table"));
                    if (table.size() > 0) {
                        cde.copyRight = "true";
                        noise = 1;
                    }
                }
                if (index == 18 + noise) {
                    cde.subDomain = text;
                    form.setSubDomainName(text);
                }
                if (index == 19 + noise) {
                    cde.domain = text;
                    form.setDomainName(text);
                }
                if (index == 20 + noise) {
                    cde.previousTitle = text;
                }
                if (index == 21 + noise) {
                    cde.size = text;
                }
                if (index == 22 + noise) {
                    cde.inputRestrictions = text;
                }
                if (index == 23 + noise) {
                    cde.minValue = text;
                }
                if (index == 24 + noise) {
                    cde.maxValue = text;
                }
                if (index == 25 + noise) {
                    cde.measurementType = text;
                }
                if (index == 26 + noise) {
                    cde.loincId = text;
                }
                if (index == 27 + noise) {
                    cde.snomed = text;
                }
                if (index == 28 + noise) {
                    cde.cadsrId = text;
                }
                if (index == 29 + noise) {
                    cde.cdiscId = text;
                }
                index++;
            }
            form.getCdes().add(cde);
        }
    }

    boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text));
        return true;
    }

    public void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    void switchTabAndClose(int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs.get(i));
    }

    void switchTab(int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }

    WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

}