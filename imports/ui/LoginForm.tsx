import { Meteor } from "meteor/meteor"
import { FormEvent, useState } from "react"

export const LoginForm = () => {
  // Local state is for UI only (open modal, field being typed).
  // Business data stays in the collection and comes back through a subscription.
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    Meteor.loginWithPassword(username, password)
  }

  return (
    <form className='login-form' onSubmit={handleSubmit}>
      <div>
        <label htmlFor='username'>Username</label>
        <input
          type='text'
          placeholder='Username'
          name='username'
          required
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          placeholder='Password'
          name='password'
          required
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button type='submit'>Log in</button>
      </div>
    </form>
  )
}
