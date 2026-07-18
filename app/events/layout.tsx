import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events Program',
  description: 'Explore the full schedule, expert panels, exclusive keynote sessions, and networking event agenda of the Nigerian Business Aviation Conference.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
