2025-06-28T15:12:11.780787979Z ==> Cloning from https://github.com/DJohnMcD/mcdairmant-campaign-infrastructure
2025-06-28T15:12:12.773103809Z ==> Checking out commit fe813df76f8db8eab04672299509530da03e25ed in branch main
2025-06-28T15:12:15.107729659Z #1 [internal] load build definition from Dockerfile
2025-06-28T15:12:15.10776143Z #1 transferring dockerfile: 848B done
2025-06-28T15:12:15.10776427Z #1 DONE 0.0s
2025-06-28T15:12:15.10776604Z 
2025-06-28T15:12:15.107767831Z #2 [internal] load metadata for docker.io/library/node:18-alpine
2025-06-28T15:12:15.709017629Z #2 ...
2025-06-28T15:12:15.709031839Z 
2025-06-28T15:12:15.709034829Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2025-06-28T15:12:15.709039119Z #3 DONE 0.0s
2025-06-28T15:12:15.859247643Z 
2025-06-28T15:12:15.859262584Z #2 [internal] load metadata for docker.io/library/node:18-alpine
2025-06-28T15:12:17.314732738Z #2 DONE 2.3s
2025-06-28T15:12:17.453613783Z 
2025-06-28T15:12:17.453633254Z #4 [internal] load .dockerignore
2025-06-28T15:12:17.453635554Z #4 transferring context: 2B done
2025-06-28T15:12:17.453637344Z #4 DONE 0.0s
2025-06-28T15:12:17.453638954Z 
2025-06-28T15:12:17.453641715Z #5 [1/8] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
2025-06-28T15:12:17.453643684Z #5 resolve docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e done
2025-06-28T15:12:18.854048921Z #5 extracting sha256:f18232174bc91741fdf3da96d85011092101a032a93a388b79e99e69c2d5c870
2025-06-28T15:12:19.310617777Z #5 ...
2025-06-28T15:12:19.310630717Z 
2025-06-28T15:12:19.310633957Z #6 [internal] load build context
2025-06-28T15:12:19.310636827Z #6 transferring context: 42.70MB 1.8s done
2025-06-28T15:12:19.310639007Z #6 DONE 1.8s
2025-06-28T15:12:19.310641007Z 
2025-06-28T15:12:19.310643607Z #5 [1/8] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
2025-06-28T15:12:19.310646317Z #5 extracting sha256:f18232174bc91741fdf3da96d85011092101a032a93a388b79e99e69c2d5c870 0.3s done
2025-06-28T15:12:20.365202428Z #5 extracting sha256:dd71dde834b5c203d162902e6b8994cb2309ae049a0eabc4efea161b2b5a3d0e
2025-06-28T15:12:22.27821395Z #5 extracting sha256:dd71dde834b5c203d162902e6b8994cb2309ae049a0eabc4efea161b2b5a3d0e 2.0s done
2025-06-28T15:12:22.27823546Z #5 extracting sha256:1e5a4c89cee5c0826c540ab06d4b6b491c96eda01837f430bd47f0d26702d6e3 0.1s done
2025-06-28T15:12:22.27824002Z #5 DONE 4.9s
2025-06-28T15:12:22.409314581Z 
2025-06-28T15:12:22.409338832Z #5 [1/8] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
2025-06-28T15:12:22.409343372Z #5 extracting sha256:25ff2da83641908f65c3a74d80409d6b1b62ccfaab220b9ea70b80df5a2e0549 0.0s done
2025-06-28T15:12:22.409346512Z #5 DONE 5.0s
2025-06-28T15:12:22.409349342Z 
2025-06-28T15:12:22.409353142Z #7 [2/8] WORKDIR /app
2025-06-28T15:12:22.409356112Z #7 DONE 0.0s
2025-06-28T15:12:22.409358732Z 
2025-06-28T15:12:22.409362992Z #8 [3/8] RUN mkdir -p /app/uploads
2025-06-28T15:12:22.409365792Z #8 DONE 0.1s
2025-06-28T15:12:22.409368383Z 
2025-06-28T15:12:22.409372483Z #9 [4/8] COPY package*.json ./
2025-06-28T15:12:22.409375333Z #9 DONE 0.1s
2025-06-28T15:12:22.559610785Z 
2025-06-28T15:12:22.559636306Z #10 [5/8] RUN npm ci --only=production
2025-06-28T15:12:22.710223079Z #10 0.166 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
2025-06-28T15:12:23.419657295Z #10 0.937 npm warn EBADENGINE Unsupported engine {
2025-06-28T15:12:23.419682406Z #10 0.937 npm warn EBADENGINE   package: '@isaacs/balanced-match@4.0.1',
2025-06-28T15:12:23.419687906Z #10 0.937 npm warn EBADENGINE   required: { node: '20 || >=22' },
2025-06-28T15:12:23.419704887Z #10 0.937 npm warn EBADENGINE   current: { node: 'v18.20.8', npm: '10.8.2' }
2025-06-28T15:12:23.419709047Z #10 0.937 npm warn EBADENGINE }
2025-06-28T15:12:23.419712357Z #10 0.937 npm warn EBADENGINE Unsupported engine {
2025-06-28T15:12:23.419715367Z #10 0.937 npm warn EBADENGINE   package: '@isaacs/brace-expansion@5.0.0',
2025-06-28T15:12:23.419718287Z #10 0.937 npm warn EBADENGINE   required: { node: '20 || >=22' },
2025-06-28T15:12:23.419721137Z #10 0.937 npm warn EBADENGINE   current: { node: 'v18.20.8', npm: '10.8.2' }
2025-06-28T15:12:23.419724357Z #10 0.937 npm warn EBADENGINE }
2025-06-28T15:12:23.419727387Z #10 0.938 npm warn EBADENGINE Unsupported engine {
2025-06-28T15:12:23.419730347Z #10 0.938 npm warn EBADENGINE   package: 'minimatch@10.0.3',
2025-06-28T15:12:23.419733687Z #10 0.938 npm warn EBADENGINE   required: { node: '20 || >=22' },
2025-06-28T15:12:23.419736847Z #10 0.938 npm warn EBADENGINE   current: { node: 'v18.20.8', npm: '10.8.2' }
2025-06-28T15:12:23.419740288Z #10 0.938 npm warn EBADENGINE }
2025-06-28T15:12:23.419743668Z #10 0.939 npm warn EBADENGINE Unsupported engine {
2025-06-28T15:12:23.419747618Z #10 0.939 npm warn EBADENGINE   package: 'better-sqlite3@12.1.1',
2025-06-28T15:12:23.419751818Z #10 0.939 npm warn EBADENGINE   required: { node: '20.x || 22.x || 23.x || 24.x' },
2025-06-28T15:12:23.419753898Z #10 0.939 npm warn EBADENGINE   current: { node: 'v18.20.8', npm: '10.8.2' }
2025-06-28T15:12:23.419755978Z #10 0.939 npm warn EBADENGINE }
2025-06-28T15:12:23.419757998Z #10 0.940 npm warn EBADENGINE Unsupported engine {
2025-06-28T15:12:23.419760048Z #10 0.940 npm warn EBADENGINE   package: 'eventsource-parser@3.0.3',
2025-06-28T15:12:23.419762088Z #10 0.940 npm warn EBADENGINE   required: { node: '>=20.0.0' },
2025-06-28T15:12:23.419764248Z #10 0.940 npm warn EBADENGINE   current: { node: 'v18.20.8', npm: '10.8.2' }
2025-06-28T15:12:23.419766268Z #10 0.940 npm warn EBADENGINE }
2025-06-28T15:12:23.419768368Z #10 0.951 npm error code EUSAGE
2025-06-28T15:12:23.419770868Z #10 0.952 npm error
2025-06-28T15:12:23.419786169Z #10 0.952 npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
2025-06-28T15:12:23.419788509Z #10 0.952 npm error
2025-06-28T15:12:23.419790869Z #10 0.952 npm error Missing: pg@8.16.3 from lock file
2025-06-28T15:12:23.419793039Z #10 0.952 npm error Missing: pg-cloudflare@1.2.7 from lock file
2025-06-28T15:12:23.419795129Z #10 0.952 npm error Missing: pg-connection-string@2.9.1 from lock file
2025-06-28T15:12:23.419797299Z #10 0.952 npm error Missing: pg-pool@3.10.1 from lock file
2025-06-28T15:12:23.419799369Z #10 0.952 npm error Missing: pg-protocol@1.10.3 from lock file
2025-06-28T15:12:23.419801459Z #10 0.952 npm error Missing: pg-types@2.2.0 from lock file
2025-06-28T15:12:23.419803559Z #10 0.952 npm error Missing: pgpass@1.0.5 from lock file
2025-06-28T15:12:23.419805579Z #10 0.952 npm error Missing: pg-int8@1.0.1 from lock file
2025-06-28T15:12:23.41980767Z #10 0.952 npm error Missing: postgres-array@2.0.0 from lock file
2025-06-28T15:12:23.41980977Z #10 0.952 npm error Missing: postgres-bytea@1.0.0 from lock file
2025-06-28T15:12:23.41981182Z #10 0.952 npm error Missing: postgres-date@1.0.7 from lock file
2025-06-28T15:12:23.41981397Z #10 0.952 npm error Missing: postgres-interval@1.2.0 from lock file
2025-06-28T15:12:23.41981609Z #10 0.952 npm error Missing: split2@4.2.0 from lock file
2025-06-28T15:12:23.4198183Z #10 0.952 npm error
2025-06-28T15:12:23.41982102Z #10 0.952 npm error Clean install a project
2025-06-28T15:12:23.4198231Z #10 0.952 npm error
2025-06-28T15:12:23.41983092Z #10 0.952 npm error Usage:
2025-06-28T15:12:23.41983309Z #10 0.952 npm error npm ci
2025-06-28T15:12:23.41983514Z #10 0.952 npm error
2025-06-28T15:12:23.41983726Z #10 0.952 npm error Options:
2025-06-28T15:12:23.419847111Z #10 0.952 npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
2025-06-28T15:12:23.419851281Z #10 0.952 npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
2025-06-28T15:12:23.419853531Z #10 0.952 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
2025-06-28T15:12:23.419855641Z #10 0.952 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
2025-06-28T15:12:23.419857701Z #10 0.952 npm error [--no-bin-links] [--no-fund] [--dry-run]
2025-06-28T15:12:23.419859771Z #10 0.952 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
2025-06-28T15:12:23.419861911Z #10 0.952 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
2025-06-28T15:12:23.419864011Z #10 0.952 npm error
2025-06-28T15:12:23.419866111Z #10 0.952 npm error aliases: clean-install, ic, install-clean, isntall-clean
2025-06-28T15:12:23.419868171Z #10 0.952 npm error
2025-06-28T15:12:23.419870241Z #10 0.952 npm error Run "npm help ci" for more info
2025-06-28T15:12:23.419872292Z #10 0.953 npm notice
2025-06-28T15:12:23.419874332Z #10 0.953 npm notice New major version of npm available! 10.8.2 -> 11.4.2
2025-06-28T15:12:23.419876372Z #10 0.953 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.2
2025-06-28T15:12:23.419878452Z #10 0.953 npm notice To update run: npm install -g npm@11.4.2
2025-06-28T15:12:23.419880512Z #10 0.953 npm notice
2025-06-28T15:12:23.419883212Z #10 0.953 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-06-28T15_12_22_538Z-debug-0.log
2025-06-28T15:12:23.419885312Z #10 ERROR: process "/bin/sh -c npm ci --only=production" did not complete successfully: exit code: 1
2025-06-28T15:12:23.433951632Z ------
2025-06-28T15:12:23.433963862Z  > [5/8] RUN npm ci --only=production:
2025-06-28T15:12:23.433966672Z 0.952 npm error
2025-06-28T15:12:23.433970482Z 0.952 npm error aliases: clean-install, ic, install-clean, isntall-clean
2025-06-28T15:12:23.433974272Z 0.952 npm error
2025-06-28T15:12:23.433978222Z 0.952 npm error Run "npm help ci" for more info
2025-06-28T15:12:23.433981692Z 0.953 npm notice
2025-06-28T15:12:23.433985373Z 0.953 npm notice New major version of npm available! 10.8.2 -> 11.4.2
2025-06-28T15:12:23.433988613Z 0.953 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.2
2025-06-28T15:12:23.433992533Z 0.953 npm notice To update run: npm install -g npm@11.4.2
2025-06-28T15:12:23.433995703Z 0.953 npm notice
2025-06-28T15:12:23.433999933Z 0.953 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-06-28T15_12_22_538Z-debug-0.log
2025-06-28T15:12:23.434003843Z ------
2025-06-28T15:12:23.435129067Z Dockerfile:14
2025-06-28T15:12:23.435139757Z --------------------
2025-06-28T15:12:23.435142337Z   12 |     
2025-06-28T15:12:23.435145487Z   13 |     # Install dependencies
2025-06-28T15:12:23.435147887Z   14 | >>> RUN npm ci --only=production
2025-06-28T15:12:23.435150427Z   15 |     
2025-06-28T15:12:23.435153007Z   16 |     # Copy application code
2025-06-28T15:12:23.435156608Z --------------------
2025-06-28T15:12:23.435159488Z error: failed to solve: process "/bin/sh -c npm ci --only=production" did not complete successfully: exit code: 1
2025-06-28T15:12:23.448832045Z error: exit status 1