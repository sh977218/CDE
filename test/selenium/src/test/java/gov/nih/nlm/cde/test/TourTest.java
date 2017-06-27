package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourTest extends NlmCdeBaseTest {
    void getNext(String expectedText) {
        clickElement(By.xpath("//button[@data-role='next']"));
        textPresent(expectedText);
    }

    @Test
    public void tourTest() {
        mustBeLoggedOut();
        clickElement(By.id("takeATourBtn"));

        textPresent("Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections.");
        getNext("This menu will take you back to the CDE search page");
        getNext("This menu will take you to the Form search page");
        getNext("Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them.");
        getNext("The quick board is a volatile board for doing quick comparisons or CDE downloads.");
        getNext("Here's where you can find more documentation about this site or start this tour again.");

        getNext("Personalize your search results. Include more registration statuses or configure how results are shown.");
        getNext("This button allow users to post comments on any given CDEs.");
        getNext("This section shows an overview of the CDE attributes.");
        getNext("Click here to see what type of value are allowed by this CDE.");
        getNext("Any CDE may have multiple names, often given within a particular context.");
        getNext("Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it.");
        getNext("Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.");
        getNext("This section contains reference documents for the CDE.");
        getNext("This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process.");
        getNext("CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here.");
        getNext("If a file is attached to a CDE, it can be view or downloaded here.");
        getNext("This section shows all prior states of the CDE.");
        getNext("Derivation Rules are used to connect CDEs together, for example, in the form of a score.");
        getNext("Validation Rules are used to validate CDE.");
        getNext("This section shows the where this CDE load from.");
        getNext("This section shows the status of the CDE, and optionally dates and/or administrative status.");
        getNext("If a CDE is used in a public board, the board will be shown in this section.");
        getNext("This section lists CDEs that are most similar to the CDE currently viewed.");
        getNext("If an element is used in a Form, it will be displayed here.");
        getNext("This section lists all data sets this CDE has.");

        textPresent("Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections.");
        getNext("This menu will take you back to the CDE search page");
        getNext("This menu will take you to the Form search page");
        getNext("Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them.");
        getNext("The quick board is a volatile board for doing quick comparisons or CDE downloads.");
        getNext("Here's where you can find more documentation about this site or start this tour again.");
        getNext("Personalize your search results. Include more registration statuses or configure how results are shown.");
        getNext("Enter one or more search terms. For example, search for \"Ethnicity\".");
        getNext("This is your search result. It will show a combination of most relevant and higher status CDEs first.");
        getNext("The plus sign will add a CDE to your Quick Board.");
        getNext("The grid view shows all search results (max 1000) in a single page. From there, results can be downloaded in CSV format.");
        getNext("If your screen is small and the filters on the left end bother you, you can hide them here.");
        getNext("Navigate the classification tree to filter results by context, domain, or other type of data element classification or grouping.");
        getNext("You can add a second classification restriction by clicking this plus sign.");
        getNext("See which filter are applied to your query");
        getNext("Restrict search to one or more statuses here.");
        clickElement(By.xpath("//button[@data-role='end']"));


    }

}
