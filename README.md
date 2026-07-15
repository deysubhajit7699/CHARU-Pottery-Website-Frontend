# Earthen & Co. — React Frontend (Part 1)

## What's in Part 1
- Full project structure (src/api, components, context, pages)
- Design system (CSS variables, typography, buttons, forms)
- AuthContext (login, register, logout, token refresh)
- CartContext (add, update, remove, count)
- App.js with full routing (public, private, admin guards)
- Navbar (sticky, search, cart badge, user dropdown, mobile menu)
- Footer
- AdminLayout (collapsible sidebar)
- HomePage (hero, clay filters, featured, categories, new arrivals)
- ProductsPage (filters sidebar, sort, pagination, skeletons)
- ProductDetailPage (gallery, tabs, reviews, related)
- LoginPage / RegisterPage / ForgotPasswordPage / ResetPasswordPage
- ProductCard component (wishlist, cart, sale badge)

## Setup
```bash
cd pottery-frontend
npm install
npm start
```
Backend must be running at localhost:5000.

## Part 2 will include
- CartPage (full cart with update/remove)
- CheckoutPage (address + Stripe payment)
- OrderSuccessPage
- MyOrdersPage + OrderDetailPage
- ProfilePage (edit profile, addresses, password)
- WishlistPage
- Admin: Dashboard (analytics), Products CRUD, Orders management
