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
        goToDataTypeDetails();
        changeDatatype(datatype);
        propertyEditText("datatypeNumberMin", "123");
        propertyEditText("datatypeNumberMax", "456");
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("123", By.xpath("//*[@id='Data Type Number Minimal Value']//td-ngx-text-diff"));
        textPresent("456", By.xpath("//*[@id='Data Type Number Maximal Value']//td-ngx-text-diff"));
        textPresent("Number", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        textPresent("Text", By.xpath("//*[@id='Data Type']//td-ngx-text-diff"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToDataTypeDetails();
        propertyEditText("datatypeNumberMin", "789");
        propertyEditText("datatypeNumberMax", "987");
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