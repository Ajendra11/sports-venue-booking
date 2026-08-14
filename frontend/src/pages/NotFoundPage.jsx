import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/States.jsx';

export default function NotFoundPage() {
  return (
    <main className="page max-w-lg">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="That page doesn't exist. It may have been moved, or the link might be out of date."
        action={<Link to="/" className="btn-primary">Back to venues</Link>}
      />
    </main>
  );
}
