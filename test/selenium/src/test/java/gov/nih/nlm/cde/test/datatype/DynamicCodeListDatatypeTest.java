package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DynamicCodeListDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void dynamicCodeListDatatype() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        String datatype = "Dynamic Code List";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToDataTypeDetails();
        changeDatatype(datatype);
        selectMatSelect("","Select system name", "VSAC");
        findElement(By.id("dynamicListCode")).sendKeys("some OID");
        hangon(1);

        goToCdeByName(cdeName);
        goToDataTypeDetails();

        goToHistory();
        selectHistoryAndCompare(1, 2);
    }
}
