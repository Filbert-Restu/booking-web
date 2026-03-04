import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { documentService } from '@/services/document.service';
import { workflowService } from '@/services/workflow.service';
import { SubmissionDetailCard } from '@/shared/components/common/SubmissionDetailCard';
import api from '@/lib/axios';

type DocType = 'proposal' | 'executive-summary' | 'approval-sheet';

const DOC_LABELS: Record<DocType, string> = {
    proposal: 'Proposal',
    'executive-summary': 'Executive Summary',
    'approval-sheet': 'Lembar Pengesahan',
};

interface HistoryDetailContentProps {
    documentId: number | undefined;
    returnPath: string;
}

export function HistoryDetailContent({
    documentId,
    returnPath,
}: HistoryDetailContentProps) {
    const navigate = useNavigate();
    const docId = documentId ?? 0;

    // ── Fetch dokumen ──────────────────────────────────────────────────────────
    const {
        data: doc,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['document', docId],
        queryFn: () => documentService.getDocument(docId),
        enabled: docId > 0,
    });

    // ── Fetch workflow steps ───────────────────────────────────────────────────
    const { data: workflow } = useQuery({
        queryKey: ['workflow', doc?.workflow_id],
        queryFn: () => workflowService.getWorkflow(doc!.workflow_id),
        enabled: !!doc?.workflow_id,
    });

    // ── PDF Preview State ──────────────────────────────────────────────────────
    const [selectedDocType, setSelectedDocType] = useState<DocType>('proposal');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const prevBlobRef = useRef<string | null>(null);

    const setBlobUrl = useCallback((url: string | null) => {
        if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
        prevBlobRef.current = url;
        setPdfUrl(url);
    }, []);

    useEffect(() => {
        return () => {
            if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
        };
    }, []);

    const loadPdf = useCallback(
        async (type: DocType) => {
            if (!docId || docId <= 0) return;
            setPdfLoading(true);
            try {
                const response = await api.get(
                    `/documents/${docId}/file/${type}/pdf`,
                    {
                        responseType: 'blob',
                    },
                );
                const blob = new Blob([response.data], { type: 'application/pdf' });
                setBlobUrl(URL.createObjectURL(blob));
            } catch {
                setBlobUrl(null);
            } finally {
                setPdfLoading(false);
            }
        },
        [docId, setBlobUrl],
    );

    useEffect(() => {
        if (doc) loadPdf(selectedDocType);
    }, [doc, selectedDocType, loadPdf]);

    // ── Loading / Error ────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-500">Memuat detail pengajuan...</span>
            </div>
        );
    }

    if (isError || !doc) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="text-gray-500">Pengajuan tidak ditemukan.</p>
                <Button
                    variant="outline"
                    onClick={() => navigate({ to: returnPath as string })}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
            </div>
        );
    }

    const currentStep = doc.current_step_order ?? 0;
    const steps = workflow?.steps ?? [];
    const logs = doc.logs ?? [];

    // Cari log aksi RECEIVED/APPROVED per step_snapshot untuk mendapat timestamp
    const getStepLog = (stepOrder: number) =>
        logs.find(
            (l) =>
                l.step_snapshot === stepOrder &&
                ((l.action as string) === 'RECEIVED' ||
                    l.action === 'APPROVED' ||
                    (l.action as string) === 'SUBMITTED'),
        );

    const availableDocs: { type: DocType; hasFile: boolean }[] = [
        { type: 'proposal', hasFile: !!doc.file_proposal },
        { type: 'executive-summary', hasFile: !!doc.file_executive_summary },
        { type: 'approval-sheet', hasFile: !!doc.file_approval_sheet },
    ];
    const hasAnyDoc = availableDocs.some((d) => d.hasFile);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: returnPath as string })}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <h1 className="text-xl font-bold text-gray-900">
                    Detail Riwayat Persetujuan
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 items-start">
                {/* ── Kolom Kiri: Info + Workflow Steps ── */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Info Kegiatan */}
                    <SubmissionDetailCard doc={doc} />

                    {/* Workflow Steps */}
                    {steps.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">
                                Steps
                            </h2>
                            <div className="relative">
                                {steps
                                    .slice()
                                    .sort((a, b) => a.step_order - b.step_order)
                                    .map((step, idx, arr) => {
                                        const isCompleted =
                                            step.step_order < currentStep ||
                                            doc.status === 'APPROVED';
                                        const isActive =
                                            step.step_order === currentStep &&
                                            doc.status === 'IN_PROGRESS';
                                        const stepLog = getStepLog(step.step_order);
                                        const isLast = idx === arr.length - 1;

                                        return (
                                            <div
                                                key={step.id ?? step.step_order}
                                                className="flex gap-4"
                                            >
                                                {/* Icon + garis vertikal */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${isCompleted
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : isActive
                                                                    ? 'border-blue-400 bg-white'
                                                                    : 'border-gray-300 bg-white'
                                                            }`}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                        ) : isActive ? (
                                                            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                                                        ) : (
                                                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                                                        )}
                                                    </div>
                                                    {!isLast && (
                                                        <div
                                                            className={`w-0.5 flex-1 my-1 ${isCompleted ? 'bg-blue-300' : 'bg-gray-200'
                                                                }`}
                                                            style={{ minHeight: '24px' }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Konten step */}
                                                <div className={`pb-5 flex-1`}>
                                                    <div
                                                        className={`text-sm font-semibold ${isCompleted
                                                                ? 'text-blue-700'
                                                                : isActive
                                                                    ? 'text-gray-900'
                                                                    : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {step.step_name}
                                                    </div>

                                                    {isActive && doc.current_holder && (
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            Assigned to: {doc.current_holder.name}
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`text-xs mt-0.5 ${isCompleted
                                                                ? 'text-blue-500'
                                                                : isActive
                                                                    ? 'text-blue-500 font-medium'
                                                                    : 'text-gray-400'
                                                            }`}
                                                    >
                                                        Status:{' '}
                                                        {isCompleted
                                                            ? 'Selesai'
                                                            : isActive
                                                                ? 'Pending'
                                                                : 'Pending'}
                                                    </div>

                                                    {stepLog && (
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            <span className="font-semibold">Received:</span>{' '}
                                                            {new Date(stepLog.created_at).toLocaleString(
                                                                'id-ID',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Kolom Kanan: Preview Dokumen ── */}
                <div className="lg:col-span-5 bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">
                            Preview Dokumen
                        </h2>
                        <Select
                            value={selectedDocType}
                            onValueChange={(val) => setSelectedDocType(val as DocType)}
                        >
                            <SelectTrigger className="w-52">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableDocs.map(({ type, hasFile }) => (
                                    <SelectItem key={type} value={type} disabled={!hasFile}>
                                        {DOC_LABELS[type]}
                                        {!hasFile && ' (belum ada)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!hasAnyDoc ? (
                        <div className="flex items-center justify-center h-[500px] border rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Belum ada dokumen yang diunggah
                            </p>
                        </div>
                    ) : pdfLoading ? (
                        <div className="flex items-center justify-center h-[500px] border rounded-lg bg-gray-50">
                            <div className="text-center text-gray-500">
                                <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                                <p className="text-sm">Memuat dokumen...</p>
                            </div>
                        </div>
                    ) : pdfUrl ? (
                        <div className="border rounded-lg overflow-hidden">
                            <iframe
                                src={pdfUrl}
                                className="w-full h-[600px]"
                                title={`Preview ${DOC_LABELS[selectedDocType]}`}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[500px] border rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-500">
                                {DOC_LABELS[selectedDocType]} belum tersedia
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
