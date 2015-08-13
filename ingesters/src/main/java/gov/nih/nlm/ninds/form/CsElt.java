package gov.nih.nlm.ninds.form;

import java.util.HashSet;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class CsElt {
    HashSet<CsElt> elements = new HashSet<>();
    String name;

    public CsElt() {

    }

    public CsElt(String n, HashSet<CsElt> e) {
        this.name = n;
        if (e != null) {
            this.elements = e;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CsElt csElt = (CsElt) o;
        if (csElt.name.equals(this.name)) {
            if (this.elements.size() == 0 && ((CsElt) o).elements.size() == 0)
                return true;
            if (this == null || this.elements.size() == 0) {
                System.out.println("wrong");
            }
            CsElt next = this.elements.iterator().next();
            if (next != null) {
                if (csElt == null || csElt.elements.size() == 0) {
                    System.out.println("wrong");
                }
                csElt.elements.add(next);
            }
            return true;
        }

        if (elements != null ? !elements.equals(csElt.elements) : csElt.elements != null) return false;
        return !(name != null ? !name.equals(csElt.name) : csElt.name != null);

    }

    @Override
    public int hashCode() {
        return (name != null ? name.hashCode() : 0);
    }
}
