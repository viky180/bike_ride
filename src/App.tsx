import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { ModeSelection } from './pages/ModeSelection'
import { HomePage } from './pages/Home'
import { PostRidePage } from './pages/PostRide'
import { FindRidePage } from './pages/FindRide'
import { MyRidesPage } from './pages/MyRides'
import { ProducePage } from './pages/ProducePage'
import { SellProductPage } from './pages/SellProductPage'
import { MyProductsPage } from './pages/MyProductsPage'
import { MyAccountPage } from './pages/MyAccountPage'
import { RequestProductPage } from './pages/RequestProductPage'
import { DemandBoardPage } from './pages/DemandBoardPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { EditProductPage } from './pages/EditProductPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { DeliveryHelpPage } from './pages/DeliveryHelpPage'
import { RegisterDeliveryHelperPage } from './pages/RegisterDeliveryHelperPage'
import { ShopPage } from './pages/ShopPage'
import { ShopSettingsPage } from './pages/ShopSettingsPage'
import { loadDefaultImagesFromDB } from './lib/defaultImages'

function AppRoutes() {
    const { mode } = useApp()

    // Load default images from database on app start
    useEffect(() => {
        loadDefaultImagesFromDB()
    }, [])

    // RIDE SHARING DEACTIVATED: Force 'produce' mode
    // Show mode selection if no mode is set (currently always 'produce')
    if (!mode) {
        return <ModeSelection />
    }

    return (
        <Routes>
            {/* Public routes - Guest can access */}
            <Route path="/" element={<HomePage />} />
            <Route path="/produce" element={<ProducePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/delivery-help" element={<DeliveryHelpPage />} />

            {/* Protected routes - Require authentication */}
            <Route path="/sell" element={<SellProductPage />} />
            <Route path="/my-products" element={<MyProductsPage />} />
            <Route path="/my-account" element={<MyAccountPage />} />
            <Route path="/edit-product/:id" element={<EditProductPage />} />
            <Route path="/request" element={<RequestProductPage />} />
            <Route path="/demand" element={<DemandBoardPage />} />
            <Route path="/delivery-help/register" element={<RegisterDeliveryHelperPage />} />
            <Route path="/shop-settings" element={<ShopSettingsPage />} />

            {/* Public shop pages */}
            <Route path="/shop/:slug" element={<ShopPage />} />

            {/* Ride sharing routes (deactivated) */}
            <Route path="/post" element={<PostRidePage />} />
            <Route path="/find" element={<FindRidePage />} />
            <Route path="/my-rides" element={<MyRidesPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
