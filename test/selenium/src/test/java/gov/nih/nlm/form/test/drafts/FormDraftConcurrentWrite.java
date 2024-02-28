package gov.nih.nlm.form.test.drafts;

import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDraftConcurrentWrite extends BaseFormTest {

    @Test
    public void formDraftConcurrentWrite() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form = "Activities of Daily Living and Gait";
        goToFormByName(form);
        goToFormDescription();
        newTab();
        switchTab(1);
        goToFormByName(form);
        goToFormDescription();

        String change1 = "Section Top";
        String change2 = "Section Bottom";
        switchTab(0);
        addSectionTop(change1);
        switchTab(1);
        addSectionBottom(change2, null);
        textPresent("Save Error. Please reload and redo.");
        textNotPresent(change1);
        textPresent(change2);
        refresh();
        saveFormEdit();
        textPresent(change1);
        textNotPresent(change2);
    }
}
