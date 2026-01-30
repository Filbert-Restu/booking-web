import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Stepper } from '@/shared/components/common/Stepper';
import { Button } from '@/shared/components/ui/button/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileText, Edit } from 'lucide-react';
import { documentService } from '@/services/document.service';
import { bookingService } from '@/services/booking.service';
import { useBookingContext } from '@/contexts/BookingContext';

export const Route = createFileRoute('/peminjam/pinjam/tanda-tangan')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { formData, resetFormData } = useBookingContext();

	// Redirect if no document_id (user skipped previous steps)
	useEffect(() => {
		if (!formData.document_id) {
			navigate({
				to: '/peminjam/pinjam/detail-tempat',
				search: { editId: undefined },
			});
		}
	}, [formData.document_id, navigate]);

	// State untuk checkbox konfirmasi tanda tangan
	const [ttdExecutiveSummary, setTtdExecutiveSummary] = useState(false);
	const [ttdLembarPengesahan, setTtdLembarPengesahan] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!ttdExecutiveSummary || !ttdLembarPengesahan) {
			alert('Mohon centang konfirmasi bahwa kedua dokumen sudah ditandatangani');
			return;
		}

		try {
			setLoading(true);

			// 1. Submit document to start workflow
			await documentService.submitDocument(formData.document_id!);

			// 2. Create room booking
			await bookingService.createBooking({
				document_id: formData.document_id!,
				room_id: formData.room_id!,
				booking_date: formData.booking_date!,
				start_time: formData.start_time!,
				end_time: formData.end_time!,
				purpose: formData.purpose || formData.event_name || 'Peminjaman Ruangan',
				special_requirements: formData.equipment,
				expected_participants: undefined, // Could be added to form if needed
			});

			alert('Peminjaman berhasil diajukan! Dokumen sedang dalam proses persetujuan.');

			// Reset context
			resetFormData();

			// Navigate to peminjaman list
			navigate({ to: '/peminjam/pinjam' });
		} catch (err) {
			console.error('Failed to submit:', err);
			if (err instanceof AxiosError) {
				const errorMsg = err.response?.data?.message || 'Gagal mengajukan peminjaman';
				alert(errorMsg);
			} else {
				alert('Terjadi kesalahan saat mengajukan peminjaman');
			}
		} finally {
			setLoading(false);
		}
	};

	// Check apakah semua tanda tangan sudah dilengkapi
	const isAllSignaturesComplete = ttdExecutiveSummary && ttdLembarPengesahan;

	const handleBack = () => {
		navigate({ to: '/peminjam/pinjam/proposal' });
	};

	const handleEditSignature = () => {
		// In a real app, this would open a document editor
		alert('Fitur edit dokumen akan dibuka di tab baru (belum diimplementasikan)');
	};

	const steps = [
		{ number: 1, title: 'Detail Tempat' },
		{ number: 2, title: 'Proposal' },
		{ number: 3, title: 'Tanda Tangan' },
	];

	return (
		<div className='space-y-6'>
			<Stepper steps={steps} currentStep={3} />

			<div className='max-w-4xl mx-auto'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
					<h2 className='text-xl font-semibold text-gray-900 mb-6'>
						Tanda Tangan
					</h2>

					<div className='space-y-6'>
						{/* Preview Dokumen */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Preview Lembar Pengesahan */}
							<div className='border border-gray-200 rounded-lg p-4'>
								<div className='flex items-center gap-2 mb-3'>
									<FileText className='h-4 w-4 text-gray-600' />
									<h3 className='text-sm font-medium text-gray-900'>
										Lembar Pengesahan
									</h3>
								</div>
								<div className='bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[250px] flex items-center justify-center'>
									<div className='text-center text-gray-500'>
										<FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
										<p className='text-xs'>Preview Dokumen</p>
										<p className='text-xs mt-2'>
											{formData.event_name || 'Peminjaman Ruangan'}
										</p>
									</div>
								</div>
							</div>

							{/* Preview Lembar Executive Summary */}
							<div className='border border-gray-200 rounded-lg p-4'>
								<div className='flex items-center gap-2 mb-3'>
									<FileText className='h-4 w-4 text-gray-600' />
									<h3 className='text-sm font-medium text-gray-900'>
										Lembar Executive Summary
									</h3>
								</div>
								<div className='bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[250px] flex items-center justify-center'>
									<div className='text-center text-gray-500'>
										<FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
										<p className='text-xs'>Preview Dokumen</p>
										<p className='text-xs mt-2'>
											Ruang: {formData.room_code}
										</p>
										<p className='text-xs'>
											Tanggal: {formData.booking_date}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Button Edit Dokumen */}
						<div className='flex justify-center'>
							<Button
								onClick={handleEditSignature}
								variant='outline'
								className='flex items-center gap-2'
							>
								<Edit className='h-4 w-4' />
								Edit & Tanda Tangan
							</Button>
						</div>

						{/* Konfirmasi Tanda Tangan */}
						<div className='border border-gray-200 rounded-lg p-4'>
							<h3 className='text-sm font-medium text-gray-900 mb-4'>
								Konfirmasi Tanda Tangan
							</h3>
							<p className='text-xs text-gray-600 mb-4'>
								Centang kotak di bawah ini untuk mengkonfirmasi bahwa Anda telah menambahkan tanda tangan yang diperlukan:
							</p>

							<div className='space-y-3'>
								<div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
									<Checkbox
										id='ttd-lembar-pengesahan'
										checked={ttdLembarPengesahan}
										onCheckedChange={(checked) => setTtdLembarPengesahan(checked as boolean)}
									/>
									<label
										htmlFor='ttd-lembar-pengesahan'
										className='text-sm leading-relaxed cursor-pointer'
									>
										Lembar Pengesahan sudah ditandatangani
									</label>
								</div>

								<div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
									<Checkbox
										id='ttd-executive-summary'
										checked={ttdExecutiveSummary}
										onCheckedChange={(checked) => setTtdExecutiveSummary(checked as boolean)}
									/>
									<label
										htmlFor='ttd-executive-summary'
										className='text-sm leading-relaxed cursor-pointer'
									>
										Executive Summary sudah ditandatangani
									</label>
								</div>
							</div>

							{!isAllSignaturesComplete && (
								<p className='text-xs text-red-600 mt-3'>
									⚠️ Harap centang kedua konfirmasi di atas sebelum mengajukan peminjaman
								</p>
							)}
						</div>

						{/* Navigation Buttons */}
						<div className='flex justify-between gap-4 pt-4'>
							<Button type='button' variant='outline' onClick={handleBack} disabled={loading}>
								Kembali
							</Button>
							<Button
								type='submit'
								onClick={handleSubmit}
								disabled={!isAllSignaturesComplete || loading}
							>
								{loading ? 'Mengajukan...' : 'Ajukan Peminjaman'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
