# SageBwd NVIDIA Pre-Prepared Runtime

This folder is a pre-prepared isolated runtime for the future NVIDIA SageBwd experiment.

Current status:

- It is reserved for future SageBwd integration work.
- The current build does not expose Sage or SageBwd training through this runtime.
- The environment exists so the project can plug in the official SageBwd code quickly once it is publicly released.

What this runtime is for right now:

- Keeping a separate Python environment ready for future SageBwd work.
- Avoiding pollution of the main training runtime.
- Allowing internal probe/debug work on the branch without exposing unfinished functionality to users.

Internal entry:

- The old root-level launcher has been intentionally removed so normal users do not see an unfinished SageBwd entry point.
- If internal maintenance is needed, use:
  `python_sagebwd_nvidia\run_internal_sagebwd_prep.bat`

Important note:

- Even if some Sage-related packages are present here for internal testing, the current project build treats this runtime as a reserved staging environment, not as a supported SageBwd training runtime.
