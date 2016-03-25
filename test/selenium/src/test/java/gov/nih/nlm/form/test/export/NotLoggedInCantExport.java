package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class NotLoggedInCantExport extends NlmCdeBaseTest {

    @Test
    public void notLoggedInCantExport() {
        mustBeLoggedOut();
        goToFormSearch();

    }

}
