package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourTest extends NlmCdeBaseTest {

    String[] steps = new String[]{
            "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections.",
            "This menu will take you back to the CDE search page",
            "This menu will take you to the Form search page",
            "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them.",
            "The quick board is a volatile board for doing quick comparisons or CDE downloads.",
            "Here's where you can find more documentation about this site or start this tour again.",
            "This button shows all classifications",
            "This button shows all topics",
            "This button shows search result of NLM",
            "This section shows the search result.",
            "This section shows classification filter",
            "This section shows status filter",
            "This section shows data type filter",
            "This is element name",
            "This button allow users to add this element to quick board.",
            "This button allow users to add this element to user's board.",
            "This button allow users to export this element to varies format.",
            "This section shows an overview of the CDE attributes.",
            "Click here to see what type of value are allowed by this CDE.",
            "Any CDE may have multiple names, often given within a particular context.",
            "Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it.",
            "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.",
            "This section contains reference documents for the CDE.",
            "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process.",
            "CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here.",
            "If a file is attached to a CDE, it can be view or downloaded here.",
            "This section shows all prior states of the CDE.",
            "Derivation Rules are used to connect CDEs together, for example, in the form of a score.",
            "Validation Rules are used to validate CDE. ",
            "This section shows the where this CDE load from.",
            "This section shows the status of the CDE, and optionally dates and/or administrative status.",
            "If a CDE is used in a public board, the board will be shown in this section.",
            "This section lists CDEs that are most similar to the CDE currently viewed.",
            "If an element is used in a Form, it will be displayed here. ",
            "This section lists all data sets this CDE has.",
            "If the form use questions, they will be here.",
    };

    void getNext(String expectedText) {
        clickElement(By.xpath("//button[@data-role='next']"));
        textPresent(expectedText);
    }

    @Test
    public void tourTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goHome();
        clickElement(By.id("takeATourBtn"));

        textPresent(steps[0]);
        for (int i = 1; i < steps.length; i++) {
            getNext(steps[i].trim());
        }
        clickElement(By.xpath("//button[@data-role='end']"));


    }

}
