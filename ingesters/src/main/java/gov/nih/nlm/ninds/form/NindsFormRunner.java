package gov.nih.nlm.ninds.form;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class NindsFormRunner {

    public static void main(String[] args) {
        Thread[] t = new Thread[1];

        NindsFormLoader runner1 = new NindsFormLoader(21, 21);
        t[0] = new Thread(runner1);

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
    }
}
