package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

public class NindsFormLoader implements Runnable {
    String url = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
    DateFormat format = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);
    WebDriver driver;
    WebDriverWait wait;
    Collection forms;
    int pageStart;
    int pageEnd;

    public NindsFormLoader(Collection f, int ps, int pe) {
        System.setProperty("webdriver.chrome.driver", "./chromedriver.exe");
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, 60);
        this.forms = f;
        this.pageStart = ps;
        this.pageEnd = pe;
    }

    @Override
    public void run() {
        goToNindsSiteAndGoToPageOf(pageStart);
        findAndSaveToForms(forms, pageStart, pageEnd);
        driver.close();
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
        textPresent("2517 items found.");
        textPresent("Page: 1 of 26");

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
            textPresent("Page: 26 of 26");
            goToPageFromLast(pageStart);
        } else {
            for (int i = 1; i < pageStart; i++) {
                hangon(10);
                findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
                textPresent("Page: " + i + " of 26");
            }
        }
    }

    void goToPageFromLast(int pageStart) {
        for (int n = 26; n > pageStart; n--) {
            findElement(By.id("ContentPlaceHolder1_lbtnPrev")).click();
            int num = n - 1;
            String s = "Page: " + num + " of 26";
            textPresent(s);
        }
    }

    void findAndSaveToForms(Collection<MyForm> forms, int pageStart, int pageEnd) {
        String textToBePresent = "Page: " + String.valueOf(pageStart) + " of 26";
        textPresent(textToBePresent);
        List<WebElement> trs = driver.findElements(By.cssSelector("#ContentPlaceHolder1_dgCRF > tbody > tr"));
        for (int i = 1; i < trs.size(); i++) {
            List<WebElement> tds = trs.get(i).findElements(By.cssSelector("td"));
            MyForm form = new MyForm();
            int index = 1;
            for (int j = 0; j < tds.size(); j++) {
                WebElement td = tds.get(j);
                String text = td.getText().replace("\"", " ").trim();
                if (index == 1)
                    form.crfModuleGuideline = text;
                if (index == 2)
                    form.description = text;
                if (index == 3) {
                    List<WebElement> img = td.findElements(By.cssSelector("img"));
                    if (img.size() > 0) {
                        form.copyRight = "true";
                    }
                }
                if (index == 4) {
                    hangon(5);
                    List<WebElement> a = td.findElements(By.cssSelector("a"));
                    if (a.size() > 0) {
                        String href = a.get(0).getAttribute("href");
                        form.downloads = href;
                    }
                }
                if (index == 5) {
                    List<WebElement> as = td.findElements(By.cssSelector("a"));
                    if (as.size() > 0) {
                        WebElement a = as.get(0);
                        getCdes(form, a);
                    }
                }
                if (index == 6)
                    form.versionNum = text;
                if (index == 7)
                    form.versionDate = text;
                if (index == 8) {
                    form.diseaseName = text;
                }
                if (index == 9) {
                    form.subDiseaseName = text;
                }
                index++;
            }
            forms.add(form);
        }
        if (pageStart < pageEnd) {
            findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            findAndSaveToForms(forms, pageStart + 1, pageEnd);
        }
    }

    boolean tableIsLoad() {
        String tableSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(2) > td:nth-child(1)";
        Boolean tableIsPresent = false;
        while (tableIsPresent == false) {
            tableIsPresent = driver.findElements(By.cssSelector(tableSelector)).size() > 0;
            if (tableIsPresent == true)
                return true;
        }
        return false;
    }

    void getCdes(MyForm form, WebElement a) {
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
                findElement(By.xpath("//*[@id=\"viewer_ctl01_ctl01_ctl05_ctl00\"]/tbody/tr/td/input")).click();
                hangon(5);
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
            for (int j = 0; j < tds.size(); j++) {
                WebElement td = tds.get(j);
                String text = td.getText().replace("\"", " ").trim();
                if (index == 1) {
                    cde.cdeId = text;
                }
                if (index == 2) {
                    cde.cdeName = text;
                }
                if (index == 3) {
                    cde.varibleName = text;
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
                    cde.instructions = text;
                }
                if (index == 10) {
                    cde.referrences = text;
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
                    List<WebElement> img = td.findElements(By.cssSelector("img"));
                    if (img.size() > 0) {
                        cde.copyRight = "true";
                    }
                }
                if (index == 18) {
                    cde.subDomain = text;
                }
                if (index == 19) {
                    cde.domain = text;
                }
                if (index == 20) {
                    cde.previousTitle = text;
                }
                if (index == 21) {
                    cde.size = text;
                }
                if (index == 22) {
                    cde.inputRestrictions = text;
                }
                if (index == 23) {
                    cde.minValue = text;
                }
                if (index == 24) {
                    cde.maxValue = text;
                }
                if (index == 25) {
                    cde.measurementType = text;
                }
                if (index == 26) {
                    cde.loincID = text;
                }
                if (index == 27) {
                    cde.snomed = text;
                }
                if (index == 28) {
                    cde.cadsrID = text;
                }
                if (index == 29) {
                    cde.cdiscID = text;
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

}
