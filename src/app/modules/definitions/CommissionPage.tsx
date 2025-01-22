import React, { FC, useEffect, useMemo, useState } from 'react';
import { Content } from "../../../_metronic/layout/components/content";
import { useTable, usePagination, useSortBy, useGlobalFilter, Column } from 'react-table';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Swal from "sweetalert2";
import { fetchCommissions, addCommission, updateCommission, deleteCommission } from "../auth/core/_requests";
import GlobalFilter from './GlobalFilter'; // Global filter için

interface Commission {
    id: number;
    commissionName: string;
    commissionName_fr: string;
}

const CommissionsPage: FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newCommission, setNewCommission] = useState<string>("");
    const [newCommissionFR, setNewCommissionFR] = useState<string>("");
    const [editCommissionId, setEditCommissionId] = useState<number | null>(null);
    const [editCommissionName, setEditCommissionName] = useState<string>("");
    const [editCommissionNameFR, setEditCommissionNameFR] = useState<string>("");

    const [activeInput, setActiveInput] = useState<'en' | 'fr' | null>(null);


    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        const loadCommissions = async () => {
            try {
                const response = await fetchCommissions();
                setCommissions(response.data);
                setLoading(false);
            } catch (error) {
                Swal.fire("Hata", "Komisyonlar yüklenirken bir hata oluştu.", "error");
                setLoading(false);
            }
        };
        loadCommissions();
    }, []);

    const handleEditClick = (id: number, name: string, nameFR: string, initialFocus: 'en' | 'fr') => {
        setEditCommissionId(id);
        setEditCommissionName(name);
        setEditCommissionNameFR(nameFR);
        setActiveInput(initialFocus);
    };


    const handleAddCommission = async () => {
        if (!newCommission.trim() || !newCommissionFR.trim()) {
            Swal.fire("Hata", "Komisyon adları boş olamaz.", "error");
            return;
        }
        try {
            const response = await addCommission(newCommission, newCommissionFR);
            setCommissions([...commissions, response.data]);
            setNewCommission("");
            setNewCommissionFR("");
            setShowModal(false);
        } catch (error) {
            Swal.fire("Hata", "Komisyon eklenirken bir hata oluştu.", "error");
        }
    };

    const handleSaveEditCommission = async (id: number) => {
        if (!editCommissionName.trim() || !editCommissionNameFR.trim()) {
            Swal.fire("Hata", "Komisyon adları boş olamaz.", "error");
            return;
        }
        try {
            await updateCommission(id, editCommissionName, editCommissionNameFR);
            setCommissions(commissions.map(c =>
                c.id === id
                    ? { ...c, commissionName: editCommissionName, commissionName_fr: editCommissionNameFR }
                    : c
            ));
            setEditCommissionId(null);
            setEditCommissionName("");
            setEditCommissionNameFR("");
        } catch (error) {
            Swal.fire("Hata", "Komisyon güncellenirken bir hata oluştu.", "error");
        }
    };

    const handleDeleteCommission = async (id: number) => {
        try {
            const result = await Swal.fire({
                title: 'Emin misiniz?',
                text: 'Bu komisyonu silmek istediğinizden emin misiniz?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'Hayır, iptal et',
            });

            if (result.isConfirmed) {
                await deleteCommission(id);
                setCommissions((prevCommissions) =>
                    prevCommissions.filter((commission) => commission.id !== id)
                );
                Swal.fire('Başarılı!', 'Komisyon başarıyla silindi.', 'success');
            }
        } catch (error) {
            Swal.fire('Hata', 'Komisyon silinirken bir hata oluştu.', 'error');
        }
    };

    const columns: Column<Commission>[] = useMemo(() => [
        {
            Header: 'ID',
            accessor: 'id' as const,
        },
        {
            Header: 'Komisyon Adı (EN)',
            accessor: 'commissionName' as const,
            Cell: ({ value, row }: { value: string; row: { original: Commission } }) => (
                editCommissionId === row.original.id ? (
                    <input
                        type="text"
                        value={editCommissionName}
                        onChange={(e) => setEditCommissionName(e.target.value)}
                        autoFocus={activeInput === 'en'} // Sadece 'en' aktifse odaklanır
                        onFocus={() => setActiveInput('en')} // 'en' alanına odaklanıldığında ayarlanır
                    />
                ) : (
                    <span>{value}</span>
                )
            ),
        },
        {
            Header: 'Komisyon Adı (FR)',
            accessor: 'commissionName_fr' as const,
            Cell: ({ value, row }: { value: string; row: { original: Commission } }) => (
                editCommissionId === row.original.id ? (
                    <input
                        type="text"
                        value={editCommissionNameFR}
                        onChange={(e) => setEditCommissionNameFR(e.target.value)}
                        autoFocus={activeInput === 'fr'}
                        onFocus={() => setActiveInput('fr')}
                    />
                ) : (
                    <span>{value}</span>
                )
            ),
        },
        {
            Header: 'İşlemler',
            disableSortBy: true,
            Cell: ({ row }: { row: { original: Commission } }) => (
                <div className="d-flex justify-content-end">
                    {editCommissionId === row.original.id ? (
                        <>
                            <Button
                                variant="outline-success"
                                className="me-2 btn-sm"
                                onClick={() => handleSaveEditCommission(row.original.id)}
                            >
                                <i className="fas fa-check-circle me-2"></i> Kaydet
                            </Button>
                            <Button
                                variant="outline-secondary"
                                className="btn-sm"
                                onClick={() => {
                                    setEditCommissionId(null);
                                    setEditCommissionName("");
                                    setEditCommissionNameFR("");
                                    setActiveInput(null);
                                }}
                            >
                                <i className="fas fa-times-circle me-2"></i> İptal
                            </Button>

                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline-primary"
                                className="me-2 btn-sm"
                                onClick={() => handleEditClick(row.original.id, row.original.commissionName, row.original.commissionName_fr, 'en')}
                            >
                                <i className="fas fa-edit me-2"></i> Düzenle
                            </Button>

                            <Button
                                variant="outline-danger"
                                onClick={() => handleDeleteCommission(row.original.id)}
                                className="btn-sm"
                            >
                                <i className="fas fa-trash-alt me-2"></i> Sil
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ], [editCommissionId, editCommissionName, editCommissionNameFR]);

    const data = useMemo(() => commissions, [commissions]);

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
        state: { pageIndex, pageSize, globalFilter },
    } = useTable(
        { columns, data, initialState: { pageIndex: 0 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <Content>

            <div className='card-header px-6 d-flex justify-content-between align-items-center'>
                <h2 className='fw-bold m-0'>Komisyon Listesi</h2>
                <Button variant="success" className='btn-lg' onClick={ () => setShowModal(true) }>
                    <i className="fas fa-plus me-2"></i> Komisyon Ekle
                </Button>
            </div>

            <div className='card-body p-6'>

                <GlobalFilter filter={ globalFilter } setFilter={ setGlobalFilter }/>

                <div className='row g-5 gx-xxl-8'>
                    <div className='col-xxl-12'>
                        { loading && <p>Yükleniyor...</p> }
                        { !loading && commissions.length > 0 && (
                            <>
                                <Table { ...getTableProps() } striped bordered hover responsive
                                       className='card-xxl-stretch mb-xl-3'>
                                    <thead className="table-dark">
                                    { headerGroups.map((headerGroup) => (
                                        <tr { ...headerGroup.getHeaderGroupProps() }>
                                            { headerGroup.headers.map((column) => (
                                                <th { ...column.getHeaderProps(column.getSortByToggleProps()) }>
                                                    { column.render('Header') }
                                                </th>
                                            )) }
                                        </tr>
                                    )) }
                                    </thead>
                                    <tbody { ...getTableBodyProps() }>
                                    { page.map((row) => {
                                        prepareRow(row);
                                        return (
                                            <tr { ...row.getRowProps() }>
                                                { row.cells.map((cell) => (
                                                    <td { ...cell.getCellProps() }>
                                                        { cell.render('Cell') }
                                                    </td>
                                                )) }
                                            </tr>
                                        );
                                    }) }
                                    </tbody>
                                </Table>

                                <div className="d-flex justify-content-between align-items-center">
                                    <Button onClick={ previousPage } disabled={ !canPreviousPage }>
                                        { '<' }
                                    </Button>
                                    <span>
                                        Sayfa <strong>{ pageIndex + 1 } / { pageOptions.length }</strong>
                                    </span>
                                    <Button onClick={ nextPage } disabled={ !canNextPage }>
                                        { '>' }
                                    </Button>
                                    <select
                                        value={ pageSize }
                                        onChange={ (e) => setPageSize(Number(e.target.value)) }
                                        className="form-select w-auto"
                                    >
                                        { [10, 20, 30].map(size => (
                                            <option key={ size } value={ size }>
                                                { size } Göster
                                            </option>
                                        )) }
                                    </select>
                                </div>
                            </>
                        ) }
                    </div>
                </div>

            </div>

            <Modal show={ showModal } onHide={ () => setShowModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>Yeni Komisyon Ekle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCommissionName">
                            <Form.Label>Komisyon Adı (EN)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Komisyon adı girin"
                                value={ newCommission }
                                onChange={(e) => setNewCommission(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCommissionNameFR">
                            <Form.Label>Komisyon Adı (FR)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Komisyon adını Fransızca girin"
                                value={ newCommissionFR }
                                onChange={(e) => setNewCommissionFR(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setShowModal(false) }>
                        <i className="fas fa-times"></i> İptal
                    </Button>
                    <Button variant="success" onClick={ handleAddCommission }>
                        <i className="fas fa-check"></i> Ekle
                    </Button>
                </Modal.Footer>
            </Modal>

        </Content>
    );
};

export default CommissionsPage;
