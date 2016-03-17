package gov.nih.nlm.ninds.form;

import com.google.gson.Gson;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.*;

public class NindsFormLoader implements Runnable {
    Map<String, String> diseaseMap = new HashMap<String, String>();
    String url = "https://commondataelements.ninds.nih.gov/CRF.aspx";
    WebDriver driver, classifDriver;
    WebDriverWait wait;
    Collection<MyForm> forms = new ArrayList<MyForm>();
    int pageStart;
    int pageEnd;
    Date today = new Date();

    public NindsFormLoader(int ps, int pe) {
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

        classifDriver = new ChromeDriver();

    }

    @Override
    public void run() {
        goToNindsSiteAndGoToPageOf(pageStart);
        findAndSaveToForms(forms, pageStart, pageEnd);
        saveToJson(forms);
        driver.close();
        classifDriver.close();
    }


    void goToNindsSiteAndGoToPageOf(int pageStart) {
        driver.get(url);
        textPresent("or the external links, please contact the NINDS CDE Project Officer, Joanne Odenkirchen, MPH.");
        hangon(10);
        findElement(By.id("ContentPlaceHolder1_btnClear")).click();
        textPresent("Page: 1 of 1");
        hangon(10);
        findElement(By.id("ddlPageSize")).click();
        findElement(By.cssSelector("#ddlPageSize > option:nth-child(4)")).click();
        textPresent("Page: 1 of 1");
        hangon(10);
        findElement(By.id("ContentPlaceHolder1_btnSearch")).click();
        textPresent("2605 items found.");
        textPresent("Page: 1 of 27");
        String sortHeadSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(1) > th:nth-child(1) > a";
        String imgHeadSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(1) > th:nth-child(1) > img";
        findElement(By.cssSelector(sortHeadSelector)).click();
        String sortImg = findElement(By.cssSelector(imgHeadSelector)).getAttribute("src");
        while (!sortImg.contains("image/triangleup.gif")) {
            findElement(By.cssSelector(sortHeadSelector)).click();
            tableIsLoad();
            hangon(5);
            sortImg = findElement(By.cssSelector(imgHeadSelector)).getAttribute("src");
        }
        tableIsLoad();
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

    void goToPageFromLast(int pageStart) {
        for (int n = 27; n > pageStart; n--) {
            findElement(By.id("ContentPlaceHolder1_lbtnPrev")).click();
            int num = n - 1;
            String s = "Page: " + num + " of 27";
            textPresent(s);
        }
    }

    void findAndSaveToForms(Collection<MyForm> forms, int pageStart, int pageEnd) {
        System.out.println("running page: " + pageStart);
        String textToBePresent = "Page: " + String.valueOf(pageStart) + " of 27";
        textPresent(textToBePresent);
        List<WebElement> trs = driver.findElements(By.cssSelector("#ContentPlaceHolder1_dgCRF > tbody > tr"));
        for (int i = 1; i < trs.size(); i++) {
            List<WebElement> tds = trs.get(i).findElements(By.cssSelector("td"));
            MyForm form = new MyForm();
            int index = 1;
            for (WebElement td : tds) {
                String text = td.getText().replace("\"", " ").trim();
                if (index == 1) {
                    form.crfModuleGuideline = text;
                    hangon(5);
                    List<WebElement> a = td.findElements(By.cssSelector("a"));
                    if (a.size() > 0) {
                        form.downloadLink = a.get(0).getAttribute("href");
                        form.id = a.get(0).getAttribute("title");
                        List<WebElement> copyRightClass = a.get(0).findElements(By.className("copyright"));
                        if (copyRightClass.size() > 0) {
                            form.crfModuleGuideline = form.crfModuleGuideline.replace("©", "");
                            form.copyRight = true;
                        } else {
                            form.copyRight = false;
                        }
                    }

                }
                if (index == 2)
                    form.description = text;
                if (index == 3) {
                    List<WebElement> as = td.findElements(By.cssSelector("a"));
                    if (as.size() > 0) {
                        WebElement a = as.get(0);
                        if (form.cdes.size() > 0 && form.diseaseName.contains("Traumatic Brain Injury") && form.subDiseaseName.contains("Moderate/Severe TBI: Rehabilitation"))
                            System.out.println('x');
                        getCdes(form, a);
                    }
                }
                if (index == 4)
                    form.versionNum = text;
                if (index == 5)
                    form.versionDate = text;
                if (index == 6) {
                    form.diseaseName = text;
                }
                if (index == 7) {
                    form.subDiseaseName = text;
                }
                index++;
            }
            getDomainAndSubDomain(form);
            forms.add(form);
        }
        if (pageStart < pageEnd) {
            findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            findAndSaveToForms(forms, pageStart + 1, pageEnd);
        }
    }

    void getDomainAndSubDomain(MyForm form) {
        classifDriver.get("https://commondataelements.ninds.nih.gov/" + diseaseMap.get(form.diseaseName));
        String subDomianSelector = "//*[normalize-space(text())=\"" + form.crfModuleGuideline
                + "\"]/ancestor::tr/preceding-sibling::tr[th[@class=\"subrow\"]][1]";
        String domianSelector = "//*[normalize-space(text())=\"" + form.crfModuleGuideline
                + "\"]/ancestor::table/preceding-sibling::a[1]";
        List<WebElement> subDomains = driver.findElements(By.xpath(subDomianSelector));
        if (subDomains.size() > 0)
            form.subDomainName = subDomains.get(0).getText().trim();
        List<WebElement> domains = driver.findElements(By.xpath(domianSelector));
        if (domains.size() > 0)
            form.domainName = domains.get(0).getText().trim();
    }

    boolean tableIsLoad() {
        String tableSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(2) > td:nth-child(1)";
        Boolean tableIsPresent;
        while (true) {
            tableIsPresent = driver.findElements(By.cssSelector(tableSelector)).size() > 0;
            if (tableIsPresent)
                return true;
        }
    }

    void getCdes(MyForm form, WebElement a) {
        a.click();
        switchTab(1);
        textPresent(today.getMonth() + "-" + today.getDay() + "-" + today.getYear());
        getCdesList(form);
        String cdesTotalPageStr = findElement(By.id("viewer_ctl01_ctl01_ctl04")).getText();
        int cdesTotalPage = Integer.valueOf(cdesTotalPageStr);
        if (cdesTotalPage > 1) {
            for (int j = 1; j < cdesTotalPage; j++) {
                if (j == 5) {
                    refreshSession();
                }
                findElement(By.xpath("//*[@id=\"viewer_ctl01_ctl01_ctl05_ctl00\"]/tbody/tr/td/input")).click();
                textPresent("Page " + j + " of " + cdesTotalPage);
                getCdesList(form);
            }
        }
        switchTabAndClose(0);
    }

    void refreshSession() {
        switchTab(0);
        findElement(By.id("ContentPlaceHolder1_lbDownload")).click();
        hangon(10);
        switchTab(1);
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
                    form.subDomainName = text;
                }
                if (index == 19 + noise) {
                    cde.domain = text;
                    form.domainName = text;
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
            form.cdes.add(cde);
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
        ArrayList<String> tabs = new ArrayList(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs.get(i));
    }

    void switchTab(int i) {
        ArrayList<String> tabs = new ArrayList(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }

    WebElement findElement(By by) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return driver.findElement(by);
    }

    public void saveToJson(Collection<MyForm> forms) {
        Gson gson = new Gson();
        String json = gson.toJson(forms);
        String fileName = "C:\\NLMCDE\\nindsForms" + pageStart + "-" + pageEnd + ".json";
        try {
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(
                    new FileOutputStream(fileName), "UTF-8"));
            out.write(json);
            out.close();
        } catch (IOException e) {
            System.out.println("exception of writing to file.");
            e.printStackTrace();
        } finally {
            System.out.println(fileName + " done.");
            System.out.println("forms size after info: " + forms.size());

        }
    }
}