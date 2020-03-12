package gov.nih.nlm.cde.test.datatype;

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

        clickElement(By.xpath("//*[@id='datatypeNumberMin']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeNumberMin']//input")).sendKeys("123");
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//button/mat-icon[normalize-space() = 'check']"));

        clickElement(By.xpath("//*[@id='datatypeNumberMax']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeNumberMax']//input")).sendKeys("456");
        clickElement(By.xpath("//*[@id='datatypeNumberMax']//button/mat-icon[normalize-space() = 'check']"));
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='Data Type Number Minimal Value']//td-ngx-text-diff"));
        textPresent("456", By.xpath("//*[@id='Data Type Number Maximal Value']//td-ngx-text-diff"));
        textPresent("Number", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        textPresent("Text", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToPermissibleValues();
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeNumberMin']//input")).sendKeys("789");
        clickElement(By.xpath("//*[@id='datatypeNumberMin']//button/mat-icon[normalize-space() = 'check']"));

        clickElement(By.xpath("//*[@id='datatypeNumberMax']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeNumberMax']//input")).sendKeys("987");
        clickElement(By.xpath("//*[@id='datatypeNumberMax']//button/mat-icon[normalize-space() = 'check']"));

        newCdeVersion();

        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='Data Type Number Minimal Value']//td-ngx-text-diff"));
        textPresent("987", By.xpath("//*[@id='Data Type Number Maximal Value']//td-ngx-text-diff"));
        textPresent("123", By.xpath("//*[@id='Data Type Number Minimal Value']//td-ngx-text-diff"));
        textPresent("456", By.xpath("//*[@id='Data Type Number Maximal Value']//td-ngx-text-diff"));
    }

}