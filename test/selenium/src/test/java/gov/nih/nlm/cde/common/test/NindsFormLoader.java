package gov.nih.nlm.cde.common.test;

import com.google.gson.Gson;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;

import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public class NindsFormLoader {
    DateFormat format = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);
    public static WebDriverWait wait;

/*    public static void main(String[] arg) {
        NindsFormLoader runner = new NindsFormLoader();
        runner.NindsFormLoaderRun();
    }*/

    private WebDriver setUpMyDriver() {
        String hubUrl = System.getProperty("hubUrl");
        DesiredCapabilities caps = DesiredCapabilities.chrome();
        WebDriver myDriver = null;
        try {
            myDriver = new RemoteWebDriver(new URL(hubUrl), caps);

        } catch (MalformedURLException ex) {
            Logger.getLogger(NindsFormLoader.class.getName()).log(Level.SEVERE,
                    null, ex);
        }
        return myDriver;
    }

    private void goToNindsSiteAndInitialize(WebDriver myDriver, int numPageClick) {
        String url = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
        myDriver.get(url);
        textPresent("or the external links, please contact the NINDS CDE Project Officer, Joanne Odenkirchen, MPH.");
        hangon(5);
        myDriver.findElement(By.id("ContentPlaceHolder1_btnClear")).click();
        textPresent("Page: 1 of 1");
        hangon(5);
        myDriver.findElement(By.id("ddlPageSize")).click();
        myDriver.findElement(By.cssSelector("#ddlPageSize > option:nth-child(4)")).click();
        textPresent("Page: 1 of 1");
        hangon(5);
        myDriver.findElement(By.id("ContentPlaceHolder1_btnSearch")).click();
        textPresent("2517 items found.");
        textPresent("Page: 1 of 26");

        String sortHeadSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(1) > th:nth-child(1) > a";
        String imgHeadSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(1) > th:nth-child(1) > img";
        myDriver.findElement(By.cssSelector(sortHeadSelector)).click();

        Boolean imgIsPresent = false;
        while (imgIsPresent == false) {
            imgIsPresent = myDriver.findElements(By.cssSelector(imgHeadSelector)).size() > 0;
            if (imgIsPresent == true)
                break;
        }
        if (!myDriver.findElement(By.cssSelector(imgHeadSelector)).getAttribute("src").equals("image/triangleup.gif")) {
            myDriver.findElement(By.cssSelector(sortHeadSelector)).click();
            tableIsLoad(myDriver);
        }
        clickSomePages(myDriver, numPageClick);
    }

    private void clickSomePages(WebDriver myDriver, int numberPageClick) {
        tableIsLoad(myDriver);
        for (int i = 0; i < numberPageClick; i++) {
            myDriver.findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            tableIsLoad(myDriver);
        }
    }

    @Test
    public void NindsFormLoaderRun() {
        // finally collect
        Set<Form> forms = new HashSet<Form>();

        // start 5 browsers
        WebDriver myDriver1 = setUpMyDriver();
        WebDriver myDriver2 = setUpMyDriver();
        WebDriver myDriver3 = setUpMyDriver();
        WebDriver myDriver4 = setUpMyDriver();
        WebDriver myDriver5 = setUpMyDriver();
        WebDriver myDriver6 = setUpMyDriver();

        // go to ninds site, reset, click search, click header to sort and go to the page;
        goToNindsSiteAndInitialize(myDriver1, 1);
        goToNindsSiteAndInitialize(myDriver2, 6);
        goToNindsSiteAndInitialize(myDriver3, 11);
        goToNindsSiteAndInitialize(myDriver4, 15);
        goToNindsSiteAndInitialize(myDriver5, 20);
        goToNindsSiteAndInitialize(myDriver6, 25);

        // grab data from the page to page+5
        findAndSaveToForms(myDriver1, forms, 1, 5);
        findAndSaveToForms(myDriver2, forms, 6, 10);
        findAndSaveToForms(myDriver3, forms, 11, 14);
        findAndSaveToForms(myDriver4, forms, 15, 19);
        findAndSaveToForms(myDriver5, forms, 20, 24);
        findAndSaveToForms(myDriver6, forms, 25, 26);

        //saveToJson(forms);
        printForms(forms);
    }

    private boolean tableIsLoad(WebDriver myDriver) {
        String tableSelector = "#ContentPlaceHolder1_dgCRF > tbody > tr:nth-child(2) > td:nth-child(1)";
        Boolean tableIsPresent = false;
        while (tableIsPresent == false) {
            tableIsPresent = myDriver.findElements(By.cssSelector(tableSelector)).size() > 0;
            if (tableIsPresent == true)
                return true;
        }
        return false;
    }


    private void saveToJson(Set<Form> forms) {
        Gson gson = new Gson();
        String json = gson.toJson(forms);
        try {
            FileWriter writer = new FileWriter("C:\\NLMCDE\\nindsForms.json");
            writer.write(json);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void printForms(Set<Form> forms) {
        System.out.println("forms size: " + forms.size());
    }

    private void printForm(Form form) {
        System.out.println("form: " + form.toString());
    }

    private void goToMainPage(WebDriver myDriver) {
        String originalHandle = myDriver.getWindowHandle();
        for (String handle : myDriver.getWindowHandles()) {
            if (!handle.equals(originalHandle)) {
                myDriver.switchTo().window(handle);
                myDriver.close();
            }
        }
        myDriver.switchTo().window(originalHandle);
    }

    void getCdes(WebDriver myDriver, Form form, WebElement td) {
        WebElement a = null;
        try {
            a = td.findElement(By.cssSelector("a"));
        } catch (Exception e) {
            //e.printStackTrace();
        }
        if (a != null) {
            a.click();
            hangon(30);
            switchTab(myDriver, 1);
            textPresent("Item count:");
            String selector = "//tbody[tr/td/div[text() = 'CDE ID']]//tr";
            List<WebElement> trs = myDriver.findElements(By.xpath(selector));
            for (int i = 2; i < trs.size(); i++) {
                WebElement tr = trs.get(i);
                List<WebElement> tds = tr.findElements(By.cssSelector("td"));
                String cdeId = tds.get(0).getText().trim();
                form.cdes.add(cdeId);
            }
            switchTabAndClose(myDriver, 0);
        }
    }

    private void findAndSaveToForms(WebDriver myDriver, Set<Form> forms, int pageStart, int pageEnd) {
        List<WebElement> trs = myDriver.findElements(By.cssSelector("#ContentPlaceHolder1_dgCRF > tbody > tr"));
        Form.Classification classification = new Form.Classification();
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
                        Form.ReferenceDocument referenceDocument = new Form.ReferenceDocument();
                        referenceDocument.uri = href;
                        form.referenceDocuments.add(referenceDocument);
                    }
                }
                if (index == 5) {
                    getCdes(myDriver, form, td);
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
            printForm(form);
            forms.add(form);
            printForms(forms);
        }


        for (int k = pageStart; k <= pageEnd; k++) {
            String textToBePresent = "Page: " + String.valueOf(k) + " of 26";
            myDriver.findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
            textPresent(textToBePresent);
            hangon(10);
            findAndSaveToForms(myDriver, forms, k + 1, pageEnd);
        }
    }

    public boolean textPresent(String text) {
        return textPresent(text, By.cssSelector("BODY"));
    }

    public boolean textPresent(String text, By by) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(by, text));
        return true;
    }

    public void hangon(double i) {
        Sleeper.sleepTight((long) (i * 1000));
    }

    protected void switchTabAndClose(WebDriver myDriver, int i) {
        hangon(1);
        ArrayList<String> tabs2 = new ArrayList(myDriver.getWindowHandles());
        myDriver.close();
        myDriver.switchTo().window(tabs2.get(i));
    }

    protected void switchTab(WebDriver myDriver, int i) {
        hangon(1);
        ArrayList<String> tabs2 = new ArrayList(myDriver.getWindowHandles());
        myDriver.switchTo().window(tabs2.get(i));
    }
}
