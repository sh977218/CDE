package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;
import com.jayway.restassured.RestAssured;

public class AttachmentReuseTest extends BaseAttachmentTest {

    @Test
    public void reuseAttachments() {
        String cde1 = "Brief Pain Inventory (BPI) - pain area indicator";
        String cde2 = "Brief Pain Inventory (BPI) - other pain indicator";
        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde1);
        addAttachment("painLocation.jpg");
        checkAttachmentNotReviewed();
        reviewAttachment("painLocation.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde2);
        addAttachment("painLocation.jpg");        
        checkAttachmentReviewed("painLocation.jpg");

        goToCdeByName(cde1);
        removeAttachment("painLocation.jpg");   

        goToCdeByName(cde2);
        checkAttachmentReviewed("painLocation.jpg");
        
    } 

}
