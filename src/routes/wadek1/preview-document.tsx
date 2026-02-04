import { createFileRoute } from '@tanstack/react-router';
import { DocumentPreviewContent } from '@/routes/preview-document';

export const Route = createFileRoute('/wadek1/preview-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
    };
  },
});

function RouteComponent() {
  const { documentId } = Route.useSearch();

  return <DocumentPreviewContent documentId={documentId} returnPath='/wadek1' />;
}
