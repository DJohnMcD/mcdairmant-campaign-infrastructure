2025-06-28T22:12:29.567340681Z       address: '::1',
2025-06-28T22:12:29.567342951Z       port: 5432
2025-06-28T22:12:29.567344932Z     },
2025-06-28T22:12:29.567346992Z     Error: connect ECONNREFUSED 127.0.0.1:5432
2025-06-28T22:12:29.567349092Z         at createConnectionError (node:net:1652:14)
2025-06-28T22:12:29.567351082Z         at afterConnectMultiple (node:net:1682:16) {
2025-06-28T22:12:29.567353122Z       errno: -111,
2025-06-28T22:12:29.567355522Z       code: 'ECONNREFUSED',
2025-06-28T22:12:29.567357952Z       syscall: 'connect',
2025-06-28T22:12:29.567360622Z       address: '127.0.0.1',
2025-06-28T22:12:29.567362952Z       port: 5432
2025-06-28T22:12:29.567365492Z     }
2025-06-28T22:12:29.567368362Z   ]
2025-06-28T22:12:29.567371212Z }
2025-06-28T22:12:29.567782895Z AggregateError [ECONNREFUSED]: 
2025-06-28T22:12:29.567793855Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-28T22:12:29.567797255Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-06-28T22:12:29.567800235Z   code: 'ECONNREFUSED',
2025-06-28T22:12:29.567803235Z   [errors]: [
2025-06-28T22:12:29.567806496Z     Error: connect ECONNREFUSED ::1:5432
2025-06-28T22:12:29.567809476Z         at createConnectionError (node:net:1652:14)
2025-06-28T22:12:29.567812506Z         at afterConnectMultiple (node:net:1682:16) {
2025-06-28T22:12:29.567815066Z       errno: -111,
2025-06-28T22:12:29.567817716Z       code: 'ECONNREFUSED',
2025-06-28T22:12:29.567820286Z       syscall: 'connect',
2025-06-28T22:12:29.567823206Z       address: '::1',
2025-06-28T22:12:29.567826166Z       port: 5432
2025-06-28T22:12:29.567828426Z     },
2025-06-28T22:12:29.567831116Z     Error: connect ECONNREFUSED 127.0.0.1:5432
2025-06-28T22:12:29.567834176Z         at createConnectionError (node:net:1652:14)
2025-06-28T22:12:29.567836867Z         at afterConnectMultiple (node:net:1682:16) {
2025-06-28T22:12:29.567839467Z       errno: -111,
2025-06-28T22:12:29.567842117Z       code: 'ECONNREFUSED',
2025-06-28T22:12:29.567844707Z       syscall: 'connect',
2025-06-28T22:12:29.567847477Z       address: '127.0.0.1',
2025-06-28T22:12:29.567850217Z       port: 5432
2025-06-28T22:12:29.567853447Z     }
2025-06-28T22:12:29.567856267Z   ]
2025-06-28T22:12:29.567858797Z }
2025-06-28T22:12:34.468669018Z Sequential Thinking MCP Server running on stdio
2025-06-28T22:12:34.565603326Z Connected to MCP structured thinking server
2025-06-28T22:12:34.565629427Z ✓ MCP structured thinking server connected successfully
2025-06-28T22:12:34.568247557Z ✓ Available MCP tools: sequentialthinking
2025-06-28T22:12:35.352199725Z ==> Your service is live 🎉
2025-06-28T22:12:35.430856295Z ==> 
2025-06-28T22:12:35.508822594Z ==> ///////////////////////////////////////////////////////////
2025-06-28T22:12:35.582539124Z ==> 
2025-06-28T22:12:35.653842485Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-06-28T22:12:35.728889395Z ==> 
2025-06-28T22:12:35.803228265Z ==> ///////////////////////////////////////////////////////////
2025-06-28T22:13:55.788566882Z Database error: AggregateError [ECONNREFUSED]: 
2025-06-28T22:13:55.788598303Z     at /app/node_modules/pg-pool/index.js:45:11
2025-06-28T22:13:55.788603103Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-06-28T22:13:55.788607434Z     at async CampaignDatabase.query (/app/database.js:72:22)
2025-06-28T22:13:55.788611064Z     at async CampaignDatabase.get (/app/database.js:93:22)
2025-06-28T22:13:55.788614814Z     at async /app/server.js:128:18 {
2025-06-28T22:13:55.788631464Z   code: 'ECONNREFUSED',
2025-06-28T22:13:55.788633804Z   [errors]: [
2025-06-28T22:13:55.788636424Z     Error: connect ECONNREFUSED ::1:5432
2025-06-28T22:13:55.788639244Z         at createConnectionError (node:net:1652:14)
2025-06-28T22:13:55.788641785Z         at afterConnectMultiple (node:net:1682:16) {
2025-06-28T22:13:55.788644265Z       errno: -111,
2025-06-28T22:13:55.788647835Z       code: 'ECONNREFUSED',
2025-06-28T22:13:55.788654195Z       syscall: 'connect',
2025-06-28T22:13:55.788656845Z       address: '::1',
2025-06-28T22:13:55.788659415Z       port: 5432
2025-06-28T22:13:55.788662095Z     },
2025-06-28T22:13:55.788664775Z     Error: connect ECONNREFUSED 127.0.0.1:5432
2025-06-28T22:13:55.788667815Z         at createConnectionError (node:net:1652:14)
2025-06-28T22:13:55.788670685Z         at afterConnectMultiple (node:net:1682:16) {
2025-06-28T22:13:55.788673445Z       errno: -111,
2025-06-28T22:13:55.788676196Z       code: 'ECONNREFUSED',
2025-06-28T22:13:55.788678976Z       syscall: 'connect',
2025-06-28T22:13:55.788681146Z       address: '127.0.0.1',
2025-06-28T22:13:55.788683326Z       port: 5432
2025-06-28T22:13:55.788685536Z     }
2025-06-28T22:13:55.788688146Z   ]
2025-06-28T22:13:55.788702257Z }