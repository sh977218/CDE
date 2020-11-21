package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.common.test.RegStatusTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FormRegStatusTest extends RegStatusTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

    @Test
    public void retire() {
        retireForm("Form Retire Test", ctepCurator_username);
    }

    @Test
    public void nlmPromotesToStandardForm() {
        nlmPromotesToStandardForm("Form Standard Test");
    }

    public void version() {
        newFormVersion();
    }

}
