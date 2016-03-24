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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NindsFormLoader implements Runnable {
    MongoOperations mongoOperation;
    Map<String, String> diseaseMap = new HashMap<String, String>();
    String url = "https://commondataelements.ninds.nih.gov/CRF.aspx";
    WebDriver driver, classifDriver;
    WebDriverWait wait;
    int pageStart;
    int pageEnd;
    MyLog log = new MyLog();

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
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, 120);
        this.pageStart = ps;
        this.pageEnd = pe;
        this.mongoOperation = mongoOperation;
        classifDriver = new ChromeDriver();
        this.log.setPageStart(this.pageStart);
        this.log.setPageEnd(this.pageEnd);

    }

    @Override
    public void run() {
        long startTime = System.currentTimeMillis();
        goToNindsSiteAndGoToPageOf(pageStart);
        findAndSaveToForms(pageStart, pageEnd);
        driver.close();
        classifDriver.close();
        log.info.add("finished " + pageStart + " to " + pageEnd);
        long endTime = System.currentTimeMillis();
        long totalTimeInMillis = endTime - startTime;
        long totalTimeInSeconds = totalTimeInMillis / 1000;
        long totalTimeInMinutes = totalTimeInSeconds / 60;
        log.setRunTime(totalTimeInMinutes);
        mongoOperation.save(log);
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
                String text = td.getText().replace("\"", " ").replace(" - Paper version", " Paper version").trim();
                if (index == 1) {
                    hangon(5);
                    List<WebElement> a = td.findElements(By.cssSelector("a"));
                    if (a.size() > 0) {
                        String downloadLink = a.get(0).getAttribute("href");
                        form.setDownloadLink(downloadLink);
                        String id = a.get(0).getAttribute("title");
                        if (id.length() > 0)
                            form.setFormId(id.replace("NOC-", ""));
                        else
                            form.setFormId(downloadLink.split("CrfId=")[1]);
                        List<WebElement> copyRightClass = a.get(0).findElements(By.className("copyright"));
                        if (copyRightClass.size() > 0) {
                            form.setCrfModuleGuideline(text.replace("©", "").replace("™", ""));
                            form.setCopyRight(true);
                        } else {
                            form.setCrfModuleGuideline(text);
                            form.setCopyRight(false);
                        }
                    }

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

            Query searchUserQuery = new Query(Criteria.where("formId").is(form.getFormId())
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
            MyForm existingForm = mongoOperation.findOne(searchUserQuery, MyForm.class);
            if (existingForm != null) {
                log.info.add("search with query: " + searchUserQuery.toString());
                log.info.add("found existing form in migration: " + existingForm);
                log.info.add("found form on web:" + form);
            } else {
                mongoOperation.save(form);
            }
        }
        if (pageStart < pageEnd) {
            findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            findAndSaveToForms(pageStart + 1, pageEnd);
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

    private void getDomainAndSubDomain(MyForm form) {
        String crfModuleGuideline = form.getCrfModuleGuideline().trim();
        classifDriver.get("https://commondataelements.ninds.nih.gov/" + diseaseMap.get(form.getDiseaseName()));
        String subDomianSelector = "//*[normalize-space(text())=\"" + crfModuleGuideline + "\"]/ancestor::tr/preceding-sibling::tr[th[@class=\"subrow\"]][1]";
        String domianSelector = "//*[normalize-space(text())=\"" + crfModuleGuideline + "\"]/ancestor::table/preceding-sibling::a[1]";
        String domianSelector1 = "//*[normalize-space(text())=\"" + crfModuleGuideline + "\"]/ancestor::table/preceding-sibling::h3[1]/a";
        List<WebElement> subDomains = classifDriver.findElements(By.xpath(subDomianSelector));
        if (subDomains.size() > 0)
            form.setSubDomainName(cleanSubDomain(subDomains.get(0).getText().trim()));
        else {
            log.info.add("cannot find subDomainName " + crfModuleGuideline + " disease name:" + form.getDiseaseName());
        }
        List<WebElement> domains = classifDriver.findElements(By.xpath(domianSelector));
        if (domains.size() > 0) {
            form.setDomainName(domains.get(0).getText().trim());
        } else {
            List<WebElement> domains1 = classifDriver.findElements(By.xpath(domianSelector1));
            if (domains1.size() > 0) {
                form.setDomainName(domains1.get(0).getText().trim());
            } else
                log.info.add("cannot find domainName, " + form.getCrfModuleGuideline() + " disease name:" + form.getDiseaseName());
        }
    }

    private void getCdes(MyForm form, WebElement a) {
        a.click();
        hangon(5);
        switchTab(1);
        getCdesList(form);
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
                getCdesList(form);
            }
        }
        switchTabAndClose(0);
    }

    private void refreshSession() {
        switchTab(0);
        findElement(By.id("ContentPlaceHolder1_lbDownload")).click();
        hangon(10);
        switchTab(1);
    }

    private void getCdesList(MyForm form) {
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

    private boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("BODY"), text));
        return true;
    }

    private void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    private void switchTabAndClose(int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<>(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs.get(i));
    }

    private void switchTab(int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }

    private WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

}
