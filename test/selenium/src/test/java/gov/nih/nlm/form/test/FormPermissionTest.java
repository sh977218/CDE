package gov.nih.nlm.form.test;

import org.testng.annotations.Test;


public class FormPermissionTest extends BaseFormTest {

    @Test
    public void formPermission() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Fixed Dynamometry";

        goToFormByName(formName);
        goToFormDescription();

        String sec1 = "test permission section";
        addSectionBottom(sec1, null);
        textPresent(sec1);
        saveFormEdit();
        newFormVersion();

        logout();
        mustBeLoggedInAs(ctepEditor_username, password);
        goToFormByName(formName);
        formEditNotAvailable();
    }

}
