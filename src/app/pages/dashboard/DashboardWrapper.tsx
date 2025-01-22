import {
    Box,
    Text,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Input,
    RadioGroup,
    Radio,
    Stack,
    Button,
    VStack,
    Textarea,
    Card,
    CardBody, Divider
} from '@chakra-ui/react'
import { Content } from "../../../_metronic/layout/components/content";

import React, {FC, useEffect, useState} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
import {useAuth} from "../../modules/auth"
import {fetchCommissions, fetchCountries, getFormDataByUserId, saveFormData} from "../../modules/auth/core/_requests"
import {Formik, Form} from 'formik'
import Select from 'react-select'
import Swal from "sweetalert2";
import AdminReport from "../../modules/admin/AdminReport.tsx";
import {setLanguage} from "../../../_metronic/i18n/Metronici18n.tsx";
import {useLang} from "../../../_metronic/i18n/Metronici18n.tsx";
import PaymentUpload from "../../modules/upload_file/PaymentUpload.tsx";

const DashboardWrapper: FC = () => {
    const intl = useIntl()
    const {currentUser} = useAuth()
    const selectedLanguage = useLang();
    const [countries, setCountries] = useState<any[]>([])
    const [commissions, setCommissions] = useState<any[]>([])
    const [showAllergyExplanation, setShowAllergyExplanation] = useState<boolean>(false)
    const [showMedicationExplanation, setShowMedicationExplanation] = useState<boolean>(false)
    const [showPetsExplanation, setShowPetsExplanation] = useState<boolean>(false)
    const [showGuestStudentInput, setShowGuestStudentInput] = useState<boolean>(false);
    const [showErrors, setShowErrors] = useState<any>({});
    const [formData, setFormData] = useState<any[] | null>(null);

    const changeLanguage = async (lang: string) => {
        if (currentUser?.id) {
            await setLanguage(lang, currentUser.id);
        }
    };

    useEffect(() => {
        if (currentUser?.language && currentUser.language !== selectedLanguage) {
            changeLanguage(currentUser.language); // Kullanıcı dilini backend'den al ve set et
        }
    }, [currentUser?.language, selectedLanguage]);

    const isDelege = currentUser?.roleID === Number(process.env.REACT_APP_DELEGE)
    const isMesajciOrOturumBaskani = [Number(process.env.REACT_APP_MESAJCI), Number(process.env.REACT_APP_OTURUM_BASKANI)].includes(currentUser?.roleID ?? 0)
    const isOgretmen = currentUser?.roleID === Number(process.env.REACT_APP_OGRETMENLER)
    const isOrganizasyonGrubu = currentUser?.roleID === Number(process.env.REACT_APP_ORGANIZASYON_GRUBU)
    const isTevfikFikretOkullari = currentUser?.schoolID === Number(process.env.REACT_APP_TEVFIK_FIKRET_LISESI_OKUL_ID)
    const isAdmin = currentUser?.roleID === Number(process.env.REACT_APP_ADMIN)


    interface ErrorState {
        parentContact?: string;
        familyName?: string;
        pets?: string;
        medication?: string;
        hobbies?: string;
        otherAccommodationDetails?: string;
        accommodation?: string;
        guestStudentCount?: string;
        selectedCommission?: string;
        selectedCountry?: string;
        allergy?: string;
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!isAdmin) {
                    const [countryRes, commissionRes] = await Promise.all([fetchCountries(), fetchCommissions()])
                    setCountries(countryRes.data)
                    setCommissions(commissionRes.data)
                    if (currentUser?.id) {
                        const formRes = await getFormDataByUserId(currentUser.id);
                        setFormData(formRes.data);
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        if (!isAdmin) {
            loadData()
        }

    }, [currentUser])
    const initialValues = {
        selectedCountry: '',
        selectedCommission: '',
        guestStudentCount: '',
        accommodation: '',
        otherAccommodationDetails: '',
        allergy: '',
        hobbies: '',
        medication: '',
        pets: '',
        familyName: '',
        parentContact: '',
    };

    const handleSubmit = (values: any) => {
        const errors: any = {};
        if (!currentUser) {
            console.error("Kullanıcı bilgisi mevcut değil!");
            return;
        }

        if ((isDelege || isMesajciOrOturumBaskani) && isTevfikFikretOkullari) {
            if (!values.selectedCommission) {
                errors.selectedCommission = intl.formatMessage({ id: 'ERROR_COMMISSION_REQUIRED' });
            }
            if (!isMesajciOrOturumBaskani && !values.selectedCountry) {
                errors.selectedCountry = intl.formatMessage({ id: 'ERROR_COUNTRY_REQUIRED' });
            }
            if (!values.guestStudentCount) {
                errors.guestStudentCount = intl.formatMessage({ id: 'ERROR_GUEST_STUDENT_COUNT_REQUIRED' });
            }
        } else if ((isDelege || isMesajciOrOturumBaskani) && !isTevfikFikretOkullari) {
            if (!values.selectedCommission) {
                errors.selectedCommission = intl.formatMessage({ id: 'ERROR_COMMISSION_REQUIRED' });
            }
            if (!isMesajciOrOturumBaskani && !values.selectedCountry) {
                errors.selectedCountry = intl.formatMessage({ id: 'ERROR_COUNTRY_REQUIRED' });
            }
            if (!values.accommodation) {
                errors.accommodation = intl.formatMessage({ id: 'ERROR_ACCOMMODATION_REQUIRED' });
            }
            if (values.accommodation === 'Aile') {
                if (!values.allergy) {
                    errors.allergy = intl.formatMessage({ id: 'ERROR_ALLERGY_REQUIRED' });
                }
                if (!values.familyName) {
                    errors.familyName = intl.formatMessage({ id: 'ERROR_FAMILY_INFO_REQUIRED' });
                }
                if (!values.hobbies) {
                    errors.hobbies = intl.formatMessage({ id: 'ERROR_HOBBIES_REQUIRED' });
                }
                if (!values.medication) {
                    errors.medication = intl.formatMessage({ id: 'ERROR_MEDICATION_REQUIRED' });
                }
                if (!values.parentContact) {
                    errors.parentContact = intl.formatMessage({ id: 'ERROR_PARENT_CONTACT_REQUIRED' });
                }
                if (!values.pets) {
                    errors.pets = intl.formatMessage({ id: 'ERROR_PETS_REQUIRED' });
                }
                if (!values.selectedCommission) {
                    errors.selectedCommission = intl.formatMessage({ id: 'ERROR_COMMISSION_REQUIRED' });
                }
            }
            if (values.accommodation === "Diğer") {
                if (!values.otherAccommodationDetails) {
                    errors.otherAccommodationDetails = intl.formatMessage({ id: 'ERROR_OTHER_ACCOMMODATION_REQUIRED' });
                }
            }
        }

        if (isOrganizasyonGrubu && isTevfikFikretOkullari) {
            if (!values.guestStudentCount) {
                errors.guestStudentCount = intl.formatMessage({ id: 'ERROR_GUEST_STUDENT_COUNT_REQUIRED' });
            }
        }
        if (Object.keys(errors).length > 0) {
            setShowErrors(errors);
            console.log(errors);
        } else {
            Swal.fire({
                title: intl.formatMessage({ id: 'CONFIRM_TITLE' }),
                text: intl.formatMessage({ id: 'CONFIRM_TEXT' }),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({ id: 'YES_CONFIRM' }),
                cancelButtonText: intl.formatMessage({ id: 'NO_CANCEL' }),
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    const formDataWithUser = {
                        ...values,
                        countryID: values.selectedCountry,
                        commissionID: values.selectedCommission,
                        userID: currentUser.id,
                        name: currentUser.name,
                        surname: currentUser.surname,
                        schoolID: currentUser.schoolID,
                        roleID: currentUser.roleID,
                        roleName: currentUser.roleName,
                        email: currentUser.email,
                        language: currentUser.language,
                    };
                    setShowErrors({});
                    saveFormData(formDataWithUser)
                        .then(async (response) => {
                            Swal.fire({
                                title: intl.formatMessage({ id: 'SUCCESS_TITLE' }),
                                text: intl.formatMessage({ id: 'SUCCESS_TEXT' }),
                                icon: 'success',
                                confirmButtonText: intl.formatMessage({ id: 'OK' })
                            }).then(() => {
                                window.location.reload();
                            });

                        })
                        .catch((error) => {
                            console.error("Veri gönderilirken hata oluştu:", error);
                            Swal.fire({
                                title: intl.formatMessage({ id: 'ERROR_TITLE' }),
                                text: intl.formatMessage({ id: 'ERROR_TEXT' }),
                                icon: 'error',
                                confirmButtonText: intl.formatMessage({ id: 'OK' })
                            });
                        });
                }
            });
        }
    };

    if (isAdmin) {
        return (
            <AdminReport/>
        )
    }

    if (formData && formData.length > 0) {

        const displayData = {
            [intl.formatMessage({id: 'FULL_NAME'})]: `${formData[0].name} ${formData[0].surname}`,
            [intl.formatMessage({id: 'LANGUAGE'})]: formData[0].language === 'tr'
                ? intl.formatMessage({id: 'LANGUAGE_TURKISH'})
                : formData[0].language === 'fr'
                    ? intl.formatMessage({id: 'LANGUAGE_FRENCH'})
                    : intl.formatMessage({id: 'LANGUAGE_ENGLISH'}),
            [intl.formatMessage({id: 'SCHOOL'})]: formData[0].schoolID?.schoolName,
            [intl.formatMessage({id: 'COUNTRY'})]: formData[0].countryID?.countryName,
            [intl.formatMessage({id: 'COMMISSION'})]: formData[0].commissionID?.commissionName,
            [intl.formatMessage({id: 'ROLE'})]: formData[0].roleID.roleName,
            [intl.formatMessage({id: 'EMAIL'})]: formData[0].email,
            [intl.formatMessage({id: 'GUEST_STUDENT_COUNT'})]: formData[0].guestStudentCount,
            [intl.formatMessage({id: 'ACCOMMODATION'})]: formData[0].accommodation,
            [intl.formatMessage({id: 'OTHER_ACCOMMODATION_DETAILS'})]: formData[0].otherAccommodationDetails,
            [intl.formatMessage({id: 'ALLERGY'})]: formData[0].allergy,
            [intl.formatMessage({id: 'HOBBIES'})]: formData[0].hobbies,
            [intl.formatMessage({id: 'MEDICATION'})]: formData[0].medication,
            [intl.formatMessage({id: 'PETS'})]: formData[0].pets,
            [intl.formatMessage({id: 'FAMILY_INFO'})]: formData[0].familyName,
            [intl.formatMessage({id: 'PARENT_CONTACT'})]: formData[0].parentContact,
        };


        const filteredData = Object.entries(displayData).filter(([_, value]) => value);


        return (

            <Content>

                <div className='card-header px-6 d-flex justify-content-between align-items-center'>
                    <h2 className='fw-bold m-0'>{ intl.formatMessage({
                        id: 'SAVED_FORM_DATA',
                        defaultMessage: 'Kayıtlı Form Verileri'
                    }) }</h2>
                </div>

                <div className='card-body p-6'>
                    {filteredData.map(([key, value], index) => (
                        <div key={index} className='row mb-7'>
                            <label className='col-lg-4 fw-semibold'>
                                {key}:
                            </label>
                            <div className='col-lg-8'>
                                <span className="fw-bold fs-6 text-gray-800">{ value }</span>
                            </div>
                        </div>
                    ))}

                </div>

            </Content>

        );
    }


    if (isOgretmen){
        return (
            <Content>
                <div className="m-5 notice d-flex bg-light-warning rounded border-warning border border-dashed  p-6">
                    <i className="ki-duotone ki-information fs-2tx text-warning me-4"><span
                        className="path1"></span><span className="path2"></span><span
                        className="path3"></span></i>
                    <div className="d-flex flex-stack flex-grow-1">
                        <div className=" fw-semibold">
                            <h4 className="text-gray-900 fw-bold">
                                <FormattedMessage id="FORM_NOT_FOUND_TITLE" defaultMessage="Form Bulunamadı"/>
                            </h4>
                            <div className="fs-6 text-gray-700 pb-5">
                                <FormattedMessage
                                    id="FORM_NOT_FOUND_DESCRIPTION"
                                    defaultMessage="{roleName} için doldurulması gereken bir form bulunamadı."
                                    values={{roleName: currentUser.roleName}}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </Content>
        )
    }

    if (!currentUser || currentUser.paymentApproval === false) {
        return (
            <Content>
                <div className="m-5 notice d-flex bg-light-warning rounded border-warning border border-dashed  p-6">
                    <i className="ki-duotone ki-information fs-2tx text-warning me-4">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                    </i>
                    <div className="d-flex flex-stack flex-grow-1">
                        <div className="fw-semibold">
                            <h4 className="text-gray-900 fw-bold">
                                <FormattedMessage id="PAYMENT_NOT_MADE" />
                            </h4>
                            <div className="fs-6 text-gray-700 pb-5">
                                <FormattedMessage id="PAYMENT_INSTRUCTION" />
                            </div>
                            <hr />
                            <div>
                                <b>IBAN</b> <br />
                                {process.env.REACT_APP_IBAN_NAME} <br />
                                {process.env.REACT_APP_IBAN_BANK} <br />
                                {process.env.REACT_APP_IBAN_NO} <br />
                            </div>
                            <PaymentUpload />
                        </div>
                    </div>
                </div>
            </Content>
        );
    }

    return (
        <>
            <PageTitle breadcrumbs={ [] }>{ intl.formatMessage({ id: 'MENU.DASHBOARD' }) }</PageTitle>

            <div style={{placeSelf: 'center', width: '100%'}} >
                <div className='card m-6 mb-xl-10 col-xl-8'>
                    <div className='card-body'>
                        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                            {({values, setFieldValue}) => (
                                <Form placeholder={null}>
                                    <VStack spacing={8} align="stretch">

                                        {(isDelege || isMesajciOrOturumBaskani) && (
                                            <Box>
                                                <Select
                                                    name="selectedCommission"
                                                    placeholder={intl.formatMessage({id: 'SELECT_COMMISSION', defaultMessage: 'Komisyon seçiniz'})}
                                                    options={commissions.map((commission) => ({
                                                        value: commission.id,
                                                        label:selectedLanguage ==='en'? commission.commissionName:commission.commissionName_fr,
                                                    }))}
                                                    onChange={(option) => {
                                                        setFieldValue('selectedCommission', option ? option.value : null);
                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                            ...prevErrors,
                                                            selectedCommission: option && option.value ? null : prevErrors.selectedCommission
                                                        }))
                                                    }}
                                                    value={values.selectedCommission ? {
                                                        value: values.selectedCommission,
                                                        label: commissions.find(commission => commission.id === values.selectedCommission)?.commissionName
                                                    } : null}
                                                />
                                                {showErrors.selectedCommission && (
                                                    <Text color="red.500">{showErrors.selectedCommission}</Text>
                                                )}
                                            </Box>
                                        )}

                                        {isDelege && (
                                            <Box>
                                                <Select
                                                    name="selectedCountry"
                                                    placeholder={intl.formatMessage({id: 'SELECT_COUNTRY', defaultMessage: 'Ülke seçiniz'})}
                                                    options={countries.map((country) => ({
                                                        value: country.id,
                                                        label: selectedLanguage==='en'? country.countryName:country.countryName_fr,
                                                    }))}
                                                    onChange={(option) => {
                                                        setFieldValue('selectedCountry', option ? option.value : null);
                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                            ...prevErrors,
                                                            selectedCountry: option && option.value ? null : prevErrors.selectedCountry
                                                        }))
                                                    }}
                                                    value={values.selectedCountry ? {
                                                        value: values.selectedCountry,
                                                        label: countries.find(country => country.id === values.selectedCountry)?.countryName
                                                    } : null}
                                                />
                                                {showErrors.selectedCountry && (
                                                    <Text color="red.500">{showErrors.selectedCountry}</Text>
                                                )}
                                            </Box>

                                        )}

                                        {(isDelege || isMesajciOrOturumBaskani) && isTevfikFikretOkullari && (
                                            <Box mb={4}>
                                                <Text fontSize="lg" fontWeight="medium">{intl.formatMessage({id: "GUEST_STUDENT_PROMPT", defaultMessage: "Misafir öğrenci alıyor musunuz?"})}</Text>
                                                <RadioGroup
                                                    name="guestStudentCountChoice"
                                                    onChange={(value) => {
                                                        setFieldValue('guestStudentCount', value === 'no' ? 'Hayır' : '');
                                                        setShowGuestStudentInput(value === 'yes');
                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                            ...prevErrors,
                                                            guestStudentCount: value === 'no' ? null : prevErrors.guestStudentCount,
                                                        }));
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={5}>
                                                        <Radio value="yes">
                                                            <FormattedMessage id="YES" defaultMessage="Evet" />
                                                        </Radio>
                                                        <Radio value="no">
                                                            <FormattedMessage id="NO" defaultMessage="Hayır" />
                                                        </Radio>
                                                    </Stack>
                                                </RadioGroup>

                                                {showGuestStudentInput && (
                                                    <Input
                                                        name="guestStudentCount"
                                                        type="number"
                                                        placeholder={intl.formatMessage({id: 'guestStudentCount', defaultMessage: 'How many guest students will you take?'})}
                                                        mt={5}
                                                        size="lg"
                                                        onChange={(e) => {
                                                            setFieldValue('guestStudentCount', e.target.value);
                                                            setShowErrors((prevErrors: ErrorState) => ({
                                                                ...prevErrors,
                                                                guestStudentCount: e.target.value ? null : intl.formatMessage({id: 'guestStudentCountError', defaultMessage: 'Guest student count is required'}),
                                                            }));
                                                        }}
                                                    />
                                                )}

                                                {showErrors.guestStudentCount && (
                                                    <Text color="red.500">{showErrors.guestStudentCount}</Text>
                                                )}
                                            </Box>
                                        )}

                                        {(isDelege || isMesajciOrOturumBaskani) && !isTevfikFikretOkullari && (
                                            <Box mb={4}>
                                                <Select
                                                    name="accommodation"
                                                    placeholder={intl.formatMessage({id: "SELECT_ACCOMMODATION_PLACE", defaultMessage: "Kalacağınız yeri seçiniz"})}
                                                    options={[
                                                        {value: 'Aile', label: intl.formatMessage({id: "FAMILY", defaultMessage: "Aile"})},
                                                        {value: 'Otel', label: intl.formatMessage({id: "HOTEL", defaultMessage: "Otel"})},
                                                        {value: 'Diğer', label: intl.formatMessage({id: "OTHER", defaultMessage: "Diğer"})},
                                                    ]}
                                                    onChange={(option) => {
                                                        setFieldValue('accommodation', option ? option.value : null);
                                                        setFieldValue('allergy', '');
                                                        setFieldValue('hobbies', '');
                                                        setFieldValue('medication', '');
                                                        setFieldValue('pets', '');
                                                        setFieldValue('familyName', '');
                                                        setFieldValue('parentContact', '');

                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                            ...prevErrors,
                                                            accommodation: option && option.value ? null : prevErrors.accommodation
                                                        }))
                                                    }}
                                                    value={values.accommodation ? {
                                                        value: values.accommodation,
                                                        label: values.accommodation
                                                    } : null}
                                                />
                                                {showErrors.accommodation && (
                                                    <Text color="red.500">{showErrors.accommodation}</Text>
                                                )}

                                                {values.accommodation === 'Diğer' && (
                                                    <Box>
                                                        <Input
                                                            name="otherAccommodationDetails"
                                                            placeholder={intl.formatMessage({id: "SPECIFY_ACCOMMODATION", defaultMessage: "Nerede kalacağınızı belirtiniz"})}
                                                            mt={5}
                                                            size="lg"
                                                            onChange={(e) => {
                                                                setFieldValue('otherAccommodationDetails', e.target.value)
                                                                setShowErrors((prevErrors: ErrorState) => ({
                                                                    ...prevErrors,
                                                                    otherAccommodationDetails: e.target.value ? '' : prevErrors.otherAccommodationDetails
                                                                }))
                                                            }}
                                                        />
                                                        {showErrors.otherAccommodationDetails && (
                                                            <Text
                                                                color="red.500">{showErrors.otherAccommodationDetails}</Text>
                                                        )}
                                                    </Box>


                                                )}

                                                {values.accommodation === 'Aile' && (
                                                    <>
                                                        <Box mt={5}>
                                                            <Text fontSize="lg" fontWeight="medium">
                                                                <FormattedMessage id="HAVE_ALLERGY" defaultMessage="Alerjiniz var mı?" />
                                                            </Text>
                                                            <RadioGroup
                                                                name="allergy"
                                                                onChange={(value) => {
                                                                    setFieldValue('allergy', value === 'no' ? 'Hayır' : '');
                                                                    setShowAllergyExplanation(value === 'yes');
                                                                    setShowErrors((prevErrors: ErrorState) => ({
                                                                        ...prevErrors,
                                                                        allergy: value === 'no' ? null : prevErrors.allergy
                                                                    }));
                                                                }}
                                                            >
                                                                <Stack direction="row" spacing={5}>
                                                                    <Radio value="yes">
                                                                        <FormattedMessage id="YES" defaultMessage="Evet" />
                                                                    </Radio>
                                                                    <Radio value="no">
                                                                        <FormattedMessage id="NO" defaultMessage="Hayır" />
                                                                    </Radio>
                                                                </Stack>
                                                            </RadioGroup>

                                                            {showAllergyExplanation && (
                                                                <Textarea
                                                                    name="allergy"
                                                                    placeholder={intl.formatMessage({id: "EXPLAIN_ALLERGY", defaultMessage: "Alerjinizi açıklayınız"})}
                                                                    mt={2}
                                                                    size="lg"
                                                                    maxLength={500}
                                                                    onChange={(e) => {
                                                                        setFieldValue('allergy', e.target.value)
                                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                                            ...prevErrors,
                                                                            allergy: e.target.value ? '' : prevErrors.allergy
                                                                        }))
                                                                    }}
                                                                />
                                                            )}
                                                            {showErrors.allergy && (
                                                                <Text color="red.500">{showErrors.allergy}</Text>
                                                            )}
                                                        </Box>

                                                        <Box mt={5}>
                                                            <Text fontSize="lg" fontWeight="medium">
                                                                <FormattedMessage id="HAVE_MEDICATION" defaultMessage="Kullandığınız ilaç var mı?" />
                                                            </Text>
                                                            <RadioGroup name="medication"
                                                                        onChange={(value) => {
                                                                            setFieldValue('medication', value === 'no' ? 'Hayır' : '');
                                                                            setShowMedicationExplanation(value === 'yes')
                                                                            setShowErrors((prevErrors: ErrorState) => ({
                                                                                ...prevErrors,
                                                                                medication: value === 'no' ? null : prevErrors.medication
                                                                            }));
                                                                        }}>
                                                                <Stack direction="row" spacing={5}>
                                                                    <Radio value="yes">
                                                                        <FormattedMessage id="YES" defaultMessage="Evet" />
                                                                    </Radio>
                                                                    <Radio value="no">
                                                                        <FormattedMessage id="NO" defaultMessage="Hayır" />
                                                                    </Radio>
                                                                </Stack>
                                                            </RadioGroup>
                                                            {showMedicationExplanation && (
                                                                <Textarea
                                                                    name="medication"
                                                                    placeholder={intl.formatMessage({id: "EXPLAIN_MEDICATION", defaultMessage: "İlaçlarınızı açıklayınız"})}
                                                                    mt={2}
                                                                    size="lg"
                                                                    maxLength={500}
                                                                    onChange={(e) => {
                                                                        setFieldValue('medication', e.target.value)
                                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                                            ...prevErrors,
                                                                            medication: e.target.value ? '' : prevErrors.medication
                                                                        }))

                                                                    }}
                                                                />
                                                            )}
                                                            {showErrors.medication && (
                                                                <Text color="red.500">{showErrors.medication}</Text>
                                                            )}
                                                        </Box>

                                                        <Box mt={5}>
                                                            <Text fontSize="lg" fontWeight="medium">
                                                                <FormattedMessage id="DISLIKE_PETS" defaultMessage="Evcil hayvandan rahatsızlık duyar mısınız?" />
                                                            </Text>
                                                            <RadioGroup name="pets"
                                                                        onChange={(value) => {
                                                                            setFieldValue('pets', value === 'no' ? 'Hayır' : '');
                                                                            setShowPetsExplanation(value === 'yes')
                                                                            setShowErrors((prevErrors: ErrorState) => ({
                                                                                ...prevErrors,
                                                                                pets: value === 'no' ? null : prevErrors.pets
                                                                            }));

                                                                        }}>
                                                                <Stack direction="row" spacing={5}>
                                                                    <Radio value="yes">
                                                                        <FormattedMessage id="YES" defaultMessage="Evet" />
                                                                    </Radio>
                                                                    <Radio value="no">
                                                                        <FormattedMessage id="NO" defaultMessage="Hayır" />
                                                                    </Radio>
                                                                </Stack>
                                                            </RadioGroup>
                                                            {showPetsExplanation && (
                                                                <Textarea
                                                                    name="pets"
                                                                    placeholder={intl.formatMessage({id: "EXPLAIN_PETS", defaultMessage: "Evcil hayvan rahatsızlığınızı açıklayınız"})}
                                                                    mt={2}
                                                                    size="lg"
                                                                    maxLength={500}
                                                                    onChange={(e) => {
                                                                        setFieldValue('pets', e.target.value)
                                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                                            ...prevErrors,
                                                                            pets: e.target.value ? '' : prevErrors.pets
                                                                        }))
                                                                    }}
                                                                />
                                                            )}
                                                            {showErrors.pets && (
                                                                <Text color="red.500">{showErrors.pets}</Text>
                                                            )}
                                                        </Box>

                                                        <Box mt={5}>
                                                            <Text fontSize="lg" fontWeight="medium">
                                                                <FormattedMessage id="HOBBIES" defaultMessage="Hobileriniz nelerdir?" />
                                                            </Text>
                                                            <Textarea
                                                                name="hobbies"
                                                                placeholder={intl.formatMessage({id: "EXPLAIN_HOBBIES", defaultMessage: "Hobilerinizi açıklayınız"})}
                                                                mt={1}
                                                                size="lg"
                                                                maxLength={500}
                                                                onChange={(e) => {
                                                                    setFieldValue('hobbies', e.target.value)
                                                                    setShowErrors((prevErrors: ErrorState) => ({
                                                                        ...prevErrors,
                                                                        hobbies: e.target.value ? '' : prevErrors.hobbies
                                                                    }))
                                                                }}
                                                            />
                                                            {showErrors.hobbies && (
                                                                <Text color="red.500">{showErrors.hobbies}</Text>
                                                            )}
                                                        </Box>

                                                        <Box mt={5}>
                                                            <Text fontSize="lg" fontWeight="medium">
                                                                <FormattedMessage id="FAMILY_INFO" defaultMessage="Kalmak istediğiniz ailenin adı ve bilgileri" />
                                                            </Text>
                                                            <Textarea
                                                                name="familyName"
                                                                placeholder={intl.formatMessage({id: "ENTER_FAMILY_INFO", defaultMessage: "Kalmak istediğiniz ailenin adı ve bilgilerini giriniz"})}
                                                                mt={1}
                                                                size="lg"
                                                                maxLength={500}
                                                                onChange={(e) => {
                                                                    setFieldValue('familyName', e.target.value)
                                                                    setShowErrors((prevErrors: ErrorState) => ({
                                                                        ...prevErrors,
                                                                        familyName: e.target.value ? '' : prevErrors.familyName
                                                                    }))
                                                                }}
                                                            />
                                                            {showErrors.familyName && (
                                                                <Text color="red.500">{showErrors.familyName}</Text>
                                                            )}
                                                        </Box>

                                                        <Box mt={5}>
                                                            <Text fontSize="lg" fontWeight="medium">
                                                                <FormattedMessage id="PARENT_CONTACT" defaultMessage="Velinizin adı, soyadı ve telefonu bilgileri" />
                                                            </Text>
                                                            <Textarea
                                                                name="parentContact"
                                                                placeholder={intl.formatMessage({id: "ENTER_PARENT_CONTACT", defaultMessage: "Velinizin bilgilerini giriniz"})}
                                                                mt={1}
                                                                size="lg"
                                                                maxLength={500}
                                                                onChange={(e) => {
                                                                    setFieldValue('parentContact', e.target.value)
                                                                    setShowErrors((prevErrors: ErrorState) => ({
                                                                        ...prevErrors,
                                                                        parentContact: e.target.value ? '' : prevErrors.parentContact
                                                                    }))
                                                                }}
                                                            />
                                                            {showErrors.parentContact && (
                                                                <Text color="red.500">{showErrors.parentContact}</Text>
                                                            )}
                                                        </Box>
                                                    </>
                                                )}
                                            </Box>
                                        )}

                                        {isOrganizasyonGrubu && isTevfikFikretOkullari && (
                                            <Box mb={4}>
                                                <Text fontSize="lg" fontWeight="medium">Misafir öğrenci alıyor
                                                    musunuz?</Text>
                                                <RadioGroup
                                                    name="guestStudentCountChoice"
                                                    onChange={(value) => {
                                                        setFieldValue('guestStudentCount', value === 'no' ? 'Hayır' : '');
                                                        setShowGuestStudentInput(value === 'yes');
                                                        setShowErrors((prevErrors: ErrorState) => ({
                                                            ...prevErrors,
                                                            guestStudentCount: value === 'no' ? null : prevErrors.guestStudentCount,
                                                        }));
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={5}>
                                                        <Radio value="yes">
                                                            <FormattedMessage id="YES" defaultMessage="Evet" />
                                                        </Radio>
                                                        <Radio value="no">
                                                            <FormattedMessage id="NO" defaultMessage="Hayır" />
                                                        </Radio>
                                                    </Stack>
                                                </RadioGroup>

                                                {showGuestStudentInput && (
                                                    <Input
                                                        name="guestStudentCount"
                                                        type="number"
                                                        placeholder="Kaç misafir öğrenci alıyorsunuz?"
                                                        mt={5}
                                                        size="lg"
                                                        onChange={(e) => {
                                                            setFieldValue('guestStudentCount', e.target.value);
                                                            setShowErrors((prevErrors: ErrorState) => ({
                                                                ...prevErrors,
                                                                guestStudentCount: e.target.value ? null : 'Misafir öğrenci sayısı zorunludur',
                                                            }));
                                                        }}
                                                    />
                                                )}

                                                {showErrors.guestStudentCount && (
                                                    <Text color="red.500">{showErrors.guestStudentCount}</Text>
                                                )}
                                            </Box>
                                        )}

                                        {isOgretmen && (
                                            <Box p={5} maxW="600px" ml={0} mt={10}>
                                                <Alert status="warning" borderRadius="md" boxShadow="lg" variant="subtle">
                                                    <AlertIcon />
                                                    <Box flex="1">
                                                        <AlertTitle fontSize="lg" fontWeight="bold" mb={2}>
                                                            <FormattedMessage id="FORM_NOT_FOUND_TITLE" defaultMessage="Form Bulunamadı" />
                                                        </AlertTitle>
                                                        <AlertDescription display="block">
                                                            <Text mb={3}>
                                                                <FormattedMessage
                                                                    id="FORM_NOT_FOUND_DESCRIPTION"
                                                                    defaultMessage="{roleName} için doldurulması gereken bir form bulunamadı."
                                                                    values={{ roleName: currentUser.roleName }}
                                                                />
                                                            </Text>
                                                        </AlertDescription>
                                                    </Box>
                                                </Alert>
                                            </Box>
                                        )}

                                        {isOrganizasyonGrubu && !isTevfikFikretOkullari && (
                                            <Box p={5} maxW="600px" ml={0} mt={10}>
                                                <Alert status="warning" borderRadius="md" boxShadow="lg"
                                                       variant="subtle">
                                                    <AlertIcon/>
                                                    <Box flex="1">
                                                        <AlertTitle fontSize="lg" fontWeight="bold" mb={2}>
                                                            <FormattedMessage id="FORM_NOT_FOUND_TITLE" defaultMessage="Form Bulunamadı" />
                                                        </AlertTitle>
                                                        <AlertDescription display="block">
                                                            <Text mb={3}>
                                                                <FormattedMessage
                                                                    id="FORM_NOT_FOUND"
                                                                    defaultMessage="{roleName} için doldurulması gereken bir form bulunamadı."
                                                                    values={{ roleName: currentUser.roleName }}
                                                                />
                                                            </Text>
                                                        </AlertDescription>
                                                    </Box>
                                                </Alert>
                                            </Box>
                                        )}

                                        {!isOgretmen && !(isOrganizasyonGrubu && !isTevfikFikretOkullari) && (
                                            <Button colorScheme="teal" size="lg" type="submit" mt={4}>
                                                <FormattedMessage id="SAVE" defaultMessage="Kaydet" />
                                            </Button>
                                        )}
                                    </VStack>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    )


}

export {DashboardWrapper}
