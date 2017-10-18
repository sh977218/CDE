package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeclineCdeAttachment extends BaseAttachmentTest {

    @Test
    public void declineCdeAttachment() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Sedative sleep pill frequency";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        goToAttachments();

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Alcohol use frequency");
        String attachmentName = "painLocationInapr.png";

        addAttachment(attachmentName);
        checkAttachmentNotReviewed();
        declineAttachment(attachmentName);

        goToCdeByName(cdeName);

        goToAttachments();
        textNotPresent("glass.jpg");
    }

}
