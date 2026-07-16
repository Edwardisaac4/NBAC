import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Announcements',
  description: 'Stay updated with the latest news, press releases, reports, and industry announcements from the Nigerian Business Aviation Conference (NBAC).',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
