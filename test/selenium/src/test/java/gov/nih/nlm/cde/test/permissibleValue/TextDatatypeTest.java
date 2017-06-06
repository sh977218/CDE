package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TextDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void textDatatype() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency";
        String datatype = "Text";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        changeDatatype(datatype);

        clickElement(By.xpath("//*[@id='datatypeTextMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeTextMin']//input")).sendKeys("789");
        clickElement(By.xpath("//*[@id='datatypeTextMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeTextMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeTextMax']//input")).sendKeys("987");
        clickElement(By.xpath("//*[@id='datatypeTextMax']//button[contains(@class,'fa fa-check')]"));

        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='Data Type Text Minimal Length']//ins"));
        textPresent("987", By.xpath("//*[@id='Data Type Text Maximal Length']//ins"));
        textPresent("Text", By.xpath("//*[@id='Data Type']//ins"));
        textPresent("Value List", By.xpath("//*[@id='Data Type']//del"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeTextRegex']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeTextRegex']//input")).sendKeys("newRegex");
        clickElement(By.xpath("//*[@id='datatypeTextRegex']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeTextRule']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeTextRule']//input")).sendKeys("newRule");
        clickElement(By.xpath("//*[@id='datatypeTextRule']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeTextMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeTextMin']//input")).sendKeys("123");
        clickElement(By.xpath("//*[@id='datatypeTextMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeTextMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeTextMax']//input")).sendKeys("321");
        clickElement(By.xpath("//*[@id='datatypeTextMax']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        goToCdeByName(cdeName);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='Data Type Text Minimal Length']//ins"));
        textPresent("789", By.xpath("//*[@id='Data Type Text Minimal Length']//del"));
        textPresent("321", By.xpath("//*[@id='Data Type Text Maximal Length']//ins"));
        textPresent("987", By.xpath("//*[@id='Data Type Text Maximal Length']//del"));
        textPresent("newRegex", By.xpath("//*[@id='Data Type Text Regex']//ins"));
        textPresent("newRule", By.xpath("//*[@id='Data Type Text Rule']//ins"));

    }
}
