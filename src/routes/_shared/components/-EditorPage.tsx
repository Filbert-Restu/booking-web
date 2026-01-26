import { WordEditorPlaceholder } from '@/shared/components/common/WordEditorPlaceholder';
import type { ApprovalDocType, ApprovalModeType } from '../approval-mock';

interface EditorPageProps {
  roleName: string;
  doc?: ApprovalDocType;
  mode?: ApprovalModeType;
  bookingId?: string;
}

export function EditorPage({ roleName, doc, mode, bookingId }: EditorPageProps) {
  if (!mode || !doc || !bookingId) {
    return (
      <div className='container mx-auto py-6'>
        <h1 className='text-2xl font-bold'>Editor Dokumen</h1>
        <p className='text-muted-foreground'>Parameter editor tidak lengkap.</p>
      </div>
    );
  }

  return <WordEditorPlaceholder bookingId={bookingId} docType={doc} mode={mode} roleName={roleName} />;
}
