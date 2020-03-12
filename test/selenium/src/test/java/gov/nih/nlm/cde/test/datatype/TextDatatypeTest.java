package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class TextDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void textDatatype() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency";
        String datatype = "Text";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        changeDatatype(datatype);

        clickElement(By.xpath("//*[@id='datatypeTextMin']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeTextMin']//input")).sendKeys("789");
        clickElement(By.xpath("//*[@id='datatypeTextMin']//button/mat-icon[normalize-space() = 'check']"));

        clickElement(By.xpath("//*[@id='datatypeTextMax']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeTextMax']//input")).sendKeys("987");
        clickElement(By.xpath("//*[@id='datatypeTextMax']//button/mat-icon[normalize-space() = 'check']"));
        newCdeVersion();

        // check update cde has fixed datatype;
        Assert.assertFalse(get(baseUrl + "/deById/593eff071acca22de85b0b29").asString().contains("valueMeaningName"));

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='Data Type Text Minimal Length']//td-ngx-text-diff"));
        textPresent("987", By.xpath("//*[@id='Data Type Text Maximal Length']//td-ngx-text-diff"));
        textPresent("Text", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        textPresent("Value List", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToPermissibleValues();
        clickElement(By.xpath("//*[@id='datatypeTextRegex']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeTextRegex']//input")).sendKeys("newRegex");
        clickElement(By.xpath("//*[@id='datatypeTextRegex']//button/mat-icon[normalize-space() = 'check']"));

        clickElement(By.xpath("//*[@id='datatypeTextRule']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeTextRule']//input")).sendKeys("newRule");
        clickElement(By.xpath("//*[@id='datatypeTextRule']//button/mat-icon[normalize-space() = 'check']"));

        clickElement(By.xpath("//*[@id='datatypeTextMin']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeTextMin']//input")).sendKeys("123");
        clickElement(By.xpath("//*[@id='datatypeTextMin']//button/mat-icon[normalize-space() = 'check']"));

        clickElement(By.xpath("//*[@id='datatypeTextMax']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id='datatypeTextMax']//input")).sendKeys("321");
        clickElement(By.xpath("//*[@id='datatypeTextMax']//button/mat-icon[normalize-space() = 'check']"));
        newCdeVersion();

        goToCdeByName(cdeName);

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='Data Type Text Minimal Length']//td-ngx-text-diff"));
        textPresent("789", By.xpath("//*[@id='Data Type Text Minimal Length']//td-ngx-text-diff"));
        textPresent("321", By.xpath("//*[@id='Data Type Text Maximal Length']//td-ngx-text-diff"));
        textPresent("987", By.xpath("//*[@id='Data Type Text Maximal Length']//td-ngx-text-diff"));
        textPresent("newRegex", By.xpath("//*[@id='Data Type Text Regex']//td-ngx-text-diff"));
        textPresent("newRule", By.xpath("//*[@id='Data Type Text Rule']//td-ngx-text-diff"));

    }
}
