import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { UserSetup } from './components/UserSetup'
import { ModeSelection } from './pages/ModeSelection'
import { HomePage } from './pages/Home'
import { PostRidePage } from './pages/PostRide'
import { FindRidePage } from './pages/FindRide'
import { MyRidesPage } from './pages/MyRides'
import { ProducePage } from './pages/ProducePage'
import { SellProductPage } from './pages/SellProductPage'
import { MyProductsPage } from './pages/MyProductsPage'
import { RequestProductPage } from './pages/RequestProductPage'
import { DemandBoardPage } from './pages/DemandBoardPage'

function App() {
    const { user, mode } = useApp()

    // Show user setup if no user
    if (!user) {
        return <UserSetup onComplete={() => { }} />
    }

    // Show mode selection if no mode is set
    if (!mode) {
        return <ModeSelection />
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
            {/* Demand Board */}
            <Route path="/request" element={<RequestProductPage />} />
            <Route path="/demand" element={<DemandBoardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
