import { Meteor } from "meteor/meteor"
import { NewTask, TaskDocument, TasksCollection } from "./TasksCollection"

Meteor.methods({
  "tasks.insert"(doc: NewTask) {
    return TasksCollection.insertAsync({ ...doc, userId: this.userId })
  },

  "tasks.update"({ _id, isChecked }: Pick<TaskDocument, "_id" | "isChecked">) {
    return TasksCollection.updateAsync(_id, { $set: { isChecked: !isChecked } })
  },

  "tasks.delete"(_id: string) {
    return TasksCollection.removeAsync(_id)
  }
})
