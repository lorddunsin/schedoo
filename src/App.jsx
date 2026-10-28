
import './App.css'
import Dashboard from './componenets/home/Dashboard'
import Home from './componenets/home/Home'
import { Route, Routes } from 'react-router-dom'
import Tasks from './componenets/home/Task'
import CreateTask from './componenets/home/CreateTask'
import TaskReminderService from './componenets/TaskReminderService'
import Calendar from './componenets/home/Calender'
import Notification from './componenets/home/Notification'
import Setting from './componenets/home/setting'



function App() {
 

  return (
    <>
        <TaskReminderService />
      <Routes>
      <Route path='/' element={<Home/>} >
      <Route index element={<Dashboard/>} />
      <Route path='tasks' element={<Tasks/>} />
<Route path='create-task' element={<CreateTask/>}/>
<Route path='calendar' element={<Calendar/>}/>
<Route path='notifications' element={<Notification/>}/>
<Route path="/settings" element={<Setting />} />
      </Route>
        
      </Routes>
    
      
    </>
  )
}

export default App
