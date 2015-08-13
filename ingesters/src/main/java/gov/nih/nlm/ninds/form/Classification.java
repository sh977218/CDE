package gov.nih.nlm.ninds.form;

import java.util.HashSet;

/**
 * Created by huangs8 on 8/7/2015.
 */

public class Classification {
    String stewardOrg = "NINDS";
    Boolean workingGroup;
    HashSet<CsElt> elements = new HashSet<>();

    public Classification() {
    }
}