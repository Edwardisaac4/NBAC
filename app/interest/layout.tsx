import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Early Bird Registration & Interest Form | NBAC 2027',
  description: 'Register your interest for the Nigerian Business Aviation Conference (NBAC) 2027 at our AfBAA event stand. Secure early bird discount codes and event updates.',
  openGraph: {
    title: 'Early Bird Registration & Interest Form | NBAC 2027',
    description: 'Register your interest for the Nigerian Business Aviation Conference (NBAC) 2027. Exclusive early bird discount codes available.',
  },
};

export default function InterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
