# webpack-virtual-modules (vendored)

Copied from [webpack-virtual-modules@0.6.2](https://github.com/sysgears/webpack-virtual-modules) (MIT).

Used by `readme-webpack-plugin.js` to inject virtual readme/manifest modules during webpack compile.

**Why vendor:** `@kne/modules-dev` previously depended on `webpack-virtual-modules@^0.5.0`. That release throws `Cannot read properties of null (reading 'fileWatchers')` when `writeModule` runs while `WatchFileSystem.watcher` is still `null` (common on newer Node/webpack). `0.6.2` guards this; keeping the implementation in-repo avoids relying on the external package resolution.
