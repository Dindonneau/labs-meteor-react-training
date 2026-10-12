import { Mongo } from "meteor/mongo"

export interface TaskDocument {
  _id: string
  text: string
  userId: string | null
  isChecked?: boolean
  createdAt?: Date
}

export type NewTask = Omit<TaskDocument, "_id" | "userId">

export const TasksCollection = new Mongo.Collection<TaskDocument>("tasks")
