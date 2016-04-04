package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NindsFormLoader implements Runnable {
    MongoOperations mongoOperation;
    Map<String, String> diseaseMap = new HashMap<String, String>();
    String url = "https://commondataelements.ninds.nih.gov/CRF.aspx";
    WebDriver driver;
    WebDriver classifDriver;
    WebDriverWait wait;
    int pageStart;
    int pageEnd;
    MyLog log = new MyLog();
    CDEUtility cdeUtility = new CDEUtility();

    public NindsFormLoader(int ps, int pe, MongoOperations mongoOperation) {
        diseaseMap.put("General (For all diseases)", "General.aspx");
        diseaseMap.put("Amyotrophic Lateral Sclerosis", "ALS.aspx");
        diseaseMap.put("Epilepsy", "Epilepsy.aspx");
        diseaseMap.put("Friedreich's Ataxia", "FA.aspx");
        diseaseMap.put("Headache", "Headache.aspx");
        diseaseMap.put("Huntington's Disease", "HD.aspx");
        diseaseMap.put("Mitochondrial Disease", "MITO.aspx");
        diseaseMap.put("Multiple Sclerosis", "MS.aspx");
        diseaseMap.put("Neuromuscular Diseases", "NMD.aspx");
        diseaseMap.put("Congenital Muscular Dystrophy", "CMD.aspx");
        diseaseMap.put("Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", "DMD.aspx");
        diseaseMap.put("Facioscapulohumeral Muscular Dystrophy", "FSHD.aspx");
        diseaseMap.put("Myasthenia Gravis", "MG.aspx");
        diseaseMap.put("Myotonic Muscular Dystrophy", "MMD.aspx");
        diseaseMap.put("Spinal Muscular Atrophy", "SMA.aspx");
        diseaseMap.put("Parkinson's Disease", "PD.aspx");
        diseaseMap.put("Spinal Cord Injury", "SCI.aspx");
        diseaseMap.put("Stroke", "Stroke.aspx");
        diseaseMap.put("Traumatic Brain Injury", "TBI.aspx");
        System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        this.pageStart = ps;
        this.pageEnd = pe;
        this.mongoOperation = mongoOperation;
        this.log.setPageStart(this.pageStart);
        this.log.setPageEnd(this.pageEnd);

    }

    @Override
    public void run() {
        this.driver = new ChromeDriver();
        this.classifDriver = new ChromeDriver();
        this.wait = new WebDriverWait(driver, 120);
        long startTime = System.currentTimeMillis();
        goToNindsSiteAndGoToPageOf(pageStart);
        findAndSaveToForms(pageStart, pageEnd);
        cdeUtility.checkDataQuality(mongoOperation, "");
        long endTime = System.currentTimeMillis();
        long totalTimeInMillis = endTime - startTime;
        long totalTimeInSeconds = totalTimeInMillis / 1000;
        long totalTimeInMinutes = totalTimeInSeconds / 60;
        this.log.setRunTime(totalTimeInMinutes);
        this.log.info.add("finished " + pageStart + " to " + pageEnd);
        mongoOperation.save(this.log);
        this.driver.close();
        this.classifDriver.close();
    }


    private void goToNindsSiteAndGoToPageOf(int pageStart) {
        driver.get(url);
        textPresent("If you have difficulty accessing either the proprietary instruments/scales or the external links, please contact the NINDS CDE Project Officer, Joanne Odenkirchen, MPH.");
        hangon(10);
        Select pageSizeSelect = new Select(findElement(By.id("ddlPageSize")));
        pageSizeSelect.selectByVisibleText("100");
        hangon(5);
        findElement(By.id("ContentPlaceHolder1_btnClear")).click();
        hangon(5);
        findElement(By.id("ContentPlaceHolder1_btnSearch")).click();
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", findElement(By.id("ContentPlaceHolder1_btnClear")));
        textPresent("2605 items found.");
        if (pageStart > 15) {
            hangon(10);
            findElement(By.id("ContentPlaceHolder1_lbtnLast")).click();
            textPresent("Page: 27 of 27");
            goToPageFromLast(pageStart);
        } else {
            for (int i = 1; i < pageStart; i++) {
                hangon(10);
                findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
                textPresent("Page: " + i + " of 27");
            }
        }
    }

    private void goToPageFromLast(int pageStart) {
        for (int n = 27; n > pageStart; n--) {
            findElement(By.id("ContentPlaceHolder1_lbtnPrev")).click();
            int num = n - 1;
            String s = "Page: " + num + " of 27";
            textPresent(s);
        }
    }

    private void findAndSaveToForms(int pageStart, int pageEnd) {
        String textToBePresent = "Page: " + String.valueOf(pageStart) + " of 27";
        textPresent(textToBePresent);
        List<WebElement> trs = driver.findElements(By.xpath("//*[@id='ContentPlaceHolder1_dgCRF']/tbody/tr"));
        for (int i = 1; i < trs.size(); i++) {
            List<WebElement> tds = trs.get(i).findElements(By.cssSelector("td"));
            MyForm form = new MyForm();
            form.setPage(pageStart);
            form.setRow(i);
            int index = 1;
            for (WebElement td : tds) {
                String text = td.getText();
                if (index == 1) {
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
                        List<WebElement> copyRightClass = td.findElements(By.className("copyright"));
                        if (copyRightClass.size() > 0) {
                            form.setCopyRight(true);
                        }
                    }
                    form.setCrfModuleGuideline(cdeUtility.cleanFormName(text));
                }
                if (index == 2)
                    form.setDescription(text);
                if (index == 3) {
                    List<WebElement> as = td.findElements(By.cssSelector("a"));
                    if (as.size() > 0) {
                        WebElement a = as.get(0);
                        getCdes(form, a);
                    }
                }
                if (index == 4)
                    form.setVersionNum(text);
                if (index == 5)
                    form.setVersionDate(text);
                if (index == 6) {
                    form.setDiseaseName(text);
                }
                if (index == 7) {
                    form.setSubDiseaseName(text);
                }
                index++;
            }
            getDomainAndSubDomain(form);

            Query searchDuplicatedFormQuery = new Query(Criteria.where("formId").is(form.getFormId())
                    .and("crfModuleGuideline").is(form.getCrfModuleGuideline())
                    .and("description").is(form.getDescription())
                    .and("copyRight").is(form.isCopyRight())
                    .and("downloadLink").is(form.getDownloadLink())
                    .and("versionNum").is(form.getVersionNum())
                    .and("versionDate").is(form.getVersionDate())
                    .and("diseaseName").is(form.getDiseaseName())
                    .and("subDiseaseName").is(form.getSubDiseaseName())
                    .and("domainName").is(form.getDomainName())
                    .and("subDomainName").is(form.getSubDomainName()));
            MyForm existingForm = mongoOperation.findOne(searchDuplicatedFormQuery, MyForm.class);
            if (existingForm != null) {
                this.log.info.add("search with query: " + searchDuplicatedFormQuery.toString());
                this.log.info.add("found existing form in migration: " + existingForm);
                this.log.info.add("found form on web:" + form);
            } else {
                form.setCreateDate(new Date());
                mongoOperation.save(form);
            }
        }
        if (pageStart < pageEnd) {
            findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            findAndSaveToForms(pageStart + 1, pageEnd);
        }
    }


    private void getDomainAndSubDomain(MyForm form) {
        String crfModuleGuideline = form.getCrfModuleGuideline().trim();
        classifDriver.get("https://commondataelements.ninds.nih.gov/" + diseaseMap.get(form.getDiseaseName()));
        String subDomianSelector = "//*[normalize-space(text())=\"" + crfModuleGuideline + "\"]/ancestor::tr/preceding-sibling::tr[th[@class=\"subrow\"]][1]";
        String domianSelector = "//*[normalize-space(text())=\"" + crfModuleGuideline + "\"]/ancestor::table/preceding-sibling::a[1]";
        String domianSelector1 = "//*[normalize-space(text())=\"" + crfModuleGuideline + "\"]/ancestor::table/preceding-sibling::h3[1]/a";
        List<WebElement> subDomains = classifDriver.findElements(By.xpath(subDomianSelector));
        if (subDomains.size() > 0)
            form.setSubDomainName(cdeUtility.cleanSubDomain(subDomains.get(0).getText().trim()));
        else {
            this.log.info.add("cannot find subDomainName of form: " + form + " of xpath: " + subDomianSelector);
        }
        List<WebElement> domains = classifDriver.findElements(By.xpath(domianSelector));
        if (domains.size() > 0) {
            form.setDomainName(domains.get(0).getText().trim());
        } else {
            List<WebElement> domains1 = classifDriver.findElements(By.xpath(domianSelector1));
            if (domains1.size() > 0) {
                form.setDomainName(domains1.get(0).getText().trim());
            } else {
                this.log.info.add("cannot find domainName of form: " + form + " of xpath: " + domianSelector1);
            }
        }
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
                if (j == 5) {
                    refreshSession();
                }
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
        hangon(10);
        cdeUtility.switchTab(driver, 1);
    }


    private boolean textPresent(String text) {
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

    @Override
    public String toString() {
        return "NindsFormLoader{" +
                ", url='" + url + '\'' +
                ", pageStart=" + pageStart +
                ", pageEnd=" + pageEnd +
                ", log=" + log +
                ", cdeUtility=" + cdeUtility +
                '}';
    }
}
