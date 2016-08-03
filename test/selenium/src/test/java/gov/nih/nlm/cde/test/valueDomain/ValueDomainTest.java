package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValueDomainTest extends NlmCdeBaseTest {

    @Test
    public void randomDatatype() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "CTC Adverse Event Apnea Grade";
        goToCdeByName(cdeName);
        clickElement(By.linkText("Permissible Values"));
        clickElement(By.id("editDatatype"));
        findElement(By.name("datatypeFreeText")).clear();
        findElement(By.name("datatypeFreeText")).sendKeys("java.lang.Date");
        clickElement(By.id("confirmDatatype"));
        newCdeVersion();

        Assert.assertTrue(textPresent("java.lang.Date"));
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("java.lang.Date");
    }

    @Test
    public void textDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.id("editDatatype"));
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Text");
        clickElement(By.id("confirmDatatype"));

        clickElement(By.xpath("//div[@id='textMinLength']//i[@title='Edit']"));
        clickElement(By.xpath("//div[@id='textMaxLength']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='textMinLength']//input")).sendKeys("789");
        findElement(By.xpath("//div[@id='textMaxLength']//input")).sendKeys("987");
        clickElement(By.cssSelector("#textMinLength .fa-check"));
        clickElement(By.cssSelector("#textMaxLength .fa-check"));
        newCdeVersion();

        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='historyCompareLeft_Text']"));
        textPresent("987", By.xpath("//*[@id='historyCompareLeft_Text']"));

        textPresent("Text", By.xpath("//*[@id='historyCompareLeft_Value Type']"));
        textPresent("Value List", By.xpath("//*[@id='historyCompareRight_Value Type']"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//div[@id='textRegex']//i[@title='Edit']"));
        clickElement(By.xpath("//div[@id='textRule']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='textRule']//input")).sendKeys("newre");
        findElement(By.xpath("//div[@id='textRegex']//input")).sendKeys("newrule");
        clickElement(By.cssSelector("#textRule .fa-check"));
        clickElement(By.cssSelector("#textRegex .fa-check"));

        clickElement(By.xpath("//div[@id='textMinLength']//i[@title='Edit']"));
        clickElement(By.xpath("//div[@id='textMaxLength']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='textMinLength']//input")).clear();
        findElement(By.xpath("//div[@id='textMaxLength']//input")).clear();
        findElement(By.xpath("//div[@id='textMinLength']//input")).sendKeys("123");
        findElement(By.xpath("//div[@id='textMaxLength']//input")).sendKeys("321");
        clickElement(By.cssSelector("#textMinLength .fa-check"));
        clickElement(By.cssSelector("#textMaxLength .fa-check"));

        newCdeVersion();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 3);
        textPresent("123", By.xpath("//*[@id='historyCompare_pvs_0']"));
        textPresent("321", By.xpath("//*[@id='historyCompare_pvs_0']"));
        textPresent("789", By.xpath("//*[@id='historyCompare_pvs_1']"));
        textPresent("987", By.xpath("//*[@id='historyCompare_pvs_1']"));
    }
}
