import React, {useEffect, useRef, useState} from "react";
import {AgGridReact} from "ag-grid-react";
import {Button, Card, Col, Form, Modal, Row, Spinner} from "react-bootstrap";
import {GrTrash, GrAdd} from "react-icons/gr";
import {toast} from "react-toastify";
import axios from "../../config/axios";
import Swal from "sweetalert2";
import {defaultColDef} from "../../util/general";

const DeliverySummaryList = () => {
  const poGridRef = useRef(null);

  const [schedules, setSchedules] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState([]);

  const [selectedPurchaseOrders, setSelectedPurchaseOrders] = useState([]);
  const [showNotConsumeModal, setShowNotConsumeModal] = useState(false);
  const [notConsumedItems, setNotConsumedItems] = useState([]);

  const [deliveryScheduleList, setDeliveryScheduleList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState({
    ID: null,
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
  });

  const poColumnDefs = [
    {
      headerName: "Select",
      field: "",
      width: 80,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {headerName: "PO ID", field: "ID", width: 130},
    {
      headerName: "Status",
      field: "",
      width: 110,
      cellRenderer: (params) => {
        const poEtd = params.data.MPO_ETD;
        const atd = currentSchedule.ATD_DATE;

        if (!atd || !poEtd) {
          return "-";
        }

        const etdDate = new Date(poEtd);
        const atdDate = new Date(atd);

        if (atdDate > etdDate) {
          return <span style={{color: "red", fontWeight: "bold"}}>Late</span>;
        } else {
          return (
            <span style={{color: "green", fontWeight: "bold"}}>On Time</span>
          );
        }
      },
    },
    {headerName: "ETD", field: "MPO_ETD", width: 110},
    {headerName: "ETA", field: "MPO_ETA", width: 110},
    {
      headerName: "Rev No",
      field: "REV",
      width: 90,
      cellRenderer: (params) => `${params.data.REV?.SEQUENCE || "0"}`,
    },
    {headerName: "PO Date", field: "MPO_DATE", width: 110},
    {
      headerName: "Customer Name",
      field: "INVOICE_DETAIL.INVOICE_COMPANY_NAME",
      width: 130,
    },
    {
      headerName: "Customer Address",
      field: "INVOICE_DETAIL.INVOICE_ADDRESS",
      width: 150,
    },
    {
      headerName: "Customer Phone Number",
      field: "INVOICE_DETAIL.INVOICE_PHONE",
      width: 130,
    },

    {headerName: "Delivery Mode", field: "DELIVERY_MODE_CODE", width: 130},
    {headerName: "Term", field: "DELIVERY_TERM", width: 100},
    {headerName: "Port Discharge", field: "PORT_DISCHARGE", width: 140},
    {headerName: "Warehouse", field: "WAREHOUSE_NAME", width: 220},
    {headerName: "Currency", field: "CURRENCY_CODE", width: 100},
    {
      headerName: "Surcharge",
      field: "SURCHARGE_AMOUNT",
      width: 110,
      cellRenderer: (params) =>
        params.value ? Number(params.value).toFixed(2) : "-",
    },
    {
      headerName: "Tax %",
      field: "TAX_PERCENTAGE",
      width: 90,
      cellRenderer: (params) =>
        params.value ? `${(params.value * 100).toFixed(1)}%` : "-",
    },
  ];

  const notConsumeColumnDefs = [
    {headerName: "MPO ID", field: "PURCHASE_ORDER_ID", width: 120},
    {headerName: "Item ID", field: "MATERIAL_ITEM_ID", width: 120},
    {
      headerName: "Item Code/Description",
      field: "ITEM_CODE_DESCRIPTION",
      width: 200,
    },
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
      headerName: "Available Qty",
      field: "QUANTITY_AVAILABLE",
      width: 120,
      cellStyle: {color: "blue", fontWeight: "bold"},
    },
    {
      headerName: "Supplier Code",
      field: "INPUT_SUPPLIER_CODE",
      width: 150,
      editable: true,
      cellEditor: "agTextCellEditor",
    },
    {
      headerName: "Supplier Description",
      field: "INPUT_SUPPLIER_DESC",
      width: 200,
      editable: true,
      cellEditor: "agTextCellEditor",
    },
    {
      headerName: "Allocate Qty",
      field: "INPUT_QUANTITY",
      width: 120,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
        max: (params) => params.data.QUANTITY_AVAILABLE || 0,
      },
      valueParser: (params) => {
        const val = parseFloat(params.newValue);
        return isNaN(val) ? 0 : val;
      },
    },
  ];

  const deliverySummaryLineColumnDefs = [
    {
      headerName: "MPO ID",
      field: "PURCHASE_ORDER_DETAIL.PURCHASE_ORDER_ID",
      width: 130,
    },
    {
      headerName: "Order Code",
      field: "PURCHASE_ORDER_DETAIL.ORDER_CODE",
      width: 130,
    },
    {
      headerName: "Item Code",
      field: "PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_ID",
      width: 130,
    },
    {
      headerName: "Item Description",
      field: "PURCHASE_ORDER_DETAIL.ITEM_CODE_DESCRIPTION",
      width: 250,
    },
    {
      headerName: "Color",
      field: "PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_COLOR",
      width: 100,
    },
    {
      headerName: "Size",
      field: "PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_SIZE",
      width: 90,
    },
    {
      headerName: "UOM",
      field: "PURCHASE_ORDER_DETAIL.PURCHASE_UOM",
      width: 80,
    },
    {
      headerName: "PO Qty",
      field: "PURCHASE_ORDER_DETAIL.PURCHASE_ORDER_QTY",
      width: 100,
      cellStyle: {fontWeight: "bold"},
    },
    {
      headerName: "Scheduled Qty",
      field: "QUANTITY",
      width: 120,
      cellStyle: {color: "green", fontWeight: "bold"},
    },
    {
      headerName: "Supplier Code",
      field: "SUPPLIER_CODE",
      width: 150,
    },
    {
      headerName: "Supplier Description",
      field: "SUPPLIER_DESC",
      width: 150,
    },
  ];

  const scheduleColumnDefs = [
    {headerName: "ATD", field: "ATD_DATE", width: 120},
    {headerName: "ATA", field: "ATA_DATE", width: 120},
    {headerName: "Delivery Mode", field: "DELIVERY_MODE", width: 150},
    {headerName: "Port Of Discharge", field: "PORT_OF_DISCHARGE", width: 150},
    {headerName: "Port Of Loading", field: "PORT_OF_LOADING", width: 150},
    {headerName: "Custom Doc Type", field: "CUSTOM_DOC_TYPE", width: 150},
    {headerName: "Custom Doc No", field: "CUSTOM_DOC_NO", width: 150},
    {headerName: "Custom Doc Date", field: "CUSTOM_DOC_DATE", width: 150},
    {headerName: "Custom DOc Note", field: "CUSTOM_DOC_NOTE", width: 150},
    {headerName: "Packing Slip No", field: "PACKING_SLIP_NO", width: 150},
    {headerName: "Invoice No", field: "INVOICE_NO", width: 150},
    {headerName: "Truck Number", field: "TRUCK_NUMBER", width: 150},
    {headerName: "Container No", field: "CONTAINER_NOTE", width: 150},
    {headerName: "Delivery Note", field: "DELIVERY_NOTE", width: 150},

    {
      headerName: "Actions",
      width: 120,
      pinned: "right",
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleRemoveSchedule(params.data.ID)}
          >
            <GrTrash />
          </Button>
        </div>
      ),
    },
  ];

  const fetchDeliverySummariesList = async (deliverySummaryId) => {
    try {
      const {data} = await axios.get("/v2/delivery/summary-detail", {
        params: {
          DELIVERY_SUMMARY_ID: deliverySummaryId,
        },
      });
      setDeliveryScheduleList(data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch delivery schedules"
      );
    }
  };

  const fetchDeliverySummaries = async () => {
    try {
      const {data} = await axios.get("/v2/delivery/summary");
      setSchedules(data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch delivery schedules"
      );
    }
  };

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

  const fetchPurchaseOrdersListSell = async (deliverySummaryId) => {
    try {
      const {data} = await axios.get("/v2/delivery/summary-purchase", {
        params: {
          DELIVERY_SUMMARY_ID: deliverySummaryId,
        },
      });
      const selectedPOs = purchaseOrders.filter((po) =>
        data.data.some((item) => item.PURCHASE_ORDER_ID === po.ID)
      );

      setSelectedPurchaseOrders([...selectedPOs]);
    } catch (err) {
      toast.error(
        err.response?.data?.message ??
          "Failed to fetch purchase orders list select"
      );
      setSelectedPurchaseOrders([]);
    }
  };

  const fetchDeliveryMode = async () => {
    try {
      const {data} = await axios.get("/delivery-mode");
      setDeliveryMode(data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch delivery modes"
      );
    }
  };

  const handleSaveAllocations = async () => {
    if (loading) return;
    if (!currentSchedule?.ID) return;

    try {
      setLoading(true);

      const allocationsToSave = notConsumedItems.map((item) => ({
        PURCHASE_ORDER_DETAIL_ID: item.ID,
        DELIVERY_SUMMARY_ID: currentSchedule.ID,
        SUPPLIER_CODE: item.INPUT_SUPPLIER_CODE,
        SUPPLIER_DESC: item.INPUT_SUPPLIER_DESC,
        QUANTITY: item.INPUT_QUANTITY,
        PURCHASE_ORDER_ID: item.PURCHASE_ORDER_ID,
      }));

      if (allocationsToSave.length === 0) {
        toast.warn("No items to save");
        return;
      }

      await axios.post("/v2/delivery/summary-detail/bulk", {
        data: allocationsToSave,
      });

      toast.success("Allocations saved successfully!");
      setShowNotConsumeModal(false);
      fetchDeliverySummariesList(currentSchedule.ID);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save allocations");
      setLoading(false);
    }
  };

  const handlePOSelectionChanged = (gridApi) => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);

    const isSame =
      selectedData.length === selectedPurchaseOrders.length &&
      selectedData.every(
        (item, index) => item.ID === selectedPurchaseOrders[index]?.ID
      );

    if (!isSame) {
      setSelectedPurchaseOrders(selectedData);
    }
  };

  const handleAddNew = () => {
    resetForm();
    fetchPurchaseOrders();
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditSchedule = async (schedule) => {
    setCurrentSchedule(schedule);
    setIsEditing(true);
    setShowForm(true);
    await fetchPurchaseOrders();
    fetchDeliverySummariesList(schedule?.ID);
  };

  const handleRemoveSchedule = async (scheduleId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/v2/delivery/summary/${scheduleId}`);
      toast.success("Schedule deleted successfully");
      fetchDeliverySummaries();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete schedule");
    }
  };

  const handleSave = async () => {
    if (loading) return;
    if (!currentSchedule.PACKING_SLIP_NO || !currentSchedule.INVOICE_NO) {
      toast.warn("Please fill required fields: Packing Slip No, Invoice No");
      return;
    }

    try {
      setLoading(true);
      let response = null;

      if (isEditing) {
        const {data} = await axios.put(
          `/v2/delivery/summary/${currentSchedule.ID}`,
          {
            ...currentSchedule,
            PURCHASE_ORDER_LIST: selectedPurchaseOrders.map((item) => item.ID),
          }
        );
        response = data.data;
        toast.success("Schedule updated successfully!");
      } else {
        const payload = {
          ...currentSchedule,
          PURCHASE_ORDER_LIST: selectedPurchaseOrders.map((item) => item.ID),
          ID: null,
        };
        const {data} = await axios.post("/v2/delivery/summary", payload);
        response = data.data;
        toast.success("Schedule created successfully!");
      }

      handleEditSchedule(response);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenItemConsume = async () => {
    if (selectedPurchaseOrders.length === 0) {
      toast.warn("Please select at least one Purchase Order");
      return;
    }

    try {
      await handleSave();
      await fetchItemNotCounsume();
      setShowNotConsumeModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to open modal");
    }
  };

  const fetchItemNotCounsume = async () => {
    if (!currentSchedule?.ID) {
      toast.error("Delivery summary ID is required");
      return;
    }

    try {
      const {data} = await axios.get("/purchase-order/detail-delivery", {
        params: {DELIVERY_SUMMARY_ID: currentSchedule.ID},
      });

      const itemsWithInputs = data.data.map((item) => ({
        ...item,
        INPUT_SUPPLIER_CODE: item.SUPPLIER_CODE || "",
        INPUT_SUPPLIER_DESC: item.SUPPLIER_DESC || "",
        INPUT_QUANTITY: item.QUANTITY_USED || 0,
      }));

      setNotConsumedItems(itemsWithInputs);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to fetch items");
      setNotConsumedItems([]);
    }
  };

  const handleCellValueChanged = (params) => {
    const {data, colDef, newValue, oldValue} = params;
    const {field} = colDef;

    if (field === "INPUT_QUANTITY") {
      const numValue = parseFloat(newValue) || 0;
      const available = data.QUANTITY_AVAILABLE || 0;
      const originalUsed = data.QUANTITY_USED || 0;

      if (numValue === originalUsed) {
        const updatedItems = notConsumedItems.map((item) =>
          item.ID === data.ID ? {...item, INPUT_QUANTITY: numValue} : item
        );
        setNotConsumedItems(updatedItems);
        return;
      }

      if (numValue > available) {
        toast.warn(`Max available quantity is ${available}`);

        const updatedItems = notConsumedItems.map((item) =>
          item.ID === data.ID ? {...item, INPUT_QUANTITY: oldValue} : item
        );
        setNotConsumedItems(updatedItems);
        return;
      }
    }

    const updatedItems = notConsumedItems.map((item) =>
      item.ID === data.ID ? {...item, [field]: newValue} : item
    );
    setNotConsumedItems(updatedItems);
  };

  const handleBack = () => {
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentSchedule({
      ID: null,
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
    });
    setSchedules([])
    setPurchaseOrders([])
    setSelectedPurchaseOrders([])
    setNotConsumedItems([])
    setDeliveryScheduleList([])
    fetchDeliverySummaries();
    fetchDeliveryMode();
  };

  useEffect(() => {
    fetchDeliverySummaries();
    fetchDeliveryMode();
  }, []);

  useEffect(() => {
    if (poGridRef.current) {
      const api = poGridRef.current.api;
      if (!api) return
      api.deselectAll();

      if (selectedPurchaseOrders.length > 0) {
        const selectedIds = new Set(selectedPurchaseOrders.map((po) => po.ID));
        api.forEachNode((node) => {
          if (selectedIds.has(node.data.ID)) {
            node.setSelected(true);
          }
        });
      }
    }
    return () => {};
  }, [selectedPurchaseOrders]);

  useEffect(() => {
    if (currentSchedule?.ID) {
      fetchPurchaseOrdersListSell(currentSchedule?.ID);
    }
  }, [purchaseOrders]);

  return (
    <div className="container-fluid">
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
                onCellValueChanged={handleCellValueChanged}
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
          <Button variant="gray" onClick={() => setShowNotConsumeModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleSaveAllocations}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {!showForm ? (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Delivery Schedules</h5>
            <Button variant="success" size="sm" onClick={handleAddNew}>
              <GrAdd /> Add New
            </Button>
          </Card.Header>
          <Card.Body>
            {schedules.length > 0 ? (
              <div
                className="ag-theme-alpine"
                style={{height: "80vh", width: "100%"}}
              >
                <AgGridReact
                  rowData={schedules}
                  columnDefs={scheduleColumnDefs}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={20}
                  onRowDoubleClicked={(params) =>
                    handleEditSchedule(params.data)
                  }
                />
              </div>
            ) : (
              <div className="text-center py-5">
                <h5>No delivery schedules found</h5>
                <p className="text-muted">
                  Click "Add New" to create your first delivery schedule
                </p>
                <Button variant="outline-success" onClick={handleAddNew}>
                  <GrAdd /> Create Schedule
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>
                  {isEditing
                    ? "Edit Delivery Schedule"
                    : "Create Delivery Schedule"}
                </h5>
                <div>
                  <Button
                    className="mx-3"
                    variant="secondary"
                    size="sm"
                    onClick={handleBack}
                  >
                    Back to List
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : isEditing ? (
                      "Update Schedule"
                    ) : (
                      "Create Schedule"
                    )}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Delivery Mode</Form.Label>
                    <Form.Select
                      value={currentSchedule.DELIVERY_MODE}
                      onChange={(e) =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          DELIVERY_MODE: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Select --</option>
                      {deliveryMode.map((item) => (
                        <option
                          key={item.DELIVERY_MODE_CODE}
                          value={item.DELIVERY_MODE_DESC}
                        >
                          {item.DELIVERY_MODE_CODE} - {item.DELIVERY_MODE_DESC}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Port of Discharge</Form.Label>
                    <Form.Control
                      type="text"
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Port of Loading</Form.Label>
                    <Form.Control
                      type="text"
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
                <Col md={3}>
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

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Packing Slip No *</Form.Label>
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Invoice No *</Form.Label>
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
                <Col md={3}>
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
                <Col md={3}>
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
            </Card.Body>
          </Card>
          <Card className="my-4">
            <Card.Header>
              <h5>Select Purchase Orders</h5>
            </Card.Header>
            <Card.Body>
              <div
                className="ag-theme-alpine"
                style={{height: "300px", width: "100%"}}
              >
                <AgGridReact
                  ref={poGridRef}
                  key={currentSchedule.ATD_DATE || ""}
                  rowData={purchaseOrders}
                  columnDefs={poColumnDefs}
                  defaultColDef={defaultColDef}
                  rowSelection="multiple"
                  onSelectionChanged={(event) =>
                    handlePOSelectionChanged(event.api)
                  }
                  suppressRowClickSelection={true}
                />
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>List Item Purchsaer Order</h5>
                <Button
                  className="mx-3"
                  variant="success"
                  size="sm"
                  onClick={handleOpenItemConsume}
                >
                  Add Purchsae Order List
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {schedules.length > 0 ? (
                <div
                  className="ag-theme-alpine"
                  style={{height: "500px", width: "100%"}}
                >
                  <AgGridReact
                    rowData={deliveryScheduleList}
                    columnDefs={deliverySummaryLineColumnDefs}
                    pagination={true}
                  />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No List Item Purchsaer Order found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default DeliverySummaryList;
