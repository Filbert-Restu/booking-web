import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Stepper } from '@/shared/components/common/Stepper';
import { Button } from '@/shared/components/ui/button/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileText, Edit } from 'lucide-react';

export const Route = createFileRoute('/peminjam/pinjam/tanda-tangan')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	// State untuk checkbox konfirmasi tanda tangan
	const [ttdKetuaOrganisasi, setTtdKetuaOrganisasi] = useState(false);
	const [ttdKetuaPelaksana, setTtdKetuaPelaksana] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!ttdKetuaOrganisasi || !ttdKetuaPelaksana) {
			alert('Mohon centang konfirmasi bahwa Anda sudah menambahkan kedua tanda tangan');
			return;
		}
		// TODO: Submit all data to API
		alert('Peminjaman berhasil diajukan!');
		navigate({ to: '/peminjam/reservasi' });
	};

	// Check apakah semua tanda tangan sudah dilengkapi
	const isAllSignaturesComplete = ttdKetuaOrganisasi && ttdKetuaPelaksana;

	const handleBack = () => {
		navigate({ to: '/peminjam/pinjam/proposal' });
	};

	const handleEditSignature = () => {
		navigate({ to: '/peminjam/pinjam/edit-dokumen' });
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
									id='ttd-ketua-organisasi'
									checked={ttdKetuaOrganisasi}
									onCheckedChange={(checked) => setTtdKetuaOrganisasi(checked as boolean)}
								/>
								<label
									htmlFor='ttd-ketua-organisasi'
									className='text-sm leading-relaxed cursor-pointer'
								>
									Saya sudah menambahkan tanda tangan Ketua Organisasi Mahasiswa
								</label>
							</div>

							<div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
								<Checkbox
									id='ttd-ketua-pelaksana'
									checked={ttdKetuaPelaksana}
									onCheckedChange={(checked) => setTtdKetuaPelaksana(checked as boolean)}
								/>
								<label
									htmlFor='ttd-ketua-pelaksana'
									className='text-sm leading-relaxed cursor-pointer'
								>
									Saya sudah menambahkan tanda tangan Ketua Pelaksana
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
						<Button type='button' variant='outline' onClick={handleBack}>
							Kembali
						</Button>
						<Button type='submit' onClick={handleSubmit} disabled={!isAllSignaturesComplete}>
							Ajukan Peminjaman
						</Button>
					</div>
				</div>
				</div>
			</div>
		</div>
	);
}
