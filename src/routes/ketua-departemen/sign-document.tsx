import { createFileRoute } from '@tanstack/react-router';
import { SignDocumentContent } from '@/routes/sign-document';

export const Route = createFileRoute('/ketua-departemen/sign-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
    };
  },
});

function RouteComponent() {
  const { documentId } = Route.useSearch();

  return <SignDocumentContent documentId={documentId} returnPath='/ketua-departemen' />;
}
