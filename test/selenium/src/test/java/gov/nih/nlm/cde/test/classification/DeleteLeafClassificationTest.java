package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteLeafClassificationTest extends NlmCdeBaseTest {

    @Test
    public void deleteLeafClassification() {
        String cdeName = "Spectroscopy geometry location not applicable indicator";
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        findElement(By.xpath("//*[@id='Domain,Assessments and Examinations,Imaging Diagnostics']"));
        removeClassificationMethod(new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics"});

        findElement(By.xpath("//*[@id='Domain,Assessments and Examinations']"));
        removeClassificationMethod(new String[]{"Disease", "Myasthenia Gravis"});
        textNotPresent("Myasthenia Gravis");
        openClassificationAudit("NINDS > Disease > Myasthenia Gravis");
        textPresent("classMgtUser");
        textPresent("delete NINDS > Disease > Myasthenia Gravis");
    }

}
