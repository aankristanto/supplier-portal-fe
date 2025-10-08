import React, {useState, useEffect, useRef} from "react";

import {AgGridReact} from "ag-grid-react";
import {Button, Modal, Form, Row, Col} from "react-bootstrap";
import {toast} from "react-toastify";
import axios from "../../config/axios";
import Swal from "sweetalert2";

const UserPage = () => {
  const gridRef = useRef();

  const [rowData, setRowData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ID: "",
    INITIAL: "",
    NAME: "",
    EMAIL: "",
    NO_TELEPHONE: "",
    COMPANY_ID: "",
    ADDRESS: "",
    POSITION: "",
    LEVEL: "",
    SUMMARY: "",
    USER_PATH: "",
    GENDER: "",
    PASSWORD: "",
  });


  const columnDefs = [
    {
      headerName: "Initial",
      field: "INITIAL",
      filter: true,
      sortable: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "NAME",
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Email",
      field: "EMAIL",
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: "Phone",
      field: "NO_TELEPHONE",
      filter: true,
      sortable: true,
      width: 120,
    },
    {
      headerName: "Company ID",
      field: "COMPANY_ID",
      filter: true,
      sortable: true,
      width: 120,
    },
    {
      headerName: "Gender",
      field: "GENDER",
      filter: true,
      sortable: true,
      width: 100,
    },
    {
      headerName: "Aksi",
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleEdit(params.data)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleDelete(params.data.ID)}
          >
            Hapus
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get("/user");
      setRowData(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat data user");
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      ID: "",
      INITIAL: "",
      NAME: "",
      EMAIL: "",
      NO_TELEPHONE: "",
      COMPANY_ID: "",
      ADDRESS: "",
      POSITION: "",
      LEVEL: "",
      SUMMARY: "",
      USER_PATH: "",
      GENDER: "",
      PASSWORD: "",
    });
    setShowModal(true);
  };

  const handleEdit = (data) => {
    setIsEditing(true);
    setFormData({
      ID: data.ID,
      INITIAL: data.INITIAL || "",
      NAME: data.NAME || "",
      EMAIL: data.EMAIL || "",
      NO_TELEPHONE: data.NO_TELEPHONE || "",
      COMPANY_ID: data.COMPANY_ID || "",
      ADDRESS: data.ADDRESS || "",
      POSITION: data.POSITION || "",
      LEVEL: data.LEVEL || "",
      SUMMARY: data.SUMMARY || "",
      USER_PATH: data.USER_PATH || "",
      GENDER: data.GENDER || "",
      PASSWORD: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const resp = await Swal.fire({
      title: "Apakah Anda yakin ingin menghapus user ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    });

    if (!resp.isConfirmed) return;

    try {
      await axios.delete(`/user/${id}`);
      toast.success("User berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus user");
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.INITIAL ||
      !formData.NAME ||
      !formData.EMAIL ||
      !formData.NO_TELEPHONE ||
      !formData.COMPANY_ID
    ) {
      toast.warn("Semua field wajib diisi");
      return;
    }

    if (!isEditing && !formData.PASSWORD) {
      toast.warn("Password wajib diisi");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`/user/${formData.ID}`, formData);
        toast.success("User berhasil diperbarui");
      } else {
        await axios.post("/auth/register", formData);
        toast.success("User berhasil ditambahkan");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>List User</h5>
        <Button variant="primary" onClick={handleAdd}>
          + Tambah User
        </Button>
      </div>

      <div className="ag-theme-alpine" style={{height: 500, width: "100%"}}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          rowSelection="single"
          suppressCellFocus={true}
          defaultColDef={{
            resizable: true,
            editable: false,
            filter: true,
            sortable: true,
          }}
        />
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit User" : "Tambah User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formInitial">
                  <Form.Label>Initial *</Form.Label>
                  <Form.Control
                    type="text"
                    name="INITIAL"
                    value={formData.INITIAL}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="NAME"
                    value={formData.NAME}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="EMAIL"
                    value={formData.EMAIL}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control
                    type="text"
                    name="NO_TELEPHONE"
                    value={formData.NO_TELEPHONE}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formCompanyId">
                  <Form.Label>Company ID *</Form.Label>
                  <Form.Control
                    type="text"
                    name="COMPANY_ID"
                    value={formData.COMPANY_ID}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formGender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="GENDER"
                    value={formData.GENDER}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Tuan">Tuan</option>
                    <option value="Nyonya">Nyonya</option>
                    <option value="Nona">Nona</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="PASSWORD"
                    value={formData.PASSWORD}
                    onChange={handleChange}
                    required={!isEditing}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPosition">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="POSITION"
                    value={formData.POSITION}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="ADDRESS"
                    value={formData.ADDRESS}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Batal
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserPage;
