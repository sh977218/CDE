package gov.nih.nlm.ninds.form;

import com.google.gson.Gson;

import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class NindsFormRunner {

    public static void main(String[] args) {
        List<Form> forms = new CopyOnWriteArrayList<Form>();
        Thread[] t = new Thread[6];

        NindsFormLoader runner1 = new NindsFormLoader(forms, 1, 5);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(forms, 6, 10);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(forms, 11, 15);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(forms, 16, 20);
        t[3] = new Thread(runner4);
        NindsFormLoader runner5 = new NindsFormLoader(forms, 21, 25);
        t[4] = new Thread(runner5);
        NindsFormLoader runner6 = new NindsFormLoader(forms, 26, 26);
        t[5] = new Thread(runner6);

        for (int i = 0; i < t.length; i++) {
            t[i].start();
        }
        for (int i = 0; i < t.length; i++) {
            try {
                t[i].join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        Form form = new Form();
        form.naming.designation = "forms size: " + forms.size();
        forms.add(form);
        saveToJson(forms);
    }

    public static void saveToJson(List<Form> forms) {
        Gson gson = new Gson();
        String json = gson.toJson(forms);
        try {
            FileWriter writer = new FileWriter("C:\\NLMCDE\\nindsForms.json");
            writer.write(json);
            writer.close();
        } catch (IOException e) {
            System.out.println("exception of writing to file.");
            e.printStackTrace();
        } finally {
            System.out.println("All done. forms size: " + forms.size());
        }
    }
}
