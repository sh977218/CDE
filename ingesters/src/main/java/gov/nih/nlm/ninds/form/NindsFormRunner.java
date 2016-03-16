package gov.nih.nlm.ninds.form;

public class NindsFormRunner {

    public static void main(String[] args) {
        // args --pages 1,2,3
        // --pages 1-4
        // --thread 5

        int startingPage = 1;

        int nbOfThreads = 27;
        Thread[] t = new Thread[nbOfThreads];

        for (int i = 0; i < nbOfThreads; i++) {
            NindsFormLoader loader = new NindsFormLoader(i+startingPage,i+startingPage);
            t[i] = new Thread(loader);
        }

        for (Thread aT : t) {
            aT.start();
        }
        for (Thread aT : t) {
            try {
                aT.join();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
