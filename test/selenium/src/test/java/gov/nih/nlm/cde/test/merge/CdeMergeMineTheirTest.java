package gov.nih.nlm.cde.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeMergeMineTheirTest extends NlmCdeBaseTest {
    @Test
    public void CdeMergeMineTheir() {
        String cdeName1 = "Smoking Cessation Other Method Specify Text";
        String cdeName2 = "Smoking History Ind";
        mustBeLoggedInAs(cabigAdmin_username, password);
        addCdeToCompare(cdeName1, cdeName2);
        textNotPresent("Merge Data Element");
    }
}
