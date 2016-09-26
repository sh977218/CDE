package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.testng.annotations.Test;

public class AttachmentReuseTest extends BaseAttachmentTest {

    @Test
    public void reuseAttachments() {
        String cde1 = "Brief Pain Inventory (BPI) - pain area indicator";
        String cde2 = "Brief Pain Inventory (BPI) - other pain indicator";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde1);
        showAllTabs();
        addAttachment("painLocation.jpg");
        checkAttachmentNotReviewed();
        reviewAttachment("painLocation.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde2);
        showAllTabs();
        addAttachment("painLocation.jpg");
        checkAttachmentReviewed("painLocation.jpg");

        goToCdeByName(cde1);
        showAllTabs();
        removeAttachment("painLocation.jpg");

        goToCdeByName(cde2);
        showAllTabs();
        checkAttachmentReviewed("painLocation.jpg");

    }

}
