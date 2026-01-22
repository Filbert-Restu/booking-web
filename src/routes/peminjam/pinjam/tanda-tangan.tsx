import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/shadcn/button/button';
import { Checkbox } from '@/components/ui/shadcn/checkbox';

export const Route = createFileRoute('/peminjam/pinjam/tanda-tangan')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [agreed, setAgreed] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!agreed) {
			alert('Mohon centang persetujuan terlebih dahulu');
			return;
		}
		// TODO: Submit all data to API
		alert('Peminjaman berhasil diajukan!');
		navigate({ to: '/peminjam/reservasi' });
	};

	const handleBack = () => {
		navigate({ to: '/peminjam/pinjam/proposal' });
	};

	const steps = [
		{ number: 1, title: 'Detail Tempat' },
		{ number: 2, title: 'Proposal' },
		{ number: 3, title: 'Tanda Tangan' },
	];

	return (
    <div>
      <p>MASIH DALAM PENGEMBANGAN</p>
      <Button type='submit' disabled={!agreed}>
        Ajukan Peminjaman
      </Button>
		</div>
	);
}
