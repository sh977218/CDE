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
        String cdeId = "593eff071acca22de85b0b29";
        String datatype = "Text";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        changeDatatype(datatype);
        propertyEditText("datatypeTextMin", "789");
        propertyEditText("datatypeTextMax", "987");
        newCdeVersion();

        // check update cde has fixed datatype;
        Assert.assertFalse(get(baseUrl + "/deById/" + cdeId).asString().contains("valueMeaningName"));

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("789", By.xpath("//*[@id='Data Type Text Minimal Length']//td-ngx-text-diff"));
        textPresent("987", By.xpath("//*[@id='Data Type Text Maximal Length']//td-ngx-text-diff"));
        textPresent("Text", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        textPresent("Value List", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToPermissibleValues();
        propertyEditText("datatypeTextRegex", "newRegex");
        propertyEditText("datatypeTextRule", "newRule");
        propertyEditText("datatypeTextMin", "123");
        propertyEditText("datatypeTextMax", "321");
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
