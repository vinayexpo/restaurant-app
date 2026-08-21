import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PrivateRoute, PublicOnlyRoute } from './components/PrivateRoute'
import { PageSkeleton } from './components/PageSkeleton'
import { CustomerLayout } from './layouts/CustomerLayout'
import { OwnerLayout } from './layouts/OwnerLayout'
import { DeliveryLayout } from './layouts/DeliveryLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { SuperadminLayout } from './layouts/SuperadminLayout'
import { setSettings } from './features/ui/uiSlice'
import { logout } from './features/auth/authSlice'
import { authService } from './services/authService'
import api from './lib/axios'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))

const Home = lazy(() => import('./pages/customer/Home'))
const Restaurants = lazy(() => import('./pages/customer/Restaurants'))
const RestaurantDetail = lazy(() => import('./pages/customer/RestaurantDetail'))
const Search = lazy(() => import('./pages/customer/Search'))
const Cart = lazy(() => import('./pages/customer/Cart'))
const Checkout = lazy(() => import('./pages/customer/Checkout'))
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'))
const OrderTracking = lazy(() => import('./pages/customer/OrderTracking'))
const Profile = lazy(() => import('./pages/customer/Profile'))
const LoyaltyProfile = lazy(() => import('./pages/customer/LoyaltyProfile'))
const Notifications = lazy(() => import('./pages/customer/Notifications'))

const RegisterRestaurant = lazy(() => import('./pages/owner/RegisterRestaurant'))
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'))
const OwnerOrders = lazy(() => import('./pages/owner/Orders'))
const CategoryManager = lazy(() => import('./pages/owner/CategoryManager'))
const MenuItems = lazy(() => import('./pages/owner/MenuItems'))
const ItemForm = lazy(() => import('./pages/owner/ItemForm'))
const RestaurantSettings = lazy(() => import('./pages/owner/RestaurantSettings'))
const OwnerReviews = lazy(() => import('./pages/owner/Reviews'))
const OwnerCoupons = lazy(() => import('./pages/owner/Coupons'))
const OwnerRevenue = lazy(() => import('./pages/owner/Revenue'))

const DeliveryDashboard = lazy(() => import('./pages/delivery/Dashboard'))
const DeliveryOrders = lazy(() => import('./pages/delivery/Orders'))
const ActiveDelivery = lazy(() => import('./pages/delivery/ActiveDelivery'))
const DeliveryEarnings = lazy(() => import('./pages/delivery/Earnings'))
const DeliveryProfile = lazy(() => import('./pages/delivery/Profile'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminRestaurants = lazy(() => import('./pages/admin/Restaurants'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminDeliveryPartners = lazy(() => import('./pages/admin/DeliveryPartners'))
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'))
const AdminLoyalty = lazy(() => import('./pages/admin/Loyalty'))
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))

const SuperadminDashboard = lazy(() => import('./pages/superadmin/Dashboard'))
const SuperadminAdmins = lazy(() => import('./pages/superadmin/Admins'))
const SuperadminCommissions = lazy(() => import('./pages/superadmin/Commissions'))
const SuperadminAuditLogs = lazy(() => import('./pages/superadmin/AuditLogs'))
const SuperadminFinancials = lazy(() => import('./pages/superadmin/Financials'))
const SuperadminFeatureFlags = lazy(() => import('./pages/superadmin/FeatureFlags'))
const SuperadminImpersonation = lazy(() => import('./pages/superadmin/Impersonation'))
const SuperadminSettings = lazy(() => import('./pages/superadmin/Settings'))

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token } = useSelector((state) => state.auth)

  useEffect(() => {
    api.get('/settings/public').then(({ data }) => dispatch(setSettings(data.data)))
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && token) {
      authService.me().catch(() => dispatch(logout()))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Customer */}
          <Route element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurants/:slug" element={<RestaurantDetail />} />
            <Route path="search" element={<Search />} />

            <Route
              path="cart"
              element={
                <PrivateRoute roles={['customer']}>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="checkout"
              element={
                <PrivateRoute roles={['customer']}>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="orders"
              element={
                <PrivateRoute roles={['customer']}>
                  <OrderHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="orders/:id"
              element={
                <PrivateRoute roles={['customer']}>
                  <OrderTracking />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute roles={['customer']}>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="profile/loyalty"
              element={
                <PrivateRoute roles={['customer']}>
                  <LoyaltyProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <PrivateRoute roles={['customer']}>
                  <Notifications />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Owner */}
          <Route
            path="/owner/register-restaurant"
            element={
              <PrivateRoute roles={['customer', 'restaurant_owner']}>
                <RegisterRestaurant />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <PrivateRoute roles={['restaurant_owner']}>
                <OwnerLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="orders" element={<OwnerOrders />} />
            <Route path="menu/categories" element={<CategoryManager />} />
            <Route path="menu/items" element={<MenuItems />} />
            <Route path="menu/items/new" element={<ItemForm />} />
            <Route path="menu/items/:id/edit" element={<ItemForm />} />
            <Route path="reviews" element={<OwnerReviews />} />
            <Route path="coupons" element={<OwnerCoupons />} />
            <Route path="revenue" element={<OwnerRevenue />} />
            <Route path="settings" element={<RestaurantSettings />} />
          </Route>

          {/* Delivery Partner */}
          <Route
            path="/delivery"
            element={
              <PrivateRoute roles={['delivery_partner']}>
                <DeliveryLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<DeliveryDashboard />} />
            <Route path="orders" element={<DeliveryOrders />} />
            <Route path="orders/:id" element={<ActiveDelivery />} />
            <Route path="earnings" element={<DeliveryEarnings />} />
            <Route path="profile" element={<DeliveryProfile />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin', 'superadmin']}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="loyalty" element={<AdminLoyalty />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Superadmin */}
          <Route
            path="/superadmin"
            element={
              <PrivateRoute roles={['superadmin']}>
                <SuperadminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<SuperadminDashboard />} />
            <Route path="admins" element={<SuperadminAdmins />} />
            <Route path="commissions" element={<SuperadminCommissions />} />
            <Route path="audit-logs" element={<SuperadminAuditLogs />} />
            <Route path="financials" element={<SuperadminFinancials />} />
            <Route path="feature-flags" element={<SuperadminFeatureFlags />} />
            <Route path="impersonation" element={<SuperadminImpersonation />} />
            <Route path="settings" element={<SuperadminSettings />} />
          </Route>

          {/* Auth */}
          <Route
            path="/auth/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
