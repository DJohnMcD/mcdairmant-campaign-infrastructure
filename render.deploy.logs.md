2025-06-29T19:04:42.618451471Z   internalQuery: undefined,
2025-06-29T19:04:42.618455332Z   where: undefined,
2025-06-29T19:04:42.618459561Z   schema: undefined,
2025-06-29T19:04:42.618463972Z   table: undefined,
2025-06-29T19:04:42.618467752Z   column: undefined,
2025-06-29T19:04:42.618471532Z   dataType: undefined,
2025-06-29T19:04:42.618475582Z   constraint: undefined,
2025-06-29T19:04:42.618479392Z   file: 'scan.l',
2025-06-29T19:04:42.618483612Z   line: '1236',
2025-06-29T19:04:42.618487792Z   routine: 'scanner_yyerror'
2025-06-29T19:04:42.618491813Z }
2025-06-29T19:07:06.690153251Z ==> Deploying...
2025-06-29T19:07:17.039109535Z 
2025-06-29T19:07:17.039157858Z > personal-ai-assistant@1.0.0 start
2025-06-29T19:07:17.039167418Z > node server.js
2025-06-29T19:07:17.039170368Z 
2025-06-29T19:07:19.641149878Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-06-29T19:07:19.641557661Z 🔍 NODE_ENV: production
2025-06-29T19:07:19.641635265Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-06-29T19:07:20.135496665Z ✅ PostgreSQL connection initialized
2025-06-29T19:07:20.135656214Z 🗂️ Creating campaign database tables...
2025-06-29T19:07:20.237003211Z ✅ Database tables initialized
2025-06-29T19:07:20.240632787Z Warning: connect.session() MemoryStore is not
2025-06-29T19:07:20.240647648Z designed for a production environment, as it will leak
2025-06-29T19:07:20.240650569Z memory, and will not scale past a single process.
2025-06-29T19:07:20.337386105Z Personal AI Assistant running on http://localhost:10000
2025-06-29T19:07:20.337492631Z Dashboard: http://localhost:10000/dashboard
2025-06-29T19:07:20.337546014Z Terri Chat: http://localhost:10000/terri
2025-06-29T19:07:20.337715283Z Attempting to connect to MCP structured thinking server...
2025-06-29T19:07:26.342628662Z Database error: error: syntax error at end of input
2025-06-29T19:07:26.342654202Z     at /app/node_modules/pg/lib/client.js:545:17
2025-06-29T19:07:26.342660622Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-06-29T19:07:26.342664983Z     at async CampaignDatabase.query (/app/database.js:74:24)
2025-06-29T19:07:26.342669523Z     at async CampaignDatabase.get (/app/database.js:93:22)
2025-06-29T19:07:26.342673763Z     at async /app/server.js:128:18 {
2025-06-29T19:07:26.342678093Z   length: 91,
2025-06-29T19:07:26.342682763Z   severity: 'ERROR',
2025-06-29T19:07:26.342696383Z   code: '42601',
2025-06-29T19:07:26.342699093Z   detail: undefined,
2025-06-29T19:07:26.342701424Z   hint: undefined,
2025-06-29T19:07:26.342704093Z   position: '39',
2025-06-29T19:07:26.342707824Z   internalPosition: undefined,
2025-06-29T19:07:26.342710454Z   internalQuery: undefined,
2025-06-29T19:07:26.342712754Z   where: undefined,
2025-06-29T19:07:26.342715054Z   schema: undefined,
2025-06-29T19:07:26.342717724Z   table: undefined,
2025-06-29T19:07:26.342720004Z   column: undefined,
2025-06-29T19:07:26.342722484Z   dataType: undefined,
2025-06-29T19:07:26.342724964Z   constraint: undefined,
2025-06-29T19:07:26.342727324Z   file: 'scan.l',
2025-06-29T19:07:26.342729564Z   line: '1236',
2025-06-29T19:07:26.342731834Z   routine: 'scanner_yyerror'
2025-06-29T19:07:26.342734084Z }
2025-06-29T19:07:27.360405664Z ==> Your service is live 🎉
2025-06-29T19:07:27.432264684Z ==> 
2025-06-29T19:07:27.501097455Z ==> ///////////////////////////////////////////////////////////
2025-06-29T19:07:27.583144324Z ==> 
2025-06-29T19:07:27.661338934Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-06-29T19:07:27.733996034Z ==> 
2025-06-29T19:07:27.748348313Z Sequential Thinking MCP Server running on stdio
2025-06-29T19:07:27.807155004Z ==> ///////////////////////////////////////////////////////////
2025-06-29T19:07:27.846799377Z Connected to MCP structured thinking server
2025-06-29T19:07:27.846877301Z ✓ MCP structured thinking server connected successfully
2025-06-29T19:07:27.934887793Z ✓ Available MCP tools: sequentialthinking
2025-06-29T19:08:27.679043733Z npm error path /app
2025-06-29T19:08:27.679062954Z npm error command failed
2025-06-29T19:08:27.679067734Z npm error signal SIGTERM
2025-06-29T19:08:27.679072264Z npm error command sh -c node server.js
2025-06-29T19:08:27.679076494Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-06-29T19_00_59_552Z-debug-0.log
2025-06-29T19:12:28.442914691Z ==> Detected service running on port 10000
2025-06-29T19:12:28.624333149Z ==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
2025-06-29T19:13:39.320729335Z ==> Deploying...
2025-06-29T19:13:50.699487664Z 
2025-06-29T19:13:50.699535197Z > personal-ai-assistant@1.0.0 start
2025-06-29T19:13:50.699540288Z > node server.js
2025-06-29T19:13:50.699542538Z 
2025-06-29T19:13:53.20633042Z 🔍 Database URL detected: postgresql://campaign_user:***@dpg-d1g6avjipnbc73acf5tg-a.ohio-postgres.render.com/campaign_infrastructure
2025-06-29T19:13:53.206892455Z 🔍 NODE_ENV: production
2025-06-29T19:13:53.2069811Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-06-29T19:13:53.697679118Z ✅ PostgreSQL connection initialized
2025-06-29T19:13:53.697831058Z 🗂️ Creating campaign database tables...
2025-06-29T19:13:53.797229329Z Warning: connect.session() MemoryStore is not
2025-06-29T19:13:53.79724814Z designed for a production environment, as it will leak
2025-06-29T19:13:53.79725106Z memory, and will not scale past a single process.
2025-06-29T19:13:53.803055646Z Personal AI Assistant running on http://localhost:10000
2025-06-29T19:13:53.803203975Z Dashboard: http://localhost:10000/dashboard
2025-06-29T19:13:53.803216896Z Terri Chat: http://localhost:10000/terri
2025-06-29T19:13:54.367068775Z ✓ Created table: users
2025-06-29T19:13:54.369360325Z ✓ Created table: entries
2025-06-29T19:13:54.371028247Z ✓ Created table: agent_responses
2025-06-29T19:13:54.379449934Z ✓ Created table: terri_private
2025-06-29T19:13:54.396019872Z ✓ Created table: campaign_expenses
2025-06-29T19:13:54.403768637Z ✓ Created table: campaign_donors
2025-06-29T19:13:54.406309893Z ✓ Created table: audit_log
2025-06-29T19:13:54.406319473Z ✅ Database tables initialized
2025-06-29T19:13:54.406533747Z Attempting to connect to MCP structured thinking server...
2025-06-29T19:14:00.104337528Z Sequential Thinking MCP Server running on stdio
2025-06-29T19:14:00.20049848Z Connected to MCP structured thinking server
2025-06-29T19:14:00.200524291Z ✓ MCP structured thinking server connected successfully
2025-06-29T19:14:00.203177634Z ✓ Available MCP tools: sequentialthinking
2025-06-29T19:14:00.440530604Z ==> Your service is live 🎉
2025-06-29T19:14:00.514749015Z ==> 
2025-06-29T19:14:00.585461495Z ==> ///////////////////////////////////////////////////////////
2025-06-29T19:14:00.656417976Z ==> 
2025-06-29T19:14:00.727547086Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-06-29T19:14:00.801527376Z ==> 
2025-06-29T19:14:00.870603327Z ==> ///////////////////////////////////////////////////////////
2025-06-29T19:15:00.711168296Z npm error path /app
2025-06-29T19:15:00.711206288Z npm error command failed
2025-06-29T19:15:00.711344446Z npm error signal SIGTERM
2025-06-29T19:15:00.711514676Z npm error command sh -c node server.js
2025-06-29T19:15:00.713141568Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-06-29T19_07_16_458Z-debug-0.log
2025-06-29T19:15:28.967472717Z ==> Deploying...
2025-06-29T19:15:43.703703883Z 🔍 NODE_ENV: production
2025-06-29T19:15:43.703798769Z 🐘 Initializing PostgreSQL connection for cloud deployment...
2025-06-29T19:15:44.114947749Z ✅ PostgreSQL connection initialized
2025-06-29T19:15:44.115152342Z 🗂️ Creating campaign database tables...
2025-06-29T19:15:44.215201459Z Warning: connect.session() MemoryStore is not
2025-06-29T19:15:44.21522116Z designed for a production environment, as it will leak
2025-06-29T19:15:44.21522396Z memory, and will not scale past a single process.
2025-06-29T19:15:44.307370601Z Personal AI Assistant running on http://localhost:10000
2025-06-29T19:15:44.307396783Z Dashboard: http://localhost:10000/dashboard
2025-06-29T19:15:44.307419554Z Terri Chat: http://localhost:10000/terri
2025-06-29T19:15:44.819816537Z ✓ Created table: users
2025-06-29T19:15:44.822847722Z ✓ Created table: entries
2025-06-29T19:15:44.825186761Z ✓ Created table: agent_responses
2025-06-29T19:15:44.826677757Z ✓ Created table: terri_private
2025-06-29T19:15:44.828277379Z ✓ Created table: campaign_expenses
2025-06-29T19:15:44.829583083Z ✓ Created table: campaign_donors
2025-06-29T19:15:44.832996092Z ✓ Created table: audit_log
2025-06-29T19:15:44.833007212Z ✅ Database tables initialized
2025-06-29T19:15:44.833217806Z Attempting to connect to MCP structured thinking server...
2025-06-29T19:15:49.777619093Z ==> Your service is live 🎉
2025-06-29T19:15:49.851964023Z ==> 
2025-06-29T19:15:49.921895764Z ==> ///////////////////////////////////////////////////////////
2025-06-29T19:15:49.989299744Z ==> 
2025-06-29T19:15:50.060671905Z ==> Available at your primary URL https://mcdairmant-campaign-infrastructure.onrender.com
2025-06-29T19:15:50.132034696Z ==> 
2025-06-29T19:15:50.200933566Z ==> ///////////////////////////////////////////////////////////
2025-06-29T19:15:50.715173907Z Sequential Thinking MCP Server running on stdio
2025-06-29T19:15:50.824009757Z Connected to MCP structured thinking server
2025-06-29T19:15:50.824910185Z ✓ MCP structured thinking server connected successfully
2025-06-29T19:15:50.909099286Z ✓ Available MCP tools: sequentialthinking
2025-06-29T19:16:49.988634336Z npm error path /app
2025-06-29T19:16:49.988697Z npm error command failed
2025-06-29T19:16:49.98886126Z npm error signal SIGTERM
2025-06-29T19:16:49.989047421Z npm error command sh -c node server.js
2025-06-29T19:16:49.991159431Z npm error A complete log of this run can be found in: /home/campaign/.npm/_logs/2025-06-29T19_13_50_104Z-debug-0.log
2025-06-29T19:20:48.055676146Z ==> Detected service running on port 10000
2025-06-29T19:20:48.252508184Z ==> Docs on specifying a port: https://render.com/docs/web-services#port-binding