import { TaskDocument, TasksCollection } from "../api/TasksCollection"
import { useSubscribe, useTracker } from "meteor/react-meteor-data"
import { Task } from "./Task"
import { TaskForm } from "./TaskForm"
import { Meteor } from "meteor/meteor"
import { useState } from "react"
import { LoginForm } from "./LoginForm"

export const App = () => {
  const user = useTracker(() => Meteor.user())
  const isLoading = useSubscribe("tasks")
  const [hideCompleted, setHideCompleted] = useState(false)

  const logout = () => Meteor.logout()

  const hideCompletedFilter = { isChecked: { $ne: true } }

  const tasks = useTracker(() => {
    if (!user) return []

    return TasksCollection.find(hideCompleted ? hideCompletedFilter : {}, {
      sort: { createdAt: -1 }
    }).fetch()
  })

  const pendingTasksCount = useTracker(() => {
    if (!user) return 0

    return TasksCollection.find(hideCompletedFilter).count()
  })

  const pendingTasksTitle = pendingTasksCount ? ` (${pendingTasksCount})` : ""

  if (isLoading()) {
    return <div>Loading...</div>
  }

  const handleToggleCheck = ({ _id, isChecked }: TaskDocument) => {
    Meteor.callAsync("tasks.update", { _id, isChecked })
  }

  const handleDelete = ({ _id }: TaskDocument) => {
    Meteor.callAsync("tasks.delete", _id)
  }

  return (
    <div className='app'>
      <header>
        <div className='app-bar'>
          <div className='app-header'>
            <h1>
              📝️ To Do List
              {pendingTasksTitle}
            </h1>
          </div>
        </div>
      </header>

      <div className='main'>
        {user ? (
          <>
            <div className='user' onClick={logout}>
              {user.username} 🚪
            </div>

            <TaskForm />

            <div className='filter'>
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? "Show All" : "Hide Completed"}
              </button>
            </div>

            <ul className='tasks'>
              {tasks.map(task => (
                <Task
                  key={task._id}
                  task={task}
                  onCheckboxClick={handleToggleCheck}
                  onDeleteClick={handleDelete}
                />
              ))}
            </ul>
          </>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  )
}
