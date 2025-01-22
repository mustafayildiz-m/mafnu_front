import React, {FC, useEffect, useMemo, useState} from 'react';
import {Content} from "../../../_metronic/layout/components/content";
import {useTable, usePagination, useSortBy, useGlobalFilter, Column, TableInstance, TableState} from 'react-table';
import {Badge, Button, Table, Form, Row, Col, Modal} from 'react-bootstrap';
import Swal from "sweetalert2";
import {
    getAllFormData,
    deleteFormData,
    fetchCountries,
    fetchCommissions,
    getFormDataByUserId, fetchRoles, updateFormData
} from "../auth/core/_requests";
import GlobalFilter from "../definitions/GlobalFilter.tsx";
import {useAuth} from "../auth";
import {FormattedMessage, useIntl} from "react-intl";
import * as XLSX from 'xlsx';
import { FaFileExcel } from 'react-icons/fa';

interface FormData {
    id: number;
    name: string;
    actions: string;
    surname: string;
    commissionName: string;
    email: string;
    roleName: string;
    language: string;
    countryName: string;
    schoolName: string;
    guestStudentCount?: string;
    accommodation?: string;
    allergy?: string;
    hobbies?: string;
    medication?: string;
    pets?: string;
    familyName?: string;
    parentContact?: string;
    paymentApproval: boolean;
}

interface Country {
    id: number;
    countryName: string;
    countryName_fr: string;
    createdAt: string;
    updatedAt: string;
}

interface Commission {
    id: number;
    commissionName: string;
    commissionName_fr: string;
    createdAt: string;
    updatedAt: string;
}

interface Role {
    id: number;
    roleName_en: string;
    roleName_fr: string;
    roleName_tr: string;
    subRoles: Role[];
    createdAt: string;
    updatedAt: string;
}


const AdminReport: FC = () => {
    const [formData, setFormData] = useState<FormData[]>([]);
    const [filteredData, setFilteredData] = useState<FormData[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [roles, setRoles] = useState<string[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [schools, setSchools] = useState<string[]>([]);
    const [accommodations, setAccommodations] = useState<string[]>([]);
    const [commissions, setCommissions] = useState<string[]>([]);

    const [allContries, setAllContries] = useState<Country[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [allCommisions, setAllCommisions] = useState<Commission[]>([]);

    const [selectedRole, setSelectedRole] = useState<string | undefined>();
    const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
    const [selectedSchool, setSelectedSchool] = useState<string | undefined>();
    const [selectedAccommodation, setSelectedAccommodation] = useState<string | undefined>();
    const [selectedCommission, setSelectedCommission] = useState<string | undefined>();

    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<FormData | null>(null);


    let {currentUser} = useAuth();

    const intl = useIntl();
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const response = await getAllFormData();
                const formattedData = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    surname: item.surname,
                    email: item.email,
                    commissionName: item.commissionID ? item.commissionID.commissionName : '',
                    roleName: item.roleName,
                    language: item.language,
                    countryName: item.countryID ? item.countryID.countryName : '',
                    countryName_fr: item.countryID ? item.countryID.countryName_fr : '',
                    schoolName: item.schoolID ? item.schoolID.schoolName : '',
                    guestStudentCount: item.guestStudentCount,
                    accommodation: item.accommodation,
                    allergy: item.allergy,
                    hobbies: item.hobbies,
                    medication: item.medication,
                    pets: item.pets,
                    familyName: item.familyName,
                    parentContact: item.parentContact,
                    paymentApproval: item.userID.paymentApproval,
                }));
                setFormData(formattedData);
                setFilteredData(formattedData);

                const uniqueRoles: string[] = Array.from(
                    new Set(
                        formattedData.map((item: FormData) => item.roleName).filter((r: string) => r && r.trim() !== "")
                    )
                );

                const uniqueCountries: string[] = Array.from(
                    new Set(
                        formattedData.map((item: FormData) => item.countryName).filter((c: string) => c && c.trim() !== "")
                    )
                );

                const uniqueSchools: string[] = Array.from(
                    new Set(
                        formattedData.map((item: FormData) => item.schoolName).filter((s: string) => s && s.trim() !== "")
                    )
                );

                const uniqueAccommodations: string[] = Array.from(
                    new Set(
                        formattedData.map((item: FormData) => item.accommodation).filter((a: string) => a && a.trim() !== "")
                    )
                );

                const uniqueCommissions: string[] = Array.from(
                    new Set(
                        formattedData.map((item: FormData) => item.commissionName).filter((c: string) => c && c.trim() !== "")
                    )
                );
                setRoles(uniqueRoles);
                setCountries(uniqueCountries);
                setSchools(uniqueSchools);
                setAccommodations(uniqueAccommodations);
                setCommissions(uniqueCommissions);


                setLoading(false);
            } catch (error) {
                Swal.fire("Hata", "Form verileri yüklenirken bir hata oluştu.", "error");
                setLoading(false);
            }
        };
        loadFormData();
    }, []);

    useEffect(() => {
        let data = formData;

        if (selectedRole) {
            data = data.filter(item => item.roleName === selectedRole);
        }

        if (selectedCountry) {
            data = data.filter(item => item.countryName === selectedCountry);
        }

        if (selectedSchool) {
            data = data.filter(item => item.schoolName === selectedSchool);
        }

        if (selectedAccommodation) {
            data = data.filter(item => item.accommodation === selectedAccommodation);
        }

        if (selectedCommission) {
            data = data.filter(item => item.commissionName === selectedCommission);
        }

        setFilteredData(data);
    }, [selectedRole, selectedCountry, selectedSchool, selectedAccommodation, selectedCommission, formData]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [countryRes, commissionRes, rolesRes] = await Promise.all([fetchCountries(), fetchCommissions(), fetchRoles()])
                setAllCommisions(commissionRes.data)
                setAllContries(countryRes.data)
                setAllRoles(rolesRes.data)

            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        loadData();
    }, []);


    const UpdateModal: FC<{
        show: boolean,
        onHide: () => void,
        onSave: (updatedData: Partial<FormData>) => void,
        selectedRow: FormData | null
    }> = ({show, onHide, onSave, selectedRow}) => {
        const [commission, setCommission] = useState(selectedRow?.commissionName || '');
        const [country, setCountry] = useState(selectedRow?.countryName || '');
        const [language, setLanguage] = useState(selectedRow?.language || '');


        useEffect(() => {
            if (selectedRow) {
                setCommission(selectedRow.commissionName);
                setCountry(selectedRow.countryName);
                setLanguage(selectedRow.language);

            }
        }, [selectedRow]);

        const handleSave = () => {
            onSave({commissionName: commission, countryName: country, language});
        };

        return (
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Record</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>

                        {/* Commission Seçimi */}
                        <Form.Group>
                            <Form.Label>Commission</Form.Label>
                            <Form.Select value={commission} onChange={(e) => setCommission(e.target.value)}>
                                <option value="">Select Commission</option>
                                {allCommisions.map((c) => (
                                    <option key={c.id} value={c.commissionName}>
                                        {c.commissionName} / {c.commissionName_fr}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Country Seçimi */}
                        <Form.Group>
                            <Form.Label>Country</Form.Label>
                            <Form.Select value={country} onChange={(e) => setCountry(e.target.value)}>
                                <option value="">Select Country</option>
                                {allContries.map((c) => (
                                    <option key={c.id} value={c.countryName}>
                                        {c.countryName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Language</Form.Label>
                            <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="">Select Language</option>
                                <option value="en">English</option>
                                <option value="fr">French</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Close</Button>
                    <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        );
    };


    const handleDelete = async (id: number, currentUser: number) => {

        try {
            const result = await Swal.fire({
                title: intl.formatMessage({id: "ARE_YOU_SURE", defaultMessage: "Are you sure?"}),
                text: intl.formatMessage({id: "CONFIRM_DELETE", defaultMessage: "Do you want to delete this item?"}),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({id: "YES_DELETE", defaultMessage: "Yes, delete"}),
                cancelButtonText: intl.formatMessage({id: "NO_CANCEL", defaultMessage: "No, cancel"}),
            });

            if (result.isConfirmed) {
                await deleteFormData(id, currentUser);
                setFormData((prevData) => prevData.filter(item => item.id !== id));

                Swal.fire(
                    intl.formatMessage({id: "SUCCESS_TITLE", defaultMessage: "Success!"}),
                    intl.formatMessage({id: "SUCCESS_DELETE", defaultMessage: "Item successfully deleted."}),
                    'success'
                );
            }
        } catch (error) {
            Swal.fire(
                intl.formatMessage({id: "ERROR_TITLE", defaultMessage: "Error!"}),
                intl.formatMessage({id: "ERROR_DELETE_DATA", defaultMessage: "There was an error deleting the item."}),
                'error'
            );
        }
    };

    const handleUpdateSave = async (updatedData: Partial<FormData>) => {
        if (selectedRow) {
            const updatedRow = {
                ...selectedRow,
                ...updatedData,
            };


            const selectedCommissionId = allCommisions.find(
                commission => commission.commissionName === updatedData.commissionName || commission.commissionName_fr === updatedData.commissionName
            )?.id;

            const selectedCountryId = allContries.find(
                country => country.countryName === updatedData.countryName || country.countryName_fr === updatedData.countryName
            )?.id;


            const payload = {
                commissionID: selectedCommissionId,
                countryID: selectedCountryId,
                language: updatedData.language,
            };

            try {
                const result = await updateFormData(selectedRow.id, payload);
                setFormData(prevData =>
                    prevData.map(item =>
                        item.id === selectedRow.id ? {...item, ...updatedData} : item
                    )
                );

                setShowUpdateModal(false);
                Swal.fire({
                    icon: "success",
                    title: "Updated Successfully",
                    text: "The record has been updated successfully.",
                    confirmButtonText: "OK",
                    timer: 3000,
                });

            } catch (error) {
                console.error("Error updating form data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: "An error occurred while updating the record. Please try again.",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const columns: Column<FormData>[] = useMemo(() => [
        {Header: <FormattedMessage id="NAME" defaultMessage="Name"/>, accessor: 'name'},
        {Header: <FormattedMessage id="SURNAME" defaultMessage="Surname"/>, accessor: 'surname'},
        {Header: <FormattedMessage id="EMAIL" defaultMessage="Email"/>, accessor: 'email'},
        {Header: <FormattedMessage id="ROLE" defaultMessage="Role"/>, accessor: 'roleName'},
        {Header: <FormattedMessage id="COMMISSION" defaultMessage="Commission"/>, accessor: 'commissionName'},
        {Header: <FormattedMessage id="LANGUAGE" defaultMessage="Language"/>, accessor: 'language'},
        {
            Header: <FormattedMessage id="COUNTRY" defaultMessage="Country" />,
            accessor: 'countryName',
            Cell: ({ row }: { row: any }) => {
                const userLanguage = row.original.language;
                const countryName = userLanguage === 'fr' ? row.original.countryName_fr : row.original.countryName;
                return countryName || '-';
            },
        },        {Header: <FormattedMessage id="SCHOOL" defaultMessage="School"/>, accessor: 'schoolName'},
        {
            Header: <FormattedMessage id="PAYMENT_STATUS" defaultMessage="Payment Status"/>,
            accessor: 'paymentApproval',
            Cell: ({value}) => (
                <Badge bg={value ? "success" : "danger"}>
                    {value ? <FormattedMessage id="APPROVED" defaultMessage="Approved"/> :
                        <FormattedMessage id="NOT_APPROVED" defaultMessage="Not Approved"/>}
                </Badge>
            )
        },
        {
            Header: <FormattedMessage id="ACTIONS" defaultMessage="Actions"/>,
            accessor: 'actions',
            Cell: ({row}: { row: any }) => (
                <>
                    <Button
                        variant="danger"
                        onClick={() => handleDelete(row.original.id, currentUser?.roleID!)}
                        className="btn-sm"
                    >
                        <FormattedMessage id="DELETE" defaultMessage="Delete"/>
                    </Button>
                    {' '}
                    <Button
                        variant="info"
                        onClick={() => {
                            setSelectedRow(row.original);
                            setShowUpdateModal(true);
                        }}
                        className="btn-sm"
                    >
                        <FormattedMessage id="UPDATE" defaultMessage="Update"/>
                    </Button>
                </>
            ),
        },
    ], [formData]);

    const data = useMemo(() => filteredData, [filteredData]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        nextPage,
        previousPage,
        setPageSize,
        setGlobalFilter,
        state: {pageIndex, pageSize, globalFilter},
    } = useTable<FormData>(
        {
            columns,
            data,
            initialState: {pageIndex: 0, pageSize: 10} as Partial<TableState<FormData>>,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    // Excel export fonksiyonu
    const handleExportExcel = () => {
        // Dışa aktarılacak verileri hazırla
        const exportData = filteredData.map(item => ({
            Name: item.name,
            Surname: item.surname,
            Email: item.email,
            Role: item.roleName,
            Commission: item.commissionName,
            Language: item.language,
            Country: item.countryName,
            School: item.schoolName,
            'Payment Status': item.paymentApproval ? 'Approved' : 'Not Approved'
        }));

        // Excel dosyasını oluştur
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");

        // Dosyayı indir
        XLSX.writeFile(wb, `Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <Content>
            <div className='card-header px-6 d-flex justify-content-between align-items-center mb-5'>
                <h2 className='fw-bold m-0'>
                    <FormattedMessage id="REPORTS" defaultMessage="Reports"/>
                </h2>
                {/* Excel Export Butonu */}
                <Button 
                    variant="success" 
                    onClick={handleExportExcel}
                    className="d-flex align-items-center gap-2"
                    style={{
                        borderRadius: '8px',
                        padding: '8px 16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaFileExcel size={20} />
                    <span>
                        <FormattedMessage 
                            id="EXPORT_EXCEL" 
                            defaultMessage="Export to Excel"
                        />
                    </span>
                </Button>
            </div>

            <div className='card-body p-6'>

                {/* Filtreleme Alanları */}
                <Form>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="roleFilter">
                                <Form.Label>
                                    <FormattedMessage id="ROLE" defaultMessage="Role"/>
                                </Form.Label>
                                <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                                    <option value="">
                                        <FormattedMessage id="ALL_ROLES" defaultMessage="All Roles"/>
                                    </option>
                                    {roles.map((role, index) => (
                                        <option key={index} value={role}>{role}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="countryFilter">
                                <Form.Label>
                                    <FormattedMessage id="COUNTRY" defaultMessage="Country"/>
                                </Form.Label>
                                <Form.Select value={selectedCountry}
                                             onChange={(e) => setSelectedCountry(e.target.value)}>
                                    <option value="">
                                        <FormattedMessage id="ALL_COUNTRIES" defaultMessage="All Countries"/>
                                    </option>
                                    {countries.map((country, index) => (
                                        <option key={index} value={country}>{country}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="schoolFilter">
                                <Form.Label>
                                    <FormattedMessage id="SCHOOL" defaultMessage="School"/>
                                </Form.Label>
                                <Form.Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                                    <option value="">
                                        <FormattedMessage id="ALL_SCHOOLS" defaultMessage="All Schools"/>
                                    </option>
                                    {schools.map((school, index) => (
                                        <option key={index} value={school}>{school}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="accommodationFilter">
                                <Form.Label>
                                    <FormattedMessage id="ACCOMMODATION" defaultMessage="Accommodation"/>
                                </Form.Label>
                                <Form.Select value={selectedAccommodation}
                                             onChange={(e) => setSelectedAccommodation(e.target.value)}>
                                    <option value="">
                                        <FormattedMessage id="ALL_ACCOMMODATIONS" defaultMessage="All Accommodations"/>
                                    </option>
                                    {accommodations.map((accommodation, index) => (
                                        <option key={index} value={accommodation}>{accommodation}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="commissionFilter">
                                <Form.Label>
                                    <FormattedMessage id="COMMISSION" defaultMessage="Commission"/>
                                </Form.Label>
                                <Form.Select value={selectedCommission}
                                             onChange={(e) => setSelectedCommission(e.target.value)}>
                                    <option value="">
                                        <FormattedMessage id="ALL_COMMISSIONS" defaultMessage="All Commissions"/>
                                    </option>
                                    {commissions.map((commission, index) => (
                                        <option key={index} value={commission}>{commission}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>

                {/* Global Filter */}
                <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter}/>

                <div className='row g-5 gx-xxl-8'>
                    <div className='col-xxl-12'>
                        {loading && <p>Yükleniyor...</p>}
                        {!loading && filteredData.length > 0 && (
                            <>
                                <Table {...getTableProps()} striped bordered hover responsive
                                       className='card-xxl-stretch mb-xl-3'>
                                    <thead className="table-dark">
                                    {headerGroups.map((headerGroup, headerGroupIndex) => (
                                        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroupIndex + 1}
                                            className="align-middle">
                                            {headerGroup.headers.map((column) => (
                                                <th {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    key={column.id}>
                                                    {column.render('Header')}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}

                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                    {page.map((row) => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()} key={row.id} className="align-middle">
                                                {row.cells.map((cell) => (
                                                    <td {...cell.getCellProps()} key={cell.column.id}>
                                                        {cell.render('Cell')}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}

                                    </tbody>
                                </Table>

                                <div className="d-flex justify-content-between align-items-center">
                                    <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                                        {'<'}
                                    </Button>
                                    <span>
                                    <FormattedMessage id="PAGE" defaultMessage="Page"/>{' '}
                                        <strong>
                                        {pageIndex + 1} / {pageOptions.length}
                                    </strong>{' '}
                                </span>
                                    <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                        {'>'}
                                    </Button>
                                    <select
                                        value={pageSize}
                                        onChange={e => setPageSize(Number(e.target.value))}
                                        className="form-select w-auto"
                                    >
                                        {[10, 20, 30].map(size => (
                                            <option key={size} value={size}>
                                                {size} <FormattedMessage id="SHOW" defaultMessage="Show"/>
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>

            <UpdateModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                onSave={handleUpdateSave}
                selectedRow={selectedRow}
            />

        </Content>
    );
};

export default AdminReport;
