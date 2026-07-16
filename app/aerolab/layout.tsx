import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AeroLab',
  description: 'Explore AeroLab at NBAC — the premier hub showcasing cutting-edge aviation technologies, drone solutions, and aerospace startup innovations in Africa.',
};

export default function AeroLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
