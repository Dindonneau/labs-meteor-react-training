import { Meteor } from "meteor/meteor"
import { Accounts } from "meteor/accounts-base"
import { TasksCollection } from "../imports/api/TasksCollection"

import "../imports/api/TasksPublication"
import "../imports/api/tasksMethods"

const insertTask = async (taskText: string) => {
  await TasksCollection.insertAsync({ text: taskText })
}

const SEED_USERNAME = "meteorite"
const SEED_PASSWORD = "password"

Meteor.startup(async () => {
  if (!(await Accounts.findUserByUsername(SEED_USERNAME))) {
    await Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD
    })
  }

  if ((await TasksCollection.find().countAsync()) === 0) {
    const myTasks = [
      "First Task",
      "Second Task",
      "Third Task",
      "Fourth Task",
      "Fifth Task",
      "Sixth Task",
      "Seventh Task"
    ]

    myTasks.forEach(insertTask)
  }
})
