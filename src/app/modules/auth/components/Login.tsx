import {useState, useEffect} from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import {Link, useLocation} from 'react-router-dom';
import {useFormik} from 'formik';
import {getUserByToken, login} from '../core/_requests';
import {useAuth} from '../core/Auth';
import LanguageSelector from "../../LanguageSelector.tsx";
import {useIntl} from 'react-intl';
import '../../../../styles/AuthPageStyles.css';

function base64Decrypt(encryptedText: string): string {
    return atob(encryptedText);
}

export function Login() {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const {saveAuth, setCurrentUser} = useAuth();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const loginSchema = Yup.object().shape({
        username: Yup.string()
            .min(3, intl.formatMessage({ id: 'MINIMUM_SYMBOLS' }, { count: 3 }))
            .max(50, intl.formatMessage({ id: 'MAXIMUM_SYMBOLS' }, { count: 50 }))
            .required(intl.formatMessage({ id: 'USERNAME_REQUIRED' })),
        password: Yup.string()
            .min(3, intl.formatMessage({ id: 'MINIMUM_SYMBOLS' }, { count: 3 }))
            .max(50, intl.formatMessage({ id: 'MAXIMUM_SYMBOLS' }, { count: 50 }))
            .required(intl.formatMessage({ id: 'PASSWORD_REQUIRED' })),
    });

    const initialValues = {
        username: '',
        password: '',
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const hash = queryParams.get('uname');
        if (hash) {
            const decryptedUsername = base64Decrypt(hash);
            formik.setFieldValue('username', decryptedUsername);
        }
    }, [location.search]);

    const formik = useFormik({
        initialValues,
        validationSchema: loginSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            setLoading(true);
            try {
                let selectedLang = 'en';
                const i18nConfig = localStorage.getItem('i18nConfig');
                if (i18nConfig) {
                    const parsedConfig = JSON.parse(i18nConfig);
                    selectedLang = parsedConfig.selectedLang || 'en';
                }

                const { data: auth } = await login(values.username, values.password, selectedLang);

                saveAuth(auth);
                localStorage.setItem('authToken', auth.token);

                const { data: user } = await getUserByToken(auth.token);

                if (user && user.language) {
                    selectedLang = user.language;
                    const updatedI18nConfig = JSON.stringify({ selectedLang });
                    localStorage.setItem('i18nConfig', updatedI18nConfig);
                }
                setCurrentUser(user);
                setSubmitting(false);
                setLoading(false);
            } catch (error: any) {
                console.error(error);

                if (error.response && error.response.data.error) {
                    setStatus(error.response.data.error);
                } else {
                    setStatus(intl.formatMessage({id: 'LOGIN_DETAILS_INCORRECT'}));
                }

                saveAuth(undefined);
                setSubmitting(false);
                setLoading(false);
            }
        },
    });

    return (
        <div className={'login-container'}>
            {/*<div className="language-selector-container">*/}
            {/*    <LanguageSelector/>*/}
            {/*</div>*/}
            <div className="justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-center">{intl.formatMessage({id: 'LOGIN_TITLE'})}</h2>
            </div>

            <form
                className="form w-lg-400px"
                onSubmit={formik.handleSubmit}
                noValidate
                id="kt_login_signin_form"
            >
                {formik.status && (
                    <div className="mb-lg-15 alert alert-danger">
                        <div className="alert-text font-weight-bold">{formik.status}</div>
                    </div>
                )}

                {/* begin::Form group */}
                <div className="fv-row mb-8">
                    <label className="form-label fs-6 fw-bolder text-gray-900">
                        {intl.formatMessage({id: 'USERNAME_LABEL'})}
                    </label>
                    <input
                        placeholder={intl.formatMessage({id: 'USERNAME_PLACEHOLDER'})}
                        {...formik.getFieldProps('username')}
                        className={clsx(
                            'form-control bg-transparent',
                            {'is-invalid': formik.touched.username && formik.errors.username},
                            {'is-valid': formik.touched.username && !formik.errors.username}
                        )}
                        type="text"
                        name="username"
                        autoComplete="off"
                    />
                    {formik.touched.username && formik.errors.username && (
                        <div className="fv-plugins-message-container">
                            <span role="alert">{formik.errors.username}</span>
                        </div>
                    )}
                </div>

                <div className="fv-row mb-3 position-relative">
                    <label className="form-label fw-bolder text-gray-900 fs-6 mb-0">
                        {intl.formatMessage({id: 'PASSWORD_LABEL'})}
                    </label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        {...formik.getFieldProps('password')}
                        className={clsx(
                            'form-control bg-transparent',
                            {'is-invalid': formik.touched.password && formik.errors.password},
                            {'is-valid': formik.touched.password && !formik.errors.password}
                        )}
                    />
                    <button
                        type="button"
                        className="btn position-absolute"
                        style={{top: '50%', right: '10px', transform: 'translateY(-50%)'}}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    </button>
                    {formik.touched.password && formik.errors.password && (
                        <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                                <span role="alert">{formik.errors.password}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* end::Form group */}

                {/* begin::Wrapper */}
                <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
                    <div/>

                    {/* begin::Link */}
                    <Link to="/auth/forgot-password" className="link-primary">
                        {intl.formatMessage({id: 'FORGOT_PASSWORD'})}
                    </Link>
                    {/* end::Link */}
                </div>
                {/* end::Wrapper */}

                {/* begin::Action */}
                <div className="d-grid mb-10">
                    <button
                        type="submit"
                        id="kt_sign_in_submit"
                        className="btn btn-primary"
                        disabled={formik.isSubmitting || !formik.isValid}
                    >
                        {!loading &&
                            <span className="indicator-label">{intl.formatMessage({id: 'CONTINUE_BUTTON'})}</span>}
                        {loading && (
                            <span className="indicator-progress" style={{display: 'block'}}>
                                {intl.formatMessage({id: 'PLEASE_WAIT'})}
                                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                            </span>
                        )}
                    </button>
                </div>
                {/* end::Action */}

                <div className="text-gray-500 text-center fw-semibold fs-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span>{intl.formatMessage({id: 'NOT_A_MEMBER_YET'})}</span>
                    <Link
                        to="/auth/registration"
                        className="signup-button"
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            padding: '8px 24px',
                            background: '#3182CE',
                            color: 'white',
                            borderRadius: '25px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            border: 'none',
                            letterSpacing: '0.3px',
                            minWidth: '120px',
                            height: '36px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {intl.formatMessage({id: 'SIGN_UP'})}
                    </Link>
                </div>
            </form>

            <style>
                {`
                    .signup-button {
                        position: relative;
                        overflow: hidden;
                    }

                    .signup-button:hover {
                        background: #2C5282;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 6px rgba(0,0,0,0.15);
                    }

                    .signup-button:active {
                        transform: translateY(0);
                    }

                    .signup-button::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
                        opacity: 0;
                        transition: opacity 0.2s ease;
                    }

                    .signup-button:hover::after {
                        opacity: 1;
                    }
                `}
            </style>
        </div>
    );
}
