package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RandomDatatypeTest extends NlmCdeBaseTest {

    @Test
    public void randomDatatype() {
        String cdeName = "CTC Adverse Event Apnea Grade";
        String datatype = "java.lang.Date";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        changeDatatype(datatype);
        newCdeVersion();

        textPresent(datatype);
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Value List", By.xpath("//*[@id='Data Type']//del"));
        textPresent(datatype, By.xpath("//*[@id='Data Type']//ins"));
    }
}
