import {useState, useEffect} from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import {Link} from 'react-router-dom';
import {useFormik} from 'formik';
import {requestPassword} from '../core/_requests';
import {useIntl} from 'react-intl';
import LanguageSelector from "../../LanguageSelector.tsx";

const initialValues = {
    email: '',
};

const FIVE_MINUTES = 5 * 60 * 1000; // 5 dakika

export function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const intl = useIntl();

    const forgotPasswordSchema = Yup.object().shape({
        email: Yup.string()
            .email(intl.formatMessage({id: 'INVALID_EMAIL_FORMAT'}))
            .min(3, intl.formatMessage({id: 'MINIMUM_SYMBOLS'}, {count: 3}))
            .max(50, intl.formatMessage({id: 'MAXIMUM_SYMBOLS'}, {count: 50}))
            .required(intl.formatMessage({id: 'EMAIL_REQUIRED'})),
    });

    useEffect(() => {
        const lastSubmitTime = localStorage.getItem('lastForgotPasswordSubmitTime');
        if (lastSubmitTime) {
            const timePassed = Date.now() - parseInt(lastSubmitTime);
            if (timePassed < FIVE_MINUTES) {
                setRemainingTime(FIVE_MINUTES - timePassed);
            }
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (remainingTime !== null && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime((prevTime) => {
                    if (prevTime && prevTime > 1000) {
                        return prevTime - 1000;
                    } else {
                        clearInterval(interval);
                        return null;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [remainingTime]);

    const formik = useFormik({
        initialValues,
        validationSchema: forgotPasswordSchema,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setLoading(true);
            setHasErrors(undefined);
            requestPassword(values.email)
                .then(() => {
                    setHasErrors(false);
                    setLoading(false);
                    const currentTime = Date.now();
                    localStorage.setItem('lastForgotPasswordSubmitTime', currentTime.toString());
                    setRemainingTime(FIVE_MINUTES); // 5 dakikalık geri sayım başlat
                })
                .catch(() => {
                    setHasErrors(true);
                    setLoading(false);
                    setSubmitting(false);
                    setStatus(intl.formatMessage({id: 'EMAIL_NOT_EXIST'}));
                });
        },
    });

    const formatRemainingTime = (time: number) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <>
            {/*<div className="language-selector-container">*/}
            {/*    <LanguageSelector/>*/}
            {/*</div>*/}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold"></h2>
            </div>
            <form
                className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
                noValidate
                id='kt_login_password_reset_form'
                onSubmit={formik.handleSubmit}
            >
                <div className='text-center mb-10'>
                    {/* begin::Title */}
                    <h1 className='text-gray-900 fw-bolder mb-3'>{intl.formatMessage({id: 'FORGOT_PASSWORD_TITLE'})}</h1>
                    {/* end::Title */}

                    {/* begin::Link */}
                    <div className='text-gray-500 fw-semibold fs-6'>
                        {intl.formatMessage({id: 'FORGOT_PASSWORD_DESCRIPTION'})}
                    </div>
                    {/* end::Link */}
                </div>

                {/* begin::Title */}
                {hasErrors === true && (
                    <div className='mb-lg-15 alert alert-danger'>
                        <div className='alert-text font-weight-bold'>
                            {intl.formatMessage({id: 'FORGOT_PASSWORD_ERROR'})}
                        </div>
                    </div>
                )}

                {hasErrors === false && (
                    <div className='mb-10 bg-light-info p-8 rounded'>
                        <div className='text-info'>{intl.formatMessage({id: 'FORGOT_PASSWORD_SUCCESS'})}</div>
                    </div>
                )}
                {/* end::Title */}

                {/* begin::Form group */}
                <div className='fv-row mb-8'>
                    <label
                        className='form-label fw-bolder text-gray-900 fs-6'>{intl.formatMessage({id: 'EMAIL_LABEL'})}</label>
                    <input
                        type='email'
                        placeholder={intl.formatMessage({id: 'EMAIL_PLACEHOLDER'})}
                        autoComplete='off'
                        {...formik.getFieldProps('email')}
                        className={clsx(
                            'form-control bg-transparent',
                            {'is-invalid': formik.touched.email && formik.errors.email},
                            {'is-valid': formik.touched.email && !formik.errors.email},
                        )}
                        disabled={remainingTime !== null} // Geri sayım sürerken input'u devre dışı bırak
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>
                                <span role='alert'>{formik.errors.email}</span>
                            </div>
                        </div>
                    )}
                </div>
                {/* end::Form group */}

                {/* begin::Form group */}
                <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
                    <button type='submit' id='kt_password_reset_submit' className='btn btn-primary me-4'
                            disabled={loading || remainingTime !== null}>
                        {remainingTime !== null ? (
                            <span className='indicator-label'>
                {intl.formatMessage({id: 'WAIT_FOR'}).replace('{time}', formatRemainingTime(remainingTime))}
              </span>
                        ) : (
                            <>
                                <span className='indicator-label'>{intl.formatMessage({id: 'SUBMIT_BUTTON'})}</span>
                                {loading && (
                                    <span className='indicator-progress'>
                    {intl.formatMessage({id: 'PLEASE_WAIT'})}
                                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                                )}
                            </>
                        )}
                    </button>
                    <Link to='/auth/login'>
                        <button
                            type='button'
                            id='kt_login_password_reset_form_cancel_button'
                            className='btn btn-light'
                            disabled={formik.isSubmitting || !formik.isValid}
                        >
                            {intl.formatMessage({id: 'CANCEL_BUTTON'})}
                        </button>
                    </Link>{' '}
                </div>
                {/* end::Form group */}
            </form>
        </>
    );
}
