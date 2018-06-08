package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAttachmentsTest extends BaseAttachmentTest {

    @Test
    public void formAttachments() {
        String formName = "Skin Cancer Patient";

        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);

        goToAttachments();
        textNotPresent("Upload more files");

        logout();
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        addAttachment("melanoma.jpg");

        checkAttachmentNotReviewed();
        reviewAttachment("melanoma.jpg");

        logout();
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        setAttachmentDefault();
        logout();

        hangon(5);

        openFormInList(formName);

        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        clickElement(By.linkText(formName));

        logout();
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        removeAttachment("melanoma.jpg");
    }

}
