import '@/app/globals.css';

export const metadata = {
  title: 'Job Management System',
  description: 'Real-time job management with Socket.IO',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
