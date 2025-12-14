import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { UserSetup } from './components/UserSetup'
import { HomePage } from './pages/Home'
import { PostRidePage } from './pages/PostRide'
import { FindRidePage } from './pages/FindRide'
import { MyRidesPage } from './pages/MyRides'

function App() {
    const { user } = useApp()

    // Show user setup if no user
    if (!user) {
        return <UserSetup onComplete={() => { }} />
    }

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post" element={<PostRidePage />} />
            <Route path="/find" element={<FindRidePage />} />
            <Route path="/my-rides" element={<MyRidesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
