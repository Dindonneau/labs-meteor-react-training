# lemtrain

A training project: the official Meteor tasks tutorial, rebuilt with Meteor 3, React and TypeScript.

Its only purpose is to practise the Meteor fundamentals on a throwaway app — collections, publications, subscriptions, the async server API — before applying them to real work.

Even here, the app runs server-authoritative: no `autopublish`, no `insecure`. Every read goes through an explicit publication, and every write goes through a Meteor method — the client never touches the collection directly.

## The tutorial

The app follows the official Meteor React tutorial: <https://docs.meteor.com/tutorials/react/>

The tutorial is written in JavaScript, but the project was scaffolded with

```bash
meteor create lemtrain --typescript
```

so every step is adapted to TypeScript: `.ts` / `.tsx` modules, collections typed through `Mongo.Collection<T>`, and typed props on the components.

## Stack

- Meteor 3.5
- React 18
- TypeScript
- MongoDB
- Rspack as the bundler (Meteor's modern build pipeline)

## Getting started

```bash
meteor npm install
meteor run
```

The app is served on http://localhost:3000.

> Use `meteor npm`, not `npm`: it runs against the Node version bundled with Meteor.

Run the tests with:

```bash
meteor npm test
```

Check types with:

```bash
meteor npm run typecheck
```

Types are checked during the build too, so this script is mainly for CI and pre-commit checks.

## Inspecting the database

Meteor starts its own MongoDB next to the app, on the port after the app's. While `meteor run` is up, point MongoDB Compass at:

```
mongodb://127.0.0.1:3001/meteor
```

The database is named `meteor` and its files live in `.meteor/local/db`, so `meteor reset` wipes it. The server is stopped together with the app, so the connection only works while `meteor run` is running.

## Layout

```
client/          eagerly loaded on the client — entry point and HTML shell
server/          eagerly loaded on the server — startup, seed, publication and method imports
imports/         lazily loaded: nothing here runs until something imports it
  api/           collections, publications and methods
  ui/            React components
tests/           Mocha test module
```

The split matters: Meteor loads `client/` and `server/` automatically, in a defined order, while `imports/` is only pulled in on demand. Shared code therefore lives under `imports/`, and `server/main.ts` imports the publications and methods it wants to register. `client/main.tsx` imports the methods too, so the client can run their optimistic simulation.

## What it does

A list of tasks, stored in MongoDB and rendered reactively:

- `imports/api/TasksCollection.ts` — the collection, typed with `TaskDocument`
- `imports/api/TasksPublication.ts` — the explicit `tasks` publication
- `imports/api/tasksMethods.ts` — the three `tasks.*` methods, the only write paths
- `imports/ui/App.tsx` — subscribes with `useSubscribe` and reads with `useTracker`
- `imports/ui/TaskForm.tsx` — the form, writing through the method
- `imports/ui/Task.tsx` — a single task row
- `server/main.ts` — seeds a few tasks on first startup

## A pinned dependency

`ts-checker-rspack-plugin` is held at `^1.7.0`, not the `^1.5.2` the Meteor scaffold ships: up to 1.6.x it watches files through `chokidar@3` and `fsevents`, which on macOS drives `meteor run` into an endless restart loop as soon as anything has been npm-installed.

What exactly went wrong, how it was diagnosed and how it was measured: **[docs/pinned-ts-checker-rspack-plugin.md](docs/pinned-ts-checker-rspack-plugin.md)**.
