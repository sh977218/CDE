package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NumberDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void numberDatatype() {
        String cdeName = "Resource Utilization Group Version IV (RUG IV) - alpha-numeric code";
        String datatype = "Number";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        changeDatatype(datatype);

        clickElement(By.xpath("//*[@id='datatypeNumberMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMin']//input")).sendKeys("123");
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeNumberMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMax']//input")).sendKeys("456");
        clickElement(By.xpath("//*[@id='datatypeNumberMax']//button[contains(@class,'fa fa-check')]"));
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='Data Type Number Minimal Value']//ins"));
        textPresent("456", By.xpath("//*[@id='Data Type Number Maximal Value']//ins"));
        textPresent("Number", By.xpath("//*[@id='Data Type']//ins"));
        textPresent("Text", By.xpath("//*[@id='Data Type']//del"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToPermissibleValues();
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMin']//input")).sendKeys("789");
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.xpath("//*[@id='datatypeNumberMax']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id='datatypeNumberMax']//input")).sendKeys("987");
        clickElement(By.xpath("//*[@id='datatypeNumberMax']//button[contains(@class,'fa fa-check')]"));

        newCdeVersion();

        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='Data Type Number Minimal Value']//ins"));
        textPresent("987", By.xpath("//*[@id='Data Type Number Maximal Value']//ins"));
        textPresent("123", By.xpath("//*[@id='Data Type Number Minimal Value']//del"));
        textPresent("456", By.xpath("//*[@id='Data Type Number Maximal Value']//del"));
    }

}