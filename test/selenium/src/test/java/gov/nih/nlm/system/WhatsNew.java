package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WhatsNew extends NlmCdeBaseTest {

    @Test
    public void whatsNew() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToArticles();

        nonNativeSelect("", "Article Key", "whatsNew");

        clickElement(By.xpath("//mat-icon[normalize-space() = 'edit']"));
        hangon(5);
        clickElement(By.xpath("//button[. = 'Plain Text']"));
        hangon(5);

        findElement(By.cssSelector("textArea")).sendKeys("<h3>June 28, 2018</h3><p>" +
                "<ul>" +
                "<li>Improvements to Smart on FHIR Apps.&nbsp;\n" +
                "<ul>" +
                "<li>When you create a Smart on FHIR App, you&nbsp;now have the option to map codes in the CDE Reposistory to other codes, such as local codes for examples.&nbsp;</li>" +
                "<li>We now support Compound Observations. For example, blood pressure.&nbsp;</li>" +
                "</ul>" +
                "</li>" +
                "</ul>" +
                "<h3>June 11, 2018</h3>" +
                "<ul>" +
                "<li>UI Improvements to form display profiles</li>" +
                "</ul>" +
                "<h3>June 5, 2018</h3>" +
                "<ul>" +
                "<li>Support for AccessGUIID UDI / DI as metadata on form collection.&nbsp;</li>" +
                "<li>Various improvements to accessibility</li>" +
                "<li>Modifying table preferences is now done directly in the search result tables.&nbsp;</li>" +
                "</ul>" +
                "<h3>May 17, 2018</h3>" +
                "<ul>" +
                "<li>Support for Permissible values in Smart on FHIR Apps.&nbsp;</li>" +
                "</ul>" +
                "<h3>May 9, 2018</h3>" +
                "<ul>" +
                "<li>Usability improvements in form editor. Drop areas highlight and skip logic autocomplete on names and codes.&nbsp;</li>" +
                "<li>Org Admins can now see all their drafts in one place.&nbsp;</li>" +
                "<li>Question answers can now be sorted.</li>" +
                "<li>Export Forms as FHIR Questionnaires.</li>" +
                "</ul>" +
                "<h3>April 26, 2018</h3>" +
                "<ul>" +
                "<li>You can now create Smart on FHIR Apps for your EHR. Contact the CDE team if you would like to&nbsp;get started.&nbsp;&nbsp;</li>" +
                "<li>See changes made in current draft. Deleting a draft prompts for confirmation.&nbsp;</li>" +
                "<li>Split Names and Definitions</li>" +
                "<li>When curating CDEs, you can now import all PVs from one CDE to another</li>" +
                "<li>UI Improvements to the history compare</li>" +
                "</ul>");

        hangon(5);


        clickElement(By.xpath("//button[text() = 'Rich Text']"));

        hangon(5);
        clickElement(By.xpath("//mat-icon[normalize-space() = 'check']"));
        checkAlert("Saved");
        logout();
        goToHelp();
        clickElement(By.id("whatsNewLink"));
        textPresent("June 28, 2018");
        textPresent("Usability improvements in form editor.");
    }

}
