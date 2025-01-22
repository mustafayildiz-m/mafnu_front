import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import { register, fetchSchools, fetchRoles } from '../core/_requests'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2';
import '../../../../styles/loader.css';
import '../../../../styles/RegisterPage.css';
import { useIntl } from "react-intl";
import PrivacyModal from "../../privacy/PrivacyModal.tsx";


export function Registration() {
    const intl = useIntl();
    const [loading, setLoading] = useState(false)
    const [schools, setSchools] = useState<School[]>([]);
    const [roles, setRoles] = useState<Role[]>([])

    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const handlePrivacyModalOpen = () => setShowPrivacyModal(true);
    const handlePrivacyModalClose = () => setShowPrivacyModal(false);



    let selectedLang = '';

    const i18nConfig = localStorage.getItem('i18nConfig');
    if (i18nConfig) {
        const parsedConfig = JSON.parse(i18nConfig);
        selectedLang = parsedConfig.selectedLang || 'en';
    }else{
        selectedLang = 'en';
    }


    const initialValues = {
        name: '',
        surname: '',
        email: '',
        phone: '',
        birthdate: '',
        gender: '',
        bloodType: '',
        nationalID: '',
        passportNumber: '',
        consentApproval: false,
        roleID: '',
        subRoleID: '',
        language: '',
        schoolID: '',
    };


    const registrationSchema = Yup.object().shape({
        name: Yup.string()
            .min(3, intl.formatMessage({ id: 'VALIDATION_MIN_CHARACTERS' }, { count: 3 }))
            .max(50, intl.formatMessage({ id: 'VALIDATION_MAX_CHARACTERS' }, { count: 50 }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_NAME' })),
        surname: Yup.string()
            .min(3, intl.formatMessage({ id: 'VALIDATION_MIN_CHARACTERS' }, { count: 3 }))
            .max(50, intl.formatMessage({ id: 'VALIDATION_MAX_CHARACTERS' }, { count: 50 }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_SURNAME' })),
        email: Yup.string()
            .email(intl.formatMessage({ id: 'VALIDATION_INVALID_EMAIL' }))
            .min(3, intl.formatMessage({ id: 'VALIDATION_MIN_CHARACTERS' }, { count: 3 }))
            .max(50, intl.formatMessage({ id: 'VALIDATION_MAX_CHARACTERS' }, { count: 50 }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_EMAIL' })),
        phone: Yup.string()
            .matches(/^[1-9][0-9]{9}$/, intl.formatMessage({ id: 'VALIDATION_PHONE_FORMAT' }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_PHONE' })),
        birthdate: Yup.date()
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_BIRTHDATE' })),
        gender: Yup.string()
            .oneOf(['Kadın', 'Erkek', 'Diğer'], intl.formatMessage({ id: 'VALIDATION_INVALID_GENDER' }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_GENDER' })),
        nationalID: Yup.string().nullable(),
        passportNumber: Yup.string().nullable(),
        schoolID: Yup.number()
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_SCHOOL' })),
        consentApproval: Yup.bool()
            .oneOf([true], intl.formatMessage({ id: 'VALIDATION_REQUIRED_CONSENT' }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_CONSENT' })),
        roleID: Yup.number()
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_ROLE' })),
        subRoleID: Yup.number().nullable(),
        language: Yup.string()
            .oneOf(['tr', 'fr', 'en'], intl.formatMessage({ id: 'VALIDATION_INVALID_LANGUAGE' }))
            .required(intl.formatMessage({ id: 'VALIDATION_REQUIRED_LANGUAGE' })),
        nationalIDOrPassport: Yup.mixed().test(
            'nationalIDOrPassport',
            intl.formatMessage({ id: 'VALIDATION_REQUIRED_NATIONALID_OR_PASSPORT' }),
            function () {
                return this.parent.nationalID || this.parent.passportNumber;
            }
        ),
    });

    const navigate = useNavigate();

    interface Role {
        id: number
        roleName_tr: string
        roleName_en: string
        roleName_fr: string
        subRoles: SubRole[]
    }

    interface SubRole {
        id: number
        subRoleName_tr: string
        subRoleName_en: string
        subRoleName_fr: string
    }

    interface Country {
        id: number;
        countryName: string;
    }

    interface School {
        id: number;
        schoolName: string;
        countryID: Country;
    }

    useEffect(() => {
        const fetchRolesAndSchools = async () => {
            try {
                const [schoolsResponse, rolesResponse] = await Promise.all([fetchSchools(), fetchRoles()])
                setSchools(schoolsResponse.data)
                setRoles(rolesResponse.data)
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: intl.formatMessage({ id: 'ERROR_TITLE' }),
                    text: intl.formatMessage({ id: 'ERROR_LOADING_DATA' }),
                })
            }
        }
        fetchRolesAndSchools()
    }, [])



    const formik = useFormik({
        initialValues,
        validationSchema: registrationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting }) => {
            setLoading(true);

            const modifiedValues = {
                ...values,
                bloodType: values.bloodType || '0+',
            };

            try {
                await register(
                    modifiedValues.email,
                    modifiedValues.name,
                    modifiedValues.surname,
                    modifiedValues.phone,
                    modifiedValues.birthdate,
                    modifiedValues.gender,
                    modifiedValues.bloodType,
                    modifiedValues.nationalID || null,
                    modifiedValues.passportNumber || null,
                    modifiedValues.consentApproval,
                    Number(modifiedValues.schoolID),
                    Number(modifiedValues.roleID),
                    Number(modifiedValues.subRoleID) || null,
                    modifiedValues.language
                );

                Swal.fire({
                    icon: 'success',
                    title: intl.formatMessage({ id: 'SUCCESS_TITLE_REGISTRATION' }),
                    text: intl.formatMessage({ id: 'SUCCESS_TEXT_REGISTRATION' }),
                    confirmButtonText: intl.formatMessage({ id: 'SUCCESS_CONFIRM_BUTTON' }),
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/auth/login');
                    }
                });

            } catch (error: any) {
                const defaultErrorMessage = intl.formatMessage({ id: 'ERROR_GENERIC_USER_CREATION' });
                let errorMessage = defaultErrorMessage;

                if (error?.response?.data) {
                    errorMessage = error.response.data.message || error.response.data.error || defaultErrorMessage;

                    if (errorMessage === 'Kullanıcı oluşturulurken bir hata oluştu.') {
                        errorMessage = defaultErrorMessage;
                    }
                }
                Swal.fire({
                    icon: 'error',
                    title: intl.formatMessage({ id: 'ERROR_TITLE' }),
                    text: errorMessage,
                    confirmButtonText: intl.formatMessage({ id: 'BUTTON_OK' }),
                });

                console.error('Error during user creation:', error);
            } finally {
                setLoading(false);
                setSubmitting(false);
            }
        },
    });

    return (

        <div>
            {/*<div className="language-selector-container">*/}
            {/*    <LanguageSelector/>*/}
            {/*</div>*/}
            <form className='form w-lg-600px fv-plugins-bootstrap5 fv-plugins-framework' noValidate
                  id='kt_login_signup_form'
                  onSubmit={formik.handleSubmit}>
                {/* Form Başlık */}
                <div className='text-center mb-11'>
                    <h1 className='text-gray-900 fw-bolder mb-3'>{intl.formatMessage({id: 'REGISTRATION_FORM_TITLE'})}</h1>
                </div>

                {/* Hata Mesajı */}
                {formik.status && (
                    <div className='mb-lg-15 alert alert-danger'>
                        <div className='alert-text font-weight-bold'>{formik.status}</div>
                    </div>
                )}

                <div className="row">
                    <div className="col-md-6">
                        {/* Ad */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_NAME_LABEL'})}
                            </label>
                            <input
                                placeholder={intl.formatMessage({id: 'REGISTRATION_NAME_PLACEHOLDER'})}
                                type='text'

                                {...formik.getFieldProps('name')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.name && formik.errors.name,
                                    'is-valid': formik.touched.name && !formik.errors.name,
                                })}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        {/* Soyad */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_SURNAME_LABEL'})}
                            </label>
                            <input
                                placeholder={intl.formatMessage({id: 'REGISTRATION_SURNAME_PLACEHOLDER'})}
                                type='text'

                                {...formik.getFieldProps('surname')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.surname && formik.errors.surname,
                                    'is-valid': formik.touched.surname && !formik.errors.surname,
                                })}
                            />
                            {formik.touched.surname && formik.errors.surname && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.surname}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        {/* Email */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_EMAIL_LABEL'})}
                            </label>
                            <input
                                placeholder={intl.formatMessage({id: 'REGISTRATION_EMAIL_PLACEHOLDER'})}
                                type='email'

                                {...formik.getFieldProps('email')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.email && formik.errors.email,
                                    'is-valid': formik.touched.email && !formik.errors.email,
                                })}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        {/* Telefon Numarası */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_PHONE_LABEL'})}
                            </label>
                            <input
                                type="tel"
                                placeholder={intl.formatMessage({id: 'REGISTRATION_PHONE_PLACEHOLDER'})}
                                maxLength={10}
                                {...formik.getFieldProps('phone')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.phone && formik.errors.phone,
                                    'is-valid': formik.touched.phone && !formik.errors.phone,
                                })}
                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                }}
                            />

                            {formik.touched.phone && formik.errors.phone && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        {/* Doğum Tarihi */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_BIRTHDATE_LABEL'})}
                            </label>
                            <input
                                placeholder={intl.formatMessage({id: 'REGISTRATION_BIRTHDATE_PLACEHOLDER'})}
                                type='date'

                                {...formik.getFieldProps('birthdate')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.birthdate && formik.errors.birthdate,
                                    'is-valid': formik.touched.birthdate && !formik.errors.birthdate,
                                })}
                            />
                            {formik.touched.birthdate && formik.errors.birthdate && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.birthdate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        {/* Cinsiyet */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_GENDER_LABEL'})}
                            </label>
                            <select
                                {...formik.getFieldProps('gender')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.gender && formik.errors.gender,
                                    'is-valid': formik.touched.gender && !formik.errors.gender,
                                })}
                            >
                                <option value='' disabled>
                                    {intl.formatMessage({id: 'REGISTRATION_GENDER_PLACEHOLDER'})}
                                </option>
                                <option
                                    value='Erkek'>{intl.formatMessage({id: 'REGISTRATION_GENDER_MALE'})}</option>
                                <option
                                    value='Kadın'>{intl.formatMessage({id: 'REGISTRATION_GENDER_FEMALE'})}</option>
                                <option
                                    value='Diğer'>{intl.formatMessage({id: 'REGISTRATION_GENDER_OTHER'})}</option>
                            </select>
                            {formik.touched.gender && formik.errors.gender && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.gender}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="row">
                    <div className="col-md-6">
                        {/* TC Kimlik No */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_NATIONALID_LABEL'})}
                            </label>
                            <input
                                placeholder={intl.formatMessage({id: 'REGISTRATION_NATIONALID_PLACEHOLDER'})}
                                type='text'

                                {...formik.getFieldProps('nationalID')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.nationalID && formik.errors.nationalID,
                                    'is-valid': formik.touched.nationalID && !formik.errors.nationalID,
                                })}
                            />
                            {formik.touched.nationalID && formik.errors.nationalID && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.nationalID}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        {/* Pasaport Numarası */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_PASSPORT_LABEL'})}
                            </label>
                            <input
                                placeholder={intl.formatMessage({id: 'REGISTRATION_PASSPORT_PLACEHOLDER'})}
                                type='text'

                                {...formik.getFieldProps('passportNumber')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.passportNumber && formik.errors.passportNumber,
                                    'is-valid': formik.touched.passportNumber && !formik.errors.passportNumber,
                                })}
                            />
                            {formik.touched.passportNumber && formik.errors.passportNumber && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.passportNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        {/* Okul Seçimi */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_SCHOOL_LABEL'})}
                            </label>
                            <select
                                {...formik.getFieldProps('schoolID')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.schoolID && formik.errors.schoolID,
                                    'is-valid': formik.touched.schoolID && !formik.errors.schoolID,
                                })}
                                onChange={(e) => formik.setFieldValue('schoolID', Number(e.target.value))} // Ensuring schoolID is set as a number
                            >
                                <option value='' disabled>
                                    {intl.formatMessage({id: 'REGISTRATION_SCHOOL_PLACEHOLDER'})}
                                </option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.schoolName}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.schoolID && formik.errors.schoolID && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.schoolID}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        {/* Kan Grubu */}
                        {/*<div className='fv-row mb-8'>*/}
                        {/*    <label className='form-label fw-bolder text-gray-900 fs-6'>*/}
                        {/*        {intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_LABEL'})}*/}
                        {/*    </label>*/}
                        {/*    <select*/}
                        {/*        {...formik.getFieldProps('bloodType')}*/}
                        {/*        className={clsx('form-control bg-transparent', {*/}
                        {/*            'is-invalid': formik.touched.bloodType && formik.errors.bloodType,*/}
                        {/*            'is-valid': formik.touched.bloodType && !formik.errors.bloodType,*/}
                        {/*        })}*/}
                        {/*    >*/}
                        {/*        <option value=''>*/}
                        {/*            {intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_PLACEHOLDER'})}*/}
                        {/*        </option>*/}
                        {/*        <option*/}
                        {/*            value='A+'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_A_POS'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='A-'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_A_NEG'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='B+'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_B_POS'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='B-'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_B_NEG'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='AB+'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_AB_POS'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='AB-'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_AB_NEG'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='0+'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_O_POS'})}</option>*/}
                        {/*        <option*/}
                        {/*            value='0-'>{intl.formatMessage({id: 'REGISTRATION_BLOOD_TYPE_O_NEG'})}</option>*/}
                        {/*    </select>*/}
                        {/*    {formik.touched.bloodType && formik.errors.bloodType && (*/}
                        {/*        <div className='fv-help-block'>*/}
                        {/*            <span role='alert'>{formik.errors.bloodType}</span>*/}
                        {/*        </div>*/}
                        {/*    )}*/}
                        {/*</div>*/}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        {/* Rol Seçimi */}
                        <div className='fv-row mb-8'>
                            <label className='form-label fw-bolder text-gray-900 fs-6'>
                                {intl.formatMessage({id: 'REGISTRATION_ROLE_LABEL'})}
                            </label>
                            <select
                                {...formik.getFieldProps('roleID')}
                                className={clsx('form-control bg-transparent', {
                                    'is-invalid': formik.touched.roleID && formik.errors.roleID,
                                    'is-valid': formik.touched.roleID && !formik.errors.roleID,
                                })}
                            >
                                <option value='' disabled>
                                    {intl.formatMessage({id: 'REGISTRATION_ROLE_PLACEHOLDER'})}
                                </option>
                                {roles.map((role) => {
                                    const roleName =
                                        selectedLang === 'tr'
                                            ? role.roleName_tr
                                            : selectedLang === 'en'
                                                ? role.roleName_en
                                                : role.roleName_fr;

                                    return (
                                        <option key={role.id} value={role.id}>
                                            {roleName}
                                        </option>
                                    );
                                })}
                            </select>

                            {formik.touched.roleID && formik.errors.roleID && (
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.roleID}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        {(() => {
                            const selectedRole = roles.find((role: Role) => role.id === Number(formik.values.roleID));

                            return (
                                formik.values.roleID && selectedRole && selectedRole.subRoles.length > 0 && (
                                    <div className='fv-row mb-8'>
                                        <label className='form-label fw-bolder text-gray-900 fs-6'>
                                            {intl.formatMessage({id: 'REGISTRATION_SUBROLE_LABEL'})}
                                        </label>
                                        <select
                                            {...formik.getFieldProps('subRoleID')}
                                            className={clsx('form-control bg-transparent', {
                                                'is-invalid': formik.touched.subRoleID && formik.errors.subRoleID,
                                                'is-valid': formik.touched.subRoleID && !formik.errors.subRoleID,
                                            })}
                                        >
                                            <option value='' disabled>
                                                {intl.formatMessage({id: 'REGISTRATION_SUBROLE_PLACEHOLDER'})}
                                            </option>
                                            {selectedRole.subRoles.map((subRole) => {
                                                const subRoleName =
                                                    selectedLang === 'tr'
                                                        ? subRole.subRoleName_tr
                                                        : selectedLang === 'en'
                                                            ? subRole.subRoleName_en
                                                            : subRole.subRoleName_fr;

                                                return (
                                                    <option key={subRole.id} value={subRole.id}>
                                                        {subRoleName}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        {formik.touched.subRoleID && formik.errors.subRoleID && (
                                            <div className='fv-help-block'>
                                                <span role='alert'>{formik.errors.subRoleID}</span>
                                            </div>
                                        )}
                                    </div>

                                )
                            );
                        })()}
                    </div>
                </div>

                {/* Dil Seçimi */}
                <div className='fv-row mb-8'>
                    <label className='form-label fw-bolder text-gray-900 fs-6'>
                        {intl.formatMessage({id: 'REGISTRATION_LANGUAGE_LABEL'})}
                    </label>
                    <select
                        {...formik.getFieldProps('language')}
                        className={clsx('form-control bg-transparent', {
                            'is-invalid': formik.touched.language && formik.errors.language,
                            'is-valid': formik.touched.language && !formik.errors.language,
                        })}
                    >
                        <option value='' disabled>
                            {intl.formatMessage({id: 'REGISTRATION_LANGUAGE_PLACEHOLDER'})}
                        </option>
                        {/*<option*/}
                        {/*    value='tr'>{intl.formatMessage({id: 'REGISTRATION_LANGUAGE_TURKISH'})}</option>*/}
                        <option
                            value='fr'>{intl.formatMessage({id: 'REGISTRATION_LANGUAGE_FRENCH'})}</option>
                        <option
                            value='en'>{intl.formatMessage({id: 'REGISTRATION_LANGUAGE_ENGLISH'})}</option>
                    </select>
                    {formik.touched.language && formik.errors.language && (
                        <div className='fv-help-block'>
                            <span role='alert'>{formik.errors.language}</span>
                        </div>
                    )}
                </div>


                {/* Gizlilik Onayı */}
                <div className='fv-row mb-8'>
                    <label className='form-check form-check-inline' htmlFor='kt_login_toc_agree'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            id='kt_login_toc_agree'
                            {...formik.getFieldProps('consentApproval')}
                        />
                        <span>
                            {intl.formatMessage({id: 'REGISTRATION_CONSENT_TEXT'})}{' '}
                            <a href='#' onClick={handlePrivacyModalOpen} className='ms-1 link-primary'>
                                {intl.formatMessage({id: 'REGISTRATION_CONSENT_LINK'})}
                            </a>.
                        </span>
                    </label>
                </div>

                <PrivacyModal show={showPrivacyModal} handleClose={handlePrivacyModalClose}/>


                {/* Butonlar */}
                <div className='text-center'>
                    <button
                        type='submit'
                        className='btn btn-lg btn-primary w-100 mb-5'
                        disabled={formik.isSubmitting || !formik.isValid || !formik.values.consentApproval}
                    >
                        {!loading && <span
                            className='indicator-label'>{intl.formatMessage({id: 'REGISTRATION_SUBMIT_BUTTON'})}</span>}
                        {loading && (
                            <span className='indicator-progress'>
                <div className='custom-spinner'></div>
                <span className='ms-2'>{intl.formatMessage({id: 'REGISTRATION_LOADING_TEXT'})}</span>
            </span>
                        )}
                    </button>
                    <Link to='/auth/login'>
                        <button type='button' className='btn btn-lg btn-light-primary w-100 mb-5'>
                            {intl.formatMessage({id: 'REGISTRATION_CANCEL_BUTTON'})}
                        </button>
                    </Link>
                </div>

            </form>
        </div>
    )

}
