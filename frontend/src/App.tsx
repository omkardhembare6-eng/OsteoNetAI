import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Predict from './pages/Predict'
import Result from './pages/Result'
import History from './pages/History'
import About from './pages/About'

export default function App() {
  const [dark, setDark] = useState(false)

  return (
    <div className={dark ? 'dark' : ''}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navbar dark={dark} setDark={setDark} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/result/:id" element={<Result />} />
              <Route path="/history" element={<History />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  )
}

