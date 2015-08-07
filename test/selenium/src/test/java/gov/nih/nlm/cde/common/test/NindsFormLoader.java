package gov.nih.nlm.cde.common.test;

import com.google.gson.Gson;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.io.FileWriter;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public class NindsFormLoader extends NlmCdeBaseTest {
    DateFormat format = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);

    @Test
    public void NindsFormLoaderRun() {
        driver.manage().window().setSize(new Dimension(2000, 10000));
        Set<Form> forms = new HashSet<Form>();
        String url = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
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
        hangon(5);
        findAndSaveToForms(forms);
        for (int i = 2; i < 27; i++) {
            String textToBePresent = "Page: " + String.valueOf(i) + " of 26";
            nextPage(textToBePresent, forms);
        }
        saveToJson(forms);
        printForms(forms);
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

    private void goToMainPage() {
        String originalHandle = driver.getWindowHandle();
        for (String handle : driver.getWindowHandles()) {
            if (!handle.equals(originalHandle)) {
                driver.switchTo().window(handle);
                driver.close();
            }
        }

        driver.switchTo().window(originalHandle);
    }

    private void nextPage(String textToBePresent, Set<Form> forms) {
        findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
        textPresent(textToBePresent);
        hangon(10);
        findAndSaveToForms(forms);
    }

    void getCdes(Form form, WebElement td) {
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

    private void findAndSaveToForms(Set<Form> forms) {
        List<WebElement> trs = driver.findElements(By.cssSelector("#ContentPlaceHolder1_dgCRF > tbody > tr"));
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
                    getCdes(form, td);
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
    }

}
