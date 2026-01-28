import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { authService } from '@/services/auth.service';
import { useState } from 'react';
import axios from 'axios';

export const Route = createFileRoute('/register')({
    component: RouteComponent,
});

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

function RouteComponent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{
        [key: string]: string;
    }>({});

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Nama harus diisi';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email harus diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Format email tidak valid';
        }

        if (!formData.password) {
            errors.password = 'Password harus diisi';
        } else if (formData.password.length < 6) {
            errors.password = 'Password minimal 6 karakter';
        }

        if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Password tidak cocok';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });

            authService.saveAuthData(response);

            // Redirect to dashboard after successful registration
            navigate({ to: '/peminjam' });
        } catch (err: unknown) {
            console.error('Registration failed:', err);

            let errorMessage = 'Registrasi gagal. Silakan coba lagi.';

            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data as {
                    message?: string;
                    errors?: { [key: string]: string[] };
                };

                if (responseData?.errors) {
                    // Laravel validation errors
                    const firstError = Object.values(responseData.errors)[0];
                    if (firstError && firstError[0]) {
                        errorMessage = firstError[0];
                    }
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Booking System
                    </h1>
                    <p className="text-gray-600">Buat akun baru Anda</p>
                </div>

                {/* Register Card */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Registrasi
                        </CardTitle>
                        <CardDescription className="text-center">
                            Isi data Anda untuk membuat akun
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-gray-700 block"
                                >
                                    Nama Lengkap
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className={`w-full ${validationErrors.name ? 'border-red-500' : ''}`}
                                />
                                {validationErrors.name && (
                                    <p className="text-xs text-red-600">{validationErrors.name}</p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 block"
                                >
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nama@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className={`w-full ${validationErrors.email ? 'border-red-500' : ''}`}
                                />
                                {validationErrors.email && (
                                    <p className="text-xs text-red-600">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 block"
                                >
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className={`w-full ${validationErrors.password ? 'border-red-500' : ''}`}
                                />
                                {validationErrors.password && (
                                    <p className="text-xs text-red-600">
                                        {validationErrors.password}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">Minimal 6 karakter</p>
                            </div>

                            {/* Password Confirmation Input */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-gray-700 block"
                                >
                                    Konfirmasi Password
                                </label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className={`w-full ${validationErrors.password_confirmation ? 'border-red-500' : ''}`}
                                />
                                {validationErrors.password_confirmation && (
                                    <p className="text-xs text-red-600">
                                        {validationErrors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Loading...
                                    </span>
                                ) : (
                                    'Daftar'
                                )}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">Sudah punya akun? </span>
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            >
                                Login sekarang
                            </Link>
                        </div>

                        {/* Development Link */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Link to="/login-option">
                                <Button variant="ghost" className="w-full text-xs text-gray-500">
                                    🔧 Development Login Menu
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2026 Booking System FSM. All rights reserved.
                </p>
            </div>
        </div>
    );
}
