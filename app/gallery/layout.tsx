import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse photos and highlights from past Nigerian Business Aviation Conference editions — conferences, exhibitions, gala dinners, and networking events.',
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
