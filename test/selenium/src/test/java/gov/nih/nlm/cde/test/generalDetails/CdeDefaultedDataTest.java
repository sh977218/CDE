package gov.nih.nlm.cde.test.generalDetails;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeDefaultedDataTest extends NlmCdeBaseTest {
    @Test
    public void cdeDefaultedDataTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/deView?tinyId=xffvfZ3Pqe4");
        textPresent("Height or length alternative measurement");
        findElement(By.xpath("//dt[contains(.,'Created By:')]/following-sibling::dd[1][contains(.,'NIH CDE Repository Team')]"));
        findElement(By.xpath("//dt[contains(.,'Updated By:')]/following-sibling::dd[1][contains(.,'NIH CDE Repository Team')]"));
        assertNoElt(By.xpath("//dt[contains(.,'Created:')]/following-sibling::dd[1][contains(.,'1969')]"));
    }

    @Test
    public void cdeDefaultedDataNotLoggedInTest() {
        driver.get(baseUrl + "/deView?tinyId=xffvfZ3Pqe4");
        textPresent("Height or length alternative measurement");
        assertNoElt(By.xpath("//dt[contains(.,'Created By:')]/following-sibling::dd[1][contains(.,'NIH CDE Repository Team')]"));
        assertNoElt(By.xpath("//dt[contains(.,'Updated By:')]/following-sibling::dd[1][contains(.,'NIH CDE Repository Team')]"));
        assertNoElt(By.xpath("//dt[contains(.,'Created:')]/following-sibling::dd[1][contains(.,'1969')]"));
    }
}
