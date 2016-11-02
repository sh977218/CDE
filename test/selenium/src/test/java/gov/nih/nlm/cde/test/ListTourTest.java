package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ListTourTest extends TourTest {

    @Test
    public void listTour() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("Registration Status");
        clickElement(By.linkText("Help"));
        clickElement(By.linkText("Take a tour"));
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
