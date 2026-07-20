import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speakers',
  description: 'Meet the industry experts, civil aviation regulators, global operators, and executive leaders speaking at the Nigerian Business Aviation Conference.',
};

export default function SpeakersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
