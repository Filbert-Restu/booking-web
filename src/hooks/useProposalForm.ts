import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { documentService } from '@/services/document.service';
import {
    useBookingContext,
    type BookingFormData,
} from '@/contexts/BookingContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProposalFields {
    event_name: string;
    event_nature: string;
    event_form: string;
    objectives: string;
    benefits: string;
    target_audience: string;
    location: string;
    equipment: string;
    invitations: string;
}

/** Keys from BookingFormData that come from step 1 (detail-tempat). */
const STEP1_KEYS: (keyof BookingFormData)[] = [
    'ketua_pelaksana_nama',
    'ketua_pelaksana_nim',
    'ketua_pelaksana_hp',
    'room_id',
    'room_code',
    'booking_date',
    'start_time',
    'end_time',
    'purpose',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseAxiosError(err: unknown, fallback: string): string {
    if (err instanceof AxiosError) {
        return err.response?.data?.message || fallback;
    }
    return fallback;
}

/** Build a FormData payload from the current context + proposal fields. */
function buildPayload(
    contextData: BookingFormData,
    fields: ProposalFields,
    proposalFile: File | null,
    includeFile: boolean,
): FormData {
    const fd = new FormData();

    // Title
    if (fields.event_name.trim()) {
        fd.append('title', fields.event_name);
    }

    // Content object (step-1 data + proposal data)
    const content: Record<string, string | number> = {};

    // Carry forward step-1 fields
    for (const key of STEP1_KEYS) {
        const val = contextData[key];
        if (val !== undefined && val !== null && val !== '') {
            content[key] = val as string | number;
        }
    }

    // Proposal fields
    for (const [key, val] of Object.entries(fields)) {
        if (typeof val === 'string' && val.trim()) {
            content[key] = val;
        }
    }

    // Peminjam name from context (already populated by auth)
    const userName = localStorage.getItem('userName');
    if (userName) content.peminjam_nama = userName;

    // Append content fields
    for (const [key, val] of Object.entries(content)) {
        fd.append(`content[${key}]`, String(val));
    }

    // Proposal file
    if (includeFile && proposalFile) {
        fd.append('proposal', proposalFile);
    }

    // Meta
    fd.append('meta_data[type]', 'room_reservation');
    fd.append('meta_data[step]', 'proposal');

    return fd;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const AUTOSAVE_DELAY_MS = 60_000; // 60 seconds after last change

export function useProposalForm() {
    const navigate = useNavigate();
    const { formData, updateFormData } = useBookingContext();

    // Redirect if no document
    useEffect(() => {
        if (!formData.document_id) {
            navigate({
                to: '/peminjam/pinjam/detail-tempat',
                search: {
                    editId: undefined,
                    roomId: undefined,
                    bookingDate: undefined,
                    startTime: undefined,
                    endTime: undefined,
                    purpose: undefined,
                    ketuaNama: undefined,
                    ketuaNim: undefined,
                    ketuaHp: undefined,
                },
            });
        }
    }, [formData.document_id, navigate]);

    // --- FORM STATE (single object) ---
    const [fields, setFields] = useState<ProposalFields>(() => ({
        event_name: formData.event_name || '',
        event_nature: formData.event_nature || '',
        event_form: formData.event_form || '',
        objectives: formData.objectives || '',
        benefits: formData.benefits || '',
        target_audience: formData.target_audience || '',
        location: formData.location || '',
        equipment: formData.equipment || '',
        invitations: formData.invitations || '',
    }));

    const [proposalFile, setProposalFile] = useState<File | null>(
        formData.proposal_file || null,
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- FIELD CHANGE HANDLER ---
    const handleFieldChange = useCallback(
        (key: keyof ProposalFields, value: string) => {
            setFields((prev) => ({ ...prev, [key]: value }));
            setError(null);
        },
        [],
    );

    // --- FILE CHANGE HANDLER ---
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFileError(null);
            const file = e.target.files?.[0] ?? null;

            if (file) {
                if (file.size > 20 * 1024 * 1024) {
                    setFileError('Ukuran file maksimal 20MB');
                    e.target.value = '';
                    return;
                }
                if (file.type !== 'application/pdf') {
                    setFileError('Format file harus PDF');
                    e.target.value = '';
                    return;
                }
                setProposalFile(file);
            } else {
                setProposalFile(null);
            }
        },
        [],
    );

    // --- SYNC TO CONTEXT ---
    const syncToContext = useCallback(() => {
        updateFormData({
            ...fields,
            proposal_file: proposalFile,
        });
    }, [fields, proposalFile, updateFormData]);

    // --- AUTOSAVE ---
    const autoSave = useCallback(async () => {
        if (!formData.document_id) return;
        try {
            setIsAutoSaving(true);
            const payload = buildPayload(formData, fields, null, false);
            await documentService.updateDocument(formData.document_id, payload);
            syncToContext();
        } catch {
            // Autosave failures are silent — user will see errors on explicit save
        } finally {
            setIsAutoSaving(false);
        }
    }, [formData, fields, syncToContext]);

    // Debounced autosave
    useEffect(() => {
        if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(autoSave, AUTOSAVE_DELAY_MS);
        return () => {
            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        };
    }, [autoSave]);

    // --- SUBMIT ---
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            // Validation
            if (!fields.event_name.trim() || !fields.objectives.trim()) {
                setError('Mohon isi minimal Nama Kegiatan dan Tujuan');
                return;
            }

            if (!formData.document_id) return;

            try {
                setIsSubmitting(true);
                const payload = buildPayload(formData, fields, proposalFile, true);
                await documentService.updateDocument(formData.document_id, payload);
                syncToContext();
                navigate({ to: '/peminjam/pinjam/tanda-tangan' });
            } catch (err) {
                setError(parseAxiosError(err, 'Terjadi kesalahan saat menyimpan proposal'));
            } finally {
                setIsSubmitting(false);
            }
        },
        [fields, formData, proposalFile, syncToContext, navigate],
    );

    // --- BACK ---
    const handleBack = useCallback(() => {
        syncToContext();
        navigate({
            to: '/peminjam/pinjam/detail-tempat',
            search: {
                editId: undefined,
                roomId: undefined,
                bookingDate: undefined,
                startTime: undefined,
                endTime: undefined,
                purpose: undefined,
                ketuaNama: undefined,
                ketuaNim: undefined,
                ketuaHp: undefined,
            },
        });
    }, [syncToContext, navigate]);

    return {
        fields,
        handleFieldChange,
        proposalFile,
        handleFileChange,
        fileError,
        isSubmitting,
        isAutoSaving,
        error,
        setError,
        handleSubmit,
        handleBack,
        hasDocumentId: !!formData.document_id,
    };
}
