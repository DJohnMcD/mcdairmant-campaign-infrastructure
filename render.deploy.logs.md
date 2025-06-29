2025-06-29T18:42:15.48489038Z #17 extracting sha256:f2bef23b8088ccd472cd9933264dd9319225c1c4ca17aa293ef949cfa59a270d 3.0s done
2025-06-29T18:42:15.646476729Z #17 CACHED
2025-06-29T18:42:15.64650333Z 
2025-06-29T18:42:15.64651738Z #18 exporting to docker image format
2025-06-29T18:42:15.64652428Z #18 exporting layers done
2025-06-29T18:42:15.646530181Z #18 exporting manifest sha256:7ba141bbcce907d6f9934a0b11bd50f785bead012bdc80f4b53299423297a385 done
2025-06-29T18:42:15.64653595Z #18 exporting config sha256:197b2f08285ba1224397826b7a79c00e3cca86c8898a016c43fbfa9a5105dfae done
2025-06-29T18:42:17.565799903Z #18 DONE 1.9s
2025-06-29T18:42:17.565816753Z 
2025-06-29T18:42:17.565821124Z #19 exporting cache to client directory
2025-06-29T18:42:17.565824264Z #19 preparing build cache for export
2025-06-29T18:42:17.618966795Z #19 writing cache manifest sha256:209e55ca706ce1629ebdaa17ed26c8352fa057ab5978a44b87dd6041f03f156d done
2025-06-29T18:42:17.618980355Z #19 DONE 0.1s
2025-06-29T18:42:18.749405154Z Pushing image to registry...
2025-06-29T18:42:19.481038717Z Upload succeeded
2025-06-29T18:42:22.072886051Z ==> Deploying...
2025-06-29T18:42:34.904883291Z > personal-ai-assistant@1.0.0 start
2025-06-29T18:42:34.904887742Z > node server.js
2025-06-29T18:42:34.904890102Z 
2025-06-29T18:42:37.406493119Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-06-29T18:42:37.406846578Z 🔍 NODE_ENV: production
2025-06-29T18:42:37.40693665Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-06-29T18:42:37.81027062Z ✅ PostgreSQL connection initialized
2025-06-29T18:42:37.810441454Z 🗂️ Creating campaign database tables...
2025-06-29T18:42:37.910166891Z ✅ Database tables initialized
2025-06-29T18:42:38.004006707Z Warning: connect.session() MemoryStore is not
2025-06-29T18:42:38.004028057Z designed for a production environment, as it will leak
2025-06-29T18:42:38.004030417Z memory, and will not scale past a single process.
2025-06-29T18:42:38.009643891Z Personal AI Assistant running on http://localhost:10000
2025-06-29T18:42:38.009785974Z Dashboard: http://localhost:10000/dashboard
2025-06-29T18:42:38.009856526Z Terri Chat: http://localhost:10000/terri
2025-06-29T18:42:38.010006159Z Attempting to connect to MCP structured thinking server...
2025-06-29T18:42:43.023707235Z ==> Your service is live 🎉
2025-06-29T18:42:43.097972235Z ==> 
2025-06-29T18:42:43.166269916Z ==> ///////////////////////////////////////////////////////////
2025-06-29T18:42:43.235538267Z ==> 
2025-06-29T18:42:43.304157758Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-06-29T18:42:43.373643448Z ==> 
2025-06-29T18:42:43.442759599Z ==> ///////////////////////////////////////////////////////////
2025-06-29T18:42:44.602341157Z Sequential Thinking MCP Server running on stdio
2025-06-29T18:42:44.699157794Z Connected to MCP structured thinking server
2025-06-29T18:42:44.699244776Z ✓ MCP structured thinking server connected successfully
2025-06-29T18:42:44.70275511Z ✓ Available MCP tools: sequentialthinking
2025-06-29T18:47:47.694951117Z ==> Detected service running on port 10000
2025-06-29T18:47:47.885299206Z ==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
2025-06-29T18:58:45.162096245Z npm error path /app
2025-06-29T18:58:45.162135546Z npm error command failed
2025-06-29T18:58:45.162532005Z npm error signal SIGTERM
2025-06-29T18:58:45.162664998Z npm error command sh -c node server.js
2025-06-29T18:58:45.165330932Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-06-29T18_42_34_300Z-debug-0.log
2025-06-29T19:01:00.190099881Z 
2025-06-29T19:01:00.190130362Z > personal-ai-assistant@1.0.0 start
2025-06-29T19:01:00.190134812Z > node server.js
2025-06-29T19:01:00.190137552Z 
2025-06-29T19:01:02.689077821Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-06-29T19:01:02.689576835Z 🔍 NODE_ENV: production
2025-06-29T19:01:02.689652867Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-06-29T19:01:03.193883573Z ✅ PostgreSQL connection initialized
2025-06-29T19:01:03.193995967Z 🗂️ Creating campaign database tables...
2025-06-29T19:01:03.290937434Z ✅ Database tables initialized
2025-06-29T19:01:03.387970644Z Warning: connect.session() MemoryStore is not
2025-06-29T19:01:03.388001895Z designed for a production environment, as it will leak
2025-06-29T19:01:03.388004975Z memory, and will not scale past a single process.
2025-06-29T19:01:03.396176421Z Personal AI Assistant running on http://localhost:10000
2025-06-29T19:01:03.396209002Z Dashboard: http://localhost:10000/dashboard
2025-06-29T19:01:03.396212042Z Terri Chat: http://localhost:10000/terri
2025-06-29T19:01:03.396214742Z Attempting to connect to MCP structured thinking server...
2025-06-29T19:01:10.495145887Z Sequential Thinking MCP Server running on stdio
2025-06-29T19:01:10.594301236Z Connected to MCP structured thinking server
2025-06-29T19:01:10.594353607Z ✓ MCP structured thinking server connected successfully
2025-06-29T19:01:10.597461333Z ✓ Available MCP tools: sequentialthinking