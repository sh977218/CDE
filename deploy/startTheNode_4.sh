
node ./test/testLoginServer.js > testLogin.log 2>&1 & sleep 5
# ./test/testServer.sh > testLogin.log 2>&1 & sleep 5
echo $! > testLogin.pid

cd build
touch test.log;
chmod -R 755 $PWD

npm i nyc

node --max-old-space-size=8192 node_modules/nyc/bin/nyc --reporter html npm start > test.log 2>&1 &

#npm run start:coverage
sleep 10
echo $! > test.pid
chmod -R 755 $PWD
