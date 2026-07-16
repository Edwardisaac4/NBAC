import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AeroLabs',
  description: 'Explore AeroLabs at NBAC — the premier hub showcasing cutting-edge aviation technologies, drone solutions, and aerospace startup innovations in Africa.',
};

export default function AeroLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
