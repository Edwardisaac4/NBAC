import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delegate Registration',
  description: 'Register as a delegate for the Nigerian Business Aviation Conference. Select your pass tier, reserve your seat, and join West Africa\'s premier aviation summit.',
};

export default function DelegateRegistrationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
