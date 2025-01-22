import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import {Column, Row, useTable} from 'react-table';
import { fetchCitiesByCountry, addCity, deleteCity, updateCity } from "../auth/core/_requests";
import Swal from "sweetalert2";

interface City {
    id: number;
    cityName: string;
}

const CitiesManagementModal: FC<{ countryId: number; show: boolean; handleClose: () => void }> = ({ countryId, show, handleClose }) => {
    const [cities, setCities] = useState<City[]>([]);
    const [newCityName, setNewCityName] = useState<string>("");
    const [editCityId, setEditCityId] = useState<number | null>(null);
    const [editCityName, setEditCityName] = useState<string>("");

    useEffect(() => {
        if (countryId) {
            // Şehirleri yüklemek için API çağrısı
            const fetchCities = async () => {
                try {
                    const response = await fetchCitiesByCountry(countryId);
                    setCities(response.data);
                } catch (e) {
                    console.error("Şehirler yüklenirken hata oluştu.");
                }
            };
            fetchCities();
        }
    }, [countryId]);

    // Şehir ekleme fonksiyonu
    const handleAddCity = async () => {
        if (!newCityName.trim()) {
            Swal.fire("Hata", "Şehir adı boş olamaz.", "error");
            return;
        }
        try {
            const response = await addCity(newCityName, countryId);
            setCities([...cities, response.data]);
            setNewCityName("");
        } catch (e) {
            Swal.fire("Hata", "Şehir eklenirken bir hata oluştu.", "error");
        }
    };

    const handleSaveEditCity = async (cityId: number) => {
        try {
            await updateCity(cityId, editCityName);
            setCities(cities.map(city => (city.id === cityId ? { ...city, cityName: editCityName } : city)));
            setEditCityId(null); // Düzenleme modundan çık
            setEditCityName("");
        } catch (e) {
            Swal.fire("Hata", "Şehir güncellenirken bir hata oluştu.", "error");
        }
    };

    const handleDeleteCity = async (cityId: number) => {
        try {
            await deleteCity(cityId);
            setCities((prevCities) => prevCities.filter(city => city.id !== cityId)); // Silinen şehri listeden çıkar
            Swal.fire("Başarılı", "Şehir başarıyla silindi.", "success");
        } catch (e) {
            Swal.fire("Hata", "Şehir silinirken bir hata oluştu.", "error");
        }
    };

    const columns: Column<City>[] = useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id' as const,
            },
            {
                Header: 'Şehir Adı',
                accessor: 'cityName' as const,
                Cell: ({ row }: { row: Row<City> }) => (
                    editCityId === row.original.id ? (
                        <input
                            type="text"
                            value={editCityName}
                            onChange={(e) => setEditCityName(e.target.value)}
                            onBlur={() => handleSaveEditCity(row.original.id)}
                            autoFocus
                        />
                    ) : (
                        <span>{row.original.cityName}</span>
                    )
                ),
            },
            {
                Header: 'İşlemler',
                Cell: ({ row }: { row: Row<City> }) => (
                    <div className="d-flex justify-content-end">
                        {editCityId === row.original.id ? (
                            <>
                                <Button
                                    variant="outline-success"
                                    className="me-2 btn-sm"
                                    onClick={() => handleSaveEditCity(row.original.id)}
                                >
                                    <i className="fas fa-check-circle me-2"></i> Kaydet
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setEditCityId(null)}
                                    className="btn-sm"
                                >
                                    <i className="fas fa-times-circle me-2"></i> İptal
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline-primary"
                                    className="me-2 btn-sm"
                                    onClick={() => { setEditCityId(row.original.id); setEditCityName(row.original.cityName); }}
                                >
                                    <i className="fas fa-edit me-2"></i> Düzenle
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => handleDeleteCity(row.original.id)}
                                    className="btn-sm"
                                >

                                    <i className="fas fa-trash-alt me-2"></i> Sil
                                </Button>
                            </>
                        )}
                    </div>
                ),
            },
        ],
        [editCityId, editCityName]
    );

    const data = useMemo(() => cities, [cities]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable<City>({
        columns,
        data,
    })

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Şehir Yönetimi</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table {...getTableProps()} striped bordered hover>
                    <thead>
                    {headerGroups.map((headerGroup, index) => {
                        const {key, ...headerGroupProps} = headerGroup.getHeaderGroupProps();
                        return (
                            <tr key={index} {...headerGroupProps}>
                                {headerGroup.headers.map((column, colIndex) => {
                                    const {key: colKey, ...columnProps} = column.getHeaderProps();
                                    return (
                                        <th key={colIndex} {...columnProps}>
                                            {column.render('Header')}
                                        </th>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </thead>


                    <tbody {...getTableBodyProps()}>
                    {rows.map((row, rowIndex) => {
                        prepareRow(row);
                        const { key, ...rowProps } = row.getRowProps();
                        return (
                            <tr key={rowIndex} {...rowProps} className="align-middle">
                                {row.cells.map((cell, cellIndex) => {
                                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                                    return (
                                        <td key={cellIndex} {...cellProps}>
                                            {cell.render('Cell')}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                    </tbody>
                </Table>
                <Form.Group className="mt-3">
                    <Form.Control
                        type="text"
                        placeholder="Yeni şehir adı girin"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Kapat
                </Button>
                <Button variant="success" onClick={handleAddCity}>
                    Şehir Ekle
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CitiesManagementModal;
