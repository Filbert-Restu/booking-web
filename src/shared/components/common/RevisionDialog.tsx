import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/button';
import { Textarea } from '@/shared/components/ui/textarea';

interface RevisionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (note: string) => void;
    title?: string;
    description?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function RevisionDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Masukkan catatan revisi:',
    description = 'Berikan catatan untuk revisi dokumen ini.',
    placeholder = 'Tulis catatan di sini...',
    confirmLabel = 'Kirim Revisi',
    cancelLabel = 'Batal',
}: RevisionDialogProps) {
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm(note);
        setNote('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className='py-4'>
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={placeholder}
                        className='min-h-[100px]'
                    />
                </div>
                <DialogFooter className='sm:justify-end gap-2'>
                    <Button variant='outline' onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button onClick={handleConfirm} disabled={!note.trim() && confirmLabel !== 'Setujui'}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
