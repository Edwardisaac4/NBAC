import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Media Accreditation',
  description: 'Journalists, editors, photographers and broadcast crews can apply for media accreditation to cover the Nigerian Business Aviation Conference 2027.',
};

export default function PressAccreditationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
