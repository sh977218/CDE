package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;


public class AddDeleteOrgClassificationTest extends NlmCdeBaseTest {
    @Test
    public void cdeAddClassification() {
        String cdeName = "Surgical Procedure Other Anatomic Site Performed Indicator";
        String[] classificationArray1 = new String[]{"Disease", "Myasthenia Gravis", "Classification", "Supplemental"};
        String[] classificationArray2 = new String[]{"Domain", "Treatment/Intervention Data", "Therapies"};

        String[] classificationArray3 = new String[]{"Disease"};
        String[] classificationArray4 = new String[]{"Disease", "Myasthenia Gravis"};
        String[] classificationArray5 = new String[]{"Disease", "Myasthenia Gravis", "Classification"};

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToClassification();
        addClassificationByTree("NINDS", classificationArray1);
        checkRecentlyUsedClassifications("NINDS", classificationArray1);

        addClassificationByTree("NINDS", classificationArray2);


        addExistingClassification("NINDS", classificationArray3);
        addExistingClassification("NINDS", classificationArray4);
        addExistingClassification("NINDS", classificationArray5);
        addExistingClassification("NINDS", classificationArray1);

        openAuditClassification("NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
        textPresent(nlm_username);
        textPresent("Surgical Procedure Other Anatomic Site Performed Indicator");
        textPresent("add NINDS > Disease > Myasthenia Gravis > Classification > Supplemental");
    }
}
