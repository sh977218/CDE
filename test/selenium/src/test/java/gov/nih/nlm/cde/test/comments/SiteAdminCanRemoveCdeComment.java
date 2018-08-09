
package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class SiteAdminCanRemoveCdeComment extends NlmCdeBaseTest {

    @Test
    public void siteAdminCanRemoveCdeCommentTest() {
        String cdeName = "Gene Versioned Genbank Accession Number Genomic Identifier";
        String commentText = "Another Inappropriate Comment";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        removeComment(commentText);
    }

}
