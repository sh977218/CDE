package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.common.test.PermissibleValueTest;
import org.testng.annotations.Test;

public class CdePermissibleValueTest extends PermissibleValueTest {
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void cdeReorderPermissibleValue() {
        reorderPermissibleValueTest("cde for test cde reorder detail tabs");
    }
}
