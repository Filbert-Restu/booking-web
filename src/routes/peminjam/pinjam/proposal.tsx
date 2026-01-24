import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Stepper } from '@/shared/components/common/Stepper';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/button';

export const Route = createFileRoute('/peminjam/pinjam/proposal')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const [namaKegiatan, setNamaKegiatan] = useState('');
	const [sifat, setSifat] = useState('');
	const [bentuk, setBentuk] = useState('');
	const [tujuan, setTujuan] = useState('');
	const [manfaat, setManfaat] = useState('');
	const [sasaran, setSasaran] = useState('');
	const [waktu, setWaktu] = useState('');
	const [tempat, setTempat] = useState('');
	const [alat, setAlat] = useState('');
	const [ketuaPanitia, setKetuaPanitia] = useState('');
	const [undangan, setUndangan] = useState('');
	const [proposalFile, setProposalFile] = useState<File | null>(null);

	const steps = [
		{ number: 1, title: 'Detail Tempat' },
		{ number: 2, title: 'Proposal' },
		{ number: 3, title: 'Tanda Tangan' },
	];

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Save data to state/context
		navigate({ to: '/peminjam/pinjam/tanda-tangan' });
	};

	const handleBack = () => {
		navigate({ to: '/peminjam/pinjam/detail-tempat' });
	};

	return (
		<div className='space-y-6'>
			<Stepper steps={steps} currentStep={2} />

			<div className='max-w-4xl mx-auto'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
					<h2 className='text-xl font-semibold text-gray-900 mb-6'>
						Proposal
					</h2>

					<form onSubmit={handleNext} className='space-y-4'>
						{/* Form Fields */}
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Nama Kegiatan
								</label>
								<Input
									value={namaKegiatan}
									onChange={(e) => setNamaKegiatan(e.target.value)}
									placeholder='Masukkan nama kegiatan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Sifat
								</label>
								<Input
									value={sifat}
									onChange={(e) => setSifat(e.target.value)}
									placeholder='Masukkan sifat kegiatan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Bentuk
								</label>
								<Input
									value={bentuk}
									onChange={(e) => setBentuk(e.target.value)}
									placeholder='Masukkan bentuk kegiatan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Tujuan
								</label>
								<Textarea
									value={tujuan}
									onChange={(e) => setTujuan(e.target.value)}
									placeholder='Masukkan tujuan kegiatan'
									rows={3}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Manfaat
								</label>
								<Textarea
									value={manfaat}
									onChange={(e) => setManfaat(e.target.value)}
									placeholder='Masukkan manfaat kegiatan'
									rows={3}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Sasaran
								</label>
								<Input
									value={sasaran}
									onChange={(e) => setSasaran(e.target.value)}
									placeholder='Masukkan sasaran kegiatan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Waktu
								</label>
								<Input
									value={waktu}
									onChange={(e) => setWaktu(e.target.value)}
									placeholder='Masukkan waktu pelaksanaan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Tempat
								</label>
								<Input
									value={tempat}
									onChange={(e) => setTempat(e.target.value)}
									placeholder='Masukkan tempat pelaksanaan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Alat
								</label>
								<Input
									value={alat}
									onChange={(e) => setAlat(e.target.value)}
									placeholder='Masukkan alat yang dibutuhkan'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Ketua Panitia
								</label>
								<Input
									value={ketuaPanitia}
									onChange={(e) => setKetuaPanitia(e.target.value)}
									placeholder='Masukkan nama ketua panitia'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Undangan
								</label>
								<Input
									value={undangan}
									onChange={(e) => setUndangan(e.target.value)}
									placeholder='Masukkan daftar undangan'
								/>
							</div>
						</div>

						{/* Upload Proposal */}
						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Unggah Proposal
							</label>
							<Input
								type='file'
								accept='.pdf,.doc,.docx'
								onChange={(e) =>
									setProposalFile(e.target.files ? e.target.files[0] : null)
								}
							/>
							<p className='text-xs text-gray-500'>
								Format: PDF, DOC, DOCX (Max 10MB)
							</p>
						</div>

						<div className='flex justify-between gap-3 pt-4'>
							<Button type='button' variant='outline' onClick={handleBack}>
								Kembali
							</Button>
							<Button type='submit'>Selanjutnya</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
