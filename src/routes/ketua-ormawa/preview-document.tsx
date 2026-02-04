import { createFileRoute } from '@tanstack/react-router';
import { DocumentPreviewContent } from '@/routes/preview-document';

export const Route = createFileRoute('/ketua-ormawa/preview-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
    };
  },
});

function RouteComponent() {
  const { documentId } = Route.useSearch();

  return <DocumentPreviewContent documentId={documentId} returnPath='/ketua-ormawa' />;
}
