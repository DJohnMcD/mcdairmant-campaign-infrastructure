2025-06-29T18:36:32.241483197Z ==> Cloning from https://github.com/DJohnMcD/mcdairmant-campaign-infrastructure
2025-06-29T18:36:33.077746105Z ==> Checking out commit 54b3381610d23b71f353dc6955f301b35d79e344 in branch main
2025-06-29T18:36:35.561558028Z #1 [internal] load build definition from Dockerfile
2025-06-29T18:36:35.561587099Z #1 transferring dockerfile: 1.22kB done
2025-06-29T18:36:35.561590039Z #1 DONE 0.0s
2025-06-29T18:36:35.561592199Z 
2025-06-29T18:36:35.561595379Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2025-06-29T18:36:36.012146056Z #2 ...
2025-06-29T18:36:36.012166626Z 
2025-06-29T18:36:36.012170606Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2025-06-29T18:36:36.012174457Z #3 DONE 0.0s
2025-06-29T18:36:36.162312994Z 
2025-06-29T18:36:36.162327685Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2025-06-29T18:36:37.617862556Z #2 DONE 2.2s
2025-06-29T18:36:37.617879916Z 
2025-06-29T18:36:37.617883947Z #4 [internal] load .dockerignore
2025-06-29T18:36:37.617887467Z #4 transferring context: 690B done
2025-06-29T18:36:37.617890557Z #4 DONE 0.0s
2025-06-29T18:36:37.617893197Z 
2025-06-29T18:36:37.617896227Z #5 [internal] load build context
2025-06-29T18:36:37.617899227Z #5 DONE 0.0s
2025-06-29T18:36:37.617901787Z 
2025-06-29T18:36:37.617905037Z #6 [ 1/11] FROM docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11
2025-06-29T18:36:37.617907857Z #6 resolve docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11 done
2025-06-29T18:36:37.768215499Z #6 ...
2025-06-29T18:36:37.7682334Z 
2025-06-29T18:36:37.76823861Z #5 [internal] load build context
2025-06-29T18:36:37.76824264Z #5 transferring context: 486.56kB done
2025-06-29T18:36:37.76824661Z #5 DONE 0.1s
2025-06-29T18:36:37.7682502Z 
2025-06-29T18:36:37.76825451Z #6 [ 1/11] FROM docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11
2025-06-29T18:36:37.874449409Z #6 sha256:98c4889b578e94078411d6c14fe8f5daa0303d43e82bbf84d5787ab657c42428 0B / 445B 0.2s
2025-06-29T18:36:37.87446894Z #6 sha256:2506673f55362e86b6c8a2ab9c01541ae636887386c92d06e01286d3ddd83871 0B / 1.26MB 0.2s
2025-06-29T18:36:37.87447385Z #6 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 0B / 42.99MB 0.2s
2025-06-29T18:36:38.004823209Z #6 sha256:fe07684b16b82247c3539ed86a65ff37a76138ec25d380bd80c869a1a4c73236 0B / 3.80MB 0.2s
2025-06-29T18:36:38.12973915Z #6 sha256:98c4889b578e94078411d6c14fe8f5daa0303d43e82bbf84d5787ab657c42428 445B / 445B 0.4s done
2025-06-29T18:36:38.871127274Z #6 sha256:2506673f55362e86b6c8a2ab9c01541ae636887386c92d06e01286d3ddd83871 1.26MB / 1.26MB 1.2s done
2025-06-29T18:36:38.871144925Z #6 sha256:fe07684b16b82247c3539ed86a65ff37a76138ec25d380bd80c869a1a4c73236 3.80MB / 3.80MB 1.1s done
2025-06-29T18:36:38.871149205Z #6 extracting sha256:fe07684b16b82247c3539ed86a65ff37a76138ec25d380bd80c869a1a4c73236
2025-06-29T18:36:39.021220561Z #6 extracting sha256:fe07684b16b82247c3539ed86a65ff37a76138ec25d380bd80c869a1a4c73236 0.1s done
2025-06-29T18:36:39.322222265Z #6 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 8.39MB / 42.99MB 1.5s
2025-06-29T18:36:39.472409244Z #6 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 16.78MB / 42.99MB 1.7s
2025-06-29T18:36:40.225606516Z #6 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 25.17MB / 42.99MB 2.4s
2025-06-29T18:36:40.527054881Z #6 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 33.55MB / 42.99MB 2.7s
2025-06-29T18:36:40.660123239Z #6 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 42.99MB / 42.99MB 2.9s done
2025-06-29T18:36:40.811239211Z #6 extracting sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd
2025-06-29T18:36:42.434811452Z #6 extracting sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 1.7s done
2025-06-29T18:36:42.434837252Z #6 extracting sha256:2506673f55362e86b6c8a2ab9c01541ae636887386c92d06e01286d3ddd83871 0.0s done
2025-06-29T18:36:42.434844052Z #6 DONE 4.8s
2025-06-29T18:36:42.584903728Z 
2025-06-29T18:36:42.584936159Z #6 [ 1/11] FROM docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11
2025-06-29T18:36:42.584942169Z #6 extracting sha256:98c4889b578e94078411d6c14fe8f5daa0303d43e82bbf84d5787ab657c42428 0.0s done
2025-06-29T18:36:42.584946079Z #6 DONE 4.8s
2025-06-29T18:36:42.584949749Z 
2025-06-29T18:36:42.584954069Z #7 [ 2/11] RUN apk add --no-cache python3 make g++
2025-06-29T18:36:42.58495766Z #7 0.045 fetch https://dl-cdn.alpinelinux.org/alpine/v3.22/main/x86_64/APKINDEX.tar.gz
2025-06-29T18:36:42.739870688Z #7 0.147 fetch https://dl-cdn.alpinelinux.org/alpine/v3.22/community/x86_64/APKINDEX.tar.gz
2025-06-29T18:36:43.038627785Z #7 0.446 (1/29) Installing libstdc++-dev (14.2.0-r6)
2025-06-29T18:36:43.165476425Z #7 0.609 (2/29) Installing jansson (2.14.1-r0)
2025-06-29T18:36:43.165492416Z #7 0.619 (3/29) Installing zstd-libs (1.5.7-r0)
2025-06-29T18:36:43.165495896Z #7 0.633 (4/29) Installing binutils (2.44-r0)
2025-06-29T18:36:43.165498806Z #7 0.717 (5/29) Installing libgomp (14.2.0-r6)
2025-06-29T18:36:43.315769977Z #7 0.729 (6/29) Installing libatomic (14.2.0-r6)
2025-06-29T18:36:43.315802878Z #7 0.738 (7/29) Installing gmp (6.3.0-r3)
2025-06-29T18:36:43.315806578Z #7 0.751 (8/29) Installing isl26 (0.26-r1)
2025-06-29T18:36:43.315809708Z #7 0.777 (9/29) Installing mpfr4 (4.2.1_p1-r0)
2025-06-29T18:36:43.315812548Z #7 0.793 (10/29) Installing mpc1 (1.3.1-r1)
2025-06-29T18:36:43.315815618Z #7 0.803 (11/29) Installing gcc (14.2.0-r6)
2025-06-29T18:36:44.223127858Z #7 1.631 (12/29) Installing musl-dev (1.2.5-r10)
2025-06-29T18:36:44.223152979Z #7 1.697 (13/29) Installing g++ (14.2.0-r6)
2025-06-29T18:36:44.472012168Z #7 1.926 (14/29) Installing make (4.4.1-r3)
2025-06-29T18:36:44.472031498Z #7 1.939 (15/29) Installing libbz2 (1.0.8-r6)
2025-06-29T18:36:44.472034948Z #7 1.948 (16/29) Installing libexpat (2.7.1-r0)
2025-06-29T18:36:44.472037918Z #7 1.958 (17/29) Installing libffi (3.4.8-r0)
2025-06-29T18:36:44.472040728Z #7 1.968 (18/29) Installing gdbm (1.24-r0)
2025-06-29T18:36:44.472043498Z #7 1.977 (19/29) Installing xz-libs (5.8.1-r0)
2025-06-29T18:36:44.472046218Z #7 1.988 (20/29) Installing mpdecimal (4.0.1-r0)
2025-06-29T18:36:44.472049699Z #7 1.999 (21/29) Installing ncurses-terminfo-base (6.5_p20250503-r0)
2025-06-29T18:36:44.472053319Z #7 2.012 (22/29) Installing libncursesw (6.5_p20250503-r0)
2025-06-29T18:36:44.472056139Z #7 2.024 (23/29) Installing libpanelw (6.5_p20250503-r0)
2025-06-29T18:36:44.622346981Z #7 2.033 (24/29) Installing readline (8.2.13-r1)
2025-06-29T18:36:44.622367291Z #7 2.044 (25/29) Installing sqlite-libs (3.49.2-r0)
2025-06-29T18:36:44.622371791Z #7 2.066 (26/29) Installing python3 (3.12.11-r0)
2025-06-29T18:36:44.77293709Z #7 2.268 (27/29) Installing python3-pycache-pyc0 (3.12.11-r0)
2025-06-29T18:36:44.923255182Z #7 2.397 (28/29) Installing pyc (3.12.11-r0)
2025-06-29T18:36:44.923279902Z #7 2.397 (29/29) Installing python3-pyc (3.12.11-r0)
2025-06-29T18:36:44.923284963Z #7 2.398 Executing busybox-1.37.0-r18.trigger
2025-06-29T18:36:44.923289133Z #7 2.410 OK: 270 MiB in 47 packages
2025-06-29T18:36:49.582772916Z #7 DONE 7.1s
2025-06-29T18:36:49.582813307Z 
2025-06-29T18:36:49.582818137Z #8 [ 3/11] WORKDIR /app
2025-06-29T18:37:02.213996177Z #8 DONE 12.6s
2025-06-29T18:37:02.214022968Z 
2025-06-29T18:37:02.214027238Z #9 [ 4/11] RUN mkdir -p /app/uploads
2025-06-29T18:37:06.722583244Z #9 DONE 4.5s
2025-06-29T18:37:06.722604034Z 
2025-06-29T18:37:06.722609934Z #10 [ 5/11] COPY package*.json ./
2025-06-29T18:37:06.722614744Z #10 DONE 0.0s
2025-06-29T18:37:06.722618874Z 
2025-06-29T18:37:06.722623854Z #11 [ 6/11] RUN npm ci --only=production --ignore-optional
2025-06-29T18:37:06.873515041Z #11 0.167 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
2025-06-29T18:37:11.383201006Z #11 4.677 
2025-06-29T18:37:11.383224436Z #11 4.677 added 294 packages, and audited 295 packages in 5s
2025-06-29T18:37:11.383229136Z #11 4.677 
2025-06-29T18:37:11.383233336Z #11 4.677 46 packages are looking for funding
2025-06-29T18:37:11.383236727Z #11 4.677   run `npm fund` for details
2025-06-29T18:37:11.383240237Z #11 4.678 
2025-06-29T18:37:11.383243597Z #11 4.678 found 0 vulnerabilities
2025-06-29T18:37:11.383247527Z #11 4.680 npm notice
2025-06-29T18:37:11.383251367Z #11 4.680 npm notice New major version of npm available! 10.8.2 -> 11.4.2
2025-06-29T18:37:11.383254687Z #11 4.680 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.2
2025-06-29T18:37:11.383258117Z #11 4.680 npm notice To update run: npm install -g npm@11.4.2
2025-06-29T18:37:11.383261467Z #11 4.680 npm notice
2025-06-29T18:37:13.638005902Z #11 DONE 6.9s
2025-06-29T18:37:13.638030733Z 
2025-06-29T18:37:13.638036333Z #12 [ 7/11] COPY . .
2025-06-29T18:37:13.904067625Z #12 DONE 0.4s
2025-06-29T18:37:14.055153266Z 
2025-06-29T18:37:14.055176617Z #13 [ 8/11] RUN find node_modules -name "*.node" -delete 2>/dev/null || true
2025-06-29T18:37:14.623469395Z #13 DONE 0.7s
2025-06-29T18:37:14.773987512Z 
2025-06-29T18:37:14.774017813Z #14 [ 9/11] RUN npm rebuild bcrypt
2025-06-29T18:37:15.676221644Z #14 0.911 rebuilt dependencies successfully
2025-06-29T18:37:15.676243595Z #14 DONE 1.0s
2025-06-29T18:37:15.676247605Z 
2025-06-29T18:37:15.676252055Z #15 [10/11] RUN addgroup -g 1001 -S campaign &&     adduser -S campaign -u 1001 -G campaign
2025-06-29T18:37:15.826794343Z #15 DONE 0.1s
2025-06-29T18:37:15.826821274Z 
2025-06-29T18:37:15.826827824Z #16 [11/11] RUN chown -R campaign:campaign /app
2025-06-29T18:37:35.332300338Z #16 DONE 19.6s
2025-06-29T18:37:35.482808356Z 
2025-06-29T18:37:35.482834056Z #17 exporting to docker image format
2025-06-29T18:37:35.482839236Z #17 exporting layers
2025-06-29T18:37:47.428064304Z #17 exporting layers 11.9s done
2025-06-29T18:37:47.428093305Z #17 exporting manifest sha256:7ba141bbcce907d6f9934a0b11bd50f785bead012bdc80f4b53299423297a385 0.0s done
2025-06-29T18:37:47.428100235Z #17 exporting config sha256:197b2f08285ba1224397826b7a79c00e3cca86c8898a016c43fbfa9a5105dfae 0.0s done
2025-06-29T18:37:49.378116473Z #17 DONE 13.9s
2025-06-29T18:37:49.378137133Z 
2025-06-29T18:37:49.378144383Z #18 exporting cache to client directory
2025-06-29T18:37:49.378150184Z #18 preparing build cache for export
2025-06-29T18:37:52.628257271Z #18 writing cache manifest sha256:209e55ca706ce1629ebdaa17ed26c8352fa057ab5978a44b87dd6041f03f156d done
2025-06-29T18:37:52.628274631Z #18 DONE 3.3s
2025-06-29T18:37:53.752280409Z Pushing image to registry...
2025-06-29T18:37:58.445315941Z Upload succeeded
2025-06-29T18:38:16.095897714Z ==> Deploying...
2025-06-29T18:38:26.75572351Z 
2025-06-29T18:38:26.755773011Z > personal-ai-assistant@1.0.0 start
2025-06-29T18:38:26.755779571Z > node server.js
2025-06-29T18:38:26.755782151Z 
2025-06-29T18:38:29.266391738Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-06-29T18:38:29.266830397Z 🔍 NODE_ENV: production
2025-06-29T18:38:29.266919198Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-06-29T18:38:29.855530716Z ✅ PostgreSQL connection initialized
2025-06-29T18:38:29.856005026Z 🗂️ Creating campaign database tables...
2025-06-29T18:38:29.955400263Z ✅ Database tables initialized
2025-06-29T18:38:29.960180094Z Warning: connect.session() MemoryStore is not
2025-06-29T18:38:29.960198904Z designed for a production environment, as it will leak
2025-06-29T18:38:29.960202015Z memory, and will not scale past a single process.
2025-06-29T18:38:30.055668669Z Personal AI Assistant running on http://localhost:10000
2025-06-29T18:38:30.055769021Z Dashboard: http://localhost:10000/dashboard
2025-06-29T18:38:30.055816272Z Terri Chat: http://localhost:10000/terri
2025-06-29T18:38:30.055972575Z Attempting to connect to MCP structured thinking server...
2025-06-29T18:38:32.057957091Z error: relation "users" does not exist
2025-06-29T18:38:32.057985981Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-29T18:38:32.057989781Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-06-29T18:38:32.057992632Z   length: 103,
2025-06-29T18:38:32.057999692Z   severity: 'ERROR',
2025-06-29T18:38:32.058002522Z   code: '42P01',
2025-06-29T18:38:32.058005112Z   detail: undefined,
2025-06-29T18:38:32.058007602Z   hint: undefined,
2025-06-29T18:38:32.058010162Z   position: undefined,
2025-06-29T18:38:32.058013172Z   internalPosition: undefined,
2025-06-29T18:38:32.058015632Z   internalQuery: undefined,
2025-06-29T18:38:32.058017782Z   where: undefined,
2025-06-29T18:38:32.058020102Z   schema: undefined,
2025-06-29T18:38:32.058022732Z   table: undefined,
2025-06-29T18:38:32.058025262Z   column: undefined,
2025-06-29T18:38:32.058027792Z   dataType: undefined,
2025-06-29T18:38:32.058030372Z   constraint: undefined,
2025-06-29T18:38:32.058032862Z   file: 'namespace.c',
2025-06-29T18:38:32.058035652Z   line: '434',
2025-06-29T18:38:32.058038522Z   routine: 'RangeVarGetRelidExtended'
2025-06-29T18:38:32.058041182Z }
2025-06-29T18:38:32.155051719Z error: relation "users" does not exist
2025-06-29T18:38:32.155072329Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-29T18:38:32.1550765Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-06-29T18:38:32.15507984Z   length: 103,
2025-06-29T18:38:32.15508334Z   severity: 'ERROR',
2025-06-29T18:38:32.15508588Z   code: '42P01',
2025-06-29T18:38:32.15508863Z   detail: undefined,
2025-06-29T18:38:32.15509147Z   hint: undefined,
2025-06-29T18:38:32.15509394Z   position: undefined,
2025-06-29T18:38:32.15509688Z   internalPosition: undefined,
2025-06-29T18:38:32.15509941Z   internalQuery: undefined,
2025-06-29T18:38:32.15510214Z   where: undefined,
2025-06-29T18:38:32.15510467Z   schema: undefined,
2025-06-29T18:38:32.15510706Z   table: undefined,
2025-06-29T18:38:32.15510959Z   column: undefined,
2025-06-29T18:38:32.15511251Z   dataType: undefined,
2025-06-29T18:38:32.15511527Z   constraint: undefined,
2025-06-29T18:38:32.15511806Z   file: 'namespace.c',
2025-06-29T18:38:32.155121181Z   line: '434',
2025-06-29T18:38:32.15512375Z   routine: 'RangeVarGetRelidExtended'
2025-06-29T18:38:32.155146751Z }
2025-06-29T18:38:32.254351314Z error: relation "users" does not exist
2025-06-29T18:38:32.254369934Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-29T18:38:32.254373414Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-06-29T18:38:32.254375935Z   length: 103,
2025-06-29T18:38:32.254378915Z   severity: 'ERROR',
2025-06-29T18:38:32.254380964Z   code: '42P01',
2025-06-29T18:38:32.254383075Z   detail: undefined,
2025-06-29T18:38:32.254385155Z   hint: undefined,
2025-06-29T18:38:32.254387215Z   position: undefined,
2025-06-29T18:38:32.254389695Z   internalPosition: undefined,
2025-06-29T18:38:32.254391735Z   internalQuery: undefined,
2025-06-29T18:38:32.254393835Z   where: undefined,
2025-06-29T18:38:32.254395895Z   schema: undefined,
2025-06-29T18:38:32.254397885Z   table: undefined,
2025-06-29T18:38:32.254400255Z   column: undefined,
2025-06-29T18:38:32.254402305Z   dataType: undefined,
2025-06-29T18:38:32.254404315Z   constraint: undefined,
2025-06-29T18:38:32.254406695Z   file: 'namespace.c',
2025-06-29T18:38:32.254408755Z   line: '434',
2025-06-29T18:38:32.254410905Z   routine: 'RangeVarGetRelidExtended'
2025-06-29T18:38:32.254413045Z }
2025-06-29T18:38:32.25560323Z error: relation "users" does not exist
2025-06-29T18:38:32.255627241Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-29T18:38:32.255631041Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-06-29T18:38:32.255633821Z   length: 103,
2025-06-29T18:38:32.255637501Z   severity: 'ERROR',
2025-06-29T18:38:32.255639901Z   code: '42P01',
2025-06-29T18:38:32.255641581Z   detail: undefined,
2025-06-29T18:38:32.255643211Z   hint: undefined,
2025-06-29T18:38:32.255644881Z   position: undefined,
2025-06-29T18:38:32.255647301Z   internalPosition: undefined,
2025-06-29T18:38:32.255649681Z   internalQuery: undefined,
2025-06-29T18:38:32.255652361Z   where: undefined,
2025-06-29T18:38:32.255655082Z   schema: undefined,
2025-06-29T18:38:32.255657691Z   table: undefined,
2025-06-29T18:38:32.255660502Z   column: undefined,
2025-06-29T18:38:32.255663282Z   dataType: undefined,
2025-06-29T18:38:32.255665782Z   constraint: undefined,
2025-06-29T18:38:32.255668202Z   file: 'namespace.c',
2025-06-29T18:38:32.255670532Z   line: '434',
2025-06-29T18:38:32.255672902Z   routine: 'RangeVarGetRelidExtended'
2025-06-29T18:38:32.255675382Z }
2025-06-29T18:38:32.274935088Z error: relation "users" does not exist
2025-06-29T18:38:32.274950169Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-29T18:38:32.274953649Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-06-29T18:38:32.274956349Z   length: 103,
2025-06-29T18:38:32.274959699Z   severity: 'ERROR',
2025-06-29T18:38:32.274961849Z   code: '42P01',
2025-06-29T18:38:32.274963939Z   detail: undefined,
2025-06-29T18:38:32.274966059Z   hint: undefined,
2025-06-29T18:38:32.274968559Z   position: undefined,
2025-06-29T18:38:32.274971369Z   internalPosition: undefined,
2025-06-29T18:38:32.274973509Z   internalQuery: undefined,
2025-06-29T18:38:32.274975629Z   where: undefined,
2025-06-29T18:38:32.274977909Z   schema: undefined,
2025-06-29T18:38:32.274980029Z   table: undefined,
2025-06-29T18:38:32.274982209Z   column: undefined,
2025-06-29T18:38:32.274984589Z   dataType: undefined,
2025-06-29T18:38:32.274986719Z   constraint: undefined,
2025-06-29T18:38:32.274988839Z   file: 'namespace.c',
2025-06-29T18:38:32.27500031Z   line: '434',
2025-06-29T18:38:32.27500286Z   routine: 'RangeVarGetRelidExtended'
2025-06-29T18:38:32.27500527Z }
2025-06-29T18:38:36.762349008Z ==> Your service is live 🎉
2025-06-29T18:38:36.832735708Z ==> 
2025-06-29T18:38:36.866898493Z Sequential Thinking MCP Server running on stdio
2025-06-29T18:38:36.902962619Z ==> ///////////////////////////////////////////////////////////
2025-06-29T18:38:36.965870991Z Connected to MCP structured thinking server
2025-06-29T18:38:36.965893761Z ✓ MCP structured thinking server connected successfully
2025-06-29T18:38:36.97038099Z ==> 
2025-06-29T18:38:37.038618881Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-06-29T18:38:37.055992892Z ✓ Available MCP tools: sequentialthinking
2025-06-29T18:38:37.105615122Z ==> 
2025-06-29T18:38:37.172657693Z ==> ///////////////////////////////////////////////////////////