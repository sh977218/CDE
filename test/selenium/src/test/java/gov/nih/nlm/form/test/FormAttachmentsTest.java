package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAttachmentsTest extends BaseAttachmentTest {

    @Test
    public void formAttachments() {
        String formName = "Skin Cancer Patient";

        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");

        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        addAttachment("melanoma.jpg");
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();
        checkAttachmentNotReviewed();
        reviewAttachment("melanoma.jpg");

        hangon(5);

        openFormInList(formName);

        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.linkText("View Full Detail")).click();

        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);
        removeAttachment("melanoma.jpg");
    }

}