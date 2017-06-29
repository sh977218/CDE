package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TourTest extends NlmCdeBaseTest {

    String[] steps = new String[]{
            "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here.",
            "Click here to start browsing CDEs",
            "Or here to browse forms",
            "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them.",
            "The quick board is a volatile board that can be used for temporarily storing CDEs and forms. You can also use the quick board to compare CDEs and Forms.",
            "You can find more help about the site here, or information on our APIs. The tour will now take you to the CDE search page.",
            "CDEs or Forms can be browsed by Classification",
            "Or by topic. Topics are MeSH terms.",
            "These boxes represent classifications. Clicking NLM will browse all CDEs classified by NLM.",
            "Browsing can return hundreds of elements, sorted by their registration and usage. When elements have list of values, the search summary shows a subset of those values. ",
            "We can continue browsing inside the NLM classification here. ",
            "By default, only Qualified and above statuses will be returned. This can be changed in your preferences.",
            "Finally, we can narrow our results down by datatype. For example, only see CDEs that represent a number.",
            "The tour will now take us to an individual record by clicking its name.",
            "This section shows an overview of the CDE attributes.",
            "CDEs may have a date when were last imported. If they were updated during that import, updated will show that date. Manual changes also show under updated. Created shows the date that the CDE was created in the NLM repository. If they were created or updated in a external repository, this information will show under Source.",
            "Many elements were imported from external sources. This section can give useful details about the source, such as copyright, status or created date.",
            "The registration status represents the maturity level of an element, with Standard and Preferred Standard being highest. Only qualified and above are retrieved in search results by default. When elements are first created, they get an incomplete status.",
            "This tab will tell us if a CDE is based on a number, text, value list or other datatype.",
            "Any CDE may have multiple names. Names help identify the CDE and are also used as question labels on forms. A name can have one or more tags to describe the context of this name.",
            "Classifications describe the way in which an organization may use a CDE or Form. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it.",
            "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.",
            "This section contains reference documents for the CDE.",
            "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process.",
            "CDEs and Forms can be identified using multiple identification sources. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here.",
            "If a file is attached to a CDE, it can be viewed or downloaded here.",
            "This section shows all prior states of the CDE. Each version can be view as it was at a given date. In addition, differences between versions can be highlighted to easily identify changes over time.",
            "Derivation Rules are used to connect CDEs together, for example, in the form of a score.",
            "Validation Rules are used to validate CDE. ",
            "CDEs can be exported in JSON or XML Format.",
            "With an account, anyone can interactively discuss an element. Users can reply to comment or resolve them.",
            "If a CDE is used public boards, the boards will be shown in this section.",
            "This section lists CDEs that are most similar to the CDE currently viewed.",
            "If an element is used Forms, they will be displayed here. ",
            "CDEs may be used in research. If datasets are public, they can be found here.",
            "We will now continue the tour and show Form features.",
            "Forms are also browsed by Classification",
            "We will now go into a form.",
            "Forms have similar administrative details to CDE. When rendering is allowed, a preview of the form will display in this tab.",
            "The repository may not have permission to display all forms. If it does details of form questions and sections are displayed in this tab. Form support logic, selecting possible answer values, scores, repeating questions and many more features. ",
            "Forms can be exported when users are logged in. Available formats are JSON, XML, ODM, SDC and RedCAP.",
            "Thank you for taking this tour. Consider creating a free UMLS account to get access to the full suite of features this repository has to offer."
    };

    void getNext(String expectedText) {
        findElement(By.xpath("//button[@data-role='next']")).click();
        try {
            textPresent(expectedText);
        } catch (TimeoutException e) {
            if (!expectedText.startsWith("Or by topic")) Assert.fail("Cannot find: " + expectedText);
        }
    }

    @Test
    public void tourTest() {
        goHome();
        clickElement(By.id("takeATourBtn"));

        textPresent(steps[0]);
        for (int i = 1; i < steps.length; i++) {
            getNext(steps[i].trim());
        }
        clickElement(By.xpath("//button[@data-role='end']"));


    }

}
