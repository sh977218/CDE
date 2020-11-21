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

        goToAttachmentsForm();
        textNotPresent("Upload more files");

        logout();
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);
        goToAttachmentsForm();

        addAttachment("melanoma.jpg");

        textPresent("cannot be downloaded");
        logout();
        reviewAttachment("melanoma.jpg");

        logout();
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        setAttachmentDefaultForm();
        logout();

        hangon(5);

        openFormInList(formName);

        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        clickElement(By.linkText(formName));

        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        removeAttachmentForm("melanoma.jpg");
    }

}
