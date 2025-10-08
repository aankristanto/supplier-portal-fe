
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';

import { Button, Modal, Form, Row, Col, ToastContainer } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../config/axios.js';
import { defaultColDef } from '../../util/general.js';

const CompanyPage = () => {
  const [rowData, setRowData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ID: '',
    NAME: '',
    ADDRESS_1: '',
    PHONE: '',
    CONTACT_NAME: '',
    CONTACT_EMAIL: '',
    COUNTRY_CODE: 'ID', 
  });

  const gridRef = useRef();

  
  const columnDefs = [
    {
      headerName: 'Nama',
      field: 'NAME',
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'ID',
      field: 'ID',
      filter: true,
      sortable: true,
      width: 100,
    },
    {
      headerName: 'Alamat',
      field: 'ADDRESS_1',
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Tlp',
      field: 'PHONE',
      filter: true,
      sortable: true,
      width: 120,
    },
    {
      headerName: 'Penanggung Jawab',
      field: 'CONTACT_NAME',
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Nama PIC',
      field: 'CONTACT_NAME',
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Email PIC',
      field: 'CONTACT_EMAIL',
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Aksi',
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => handleEdit(params.data)}>
            Edit
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(params.data.ID)}>
            Hapus
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  
  const fetchData = async () => {
    try {
      const response = await axios.get('/company'); 
      if (response.data.status) {
        setRowData(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data perusahaan');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      ID: '',
      NAME: '',
      ADDRESS_1: '',
      PHONE: '',
      CONTACT_NAME: '',
      CONTACT_EMAIL: '',
      COUNTRY_CODE: 'ID',
    });
    setShowModal(true);
  };

  const handleEdit = (data) => {
    setIsEditing(true);
    setFormData({
      ID: data.ID,
      NAME: data.NAME || '',
      ADDRESS_1: data.ADDRESS_1 || '',
      PHONE: data.PHONE || '',
      CONTACT_NAME: data.CONTACT_NAME || '',
      CONTACT_EMAIL: data.CONTACT_EMAIL || '',
      COUNTRY_CODE: data.COUNTRY_CODE || 'ID',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus perusahaan ini?')) return;

    try {
      await axios.delete(`/company/${id}`);
      toast.success('Perusahaan berhasil dihapus');
      fetchData(); 
    } catch (error) {
      toast.error('Gagal menghapus perusahaan');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await axios.put(`/company/${formData.ID}`, formData);
        toast.success('Perusahaan berhasil diperbarui');
      } else {
        await axios.post('/company', formData);
        toast.success('Perusahaan berhasil ditambahkan');
      }

      setShowModal(false);
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>List Company</h5>
        <Button variant="primary" onClick={handleAdd}>
          + Tambah Perusahaan
        </Button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          rowSelection="single"
          suppressCellFocus={true}
          defaultColDef={defaultColDef}
        />
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Perusahaan' : 'Tambah Perusahaan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formID">
                  <Form.Label>ID *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ID"
                    value={formData.ID}
                    onChange={handleChange}
                    required
                    disabled={isEditing}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Nama *</Form.Label>
                  <Form.Control
                    type="text"
                    name="NAME"
                    value={formData.NAME}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Alamat *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="ADDRESS_1"
                    value={formData.ADDRESS_1}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Tlp *</Form.Label>
                  <Form.Control
                    type="text"
                    name="PHONE"
                    value={formData.PHONE}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formContactName">
                  <Form.Label>Nama PIC *</Form.Label>
                  <Form.Control
                    type="text"
                    name="CONTACT_NAME"
                    value={formData.CONTACT_NAME}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formContactEmail">
                  <Form.Label>Email PIC *</Form.Label>
                  <Form.Control
                    name="CONTACT_EMAIL"
                    value={formData.CONTACT_EMAIL}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formCountryCode">
                  <Form.Label>Kode Negara</Form.Label>
                  <Form.Select
                    name="COUNTRY_CODE"
                    value={formData.COUNTRY_CODE}
                    onChange={handleChange}
                  >
                    <option value="ID">Indonesia</option>
                    <option value="US">United States</option>
                    <option value="SG">Singapore</option>
                    <option value="MY">Malaysia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Batal
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default CompanyPage;