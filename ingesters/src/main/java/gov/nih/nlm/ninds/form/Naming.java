package gov.nih.nlm.ninds.form;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class Naming implements Comparable {
    String designation;
    String definition;
    String definitionFormat;
    String languageCode;
    Context context;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Naming naming = (Naming) o;

        if (designation != null ? !designation.equals(naming.designation) : naming.designation != null) return false;
        if (definition != null ? !definition.equals(naming.definition) : naming.definition != null) return false;
        if (definitionFormat != null ? !definitionFormat.equals(naming.definitionFormat) : naming.definitionFormat != null)
            return false;
        if (languageCode != null ? !languageCode.equals(naming.languageCode) : naming.languageCode != null)
            return false;
        return !(context != null ? !context.equals(naming.context) : naming.context != null);

    }

    @Override
    public int hashCode() {
        int result = designation != null ? designation.hashCode() : 0;
        return result;
    }

    @Override
    public String toString() {
        return "Naming{" +
                "designation='" + designation + '\'' +
                ", definition='" + definition + '\'' +
                ", definitionFormat='" + definitionFormat + '\'' +
                ", languageCode='" + languageCode + '\'' +
                ", context=" + context +
                '}';
    }


    @Override
    public int compareTo(Object o) {
        Naming n = (Naming) o;
        return this.designation.compareTo(n.designation);
    }
}
