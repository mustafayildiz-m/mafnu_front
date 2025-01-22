import React, { FC, useEffect, useMemo, useState } from 'react';
import { Content } from "../../../_metronic/layout/components/content";
import { useTable, usePagination, useSortBy, useGlobalFilter, Column } from 'react-table';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import {
    fetchCountries,
    deleteCountry,
    confirmDeleteCountry,
    addCountry,
    addCity,
    updateCountry
} from "../auth/core/_requests";
import GlobalFilter from './GlobalFilter';
import Swal from "sweetalert2";
import CitiesManagementModal from "./CitiesManagementModal.tsx";

interface Country {
    id: number;
    countryName: string;
    countryName_fr: string;
    actions: string;
}

const CountriesPage: FC = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showCountryModal, setShowCountryModal] = useState<boolean>(false);
    const [newCountry, setNewCountry] = useState<string>("");
    const [newCountryFR, setNewCountryFR] = useState<string>("");

    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
    const [editCountryName, setEditCountryName] = useState<string>("");
    const [editCountryNameFR, setEditCountryNameFR] = useState<string>("");

    const [showCitiesModal, setShowCitiesModal] = useState(false);
    const [selectedCountryIdForCity, setSelectedCountryIdForCity] = useState<number | null>(null);

    const [activeInput, setActiveInput] = useState<'en' | 'fr' | null>(null);


    const handleOpenCitiesModal = (countryId: number) => {
        setSelectedCountryIdForCity(countryId);
        setShowCitiesModal(true);
    };

    useEffect(() => {
        const getCountries = async () => {
            try {
                const response = await fetchCountries();
                setCountries(response.data);
                setLoading(false);
            } catch (e) {
                setError('Ülkeler yüklenirken bir hata oluştu.');
                setLoading(false);
            }
        };
        getCountries();
    }, []);

    const handleAddCountry = async () => {
        if (!newCountry.trim() || !newCountryFR.trim()) {
            Swal.fire("Hata", "Ülke adları boş olamaz.", "error");
            return;
        }
        try {
            const response = await addCountry(newCountry, newCountryFR);
            setCountries([...countries, response.data]);
            setShowCountryModal(false);
            setNewCountry("");
            setNewCountryFR("");
        } catch (e) {
            setError('Ülke eklenirken bir hata oluştu.');
        }
    };

    const handleEdit = (
        rowIndex: number,
        countryName: string,
        countryNameFR: string,
        initialFocus: 'en' | 'fr'
    ) => {
        setEditingRowIndex(rowIndex);
        setEditCountryName(countryName);
        setEditCountryNameFR(countryNameFR);
        setActiveInput(initialFocus);
    };


    const handleSaveEdit = async (rowIndex: number) => {
        try {
            const countryToUpdate = countries[rowIndex];
            await updateCountry(countryToUpdate.id, editCountryName, editCountryNameFR);
            const updatedCountries = countries.map((country, index) => {
                if (index === rowIndex) {
                    return {
                        ...country,
                        countryName: editCountryName,
                        countryName_fr: editCountryNameFR
                    };
                }
                return country;
            });
            setCountries(updatedCountries);
            setEditingRowIndex(null);
        } catch (e) {
            setError('Ülke güncellenirken bir hata oluştu.');
        }
    };


    const handleDeleteCountry = async (countryID: number) => {
        try {
            const response = await deleteCountry(countryID);

            let warningMessage = 'Ülkeye ait tüm bilgiler silinecek. Onaylıyor musunuz?';
            if (response.data.hasRelatedEntities) {
                let cityListHTML = '';
                let schoolListHTML = '';

                if (response.data.relatedCities.length > 0) {
                    cityListHTML = `
                <h3>Şehirler:</h3>
                <ul style="list-style-type: disc; margin-left: 20px;">
                    ${response.data.relatedCities.map((city: { id: number; name: string }) => `<li>${city}</li>`).join('')}
                </ul>
            `;
                }

                if (response.data.relatedSchools.length > 0) {
                    schoolListHTML = `
                <h3>Okullar:</h3>
                <ul style="list-style-type: disc; margin-left: 20px;">
                    ${response.data.relatedSchools.map((school: { id: number; name: string }) => `<li>${school}</li>`).join('')}
                </ul>
            `;
                }

                warningMessage = `
            <div>
                Bu ülkeye ait ilişkili bilgiler silinecek:
                ${cityListHTML ? cityListHTML : ''}
                ${schoolListHTML ? schoolListHTML : ''}
            </div>
        `;
            }

            // Swal ile kullanıcıya onay sorusu göster
            const result = await Swal.fire({
                title: 'Emin misiniz?',
                html: warningMessage,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'Hayır, iptal et',
            });

            if (result.isConfirmed) {
                const confirmResponse = await confirmDeleteCountry(countryID);

                // Ülkenin silinmesinden sonra tabloyu güncelle
                setCountries((prevCountries) => prevCountries.filter(country => country.id !== countryID));

                Swal.fire('Başarılı!', confirmResponse.data.message, 'success');
            } else {
                Swal.fire('İptal edildi', 'Ülke silme işlemi iptal edildi.', 'error');
            }
        } catch (e) {
            setError('Ülke silinirken bir hata oluştu.');
        }
    };


    const columns: Column<Country>[] = useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
                width: 50,
            },
            {
                Header: 'Ülke Adı (EN)',
                accessor: 'countryName',
                Cell: ({ value, row }: any) => (
                    editingRowIndex === row.index ? (
                        <input
                            type="text"
                            value={editCountryName}
                            onChange={(e) => setEditCountryName(e.target.value)}
                            autoFocus={activeInput === 'en'} // Sadece 'en' aktifse odaklanır
                            onFocus={() => setActiveInput('en')} // 'en' alanına odaklanıldığında ayarlanır
                            style={{ width: "100%" }}
                        />
                    ) : (
                        <span>{value}</span>
                    )
                ),
            },
            {
                Header: 'Ülke Adı (FR)',
                accessor: 'countryName_fr',
                Cell: ({ value, row }: any) => (
                    editingRowIndex === row.index ? (
                        <input
                            type="text"
                            value={editCountryNameFR}
                            onChange={(e) => setEditCountryNameFR(e.target.value)}
                            autoFocus={activeInput === 'fr'} // Sadece 'fr' aktifse odaklanır
                            onFocus={() => setActiveInput('fr')} // 'fr' alanına odaklanıldığında ayarlanır
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
                Cell: ({row}: any) => (
                    <div className="d-flex justify-content-end align-items-center">
                        {/* Düzenle butonu */}
                        {editingRowIndex === row.index ? (
                            <>
                                <Button
                                    variant="outline-success"
                                    className="btn-sm me-2 d-flex align-items-center"
                                    onClick={() => handleSaveEdit(row.index)}
                                >
                                    <i className="fas fa-check-circle me-2"></i> Kaydet
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center"
                                    onClick={() => setEditingRowIndex(null)}
                                >
                                    <i className="fas fa-times-circle me-2"></i> İptal
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline-primary"
                                    className="btn-sm me-2 d-flex align-items-center"
                                    onClick={() =>
                                        handleEdit(
                                            row.index,
                                            row.original.countryName,
                                            row.original.countryName_fr,
                                            'en'
                                        )
                                    }
                                >
                                    <i className="fas fa-edit me-2"></i> Düzenle
                                </Button>

                                <Button
                                    variant="outline-danger"
                                    className="btn-sm me-2 d-flex align-items-center"
                                    onClick={() => handleDeleteCountry(row.original.id)}
                                >
                                    <i className="fas fa-trash-alt me-2"></i> Sil
                                </Button>
                            </>
                        )}

                        {row.original.countryName ==='Turkey' &&
                            <Button
                                variant="outline-warning"
                                className="btn-sm d-flex align-items-center"
                                onClick={() => handleOpenCitiesModal(row.original.id)}
                            >
                                <i className="fas fa-city me-2"></i> Şehirleri Yönet
                            </Button>
                        }

                    </div>
                ),
            },
        ],
        [editingRowIndex, editCountryName, editCountryNameFR]
    );


    const data = useMemo(() => countries, [countries]);

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
            <div className='card-header px-6 d-flex justify-content-between align-items-center'>
                <h2 className='fw-bold m-0'>Ülke Listesi</h2>
                <Button variant="success" className='btn-lg' onClick={() => setShowCountryModal(true)}>
                    + Ülke Ekle
                </Button>
            </div>

            <div className='card-body p-6'>

                <GlobalFilter filter={ globalFilter } setFilter={ setGlobalFilter }/>

                <div className='row g-5 gx-xxl-8'>
                    <div className='col-xxl-12'>
                        { loading && <p>Yükleniyor...</p> }
                        { error && <p>{ error }</p> }
                        { !loading && !error && countries.length > 0 && (
                            <>
                                <Table { ...getTableProps() } striped bordered hover responsive
                                       className='card-xxl-stretch mb-xl-3'>
                                    <thead className="table-dark">
                                    { headerGroups.map((headerGroup, headerGroupIndex) => (
                                        <tr { ...headerGroup.getHeaderGroupProps() } key={ headerGroupIndex }
                                            className="align-middle">
                                            { headerGroup.headers.map((column, columnIndex) => (
                                                <th { ...column.getHeaderProps(column.getSortByToggleProps()) }
                                                    key={ columnIndex }>
                                                    { column.render('Header') }
                                                </th>
                                            )) }
                                        </tr>
                                    )) }

                                    </thead>
                                    <tbody { ...getTableBodyProps() } className="align-middle">
                                    { page.map(row => {
                                        prepareRow(row);
                                        return (
                                            <tr { ...row.getRowProps() } key={ row.id }>
                                                { row.cells.map((cell, cellIndex) => (
                                                    <td { ...cell.getCellProps() } key={ cellIndex }>
                                                        { cell.render('Cell') }
                                                    </td>
                                                )) }

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

            <Modal show={showCountryModal} onHide={() => setShowCountryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Yeni Ülke Ekle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCountryName">
                            <Form.Label>Ülke Adı (EN)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ülke adı girin"
                                value={newCountry}
                                onChange={(e) => setNewCountry(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCountryNameFR">
                            <Form.Label>Ülke Adı (FR)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ülke adını Fransızca girin"
                                value={newCountryFR}
                                onChange={(e) => setNewCountryFR(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCountryModal(false)}>
                        İptal
                    </Button>
                    <Button variant="success" onClick={handleAddCountry}>
                        Ekle
                    </Button>
                </Modal.Footer>
            </Modal>

            { selectedCountryIdForCity && (
                <CitiesManagementModal
                    countryId={ selectedCountryIdForCity }
                    show={ showCitiesModal }
                    handleClose={ () => setShowCitiesModal(false) }
                />
            ) }
        </Content>
    );
};

export default CountriesPage;
