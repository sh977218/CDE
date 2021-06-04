package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.testng.annotations.Test;

public class AttachmentReuseTest extends BaseAttachmentTest {

    @Test
    public void reuseAttachments() {
        String cde1 = "Brief Pain Inventory (BPI) - pain area indicator";
        String cde2 = "Brief Pain Inventory (BPI) - other pain indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde1);
        goToAttachments();

        addAttachment("painLocation.jpg");

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde2);
        goToAttachments();

        addAttachment("painLocation.jpg");

        goToCdeByName(cde1);
        removeAttachment("painLocation.jpg");

        goToCdeByName(cde2);
    }

}
