export host_name=`hostname`

/usr/nlm/apps/gradle/bin/gradle --no-daemon --max-workers=$forkNb --parallel -DforkNb=$forkNb -DtestUrl=http://local-cde-dev-2.nlm.nih.gov:3001 -DhubUrl=${bamboo.GRID_URL} -Dtimeout=30 -Dbrowser=$bamboo_BROWSER -Djava.io.tmpdir=/usr/nlm/apps/tmp -b build.gradle test
