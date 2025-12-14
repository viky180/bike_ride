import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { UserSetup } from './components/UserSetup'
import { HomePage } from './pages/Home'
import { PostRidePage } from './pages/PostRide'
import { FindRidePage } from './pages/FindRide'
import { MyRidesPage } from './pages/MyRides'
import { ProducePage } from './pages/ProducePage'
import { SellProductPage } from './pages/SellProductPage'
import { MyProductsPage } from './pages/MyProductsPage'

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
            {/* Produce Module */}
            <Route path="/produce" element={<ProducePage />} />
            <Route path="/sell" element={<SellProductPage />} />
            <Route path="/my-products" element={<MyProductsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
