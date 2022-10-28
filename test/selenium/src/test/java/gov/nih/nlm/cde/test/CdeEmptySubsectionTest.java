package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

import gov.nih.nlm.system.NlmCdeBaseTest;

public class CdeEmptySubsectionTest extends NlmCdeBaseTest {

    String[] subSectionsHideWhenEmpty = new String[]{
            "Classification",
            "Related Documents",
            "Properties",
            "Identifiers",
            "Attachments",
            "History",
            "Rules",
            "Derivation Rules",
    };
    String[] subSectionsShowWhenEmpty = new String[]{
            "CDE Summary",
            "Status",
            "Concepts",
            "Submission Information",
    };

    @Test
    public void cdeEmptySubsection() {
        String cdeName = "Empty sub sections CDE";
        goToCdeByName(cdeName);
        for (String subsection : subSectionsHideWhenEmpty) {
            textNotPresent(subsection, By.cssSelector(".toc-inner"));
        }
        for (String subsection : subSectionsShowWhenEmpty) {
            textPresent(subsection, By.cssSelector(".toc-inner"));
        }
        // 'Other Names & Definitions' section will be hide if there is no naming or definition, but this CDE has a name & a designation.
        textPresent("Other Names & Definitions", By.cssSelector(".toc-inner"));
    }
}
