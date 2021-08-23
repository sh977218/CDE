package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;


public class AddDeleteOrgClassificationTest extends NlmCdeBaseTest {
    @Test
    public void cdeAddClassification() {
        String cdeName = "Surgical Procedure Other Anatomic Site Performed Indicator";
        String[] classificationArray1 = new String[]{"Disease", "Amyotrophic Lateral Sclerosis", "Classification", "Core"};
        String[] classificationArray2 = new String[]{"Domain", "Additional Instruments", "Additional Instruments"};
        String[] classificationArray3 = new String[]{"Domain"};
        String[] classificationArray4 = new String[]{"Domain", "Assessments and Examinations"};
        String[] classificationArray5 = new String[]{"Domain", "Assessments and Examinations", "Hospital/Care Management"};

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToClassification();
        addClassificationByTree("NINDS", classificationArray1);
        checkRecentlyUsedClassifications("NINDS", classificationArray1);

        addClassificationByTree("NINDS", classificationArray2);

        addExistingClassification("NINDS", classificationArray3);
        addClassificationByTree("NINDS", classificationArray4);
        addClassificationByTree("NINDS", classificationArray5);
        addExistingClassification("NINDS", classificationArray1);

        openAuditClassification("NINDS > Disease > Amyotrophic Lateral Sclerosis > Classification > Core");
        textPresent(nlm_username);
        textPresent("Surgical Procedure Other Anatomic Site Performed Indicator");
        textPresent("add NINDS > Disease > Amyotrophic Lateral Sclerosis > Classification > Core");
    }
}
