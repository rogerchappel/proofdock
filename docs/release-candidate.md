# Release candidate readiness

Generated: 2026-05-05T21:24:26Z
Branch: `release-candidate/readiness`
Base: `origin/main`

## Verification

Status: BLOCKED - one or more local readiness checks failed

Checks run:
- `npm run release:check`
- `bash scripts/validate.sh`
- `node releasebox check .`

## Check output summary

    ## npm run release:check
    ```
    npm run release:check
    ```
    ```text
    
    > proofdock@0.1.0 release:check
    > npm run check && npm test && npm run smoke && npm run package:smoke && npm pack --dry-run
    
    
    > proofdock@0.1.0 check
    > tsc -p tsconfig.json --noEmit
    
    error TS2688: Cannot find type definition file for 'node'.
      The file is in the program because:
        Entry point of type library 'node' specified in compilerOptions
    ```
    RESULT: 2 (0s)
    
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
    
    error TS2688: Cannot find type definition file for 'node'.
      The file is in the program because:
        Entry point of type library 'node' specified in compilerOptions
    FAIL: package script: check
    
    > proofdock@0.1.0 test
    > npm run build && node --test
    
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    error TS2688: Cannot find type definition file for 'node'.
      The file is in the program because:
        Entry point of type library 'node' specified in compilerOptions
    FAIL: package script: test
    
    > proofdock@0.1.0 build
    > tsc -p tsconfig.json
    
    error TS2688: Cannot find type definition file for 'node'.
      The file is in the program because:
        Entry point of type library 'node' specified in compilerOptions
    FAIL: package script: build
    NOTE: agent-qc not installed; skipping optional agent check
    
    Validation failed.
    ```
    RESULT: 1 (1s)
    
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
    
