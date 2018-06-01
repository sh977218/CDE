package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.testng.annotations.Test;

public class AttachmentReuseTest extends BaseAttachmentTest {

    @Test
    public void reuseAttachments() {
        System.out.println("reuseAttach 1");
        String cde1 = "Brief Pain Inventory (BPI) - pain area indicator";
        String cde2 = "Brief Pain Inventory (BPI) - other pain indicator";
        System.out.println("reuseAttach 2");
        mustBeLoggedInAs(ninds_username, password);
        System.out.println("reuseAttach 3");
        goToCdeByName(cde1);
        System.out.println("reuseAttach 4");
        addAttachment("painLocation.jpg");
        System.out.println("reuseAttach 5");
        checkAttachmentNotReviewed();
        System.out.println("reuseAttach 6");
        reviewAttachment("painLocation.jpg");
        System.out.println("reuseAttach 7");

        mustBeLoggedInAs(ninds_username, password);
        System.out.println("reuseAttach 8");
        goToCdeByName(cde2);
        System.out.println("reuseAttach 9");

        addAttachment("painLocation.jpg");
        System.out.println("reuseAttach 10");
        checkAttachmentReviewed("painLocation.jpg");
        System.out.println("reuseAttach 11");

        goToCdeByName(cde1);
        System.out.println("reuseAttach 12");

        removeAttachment("painLocation.jpg");
        System.out.println("reuseAttach 13");

        goToCdeByName(cde2);
        System.out.println("reuseAttach 14");

        checkAttachmentReviewed("painLocation.jpg");
        System.out.println("reuseAttach 15");

    }

}
