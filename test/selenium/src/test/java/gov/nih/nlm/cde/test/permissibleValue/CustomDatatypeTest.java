package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CustomDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void customDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Tobacco product fail control indicator";
        String newDatatype = "Custom Datatype";
        String newDatatype2 = "Other Datatype";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        changeDatatype(newDatatype);
        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Value List", By.xpath("//*[@id='Data Type']//del"));
        textPresent(newDatatype, By.xpath("//*[@id='Data Type']//ins"));

        clickElement(By.id("pvs_tab"));
        changeDatatype(newDatatype2);
        newCdeVersion();

        goToCdeByName(cdeName);
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newDatatype, By.xpath("//*[@id='Data Type']//del"));
        textPresent(newDatatype2, By.xpath("//*[@id='Data Type']//ins"));
    }

}