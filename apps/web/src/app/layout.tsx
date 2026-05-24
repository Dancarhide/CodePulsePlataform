import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodePulse Platform',
  description: 'A state-of-the-art educational and competitive programming platform with microservices.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
