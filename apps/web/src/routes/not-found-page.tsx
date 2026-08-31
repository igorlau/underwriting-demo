import { Link } from 'react-router-dom';
import { Container } from '@/components/app-shell';
import { EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <Container className="py-20">
      <EmptyState
        title="Page not found"
        description="The view you asked for does not exist in this workspace."
        action={
          <Button asChild variant="outline">
            <Link to="/deals">Back to Deal Pipeline</Link>
          </Button>
        }
      />
    </Container>
  );
}
