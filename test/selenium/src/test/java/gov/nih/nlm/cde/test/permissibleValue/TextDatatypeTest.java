package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class TextDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void textDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id='datatypeSelect']//i[contains(@class,'fa fa-edit')]"));
        new Select(findElement(By.xpath("//*[@id='datatypeSelect']//select"))).selectByVisibleText("Text");
        clickElement(By.xpath("//*[@id='datatypeSelect']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*//*[@id='datatypeTextMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*//*[@id='datatypeTextMin']//i[contains(@class,'fa fa-edit')]")).sendKeys("789");
        clickElement(By.xpath("//*//*[@id='datatypeTextMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*//*[@id='datatypeTextMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*//*[@id='datatypeTextMax']//i[contains(@class,'fa fa-edit')]")).sendKeys("987");
        clickElement(By.xpath("//*//*[@id='datatypeTextMax']//button[contains(@class,'fa fa-check')]"));

        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='historyCompareLeft_Text']"));
        textPresent("987", By.xpath("//*[@id='historyCompareLeft_Text']"));

        textPresent("Text", By.xpath("//*[@id='historyCompareLeft_Value Type']"));
        textPresent("Value List", By.xpath("//*[@id='historyCompareRight_Value Type']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*//*[@id='datatypeTextRegex']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*//*[@id='datatypeTextRegex']//i[contains(@class,'fa fa-edit')]")).sendKeys("newrule");
        clickElement(By.xpath("//*//*[@id='datatypeTextRegex']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*//*[@id='datatypeTextRule']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*//*[@id='datatypeTextRule']//i[contains(@class,'fa fa-edit')]")).sendKeys("newre");
        clickElement(By.xpath("//*//*[@id='datatypeTextRule']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*//*[@id='datatypeTextMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*//*[@id='datatypeTextMin']//i[contains(@class,'fa fa-edit')]")).sendKeys("123");
        clickElement(By.xpath("//*//*[@id='datatypeTextMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*//*[@id='datatypeTextMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*//*[@id='datatypeTextMax']//i[contains(@class,'fa fa-edit')]")).sendKeys("321");
        clickElement(By.xpath("//*//*[@id='datatypeTextMax']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        goToCdeByName(cdeName);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='historyCompareLeft_Data Type Text']//*[contains(@class,'minLength')]"));
        textPresent("321", By.xpath("//*[@id='historyCompareLeft_Data Type Text']//*[contains(@class,'maxLength')]"));
        textPresent("789", By.xpath("//*[@id='historyCompareRight_Data Type Text']//*[contains(@class,'minLength')]"));
        textPresent("987", By.xpath("//*[@id='historyCompareRight_Data Type Text']//*[contains(@class,'maxLength')]"));
    }
}
