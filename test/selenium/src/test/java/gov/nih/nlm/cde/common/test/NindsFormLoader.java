package gov.nih.nlm.cde.common.test;

import com.google.gson.Gson;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class NindsFormLoader extends NlmCdeBaseTest {

    @Test
    public void NindsFormLoaderRun() {
        ArrayList<Form> forms = new ArrayList<Form>();

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

        findAndSaveToList(forms);
        for (int i = 2; i < 27; i++) {
            String textToBePresent = "Page: " + String.valueOf(i) + " of 26";
            nextPage(textToBePresent, forms);
        }
        saveToJson(forms);
        printInfo(forms);
    }

    private void saveToJson(ArrayList<Form> forms) {
        Gson gson = new Gson();

        // convert java object to JSON format,
        // and returned as JSON formatted string
        String json = gson.toJson(forms);

        try {
            //write converted json data to a file named "file.json"
            FileWriter writer = new FileWriter("C:\\NLMCDE\\nindsForms.json");
            writer.write(json);
            writer.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    private void printInfo(ArrayList<Form> forms) {
        System.out.println("forms size:" + forms.size());
    }

    private void nextPage(String textToBePresent, ArrayList<Form> forms) {
        findElement(By.id("ContentPlaceHolder1_lbtnNext")).click();
        textPresent(textToBePresent);
        findAndSaveToList(forms);
    }

    private void findAndSaveToList(ArrayList<Form> forms) {
        List<WebElement> trs = driver.findElements(By.cssSelector("#ContentPlaceHolder1_dgCRF > tbody > tr"));

        for (int i = 1; i < trs.size(); i++) {
            List<WebElement> tds = trs.get(i).findElements(By.cssSelector("td"));
            Form form = new Form();
            int index = 1;
            for (WebElement td : tds) {
                if (index == 1)
                    form.setName(td.getText());
                if (index == 2)
                    form.setDescription(td.getText());
                if (index == 4)
                    form.setDownload(td.getText());
                if (index == 5)
                    form.setCdes(td.getText());
                if (index == 6)
                    form.setVersionNum(td.getText());
                if (index == 7)
                    form.setVersionDate(td.getText());
                if (index == 8)
                    form.setDiseaseName(td.getText());
                if (index == 9)
                    form.setSubDiseaseName(td.getText());
                index++;
            }
            forms.add(form);
        }
    }

}
