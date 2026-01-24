import { Approval } from '../Approval';
import type { ActorRole, ApprovalItem, DocActionPayload } from '../Approval';

interface ApprovalLayoutProps {
  actorTitle: string;
  description?: string;
  approvalItems: ApprovalItem[];
  actorRole: ActorRole;
  showOrganisasi?: boolean;
  showProposal?: boolean;
  onApprove?: (id: number) => void;
  onRevise?: (id: number) => void;
  onOpenDoc?: (payload: DocActionPayload) => void;
}

export function ApprovalLayout({
  actorTitle,
  description,
  approvalItems,
  actorRole,
  showOrganisasi = true,
  showProposal = true,
  onApprove,
  onRevise,
  onOpenDoc,
}: ApprovalLayoutProps) {
  return (
    <div className='w-full h-full space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold'>{actorTitle}</h1>
        {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
      </div>
      <Approval
        bookings={approvalItems}
        actorRole={actorRole}
        showOrganisasi={showOrganisasi}
        showProposal={showProposal}
        onApprove={onApprove}
        onRevise={onRevise}
        onOpenDoc={onOpenDoc}
      />
    </div>
  );
}
