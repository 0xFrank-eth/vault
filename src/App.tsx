import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Vault from './pages/Vault'
import Upload from './pages/Upload'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </>
  )
}

export default App
