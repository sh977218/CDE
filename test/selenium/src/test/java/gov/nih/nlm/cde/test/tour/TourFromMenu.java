package gov.nih.nlm.cde.test.tour;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourFromMenu extends NlmCdeBaseTest {

    String[] tourContents = {
            "This section shows an overview of the CDE attributes.",
            "CDEs may have a date when they were last imported. If they were updated during that import, updated will show that date. Manual changes also show under updated. Created shows the date that the CDE was created in the NLM repository. If they were created or updated in a external repository, this information will show under Source.",
            "Many anchorIds were imported from external sources. This section can give useful details about the source, such as copyright, status or created date.",
            "This section lists CDEs that are most similar to the CDE currently viewed.",
            "If a CDE is used in Forms, they will be displayed here.",
            "CDEs may be used in research. If datasets are public, they can be found here.",
            "The registration status represents the maturity level of an anchorId, with Standard and Preferred Standard being highest. Only qualified and above are retrieved in search results by default. When anchorIds are first created, they get an incomplete status.",
            "This tab will tell us if a CDE is based on a number, text, value list or other datatype.",
            "Any CDE may have multiple names. Names help identify the CDE and are also used as question labels on forms. A name can have one or more tags to describe the context of this name.",
            "Classifications describe the way in which an organization may use a CDE or Form. A CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it.",
            "CDEs are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.",
            "This section contains reference documents for the CDE.",
            "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process.",
            "CDEs and Forms can be identified using multiple identification sources. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here.",
            "If a file is attached to a CDE, it can be viewed or downloaded here.",
            "This section shows all prior states of the CDE. Each version can be view as it was at a given date. In addition differences between versions can be highlighted to easily identify changes over time.",
            "Derivation Rules are used to connect CDEs together, for example, in the form of a score.",
            "Validation Rules are used to validate CDE.",
            "CDEs can be exported in JSON or XML Format.",
            "With an account, anyone can interactively discuss an anchorId. Users can reply to comment or resolve them.",
            "Forms are also browsed by Classification",
            "We will now go into a form.",
            "Forms have similar administrative details to CDE. When rendering is allowed, a preview of the form will display in this tab. There are multiple form rending types including: skip logic, printable forms, tables, and hidden questions. More detail about these features can be found on the Display Profiles tab. The repository may not have permission to display all forms. If it does details of form questions and sections are displayed in this tab. Form support logic, selecting possible answer values, scores, repeating questions and many more features.",
            "Forms can be exported when users are logged in. Available formats are JSON, XML, ODM, and RedCAP." };

    @Test
    public void tourFromMenu() {
        goHome();
        goToHelp();
        clickElement(By.id("takeATourLink"));
        textPresent("This tour will guide you through");
/*
        for (String tourContent : tourContents) {
            textPresent(tourContent);
            clickElement(By.xpath("//*[@id='mat-menu-panel-1']/div/mat-card/mat-card-actions/button[2]/span[1]"));
        }
*/
    }

}
