package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public class NindsFormLoader implements Runnable {
    String url = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
    DateFormat format = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);
    WebDriver driver;
    WebDriverWait wait;
    Set forms;
    int pageStart;
    int pageEnd;

    public NindsFormLoader(Set f, int ps, int pe) {
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
    }

    void goToNindsSiteAndGoToPageOf(int pageStart) {
        driver.get(url);
        textPresent("or the external links, please contact the NINDS CDE Project Officer, Joanne Odenkirchen, MPH.");
        hangon(5);
        findElement(By.id("ContentPlaceHolder1_btnClear")).click();
        textPresent("Page: 1 of 1");
        hangon(5);
        findElement(By.id("ddlPageSize")).click();
        findElement(By.cssSelector("#ddlPageSize > option:nth-child(4)")).click();
        textPresent("Page: 1 of 1");
        hangon(5);
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
        for (int i = 1; i <= pageStart; i++) {
            findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            hangon(15);
        }
    }

    void findAndSaveToForms(Set<Form> forms, int pageStart, int pageEnd) {
        List<WebElement> trs = driver.findElements(By.cssSelector("#ContentPlaceHolder1_dgCRF > tbody > tr"));
        Classification classification = new Classification();
        for (int i = 1; i < trs.size(); i++) {
            List<WebElement> tds = trs.get(i).findElements(By.cssSelector("td"));
            Form form = new Form();
            int index = 1;
            for (int j = 0; j < tds.size(); j++) {
                WebElement td = tds.get(j);
                String text = td.getText();
                if (index == 1)
                    form.naming.designation = text;
                if (index == 2)
                    form.naming.definition = text;
                if (index == 3) {
                    WebElement img = null;
                    try {
                        img = td.findElement(By.cssSelector("img"));
                    } catch (Exception e) {
                    }
                    if (img != null) {
                        form.isCopyrighted = true;
                    }
                }
                if (index == 4) {
                    WebElement a = td.findElement(By.cssSelector("a"));
                    if (a != null) {
                        String href = a.getAttribute("href");
                        ReferenceDocument referenceDocument = new ReferenceDocument();
                        referenceDocument.uri = href;
                        form.referenceDocuments.add(referenceDocument);
                    }
                }
                if (index == 5) {
                    getCdes(driver, form, td);
                }
                if (index == 6)
                    form.version = text;
                if (index == 7)
                    try {
                        form.updated = format.parse(text);
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                if (index == 8) {
                    form.disease.name = text;
                }
                if (index == 9) {
                    form.subDisease.name = text;
                }
                index++;
            }
            forms.add(form);
        }
        for (int k = pageStart; k <= pageEnd; k++) {
            String textToBePresent = "Page: " + String.valueOf(k) + " of 26";
            findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            tableIsLoad();
            findAndSaveToForms(forms, k + 1, pageEnd);
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

    void goToMainPage() {
        String originalHandle = driver.getWindowHandle();
        for (String handle : driver.getWindowHandles()) {
            if (!handle.equals(originalHandle)) {
                driver.switchTo().window(handle);
                driver.close();
            }
        }
        driver.switchTo().window(originalHandle);
    }

    void getCdes(WebDriver driver, Form form, WebElement td) {
        WebElement a = null;
        try {
            a = td.findElement(By.cssSelector("a"));
        } catch (Exception e) {
            //e.printStackTrace();
        }
        if (a != null) {
            a.click();
            hangon(30);
            switchTab(1);
            textPresent("Item count:");
            String selector = "//tbody[tr/td/div[text() = 'CDE ID']]//tr";
            List<WebElement> trs = driver.findElements(By.xpath(selector));
            for (int i = 2; i < trs.size(); i++) {
                WebElement tr = trs.get(i);
                List<WebElement> tds = tr.findElements(By.cssSelector("td"));
                String cdeId = tds.get(0).getText().trim();
                form.cdes.add(cdeId);
            }
            switchTabAndClose(0);
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
