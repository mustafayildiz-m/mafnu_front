import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tokenFromQuery = searchParams.get('token');
        setToken(tokenFromQuery);
    }, [location.search]);
    const passwordValidations = {
        minLength: newPassword.length >= 8,
        hasUpperCase: /[A-Z]/.test(newPassword),
        hasLowerCase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecialChar: /[?@!#%+\-*]/.test(newPassword),
    };

    const isPasswordValid = Object.values(passwordValidations).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword;

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError('Invalid or missing token');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/reset-password`, {
                token,
                newPassword,
            });

            setSuccess(response.data.message || 'Password reset successful');
            setError(null);
            setTimeout(() => {
                navigate('/auth/login');
            }, 1500);
        } catch (err:any) {
            if (err.response) {
                if (err.response.data.error === 'Token expired') {
                    setError('The reset link has expired. Please request a new one.');
                } else if (err.response.data.error === 'Invalid token') {
                    setError('The reset link is invalid. Please request a new one.');
                } else {
                    setError('Failed to reset password. Please try again later.');
                }
            } else {
                setError('Failed to reset password. Please try again later.');
            }
            setSuccess(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className='form w-100' onSubmit={handleResetPassword} noValidate id='kt_reset_password_form'>
            <h1 className='text-center mb-5'>Reset Password</h1>
            {error && (
                <div className='mb-lg-15 alert alert-danger'>
                    <div className='alert-text font-weight-bold'>{error}</div>
                </div>
            )}

            {success && (
                <div className='mb-lg-15 alert alert-success'>
                    <div className='alert-text font-weight-bold'>{success}</div>
                </div>
            )}

            <div className='fv-row mb-8 position-relative'>
                <label className='form-label fs-6 fw-bolder text-gray-900'>New Password</label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='New Password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='form-control bg-transparent'
                />
                <button
                    type="button"
                    className="btn btn-sm btn-light position-absolute end-0 top-0"
                    style={{ marginTop: '30px' }}
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>

                {/* Şifre kuralları */}
                {newPassword && (
                    <ul className="password-rules mt-2">
                        <li className={passwordValidations.minLength ? 'text-success' : 'text-danger'}>
                            {passwordValidations.minLength ? '✔️' : '❌'} En az 8 karakter
                        </li>
                        <li className={passwordValidations.hasUpperCase ? 'text-success' : 'text-danger'}>
                            {passwordValidations.hasUpperCase ? '✔️' : '❌'} Büyük harf
                        </li>
                        <li className={passwordValidations.hasLowerCase ? 'text-success' : 'text-danger'}>
                            {passwordValidations.hasLowerCase ? '✔️' : '❌'} Küçük harf
                        </li>
                        <li className={passwordValidations.hasNumber ? 'text-success' : 'text-danger'}>
                            {passwordValidations.hasNumber ? '✔️' : '❌'} Rakam
                        </li>
                        <li className={passwordValidations.hasSpecialChar ? 'text-success' : 'text-danger'}>
                            {passwordValidations.hasSpecialChar ? '✔️' : '❌'} Özel karakter (?, @, !, #, %, +, -, *, %)
                        </li>
                    </ul>
                )}
            </div>

            <div className='fv-row mb-8 position-relative'>
                <label className='form-label fs-6 fw-bolder text-gray-900'>Confirm Password</label>
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='form-control bg-transparent'
                />
                <button
                    type="button"
                    className="btn btn-sm btn-light position-absolute end-0 top-0"
                    style={{ marginTop: '30px' }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
                {confirmPassword && !passwordsMatch && (
                    <div className='text-danger mt-2'>
                        ❌ Şifreler eşleşmiyor
                    </div>
                )}
            </div>

            <div className='d-grid mb-10'>
                <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={loading || !isPasswordValid || !passwordsMatch}
                >
                    {!loading && <span className='indicator-label'>Reset Password</span>}
                    {loading && (
                        <span className='indicator-progress' style={{ display: 'block' }}>
                            Please wait...
                            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
}
