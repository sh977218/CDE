package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormGeneralInfoTest extends BaseFormTest {

    @Test
    public void formGeneralInformationTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Section Inside Section Form");
        goToGeneralDetail();
        findElement(By.xpath("//dt[contains(.,'Created:')]/following-sibling::dd[1][contains(.,'05/09/2016 @ 5:21PM')]"));
        findElement(By.xpath("//dt[contains(.,'Updated:')]/following-sibling::dd[1][contains(.,'05/11/2016 @ 11:11AM')]"));
        findElement(By.xpath("//dt[contains(.,'Created By:')]/following-sibling::dd[1][contains(.,'testAdmin')]"));
        findElement(By.xpath("//dt[contains(.,'Updated By:')]/following-sibling::dd[1][contains(.,'testAdmin')]"));
    }

    @Test
    public void formGeneralInformationLoggedOutTest() {
        goToFormByName("Section Inside Section Form");
        goToGeneralDetail();
        findElement(By.xpath("//dt[contains(.,'Created:')]/following-sibling::dd[1][contains(.,'05/09/2016 @ 5:21PM')]"));
        findElement(By.xpath("//dt[contains(.,'Updated:')]/following-sibling::dd[1][contains(.,'05/11/2016 @ 11:11AM')]"));
        assertNoElt(By.xpath("//dt[contains(.,'Created By:')]/following-sibling::dd[1][contains(.,'testAdmin')]"));
        assertNoElt(By.xpath("//dt[contains(.,'Updated By:')]/following-sibling::dd[1][contains(.,'testAdmin')]"));
    }

}
