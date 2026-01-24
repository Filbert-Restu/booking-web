import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Stepper } from '@/shared/components/common/Stepper';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/button';

export const Route = createFileRoute('/peminjam/pinjam/detail-tempat')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	// Auto-filled dari reservasi tapi bisa diedit
	const [selectedRoom, setSelectedRoom] = useState('K105');
	const [startTime, setStartTime] = useState('09:30');
	const [endTime, setEndTime] = useState('11:30');
	const [startDate, setStartDate] = useState('2026-01-31');
	const [endDate, setEndDate] = useState('2026-01-31');
	const [activity, setActivity] = useState('');
	const [attachment, setAttachment] = useState<File | null>(null);

	const borrowerId = '24060119120011';

	const steps = [
		{ number: 1, title: 'Detail Tempat' },
		{ number: 2, title: 'Proposal' },
		{ number: 3, title: 'Tanda Tangan' },
	];

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Save data to state/context
		navigate({ to: '/peminjam/pinjam/proposal' });
	};

	return (
		<div className='space-y-6'>
			<Stepper steps={steps} currentStep={1} />

			<div className='max-w-2xl mx-auto'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
					<h2 className='text-xl font-semibold text-gray-900 mb-6'>
						Detail Tempat - Ruang {selectedRoom}
					</h2>

					<form onSubmit={handleNext} className='space-y-5'>
						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Peminjam
							</label>
							<Input
								value={borrowerId}
								disabled
								readOnly
								className='bg-gray-300'
							/>
						</div>

						<div className='space-y-3'>
							<p className='text-sm font-medium text-gray-700'>
								Waktu & Tanggal
							</p>

							<div className='space-y-3'>
								<div className='flex flex-col gap-2'>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Clock className='w-4 h-4' />
										<span>Waktu</span>
									</div>
									<div className='flex items-center gap-2 w-full'>
										<Input
											type='time'
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
											className='flex-1 min-w-0'
										/>
										<span className='text-sm text-gray-500 flex-shrink-0'>
											-
										</span>
										<Input
											type='time'
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className='flex-1 min-w-0'
										/>
									</div>
								</div>

								<div className='flex flex-col gap-2'>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Calendar className='w-4 h-4' />
										<span>Tanggal</span>
									</div>
									<div className='flex items-center gap-2 w-full'>
										<Input
											type='date'
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className='flex-1 min-w-0'
										/>
										<span className='text-sm text-gray-500 flex-shrink-0'>
											-
										</span>
										<Input
											type='date'
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className='flex-1 min-w-0'
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Aktivitas/Kegiatan
							</label>
							<Textarea
								placeholder=''
								value={activity}
								onChange={(e) => setActivity(e.target.value)}
								rows={4}
								className='resize-none'
							/>
						</div>

						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Attachment:
							</label>
							<Input
								type='file'
								accept='.pdf,.doc,.docx'
								onChange={(e) =>
									setAttachment(e.target.files ? e.target.files[0] : null)
								}
							/>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate({ to: '/peminjam/reservasi' })}
							>
								Batal
							</Button>
							<Button type='submit'>Selanjutnya</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
