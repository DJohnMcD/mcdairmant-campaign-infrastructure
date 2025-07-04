2025-07-04T13:38:48.442473619Z ==> Cloning from https://github.com/DJohnMcD/mcdairmant-campaign-infrastructure
2025-07-04T13:38:49.360704893Z ==> Checking out commit d5253c4e87c37f0915835a442901c2bdd7b2f51d in branch main
2025-07-04T13:38:50.501214682Z ==> Downloading cache...
2025-07-04T13:38:59.534411939Z ==> Transferred 292MB in 8s. Extraction took 0s.
2025-07-04T13:39:10.002281888Z #1 [internal] load build definition from Dockerfile
2025-07-04T13:39:10.002326549Z #1 transferring dockerfile: 1.22kB done
2025-07-04T13:39:10.002330749Z #1 DONE 0.0s
2025-07-04T13:39:10.002333339Z 
2025-07-04T13:39:10.002336559Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2025-07-04T13:39:10.453860493Z #2 ...
2025-07-04T13:39:10.459826259Z 
2025-07-04T13:39:10.459835409Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2025-07-04T13:39:10.459841149Z #3 DONE 0.0s
2025-07-04T13:39:10.604229578Z 
2025-07-04T13:39:10.604257268Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2025-07-04T13:39:12.207659619Z #2 DONE 2.3s
2025-07-04T13:39:12.20768264Z 
2025-07-04T13:39:12.20768803Z #4 [internal] load .dockerignore
2025-07-04T13:39:12.20769235Z #4 transferring context: 690B done
2025-07-04T13:39:12.20769602Z #4 DONE 0.0s
2025-07-04T13:39:12.20769933Z 
2025-07-04T13:39:12.20770292Z #5 [internal] load build context
2025-07-04T13:39:12.207706331Z #5 DONE 0.0s
2025-07-04T13:39:12.207709651Z 
2025-07-04T13:39:12.207713871Z #6 [ 1/11] FROM docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11
2025-07-04T13:39:12.207717401Z #6 resolve docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11
2025-07-04T13:39:12.358525844Z #6 resolve docker.io/library/node:20-alpine@sha256:674181320f4f94582c6182eaa151bf92c6744d478be0f1d12db804b7d59b2d11 0.0s done
2025-07-04T13:39:12.358543325Z #6 DONE 0.0s
2025-07-04T13:39:12.358546495Z 
2025-07-04T13:39:12.358550095Z #7 importing cache manifest from local:10105894519101597424
2025-07-04T13:39:12.358553645Z #7 inferred cache manifest type: application/vnd.oci.image.index.v1+json done
2025-07-04T13:39:12.358556695Z #7 DONE 0.0s
2025-07-04T13:39:12.358559365Z 
2025-07-04T13:39:12.358562575Z #5 [internal] load build context
2025-07-04T13:39:12.358565985Z #5 transferring context: 1.16MB 0.0s done
2025-07-04T13:39:12.358568685Z #5 DONE 0.0s
2025-07-04T13:39:12.358571295Z 
2025-07-04T13:39:12.358574955Z #8 [ 3/11] WORKDIR /app
2025-07-04T13:39:12.358578055Z #8 CACHED
2025-07-04T13:39:12.358580715Z 
2025-07-04T13:39:12.358583475Z #9 [ 6/11] RUN npm ci --only=production --ignore-optional
2025-07-04T13:39:12.358586226Z #9 CACHED
2025-07-04T13:39:12.358588796Z 
2025-07-04T13:39:12.358591466Z #10 [ 7/11] COPY . .
2025-07-04T13:39:12.358594226Z #10 CACHED
2025-07-04T13:39:12.358596856Z 
2025-07-04T13:39:12.358600566Z #11 [10/11] RUN addgroup -g 1001 -S campaign &&     adduser -S campaign -u 1001 -G campaign
2025-07-04T13:39:12.358603516Z #11 CACHED
2025-07-04T13:39:12.358606066Z 
2025-07-04T13:39:12.358608826Z #12 [ 4/11] RUN mkdir -p /app/uploads
2025-07-04T13:39:12.358612206Z #12 CACHED
2025-07-04T13:39:12.358614796Z 
2025-07-04T13:39:12.358617446Z #13 [ 5/11] COPY package*.json ./
2025-07-04T13:39:12.358620146Z #13 CACHED
2025-07-04T13:39:12.358622736Z 
2025-07-04T13:39:12.358625536Z #14 [ 8/11] RUN find node_modules -name "*.node" -delete 2>/dev/null || true
2025-07-04T13:39:12.358628256Z #14 CACHED
2025-07-04T13:39:12.358630856Z 
2025-07-04T13:39:12.358633547Z #15 [ 9/11] RUN npm rebuild bcrypt
2025-07-04T13:39:12.358636256Z #15 CACHED
2025-07-04T13:39:12.358638827Z 
2025-07-04T13:39:12.358641527Z #16 [ 2/11] RUN apk add --no-cache python3 make g++
2025-07-04T13:39:12.358644217Z #16 CACHED
2025-07-04T13:39:12.358646837Z 
2025-07-04T13:39:12.358649597Z #17 [11/11] RUN chown -R campaign:campaign /app
2025-07-04T13:39:12.484847492Z #17 sha256:fe07684b16b82247c3539ed86a65ff37a76138ec25d380bd80c869a1a4c73236 3.80MB / 3.80MB 0.0s done
2025-07-04T13:39:12.484866782Z #17 extracting sha256:fe07684b16b82247c3539ed86a65ff37a76138ec25d380bd80c869a1a4c73236 0.1s done
2025-07-04T13:39:12.793898324Z #17 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 20.97MB / 42.99MB 0.2s
2025-07-04T13:39:12.900304693Z #17 sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 42.99MB / 42.99MB 0.4s done
2025-07-04T13:39:13.051084917Z #17 extracting sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd
2025-07-04T13:39:15.455968299Z #17 extracting sha256:5432aa916e0868c8c9385ef60226d5ef530f13fe7c28fc13c054de1df6d006cd 2.4s done
2025-07-04T13:39:15.455993279Z #17 sha256:2506673f55362e86b6c8a2ab9c01541ae636887386c92d06e01286d3ddd83871 1.26MB / 1.26MB 0.0s done
2025-07-04T13:39:15.455997939Z #17 extracting sha256:2506673f55362e86b6c8a2ab9c01541ae636887386c92d06e01286d3ddd83871
2025-07-04T13:39:15.560291418Z #17 extracting sha256:2506673f55362e86b6c8a2ab9c01541ae636887386c92d06e01286d3ddd83871 0.2s done
2025-07-04T13:39:15.560312418Z #17 sha256:98c4889b578e94078411d6c14fe8f5daa0303d43e82bbf84d5787ab657c42428 445B / 445B done
2025-07-04T13:39:15.710411118Z #17 extracting sha256:98c4889b578e94078411d6c14fe8f5daa0303d43e82bbf84d5787ab657c42428 0.0s done
2025-07-04T13:39:15.860482048Z #17 sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 20.97MB / 99.12MB 0.2s
2025-07-04T13:39:16.010789471Z #17 sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 37.75MB / 99.12MB 0.3s
2025-07-04T13:39:16.16187584Z #17 sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 56.62MB / 99.12MB 0.5s
2025-07-04T13:39:16.312150014Z #17 sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 74.45MB / 99.12MB 0.6s
2025-07-04T13:39:16.463064169Z #17 sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 93.32MB / 99.12MB 0.8s
2025-07-04T13:39:16.613496396Z #17 sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 99.12MB / 99.12MB 0.9s done
2025-07-04T13:39:16.613517866Z #17 extracting sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e
2025-07-04T13:39:24.393564185Z #17 extracting sha256:88ee5023e3b3424c3296d41aec4cf0a7581b4b800d733f02d6655094a279948e 7.8s done
2025-07-04T13:39:25.597349641Z #17 sha256:2daac478e13069e5cb52bab4d7bab402adc08ca4d2d524d2dc942934f0864f37 89B / 89B done
2025-07-04T13:39:25.597374252Z #17 extracting sha256:2daac478e13069e5cb52bab4d7bab402adc08ca4d2d524d2dc942934f0864f37
2025-07-04T13:39:26.197506525Z #17 extracting sha256:2daac478e13069e5cb52bab4d7bab402adc08ca4d2d524d2dc942934f0864f37 0.7s done
2025-07-04T13:39:26.304585698Z #17 sha256:f94c9a152d6b35375aad3a23ea7540c922774a830a5e2d5753839e54ad4b0e80 113B / 113B done
2025-07-04T13:39:26.304608049Z #17 extracting sha256:f94c9a152d6b35375aad3a23ea7540c922774a830a5e2d5753839e54ad4b0e80 0.0s done
2025-07-04T13:39:26.304612498Z #17 sha256:f55141ce26dfe07096739bb91c8b314630b2dbcc43ac9f1a268b8fc649a20201 9.36kB / 9.36kB done
2025-07-04T13:39:26.304616189Z #17 extracting sha256:f55141ce26dfe07096739bb91c8b314630b2dbcc43ac9f1a268b8fc649a20201
2025-07-04T13:39:26.454997854Z #17 extracting sha256:f55141ce26dfe07096739bb91c8b314630b2dbcc43ac9f1a268b8fc649a20201 0.0s done
2025-07-04T13:39:26.562721289Z #17 sha256:721498fd54d023b594c1c63053759b2b9553637bff64fea5cd1571c8d56419c8 20.69MB / 20.69MB 0.2s done
2025-07-04T13:39:26.713876119Z #17 extracting sha256:721498fd54d023b594c1c63053759b2b9553637bff64fea5cd1571c8d56419c8
2025-07-04T13:39:28.472189972Z #17 extracting sha256:721498fd54d023b594c1c63053759b2b9553637bff64fea5cd1571c8d56419c8 1.8s done
2025-07-04T13:39:28.472227222Z #17 sha256:49fa8d02bcaf00f41fc3c4afdf5b9d83f45f327560d9fabb701994b4abf8aaf2 492.85kB / 492.85kB done
2025-07-04T13:39:28.472231892Z #17 extracting sha256:49fa8d02bcaf00f41fc3c4afdf5b9d83f45f327560d9fabb701994b4abf8aaf2 0.0s done
2025-07-04T13:39:28.472234472Z #17 sha256:92b6ae6340b5032e5cee95630404739cef31d192c20164d33a9d39420e83f8c2 334B / 334B done
2025-07-04T13:39:28.577701494Z #17 extracting sha256:92b6ae6340b5032e5cee95630404739cef31d192c20164d33a9d39420e83f8c2 0.0s done
2025-07-04T13:39:28.577723464Z #17 sha256:0ef93c5495892312f6f9065a9e1229ca61ab7b17d2b5dae21a1352fa46a40eab 42.51kB / 42.51kB done
2025-07-04T13:39:28.577727994Z #17 extracting sha256:0ef93c5495892312f6f9065a9e1229ca61ab7b17d2b5dae21a1352fa46a40eab 0.0s done
2025-07-04T13:39:28.577731604Z #17 sha256:2a6d6fbc0c2bb9c86b207aef8d597ca9c0c7834e03f37f7595087a555fda4c70 966B / 966B done
2025-07-04T13:39:28.577735065Z #17 extracting sha256:2a6d6fbc0c2bb9c86b207aef8d597ca9c0c7834e03f37f7595087a555fda4c70 0.0s done
2025-07-04T13:39:28.679721688Z #17 sha256:47d2e5ebbabf55dc8d172ba5758de16b7903122466ec415c298f1d8166fa0d93 8.72MB / 8.72MB 0.1s done
2025-07-04T13:39:28.67981076Z #17 extracting sha256:47d2e5ebbabf55dc8d172ba5758de16b7903122466ec415c298f1d8166fa0d93
2025-07-04T13:39:32.414510244Z #17 extracting sha256:47d2e5ebbabf55dc8d172ba5758de16b7903122466ec415c298f1d8166fa0d93 3.7s done
2025-07-04T13:39:32.593872124Z #17 CACHED
2025-07-04T13:39:32.593905614Z 
2025-07-04T13:39:32.593914624Z #18 exporting to docker image format
2025-07-04T13:39:32.593919794Z #18 exporting layers done
2025-07-04T13:39:32.593924474Z #18 exporting manifest sha256:27a272c8f49540139fb1592d9ff957b42e148c09777aed87bffb80b360640659 done
2025-07-04T13:39:32.593928534Z #18 exporting config sha256:ce0cdd41500298928624cabfb5de7e021419263a826eb04f15cb533bf9623865 done
2025-07-04T13:39:34.799901853Z #18 DONE 2.2s
2025-07-04T13:39:34.799927054Z 
2025-07-04T13:39:34.799932274Z #19 exporting cache to client directory
2025-07-04T13:39:34.799936194Z #19 preparing build cache for export
2025-07-04T13:39:34.84396268Z #19 writing cache manifest sha256:c7376b5e5cb52f2eb6cb8dc3266bc4951e2ca91755047ff472d495a4e7b710c6 done
2025-07-04T13:39:34.84398456Z #19 DONE 0.1s
2025-07-04T13:39:35.618844292Z Pushing image to registry...
2025-07-04T13:39:36.374841317Z Upload succeeded
2025-07-04T13:39:39.134363103Z ==> Deploying...
2025-07-04T13:40:02.068148193Z 
2025-07-04T13:40:02.068185745Z > personal-ai-assistant@1.0.0 start
2025-07-04T13:40:02.068190196Z > node server.js
2025-07-04T13:40:02.068192736Z 
2025-07-04T13:40:04.956465515Z 📧 Email service not configured - SMTP credentials missing
2025-07-04T13:40:04.957197274Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-07-04T13:40:04.957216765Z 🔍 NODE_ENV: production
2025-07-04T13:40:04.957278669Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-07-04T13:40:05.354537127Z ✅ PostgreSQL connection initialized
2025-07-04T13:40:05.354722777Z 🗂️ Creating campaign database tables...
2025-07-04T13:40:05.460398943Z Warning: connect.session() MemoryStore is not
2025-07-04T13:40:05.460418194Z designed for a production environment, as it will leak
2025-07-04T13:40:05.460422654Z memory, and will not scale past a single process.
2025-07-04T13:40:05.554969268Z Personal AI Assistant running on http://localhost:10000
2025-07-04T13:40:05.554988799Z Dashboard: http://localhost:10000/dashboard
2025-07-04T13:40:05.554993509Z Terri Chat: http://localhost:10000/terri
2025-07-04T13:40:06.071079735Z ✓ Created table: users
2025-07-04T13:40:06.07709438Z ✓ Created table: entries
2025-07-04T13:40:06.078870526Z ✓ Created table: agent_responses
2025-07-04T13:40:06.086187682Z ✓ Created table: terri_private
2025-07-04T13:40:06.088998594Z ✓ Created table: campaign_expenses
2025-07-04T13:40:06.093521929Z ✓ Created table: campaign_donors
2025-07-04T13:40:06.097139084Z ✓ Created table: audit_log
2025-07-04T13:40:06.097151345Z ✅ Database tables initialized
2025-07-04T13:40:06.097382638Z Attempting to connect to MCP structured thinking server...
2025-07-04T13:40:09.90720455Z ==> Your service is live 🎉
2025-07-04T13:40:09.980976373Z ==> 
2025-07-04T13:40:10.050009896Z ==> ///////////////////////////////////////////////////////////
2025-07-04T13:40:10.119375179Z ==> 
2025-07-04T13:40:10.187991162Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-07-04T13:40:10.261774645Z ==> 
2025-07-04T13:40:10.330354007Z ==> ///////////////////////////////////////////////////////////
2025-07-04T13:40:12.454819813Z Sequential Thinking MCP Server running on stdio
2025-07-04T13:40:12.55498624Z Connected to MCP structured thinking server
2025-07-04T13:40:12.555000491Z ✓ MCP structured thinking server connected successfully
2025-07-04T13:40:12.558888702Z ✓ Available MCP tools: sequentialthinking
2025-07-04T13:45:14.334751018Z ==> Detected service running on port 10000
2025-07-04T13:45:16.293514927Z ==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
2025-07-04T13:56:22.338253963Z npm error path /app
2025-07-04T13:56:22.338270724Z npm error command failed
2025-07-04T13:56:22.338274724Z npm error signal SIGTERM
2025-07-04T13:56:22.338279534Z npm error command sh -c node server.js
2025-07-04T13:56:22.349076047Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-07-04T13_40_01_377Z-debug-0.log
2025-07-04T14:28:28.107219263Z 
2025-07-04T14:28:28.107261204Z > personal-ai-assistant@1.0.0 start
2025-07-04T14:28:28.107265594Z > node server.js
2025-07-04T14:28:28.107268224Z 
2025-07-04T14:28:31.006553746Z 📧 Email service not configured - SMTP credentials missing
2025-07-04T14:28:31.007491787Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-07-04T14:28:31.007509097Z 🔍 NODE_ENV: production
2025-07-04T14:28:31.007597149Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-07-04T14:28:31.308132929Z ✅ PostgreSQL connection initialized
2025-07-04T14:28:31.308285633Z 🗂️ Creating campaign database tables...
2025-07-04T14:28:31.415814944Z Warning: connect.session() MemoryStore is not
2025-07-04T14:28:31.415836365Z designed for a production environment, as it will leak
2025-07-04T14:28:31.415839365Z memory, and will not scale past a single process.
2025-07-04T14:28:31.423550257Z Personal AI Assistant running on http://localhost:10000
2025-07-04T14:28:31.423565948Z Dashboard: http://localhost:10000/dashboard
2025-07-04T14:28:31.423568998Z Terri Chat: http://localhost:10000/terri
2025-07-04T14:28:32.280259991Z ✓ Created table: users
2025-07-04T14:28:32.282142793Z ✓ Created table: entries
2025-07-04T14:28:32.283594165Z ✓ Created table: agent_responses
2025-07-04T14:28:32.285333124Z ✓ Created table: terri_private
2025-07-04T14:28:32.286953751Z ✓ Created table: campaign_expenses
2025-07-04T14:28:32.288411924Z ✓ Created table: campaign_donors
2025-07-04T14:28:32.291773689Z ✓ Created table: audit_log
2025-07-04T14:28:32.291785369Z ✅ Database tables initialized
2025-07-04T14:28:32.291790239Z Attempting to connect to MCP structured thinking server...
2025-07-04T14:28:38.113765907Z Sequential Thinking MCP Server running on stdio
2025-07-04T14:28:38.216761006Z Connected to MCP structured thinking server
2025-07-04T14:28:38.216782907Z ✓ MCP structured thinking server connected successfully
2025-07-04T14:28:38.305897645Z ✓ Available MCP tools: sequentialthinking
2025-07-04T14:51:20.536993622Z npm error path /app
2025-07-04T14:51:20.537013722Z npm error command failed
2025-07-04T14:51:20.537018792Z npm error signal SIGTERM
2025-07-04T14:51:20.537174936Z npm error command sh -c node server.js
2025-07-04T14:51:20.539293324Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-07-04T14_28_27_509Z-debug-0.log
2025-07-04T14:57:06.632399807Z 
2025-07-04T14:57:06.632459769Z > personal-ai-assistant@1.0.0 start
2025-07-04T14:57:06.632464769Z > node server.js
2025-07-04T14:57:06.632467249Z 
2025-07-04T14:57:09.526741959Z 📧 Email service not configured - SMTP credentials missing
2025-07-04T14:57:09.527369921Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-07-04T14:57:09.527395541Z 🔍 NODE_ENV: production
2025-07-04T14:57:09.527557374Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-07-04T14:57:09.834514162Z ✅ PostgreSQL connection initialized
2025-07-04T14:57:09.834712176Z 🗂️ Creating campaign database tables...
2025-07-04T14:57:10.020969074Z Warning: connect.session() MemoryStore is not
2025-07-04T14:57:10.020995955Z designed for a production environment, as it will leak
2025-07-04T14:57:10.020999155Z memory, and will not scale past a single process.
2025-07-04T14:57:10.0271597Z Personal AI Assistant running on http://localhost:10000
2025-07-04T14:57:10.027183771Z Dashboard: http://localhost:10000/dashboard
2025-07-04T14:57:10.027284992Z Terri Chat: http://localhost:10000/terri
2025-07-04T14:57:10.466743872Z ✓ Created table: users
2025-07-04T14:57:10.468706019Z ✓ Created table: entries
2025-07-04T14:57:10.470004643Z ✓ Created table: agent_responses
2025-07-04T14:57:10.471471781Z ✓ Created table: terri_private
2025-07-04T14:57:10.473170033Z ✓ Created table: campaign_expenses
2025-07-04T14:57:10.474890555Z ✓ Created table: campaign_donors
2025-07-04T14:57:10.47621471Z ✓ Created table: audit_log
2025-07-04T14:57:10.47622487Z ✅ Database tables initialized
2025-07-04T14:57:10.476450984Z Attempting to connect to MCP structured thinking server...
2025-07-04T14:57:16.222418556Z Sequential Thinking MCP Server running on stdio
2025-07-04T14:57:16.326292671Z Connected to MCP structured thinking server
2025-07-04T14:57:16.326319622Z ✓ MCP structured thinking server connected successfully
2025-07-04T14:57:16.329779747Z ✓ Available MCP tools: sequentialthinking
2025-07-04T15:28:42.845473592Z npm error path /app
2025-07-04T15:28:42.845513973Z npm error command failed
2025-07-04T15:28:42.845591814Z npm error signal SIGTERM
2025-07-04T15:28:42.845809818Z npm error command sh -c node server.js
2025-07-04T15:28:42.847702924Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-07-04T14_57_06_031Z-debug-0.log
2025-07-04T17:12:29.572469606Z 🗂️ Creating campaign database tables...
2025-07-04T17:12:29.66178747Z Warning: connect.session() MemoryStore is not
2025-07-04T17:12:29.661812492Z designed for a production environment, as it will leak
2025-07-04T17:12:29.661817662Z memory, and will not scale past a single process.
2025-07-04T17:12:29.75468672Z Personal AI Assistant running on http://localhost:10000
2025-07-04T17:12:29.754711722Z Dashboard: http://localhost:10000/dashboard
2025-07-04T17:12:29.754729813Z Terri Chat: http://localhost:10000/terri
2025-07-04T17:12:30.201724571Z ✓ Created table: users
2025-07-04T17:12:30.203840088Z ✓ Created table: entries
2025-07-04T17:12:30.205057041Z ✓ Created table: agent_responses
2025-07-04T17:12:30.20654116Z ✓ Created table: terri_private
2025-07-04T17:12:30.208014588Z ✓ Created table: campaign_expenses
2025-07-04T17:12:30.209327097Z ✓ Created table: campaign_donors
2025-07-04T17:12:30.210588403Z ✓ Created table: audit_log
2025-07-04T17:12:30.210600454Z ✅ Database tables initialized
2025-07-04T17:12:30.210810617Z Attempting to connect to MCP structured thinking server...
2025-07-04T17:12:37.159862262Z Sequential Thinking MCP Server running on stdio
2025-07-04T17:12:37.265257713Z Connected to MCP structured thinking server
2025-07-04T17:12:37.265276684Z ✓ MCP structured thinking server connected successfully
2025-07-04T17:12:37.351443649Z ✓ Available MCP tools: sequentialthinking
2025-07-04T17:20:54.144455359Z npm error path /app
2025-07-04T17:20:54.14447627Z npm error command failed
2025-07-04T17:20:54.144480861Z npm error signal SIGTERM
2025-07-04T17:20:54.144579126Z npm error command sh -c node server.js
2025-07-04T17:20:54.146531924Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-07-04T17_12_25_673Z-debug-0.log