# Thiqa Frontend

A React-based frontend application with RTL support for Arabic and English languages.

## Features

- **Multi-language Support**: Full RTL/LTR support for Arabic and English
- **Responsive Design**: Mobile-first approach with Bootstrap
- **Profile Management**: Complete user profile page with sidebar navigation
- **Authentication**: Login and signup functionality
- **E-commerce**: Product listings, checkout, and payment processing

## Profile Page

The profile page (`/profile`) includes:

### Features
- **Sidebar Navigation**: Tabbed interface with icons for different sections
- **Profile Information**: Display and edit user details (name, email, phone)
- **Profile Picture**: Circular profile image with camera icon for updates
- **RTL Support**: Automatic layout adjustment for Arabic language
- **Responsive Design**: Mobile-friendly layout

### Navigation Tabs
- Personal Profile (الملف الشخصي)
- Notifications (الاشعارات)
- My Addresses (عنواني)
- My Orders (طلباتي)
- Payment Method (طريقة الدفع)
- Service (الخدمة)
- Favorites (المفضلة)

### RTL Support
The profile page automatically adjusts its layout based on the selected language:
- **LTR (English)**: Sidebar on left, content on right
- **RTL (Arabic)**: Sidebar on right, content on left

### Styling
- Custom SCSS with utility variables
- Consistent with the app's design system
- Smooth transitions and hover effects
- Mobile-responsive breakpoints

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Navigate to `/profile` to view the profile page

## Language Switching

Use the language switcher in the navbar to toggle between English and Arabic. The layout will automatically adjust for RTL support.

## File Structure

```
src/
├── pages/
│   └── Profile.jsx          # Profile page component
├── css/
│   └── pages/
│       └── profile.scss     # Profile page styles
└── locales/
    ├── en.json             # English translations
    └── ar.json             # Arabic translations
```
# thiqa-frontend
