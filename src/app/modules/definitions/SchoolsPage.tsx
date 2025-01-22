import React, { FC, useEffect, useMemo, useState } from 'react';
import { Content } from "../../../_metronic/layout/components/content";
import { useTable, usePagination, useSortBy, useGlobalFilter, Column } from 'react-table';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Swal from "sweetalert2";
import { useIntl } from 'react-intl';

import {
    fetchSchools,
    deleteSchool,
    addSchool,
    updateSchool
} from "../auth/core/_requests";
import GlobalFilter from "./GlobalFilter.tsx"; // Placeholder for requests

interface School {
    id: number;
    schoolName: string;
    actions: string;
}

const SchoolsPage: FC = () => {
    const intl = useIntl();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showSchoolModal, setShowSchoolModal] = useState<boolean>(false);
    const [newSchool, setNewSchool] = useState<string>("");

    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
    const [editSchoolName, setEditSchoolName] = useState<string>("");

    useEffect(() => {
        const getSchools = async () => {
            try {
                const response = await fetchSchools();
                setSchools(response.data);
                setLoading(false);
            } catch (e) {
                setError(intl.formatMessage({id: 'ERROR_LOADING_SCHOOLS'}));
                setLoading(false);
            }
        };
        getSchools();
    }, []);

    const handleAddSchool = async () => {
        try {
            const response = await addSchool(newSchool);
            setSchools([...schools, response.data]);
            setShowSchoolModal(false);
            setNewSchool("");
        } catch (e) {
            setError(intl.formatMessage({id: 'ERROR_ADD_SCHOOL'}));
        }
    };

    const handleEdit = (rowIndex: number, schoolName: string) => {
        setEditingRowIndex(rowIndex);
        setEditSchoolName(schoolName);
    };

    const handleSaveEdit = async (rowIndex: number) => {
        try {
            const schoolToUpdate = schools[rowIndex];
            await updateSchool(schoolToUpdate.id, editSchoolName);
            const updatedSchools = schools.map((school, index) => {
                if (index === rowIndex) {
                    return { ...school, schoolName: editSchoolName };
                }
                return school;
            });
            setSchools(updatedSchools);
            setEditingRowIndex(null);
        } catch (e) {
            setError(intl.formatMessage({id: 'ERROR_UPDATE_SCHOOL'}));
        }
    };

    const handleDeleteSchool = async (schoolID: number) => {
        try {
            const result = await Swal.fire({
                title: intl.formatMessage({id: 'DELETE_CONFIRM_TITLE'}),
                text: intl.formatMessage({id: 'DELETE_CONFIRM_TEXT'}),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({id: 'DELETE_BUTTON'}),
                cancelButtonText: intl.formatMessage({id: 'CANCEL_BUTTON'}),
            });

            if (result.isConfirmed) {
                await deleteSchool(schoolID);

                setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolID));

                Swal.fire(
                    intl.formatMessage({id: 'DELETE_SUCCESS_TITLE'}),
                    intl.formatMessage({id: 'DELETE_SUCCESS_TEXT'}),
                    'success'
                );
            }
        } catch (e) {
            setError(intl.formatMessage({id: 'ERROR_DELETE_SCHOOL'}));
        }
    };


    const columns: Column<School>[] = useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
                width: 50,
            },
            {
                Header: intl.formatMessage({id: 'SCHOOL_NAME_LABEL'}),
                accessor: 'schoolName',
                Cell: ({ value, row }: any) => (
                    editingRowIndex === row.index ? (
                        <input
                            type="text"
                            value={editSchoolName}
                            onChange={(e) => setEditSchoolName(e.target.value)}
                            autoFocus
                            style={{ width: "100%" }}
                        />
                    ) : (
                        <span>{value}</span>
                    )
                ),
            },
            {
                Header: '',
                accessor: 'actions',
                disableSortBy: true,
                Cell: ({ row }: any) => {
                    // Eğer ID 6 ise butonları gösterme
                    if (row.original.id === 6) {
                        return null;
                    }

                    return (
                        <div className="d-flex justify-content-end align-items-center">
                            {editingRowIndex === row.index ? (
                                <>
                                    <Button
                                        variant="outline-success"
                                        className="btn-sm me-2 d-flex align-items-center"
                                        onClick={() => handleSaveEdit(row.index)}
                                    >
                                        <i className="fas fa-check-circle me-2"></i> {intl.formatMessage({ id: 'SAVE_BUTTON' })}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        className="d-flex align-items-center"
                                        onClick={() => setEditingRowIndex(null)}
                                    >
                                        <i className="fas fa-times-circle me-2"></i> {intl.formatMessage({ id: 'CANCEL_BUTTON' })}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline-primary"
                                        className="btn-sm me-2 d-flex align-items-center"
                                        onClick={() => handleEdit(row.index, row.original.schoolName)}
                                    >
                                        <i className="fas fa-edit me-2"></i> {intl.formatMessage({ id: 'EDIT_BUTTON' })}
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        className="btn-sm me-2 d-flex align-items-center"
                                        onClick={() => handleDeleteSchool(row.original.id)}
                                    >
                                        <i className="fas fa-trash-alt me-2"></i> {intl.formatMessage({ id: 'DELETE_BUTTON' })}
                                    </Button>
                                </>
                            )}
                        </div>
                    );
                },
            },
        ],
        [editingRowIndex, editSchoolName]
    );

    const data = useMemo(() => schools, [schools]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        setGlobalFilter,
        canPreviousPage,
        canNextPage,
        pageOptions,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize, globalFilter },
    } = useTable(
        { columns, data, initialState: { pageIndex: 0 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <Content>

            <div className='card-header px-6 d-flex justify-content-between align-items-center mb-5'>
                <h2 className='fw-bold m-0'>{ intl.formatMessage({ id: 'SCHOOLS_LIST' }) }</h2>
                <Button variant="success" className='btn-lg' onClick={ () => setShowSchoolModal(true) }>
                    { intl.formatMessage({ id: 'ADD_SCHOOL_BUTTON' }) }
                </Button>
            </div>

            <div className='card-body p-6'>

                <GlobalFilter filter={ globalFilter } setFilter={ setGlobalFilter }/>

                <div className='row g-5 gx-xxl-8'>
                    <div className='col-xxl-12'>
                        { loading && <p>{ intl.formatMessage({ id: 'LOADING' }) }</p> }
                        { error && <p>{ error }</p> }
                        { !loading && !error && schools.length > 0 && (
                            <>
                                <Table { ...getTableProps() } striped bordered hover responsive
                                       className='card-xxl-stretch mb-xl-3'>
                                    <thead className="table-dark">
                                    { headerGroups.map((headerGroup) => {
                                        const headerGroupProps = headerGroup.getHeaderGroupProps();
                                        return (
                                            <tr { ...headerGroupProps } key={ headerGroupProps.key }
                                                className="align-middle">
                                                { headerGroup.headers.map((column) => {
                                                    const columnProps = column.getHeaderProps(column.getSortByToggleProps());
                                                    return (
                                                        <th { ...columnProps } key={ columnProps.key }>
                                                            { column.render('Header') }
                                                        </th>
                                                    );
                                                }) }
                                            </tr>
                                        );
                                    }) }

                                    </thead>
                                    <tbody { ...getTableBodyProps() }>
                                    { page.map((row) => {
                                        prepareRow(row);
                                        const rowProps = row.getRowProps();
                                        return (
                                            <tr { ...rowProps } key={ rowProps.key } className="align-middle">
                                                { row.cells.map((cell) => {
                                                    const cellProps = cell.getCellProps();
                                                    return (
                                                        <td { ...cellProps } key={ cellProps.key }>
                                                            { cell.render('Cell') }
                                                        </td>
                                                    );
                                                }) }
                                            </tr>
                                        );
                                    }) }

                                    </tbody>
                                </Table>

                                <div className="d-flex justify-content-between align-items-center">
                                    <Button onClick={ () => previousPage() } disabled={ !canPreviousPage }>
                                        { '<' }
                                    </Button>
                                    <span>
                                    Page{ ' ' }
                                        <strong>
                                        { pageIndex + 1 } of { pageOptions.length }
                                    </strong>{ ' ' }
                                </span>
                                    <Button onClick={ () => nextPage() } disabled={ !canNextPage }>
                                        { '>' }
                                    </Button>
                                    <select
                                        value={ pageSize }
                                        onChange={ e => setPageSize(Number(e.target.value)) }
                                        className="form-select w-auto"
                                    >
                                        { [10, 20, 30].map(size => (
                                            <option key={ size } value={ size }>
                                                Show { size }
                                            </option>
                                        )) }
                                    </select>
                                </div>
                            </>
                        ) }
                    </div>
                </div>

            </div>

            <Modal show={ showSchoolModal } onHide={ () => setShowSchoolModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>Yeni Okul Ekle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formSchoolName">
                            <Form.Label>Okul Adı</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Okul adı girin"
                                value={ newSchool }
                                onChange={ (e) => setNewSchool(e.target.value) }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setShowSchoolModal(false) }>
                        İptal
                    </Button>
                    <Button variant="success" onClick={ handleAddSchool }>
                        Ekle
                    </Button>
                </Modal.Footer>
            </Modal>
        </Content>
    );
};

export default SchoolsPage;
