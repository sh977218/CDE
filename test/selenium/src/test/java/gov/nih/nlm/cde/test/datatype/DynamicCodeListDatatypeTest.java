package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class DynamicCodeListDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void dynamicCodeLisDatatype() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        String datatype = "Dynamic Code List";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        changeDatatype(datatype);

        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
    }

}