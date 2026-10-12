# Why ts-checker-rspack-plugin needs at least 1.7.0

Resolved by a dependency upgrade. Up to 1.6.x the plugin sends `meteor run` into an endless rspack restart loop on macOS, which is why the constraint is `^1.7.0` and not the `^1.5.2` the Meteor scaffold ships. The diagnosis took several wrong turns, recorded below so they are not repeated.

## The symptom

`meteor run` restarted the server 20 to 50 times a minute, and the log never reported anything wrong:

```
=> App running at http://localhost:3000/
=> Client modified -- refreshing
=> Server modified -- restarting...
=> Compiled Rspack server app no errors found in 134 ms
=> Linted your app. No linting errors.
=> Meteor server restarted at http://localhost:3000/
=> Client modified -- refreshing
=> Server modified -- restarting...
```

Everything green, nothing edited, and the browser reloading about once a second.

## The real cause

Three conditions had to hold at the same time. Remove any one of them and the loop disappears, which is what made it hard to pin down.

**1. The plugin is enabled.** `TsCheckerRspackPlugin` type-checks asynchronously so it does not slow the build down, and triggers an extra compilation when it finishes.

**2. That extra compilation rewrites a watched file.** Meteor's rspack integration rewrites `_build/main-dev/server-meteor.js` after every server compilation, injecting a fresh `/* rspack-server-build-id:<timestamp> */` marker. Meteor watches that file deliberately: the marker is how it learns a new server bundle is ready and the Node process must restart. The extra pass produces identical code, but the marker changes anyway.

**3. The watcher can see it.** `ts-checker-rspack-plugin` up to 1.6.x depends on `chokidar@^3`, which uses `fsevents` on macOS. `fsevents` is an optional dependency (`optional: true`, `os: ["darwin"]`): `meteor create` does not install it, every `npm install` does. Until it is installed, chokidar falls back to a backend that misses the rewrite, and nothing restarts.

So the chain closes on the first `npm install` in the project, whatever is being installed — even a pure-JavaScript package with no native build. Before that, conditions 1 and 2 sit there harmlessly.

## The fix

`ts-checker-rspack-plugin@1.7.0`, published on 10 October 2026, moved from `chokidar@^3` to `chokidar@^4`, which dropped `fsevents` altogether and ships nested inside the plugin. Upgrading breaks condition 3 for good:

```json
"ts-checker-rspack-plugin": "^1.7.0"
```

Build-time type checking is kept. Verified on this repository with `fsevents` installed: zero restarts over 60 seconds, and a deliberate `const probe: number = "not a number"` still reported as `TS2322` with `found 1 error`. Note that 1.7.0 no longer prints a separate `[type-check]` line — the result is folded into the `Compiled Rspack server app` line, so its absence is not a sign that checking stopped.

Do not work around this by deleting `fsevents`. The only project-wide switch is `omit=optional` in `.npmrc`, and this tree holds 86 optional packages, among them `@rspack/binding-darwin-arm64`, `@swc/core-darwin-arm64` and `@typescript/typescript-darwin-arm64` — the bundler, the transpiler and the type checker themselves. Deleting the directory by hand does not hold either, since the next `npm install` puts it back.

## How it was diagnosed

The order matters more than the dates: every step below was wrong in a way the next one corrected.

1. **Captured the output.** `meteor run > log 2>&1`, then read it. No stack trace, only green lines, so a rebuild loop rather than a crash loop. Two signals had suggested a crash and both are worthless here: `curl localhost:3000` answers `200` even while the app is down, because the `meteor run` proxy serves the shell; and the application process gets a new PID every second in either case.
2. **Scanned the project for churning files.** Nothing in the sources changed. The file being rewritten lives in `_build`, which is easy to exclude from a search and easy to overlook.
3. **Blamed `zodern:types`** for regenerating `.meteor/local/types/packages.d.ts`. Plausible, unverified, and wrong.
4. **Replayed every commit** from the initial scaffold to the last merge into a fresh `meteor create` project. Not one of them looped, so the source was not the variable. This run had no `fsevents`, which made the result meaningless — see step 7.
5. **Compared dependency trees** between a looping and a healthy project. `fsevents` was present on one side only. Adding it made the loop appear, removing it made the loop stop, in both directions. Conclusion: `fsevents` is the cause. Wrong, because necessary is not sufficient.
6. **A second fresh project refuted that.** Created the next morning, it had `fsevents` and did not loop. One counter-example was enough to bring the whole thing down.
7. **Replayed the commits again, with `fsevents` installed.** Every state looped, including the bare scaffold. So neither the source nor `fsevents` alone.
8. **Compared the dependency trees of two projects carrying identical source**, one looping and one not. One meaningful difference remained: `ts-checker-rspack-plugin` 1.6.2 against 1.7.0, the newer one shipping its own nested `chokidar@4`.
9. **Upgraded in place and measured.** Zero restarts, type errors still reported.

Three lessons. A shared `node_modules`, symlinked between git worktrees, invalidates any measurement about a file watcher — that mistake produced three confident and wrong results. Replaying a project's history proves nothing when the variable lives in `node_modules`. And when someone says a behaviour is new, the differential is real: look for what changed around the code rather than defending the measurement.

## Measurements

Same source, same machine, 45 to 60 second windows, counting `Meteor server restarted`:

| `ts-checker-rspack-plugin` | `fsevents` | Plugin | Restarts |
| --- | --- | --- | --- |
| 1.6.2 | absent | enabled | 0 |
| 1.6.2 | present | enabled | 20 to 50 |
| 1.6.2 | present | removed | 0 |
| 1.7.0 | present | enabled | **0** |

Hot reload was timed in each combination by editing a source file: two seconds every time. None of these configurations degrades developer feedback — only the restart count differs.
