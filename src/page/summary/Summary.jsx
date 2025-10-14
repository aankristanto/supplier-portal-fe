import React, {useEffect, useState} from "react";
import {AgGridReact} from "ag-grid-react";

import {Button, Card, Col, Form, Modal, Row} from "react-bootstrap";
import {GrEdit, GrView} from "react-icons/gr";

import {toast} from "react-toastify";
import axios from "../../config/axios";
import "./summary.css";
import Swal from "sweetalert2";

const SummaryPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderPurchasingId, setOrderPurchasingId] = useState("");
  const [formData, setFormData] = useState({});
  const [deliveryMode, setDeliveryMode] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showNotConsumeModal, setShowNotConsumeModal] = useState(false);
  const [notConsumedItems, setNotConsumedItems] = useState([]);

  const [showRevModal, setShowRevModal] = useState(false);
  const [formRev, setFormRev] = useState({});

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentSchedule, setCurrentSchedule] = useState({
    ATD_DATE: "",
    ATA_DATE: "",
    DELIVERY_MODE: "",
    PORT_OF_DISCHARGE: "",
    PORT_OF_LOADING: "",
    TERM_OF_DELIVERY: "",
    CUSTOM_DOC_TYPE: "",
    CUSTOM_DOC_NO: "",
    CUSTOM_DOC_DATE: "",
    CUSTOM_DOC_NOTE: "",
    PACKING_SLIP_NO: "",
    INVOICE_NO: "",
    DELIVERY_NOTE: "",
    TRUCK_NUMBER: "",
    CONTAINER_NOTE: "",
    NOTE: "",
  });

  const columnDefs = [
    {headerName: "PO ID", field: "ID", width: 120},
    {
      headerName: "Status",
      field: "MPO_STATUS",
      width: 120,
      cellStyle: () => {
        return {color: "red", backgroundColor: "white"};
      },
    },
    {
      headerName: "Rev No",
      field: "REV",
      width: 100,
      cellRenderer: (params) => `${params.data.REV?.SEQUENCE || "0"}`,
    },
    {headerName: "PO Date", field: "MPO_DATE", width: 120},
    {headerName: "Vendor ID", field: "VENDOR_ID", width: 120},
    {headerName: "Company ID", field: "COMPANY_ID", width: 120},
    {headerName: "Currency", field: "CURRENCY_CODE", width: 100},
    {headerName: "Tax %", field: "TAX_PERCENTAGE", width: 100},
    {headerName: "Surcharge", field: "SURCHARGE_AMOUNT", width: 120},
    {headerName: "Created At", field: "CREATED_AT", width: 180},
    {headerName: "Updated At", field: "UPDATED_AT", width: 180},
  ];

  const notConsumeColumnDefs = [
    {headerName: "Item ID", field: "MATERIAL_ITEM_ID", width: 120},
    {
      headerName: "Item Code/Description",
      field: "ITEM_CODE_DESCRIPTION",
      width: 200,
    },
    {headerName: "Color", field: "MATERIAL_ITEM_COLOR", width: 100},
    {headerName: "Size", field: "MATERIAL_ITEM_SIZE", width: 100},
    {headerName: "UOM", field: "PURCHASE_UOM", width: 80},
    {
      headerName: "PO Qty",
      field: "PURCHASE_ORDER_QTY",
      width: 100,
      cellStyle: {fontWeight: "bold"},
    },
    {
      headerName: "Used Qty",
      field: "QUANTITY_USED",
      width: 100,
      cellStyle: {color: "green"},
    },
    {
      headerName: "Remaining Qty",
      width: 120,
      cellStyle: {color: "red", fontWeight: "bold"},
      valueGetter: (params) => {
        const poQty = parseFloat(params.data.PURCHASE_ORDER_QTY) || 0;
        const usedQty = parseFloat(params.data.QUANTITY_USED) || 0;
        return poQty - usedQty;
      },
    },
    {headerName: "Unit Cost", field: "UNIT_COST", width: 120},
    {
      headerName: "Total Purchase Cost",
      field: "TOTAL_PURCHASE_COST",
      width: 150,
    },
  ];

  const fetchPurchaseOrders = async () => {
    try {
      const {data} = await axios.get("/purchase-order/main", {
        params: {
          MPO_STATUS: "Process",
        },
      });
      setPurchaseOrders(data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch purchase orders"
      );
    }
  };

  const fetchDeliveryMode = async () => {
    try {
      const {data} = await axios.get("/delivery-mode");
      setDeliveryMode(data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch purchase orders"
      );
    }
  };

  const fetchPurchaseOrderById = async (id) => {
    try {
      const {data} = await axios.get(`/purchase-order/main/${id}`);
      setFormData(data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch purchase order detail"
      );
    }
  };

  const fetchDeliverySummaries = async (purchaseOrderId) => {
    try {
      const {data} = await axios.get("/v1/delivery/summary", {
        params: {PURCHASE_ORDER_ID: purchaseOrderId},
      });
      setSchedules(data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch delivery schedules"
      );
      setSchedules([]);
    }
  };

  const fetchNotConsumedItems = async (purchaseOrderId) => {
    if (!purchaseOrderId) return;

    try {
      const {data} = await axios.get("/purchase-order/detail-summary", {
        params: {PURCHASE_ORDER_ID: purchaseOrderId},
      });

      const notConsumed = (data.data || []).filter((item) => {
        const poQty = parseFloat(item.PURCHASE_ORDER_QTY) || 0;
        const usedQty = parseFloat(item.QUANTITY_USED) || 0;
        return poQty > usedQty;
      });

      setNotConsumedItems(notConsumed);
      setShowNotConsumeModal(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch not consumed items"
      );
      setNotConsumedItems([]);
    } finally {
    }
  };

  const onOpenRevDetail = async () => {
    try {
      const {data} = await axios.get("/purchase-order/rev", {
        params: {
          PURCHASE_ORDER_ID: formData.ID,
          SEQUENCE: formData?.REV?.SEQUENCE || 0,
        },
      });
      if (!data.data.length) {
        toast.warn("No revision found");
        return;
      }
      setShowRevModal(true);
      setFormRev(data.data[0]);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch delivery schedules"
      );
    }
  };

  const handleAddSchedule = async () => {
    if (loading) return;
    if (!currentSchedule.PACKING_SLIP_NO || !currentSchedule.INVOICE_NO) {
      toast.warn("Please fill required fields: Packing Slip No, Invoice No");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        PURCHASE_ORDER_ID: orderPurchasingId,
        ...currentSchedule,
      };

      await axios.post("/v1/delivery/summary", payload);
      toast.success("Schedule added successfully!");
      await fetchDeliverySummaries(orderPurchasingId);
      resetScheduleForm();
      setShowModal(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(
        err.response?.data?.message ?? "Failed to add delivery schedule"
      );
    }
  };

  const handleUpdateSchedule = async () => {
    if (loading) return;
    if (!currentSchedule.PACKING_SLIP_NO || !currentSchedule.INVOICE_NO) {
      toast.warn("Please fill required fields: Packing Slip No, Invoice No");
      return;
    }

    setLoading(true);
    try {
      const payload = {...currentSchedule};
      await axios.put(`/v1/delivery/summary/${currentSchedule.ID}`, payload);
      toast.success("Schedule updated successfully!");
      await fetchDeliverySummaries(orderPurchasingId);
      resetScheduleForm();
      setLoading(false);
      setShowModal(false);
    } catch (err) {
      setLoading(false);
      toast.error(
        err.response?.data?.message ?? "Failed to update delivery schedule"
      );
    }
  };

  const handleRemoveSchedule = async (scheduleId) => {
    const confirm = await Swal.fire({
      title: "Are you sure you want to delete this schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/v1/delivery/summary/${scheduleId}`);
      toast.success("Schedule deleted successfully");
      await fetchDeliverySummaries(orderPurchasingId);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete schedule");
    }
  };

  const onHandleAddSchedule = () => {
    resetScheduleForm();
    setShowModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setCurrentSchedule({
      ID: schedule.ID,
      ATD_DATE: schedule.ATD_DATE || "",
      ATA_DATE: schedule.ATA_DATE || "",
      DELIVERY_MODE: schedule.DELIVERY_MODE || "",
      PORT_OF_DISCHARGE: schedule.PORT_OF_DISCHARGE || "",
      PORT_OF_LOADING: schedule.PORT_OF_LOADING || "",
      TERM_OF_DELIVERY: schedule.TERM_OF_DELIVERY || "",
      CUSTOM_DOC_TYPE: schedule.CUSTOM_DOC_TYPE || "",
      CUSTOM_DOC_NO: schedule.CUSTOM_DOC_NO || "",
      CUSTOM_DOC_DATE: schedule.CUSTOM_DOC_DATE || "",
      CUSTOM_DOC_NOTE: schedule.CUSTOM_DOC_NOTE || "",
      PACKING_SLIP_NO: schedule.PACKING_SLIP_NO || "",
      INVOICE_NO: schedule.INVOICE_NO || "",
      DELIVERY_NOTE: schedule.DELIVERY_NOTE || "",
      TRUCK_NUMBER: schedule.TRUCK_NUMBER || "",
      CONTAINER_NOTE: schedule.CONTAINER_NOTE || "",
      NOTE: schedule.NOTE || "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const resetScheduleForm = () => {
    setCurrentSchedule({
      ATD_DATE: "",
      ATA_DATE: "",
      DELIVERY_MODE: "",
      PORT_OF_DISCHARGE: "",
      PORT_OF_LOADING: "",
      TERM_OF_DELIVERY: "",
      CUSTOM_DOC_TYPE: "",
      CUSTOM_DOC_NO: "",
      CUSTOM_DOC_DATE: "",
      CUSTOM_DOC_NOTE: "",
      PACKING_SLIP_NO: "",
      INVOICE_NO: "",
      DELIVERY_NOTE: "",
      TRUCK_NUMBER: "",
      CONTAINER_NOTE: "",
      NOTE: "",
    });
    setIsEditing(false);
  };

  const handleViewDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  const handleRowDoubleClick = (id) => {
    fetchPurchaseOrderById(id);
    setOrderPurchasingId(id);
    fetchDeliverySummaries(id);
  };

  const handleBack = () => {
    setOrderPurchasingId("");
    setFormData({});
    fetchPurchaseOrders();
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchDeliveryMode();
  }, []);

  return (
    <div>
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetScheduleForm();
        }}
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Delivery Schedule" : "Add Delivery Schedule"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>ATD Date</Form.Label>
                <Form.Control
                  type="date"
                  value={currentSchedule.ATD_DATE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      ATD_DATE: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>ATA Date</Form.Label>
                <Form.Control
                  type="date"
                  value={currentSchedule.ATA_DATE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      ATA_DATE: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Delivery Mode</Form.Label>
                <Form.Control
                  as="select"
                  value={currentSchedule.DELIVERY_MODE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      DELIVERY_MODE: e.target.value,
                    })
                  }
                >
                  <option value="">-- Select --</option>
                  {deliveryMode.map((item, idx) => (
                    <option key={idx} value={item.DELIVERY_MODE_DESC}>
                      {item.DELIVERY_MODE_CODE} - {item.DELIVERY_MODE_DESC}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Term of Delivery</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. FOB"
                  value={currentSchedule.TERM_OF_DELIVERY}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      TERM_OF_DELIVERY: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Port of Discharge</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. SEMARANG"
                  value={currentSchedule.PORT_OF_DISCHARGE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      PORT_OF_DISCHARGE: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Port of Loading</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Jakarta"
                  value={currentSchedule.PORT_OF_LOADING}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      PORT_OF_LOADING: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Packing Slip No</Form.Label>
                <Form.Control
                  type="text"
                  value={currentSchedule.PACKING_SLIP_NO}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      PACKING_SLIP_NO: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Invoice No</Form.Label>
                <Form.Control
                  type="text"
                  value={currentSchedule.INVOICE_NO}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      INVOICE_NO: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Truck Number</Form.Label>
                <Form.Control
                  type="text"
                  value={currentSchedule.TRUCK_NUMBER}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      TRUCK_NUMBER: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Container No</Form.Label>
                <Form.Control
                  type="text"
                  value={currentSchedule.CONTAINER_NOTE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      CONTAINER_NOTE: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Delivery Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={currentSchedule.DELIVERY_NOTE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      DELIVERY_NOTE: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-4 pt-3 border-top">
            <h6>Custom Document (Optional)</h6>
            <Row className="g-3">
              <Col md={4}>
                <Form.Control
                  placeholder="Document Type"
                  value={currentSchedule.CUSTOM_DOC_TYPE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      CUSTOM_DOC_TYPE: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Document No"
                  value={currentSchedule.CUSTOM_DOC_NO}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      CUSTOM_DOC_NO: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="date"
                  value={currentSchedule.CUSTOM_DOC_DATE}
                  onChange={(e) =>
                    setCurrentSchedule({
                      ...currentSchedule,
                      CUSTOM_DOC_DATE: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>
            <Form.Group className="mt-2">
              <Form.Control
                as="textarea"
                placeholder="Document Note"
                rows={1}
                value={currentSchedule.CUSTOM_DOC_NOTE}
                onChange={(e) =>
                  setCurrentSchedule({
                    ...currentSchedule,
                    CUSTOM_DOC_NOTE: e.target.value,
                  })
                }
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              resetScheduleForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={isEditing ? handleUpdateSchedule : handleAddSchedule}
          >
            {isEditing ? "Update Schedule" : "Add Schedule"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delivery Schedule Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule && (
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3">
                  Shipping Information
                </h6>
                <div className="mb-3">
                  <strong>ATD Date:</strong> {selectedSchedule.ATD_DATE || "-"}
                </div>
                <div className="mb-3">
                  <strong>ATA Date:</strong> {selectedSchedule.ATA_DATE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Delivery Mode:</strong>{" "}
                  {selectedSchedule.DELIVERY_MODE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Port of Discharge:</strong>{" "}
                  {selectedSchedule.PORT_OF_DISCHARGE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Port of Loading:</strong>{" "}
                  {selectedSchedule.PORT_OF_LOADING || "-"}
                </div>
                <div className="mb-3">
                  <strong>Term of Delivery:</strong>{" "}
                  {selectedSchedule.TERM_OF_DELIVERY || "-"}
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3">
                  Logistics & Document
                </h6>
                <div className="mb-3">
                  <strong>Packing Slip No:</strong>{" "}
                  {selectedSchedule.PACKING_SLIP_NO || "-"}
                </div>
                <div className="mb-3">
                  <strong>Invoice No:</strong>{" "}
                  {selectedSchedule.INVOICE_NO || "-"}
                </div>
                <div className="mb-3">
                  <strong>Truck Number:</strong>{" "}
                  {selectedSchedule.TRUCK_NUMBER || "-"}
                </div>
                <div className="mb-3">
                  <strong>Container No:</strong>{" "}
                  {selectedSchedule.CONTAINER_NOTE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Delivery Note:</strong>{" "}
                  {selectedSchedule.DELIVERY_NOTE || "-"}
                </div>
              </div>

              {(selectedSchedule.CUSTOM_DOC_TYPE ||
                selectedSchedule.CUSTOM_DOC_NO ||
                selectedSchedule.CUSTOM_DOC_DATE ||
                selectedSchedule.CUSTOM_DOC_NOTE) && (
                <div className="col-12 mt-3">
                  <h6 className="border-bottom pb-2 mb-3">Custom Document</h6>
                  <div className="row">
                    <div className="col-md-3">
                      <strong>Type:</strong>{" "}
                      {selectedSchedule.CUSTOM_DOC_TYPE || "-"}
                    </div>
                    <div className="col-md-3">
                      <strong>No:</strong>{" "}
                      {selectedSchedule.CUSTOM_DOC_NO || "-"}
                    </div>
                    <div className="col-md-3">
                      <strong>Date:</strong>{" "}
                      {selectedSchedule.CUSTOM_DOC_DATE || "-"}
                    </div>
                    <div className="col-md-3">
                      <strong>Note:</strong>{" "}
                      {selectedSchedule.CUSTOM_DOC_NOTE || "-"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showRevModal}
        onHide={() => setShowRevModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Revision Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control size="sm" value={formRev?.NAME} disabled />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>SEQUENCE</Form.Label>
                <Form.Control size="sm" value={formRev?.SEQUENCE} disabled />
              </Form.Group>
            </Col>
            <Col md={12} className="mt-2">
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={3}
                  value={formRev?.DESCRIPTION}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delivery Schedule Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule && (
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3">
                  Shipping Information
                </h6>
                <div className="mb-3">
                  <strong>ATD Date:</strong> {selectedSchedule?.ATD_DATE || "-"}
                </div>
                <div className="mb-3">
                  <strong>ATA Date:</strong> {selectedSchedule?.ATA_DATE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Delivery Mode:</strong>
                  {selectedSchedule?.DELIVERY_MODE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Port of Discharge:</strong>
                  {selectedSchedule?.PORT_OF_DISCHARGE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Port of Loading:</strong>
                  {selectedSchedule?.PORT_OF_LOADING || "-"}
                </div>
                <div className="mb-3">
                  <strong>Term of Delivery:</strong>
                  {selectedSchedule?.TERM_OF_DELIVERY || "-"}
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3">
                  Logistics & Document
                </h6>
                <div className="mb-3">
                  <strong>Packing Slip No:</strong>
                  {selectedSchedule?.PACKING_SLIP_NO || "-"}
                </div>
                <div className="mb-3">
                  <strong>Invoice No:</strong>
                  {selectedSchedule?.INVOICE_NO || "-"}
                </div>
                <div className="mb-3">
                  <strong>Truck Number:</strong>
                  {selectedSchedule?.TRUCK_NUMBER || "-"}
                </div>
                <div className="mb-3">
                  <strong>Container No:</strong>
                  {selectedSchedule?.CONTAINER_NOTE || "-"}
                </div>
                <div className="mb-3">
                  <strong>Delivery Note:</strong>
                  {selectedSchedule?.DELIVERY_NOTE || "-"}
                </div>
              </div>

              {(selectedSchedule?.CUSTOM_DOC_TYPE ||
                selectedSchedule?.CUSTOM_DOC_NO ||
                selectedSchedule?.CUSTOM_DOC_DATE ||
                selectedSchedule?.CUSTOM_DOC_NOTE) && (
                <div className="col-12 mt-3">
                  <h6 className="border-bottom pb-2 mb-3">Custom Document</h6>
                  <div className="row">
                    <div className="col-md-3">
                      <strong>Type:</strong>
                      {selectedSchedule?.CUSTOM_DOC_TYPE || "-"}
                    </div>
                    <div className="col-md-3">
                      <strong>No:</strong>
                      {selectedSchedule?.CUSTOM_DOC_NO || "-"}
                    </div>
                    <div className="col-md-3">
                      <strong>Date:</strong>
                      {selectedSchedule?.CUSTOM_DOC_DATE || "-"}
                    </div>
                    <div className="col-md-3">
                      <strong>Note:</strong>
                      {selectedSchedule?.CUSTOM_DOC_NOTE || "-"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showNotConsumeModal}
        onHide={() => setShowNotConsumeModal(false)}
        size="xl"
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Items Not Fully Consumed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notConsumedItems.length > 0 ? (
            <div
              className="ag-theme-alpine"
              style={{height: "60vh", width: "100%"}}
            >
              <AgGridReact
                rowData={notConsumedItems}
                columnDefs={notConsumeColumnDefs}
                pagination={true}
                paginationPageSize={15}
                enableCellTextSelection={true}
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <h5>All items have been fully consumed!</h5>
              <p className="text-muted">No remaining quantities to schedule.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNotConsumeModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {!orderPurchasingId ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>Delivery Schedule |  MPO (Proccess)</h5>
          </div>
          <div
            className="ag-theme-alpine"
            style={{height: "95vh", width: "100%"}}
          >
            <AgGridReact
              rowData={purchaseOrders}
              columnDefs={columnDefs}
              pagination={true}
              rowSelection="single"
              onRowDoubleClicked={(params) =>
                handleRowDoubleClick(params.data.ID)
              }
            />
          </div>
        </>
      ) : (
        <div>
          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={1}>
                  <Button variant="secondary" size="sm" onClick={handleBack}>
                    Back to Table
                  </Button>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>PO ID.</Form.Label>
                    <Form.Control size="sm" value={formData?.ID} disabled />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Revisi No.</Form.Label>
                    <Form.Control
                      size="sm"
                      style={{cursor: "pointer"}}
                      onClick={onOpenRevDetail}
                      value={formData?.REV?.SEQUENCE || 0}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData?.MPO_DATE}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>PO Status</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData?.MPO_STATUS}
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row>
            <Col md={8}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>Manage Individual Delivery Timing</h5>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => fetchNotConsumedItems(orderPurchasingId)}
                    >
                      Show Item Not Consume
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {schedules.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold text-primary mb-2">
                        Added Schedules
                      </h6>
                      <div className="schedule-list-container">
                        {schedules.map((schedule) => (
                          <div
                            key={schedule.ID}
                            className="schedule-item d-flex justify-content-between align-items-start p-3 mb-2 bg-white border rounded shadow-sm"
                          >
                            <div className="schedule-info flex-grow-1 me-3">
                              <div className="d-flex flex-wrap gap-3 mb-1">
                                {schedule.ATD_DATE && (
                                  <span className="badge bg-info text-dark">
                                    <strong>ATD:</strong> {schedule.ATD_DATE}
                                  </span>
                                )}
                                {schedule.ATA_DATE && (
                                  <span className="badge bg-success text-white">
                                    <strong>ATA:</strong> {schedule.ATA_DATE}
                                  </span>
                                )}
                                {schedule.DELIVERY_MODE && (
                                  <span className="badge bg-secondary">
                                    <strong>Mode:</strong>{" "}
                                    {schedule.DELIVERY_MODE}
                                  </span>
                                )}
                              </div>

                              <div className="d-flex flex-wrap gap-3 mt-1">
                                {schedule.PACKING_SLIP_NO && (
                                  <span>
                                    <strong>Packing Slip:</strong>{" "}
                                    {schedule.PACKING_SLIP_NO}
                                  </span>
                                )}
                                {schedule.INVOICE_NO && (
                                  <span>
                                    <strong>Invoice:</strong>{" "}
                                    {schedule.INVOICE_NO}
                                  </span>
                                )}
                                {schedule.CONTAINER_NOTE && (
                                  <span>
                                    <strong>Container:</strong>{" "}
                                    {schedule.CONTAINER_NOTE}
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 text-muted small">
                                {schedule.DELIVERY_NOTE && (
                                  <span>Note: {schedule.DELIVERY_NOTE}</span>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="flex-shrink-0 me-2"
                              onClick={() => handleViewDetail(schedule)}
                            >
                              <GrView /> View
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="flex-shrink-0 me-2"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <GrEdit /> Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="flex-shrink-0"
                              onClick={() => handleRemoveSchedule(schedule.ID)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className="d-flex justify-content-center align-items-center pt-2"
                    style={{borderTop: "1px solid #B2BEB5"}}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onHandleAddSchedule}
                    >
                      Add Schedule
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header>
                  <b>Delivery Detail</b>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>ETD Date</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.MPO_ETD || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>ETA Date</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.MPO_ETA || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>

                    <Col sm={12}>
                      <Form.Group className="mb-2">
                        <Form.Label>Delivery Mode</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.DELIVERY_MODE_CODE || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Delivery Term</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.DELIVERY_TERM || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Country ID</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.COUNTRY_ID || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={12}>
                      <Form.Group className="mb-2">
                        <Form.Label>Port of Discharge</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.PORT_DISCHARGE || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Delivery Unit</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.DELIVERY_UNIT || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Warehouse</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.WAREHOUSE_NAME || ""}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card>
                <Card.Header>
                  <b>Invoice Detail</b>
                </Card.Header>
                <Card.Body>
                  {formData?.INVOICE_DETAIL ? (
                    <>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          size="sm"
                          value={
                            formData.INVOICE_DETAIL.INVOICE_COMPANY_NAME || ""
                          }
                          disabled
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.INVOICE_DETAIL.INVOICE_ADDRESS || ""}
                          disabled
                        />
                      </Form.Group>
                      <Row>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Tel.</Form.Label>
                            <Form.Control
                              size="sm"
                              value={
                                formData.INVOICE_DETAIL.INVOICE_PHONE || ""
                              }
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Fax</Form.Label>
                            <Form.Control
                              size="sm"
                              value={formData.INVOICE_DETAIL.INVOICE_FAX || ""}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.INVOICE_DETAIL.INVOICE_EMAIL || ""}
                          disabled
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <p>No invoice detail available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default SummaryPage;
