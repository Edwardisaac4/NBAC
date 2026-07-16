import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sponsor Application',
  description: 'Apply for a sponsorship package at the Nigerian Business Aviation Conference. Showcase your brand to senior aviation executives across West Africa.',
};

export default function SponsorApplicationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
