package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.testng.annotations.Test;

public class DeclineCdeAttachment extends BaseAttachmentTest {

    @Test
    public void declineCdeAttachment() {
        String cdeName = "Alcohol use frequency";
        mustBeLoggedInAs(ninds_username, password);
        String attachmentName = "ml.jpg";
        goToCdeByName("Alcohol use frequency");
        goToAttachments();

        addAttachment(attachmentName);
        textPresent("cannot be downloaded");
        declineAttachment(attachmentName);

        goToCdeByName(cdeName);

        goToAttachments();
        textNotPresent("ml.jpg");
    }

}
