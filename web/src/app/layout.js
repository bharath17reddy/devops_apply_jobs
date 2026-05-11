import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'Career Ops Dashboard',
  description: 'Manage your career trajectory with precision.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation />
          <main style={{ flex: 1, padding: '2rem', marginLeft: 'var(--sidebar-width)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
