
package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

public class PvTest extends NlmCdeBaseTest {

    @Test
    @Parameters("Subdural hematoma mixed density CSF-like collection indicator")
    public void changePermissibleValue(String cdeName) {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        String value = " added to pv";
        String codeName = " added to code name";

        editPermissibleValueByIndex(0, value, codeName, null, null, null);
        newCdeVersion("Changed PV");

        textPresent(value);
        textPresent(codeName);

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Absent " + value, By.xpath("//*[@id='historyCompareLeft_Data Type Value List_0_0']"));
        textPresent("Absent " + codeName, By.xpath("//*[@id='historyCompareLeft_Data Type Value List_0_0']"));
        textPresent("Indeterminate", By.xpath("//*[@id='historyCompareLeft_Data Type Value List_0_0']"));
    }
}
