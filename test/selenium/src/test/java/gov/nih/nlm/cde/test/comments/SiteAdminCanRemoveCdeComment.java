
package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class SiteAdminCanRemoveCdeComment extends CdeCommentTest {

    @Test
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment("Gene Versioned Genbank Accession Number Genomic Identifier", null);
    }

}
