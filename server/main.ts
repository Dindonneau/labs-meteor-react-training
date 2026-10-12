import { Meteor } from "meteor/meteor"
import { Accounts } from "meteor/accounts-base"
import { TasksCollection } from "../imports/api/TasksCollection"

import "../imports/api/TasksPublication"
import "../imports/api/tasksMethods"

const insertTask = async (taskText: string, user: Meteor.User) => {
  await TasksCollection.insertAsync({
    text: taskText,
    userId: user._id,
    createdAt: new Date()
  })
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

  const user = await Accounts.findUserByUsername(SEED_USERNAME)
  if (!user) throw new Error("User not found, which should never happen")

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

    myTasks.forEach(taskText => insertTask(taskText, user))
  }
})
