# Release candidate readiness

Generated: 2026-05-05T21:27:24Z
Branch: `release-candidate/readiness`
Base: `main`

## Verification

Status: PASS

Checks run:
- `npm ci`
- `npm run release:check`
- `bash scripts/validate.sh`
- `node releasebox check .`

## Check output summary

    ## npm ci
    ```
    npm ci
    ```
    ```text
    
    added 3 packages, and audited 4 packages in 487ms
    
    found 0 vulnerabilities
    ```
    RESULT: 0 (0s)
    
    ## npm run release:check
    ```
    npm run release:check
    ```
    ```text
    
    > proofdock@0.1.0 release:check
    > npm run check && npm test && npm run smoke && npm run package:smoke && npm pack --dry-run
    
    
    > proofdock@0.1.0 check
    > tsc -p tsconfig.json --noEmit
    
    
    > proofdock@0.1.0 test
    > npm run build && node --test
    
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    ✔ cli summary emits markdown (375.057208ms)
    ✔ collectProof creates JSON, markdown, html, and redacted previews (241.225583ms)
    ✔ collectProof rejects missing artifacts (165.398375ms)
    ✔ test/helpers.mjs (59.699875ms)
    ✔ redacts common secret patterns (0.767167ms)
    ℹ tests 5
    ℹ suites 0
    ℹ pass 5
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 489.81325
    
    > proofdock@0.1.0 smoke
    > npm run build && node scripts/smoke.mjs
    
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    smoke ok
    
    > proofdock@0.1.0 package:smoke
    > npm run build && node scripts/package-smoke.mjs
    
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    package smoke ok: proofdock-0.1.0.tgz
    npm notice
    npm notice package: proofdock@0.1.0
    npm notice Tarball Contents
    npm notice 1.1kB LICENSE
    npm notice 3.3kB README.md
    npm notice 31B dist/cli.d.ts
    npm notice 4.8kB dist/cli.js
    npm notice 208B dist/collect.d.ts
    npm notice 5.9kB dist/collect.js
    npm notice 280B dist/config.d.ts
    npm notice 2.6kB dist/config.js
    npm notice 180B dist/errors.d.ts
    npm notice 237B dist/errors.js
    npm notice 405B dist/fs-utils.d.ts
    npm notice 1.7kB dist/fs-utils.js
    npm notice 254B dist/git.d.ts
    npm notice 1.3kB dist/git.js
    npm notice 298B dist/index.d.ts
    npm notice 265B dist/index.js
    npm notice 59B dist/redact.d.ts
    npm notice 784B dist/redact.js
    npm notice 246B dist/render.d.ts
    npm notice 3.6kB dist/render.js
    npm notice 1.9kB dist/types.d.ts
    npm notice 11B dist/types.js
    npm notice 1.3kB package.json
    npm notice Tarball Details
    npm notice name: proofdock
    npm notice version: 0.1.0
    npm notice filename: proofdock-0.1.0.tgz
    npm notice package size: 9.6 kB
    npm notice unpacked size: 30.7 kB
    npm notice shasum: a1b7a60d74390896a4596febb7a1fd1998402aaf
    npm notice integrity: sha512-Vg2AjEPWHseXA[...]oGGhP1IZjzgCg==
    npm notice total files: 23
    npm notice
    proofdock-0.1.0.tgz
    ```
    RESULT: 0 (6s)
    
    ## bash scripts/validate.sh
    ```
    bash scripts/validate.sh
    ```
    ```text
    Checking proofdock required files...
    PASS: required file exists: README.md
    PASS: required file exists: AGENTS.md
    PASS: required file exists: CONTRIBUTING.md
    PASS: required file exists: SECURITY.md
    PASS: required file exists: .github/pull_request_template.md
    PASS: required file exists: scripts/validate.sh
    
    Checking proofdock required directories...
    PASS: required directory exists: .github
    PASS: required directory exists: docs
    PASS: required directory exists: scripts
    
    Running local project checks where present...
    NOTE: using package manager: npm
    
    > proofdock@0.1.0 check
    > tsc -p tsconfig.json --noEmit
    
    PASS: package script: check
    
    > proofdock@0.1.0 test
    > npm run build && node --test
    
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    ✔ cli summary emits markdown (419.624125ms)
    ✔ collectProof creates JSON, markdown, html, and redacted previews (242.077875ms)
    ✔ collectProof rejects missing artifacts (222.513334ms)
    ✔ test/helpers.mjs (81.9605ms)
    ✔ redacts common secret patterns (0.785333ms)
    ℹ tests 5
    ℹ suites 0
    ℹ pass 5
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 564.999584
    PASS: package script: test
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    PASS: package script: build
    NOTE: agent-qc not installed; skipping optional agent check
    
    Validation passed.
    ```
    RESULT: 0 (3s)
    
    ## ReleaseBox check
    ```
    node '/Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js' check .
    ```
    ```text
    ✅ releasebox config: node-cli
    ✅ ci workflow: .github/workflows/ci.yml
    ✅ release dry run workflow: .github/workflows/release-dry-run.yml
    ✅ task breakdown: docs/TASKS.md
    ✅ orchestration plan: docs/ORCHESTRATION.md
    ✅ dependabot config: .github/dependabot.yml
    ✅ npm test script: npm run build && node --test
    ✅ build script: tsc -p tsconfig.json
    ✅ smoke script: npm run build && node scripts/smoke.mjs
    ✅ bin entry: {"proofdock":"./dist/cli.js"}
    ```
    RESULT: 0 (0s)
    
