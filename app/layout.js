import './globals.css'

export const metadata = {
  title: 'TruEstate - Retail Sales Management System',
  description: 'Retail Sales Management System built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

