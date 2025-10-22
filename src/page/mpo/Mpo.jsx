import React, {useEffect, useState} from "react";
import {AgGridReact} from "ag-grid-react";

import {FcAcceptDatabase, FcProcess} from "react-icons/fc";
import {Button, Card, Col, Form, Modal, Row} from "react-bootstrap";
import {toast} from "react-toastify";
import axios from "../../config/axios";
import moment from "moment";
import Swal from "sweetalert2";
import {printMpoToPdf} from "../../util/general";

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [mpoStatus, setMpoStatus] = useState("Open");
  const [orderPurchasingId, setOrderPurchasingId] = useState("");
  const [formData, setFormData] = useState({});
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);

  const [showRevModal, setShowRevModal] = useState(false);
  const [formRev, setFormRev] = useState({});

  const columnDefs = [
    {headerName: "PO ID", field: "ID", width: 120},
    {
      headerName: "Status",
      field: "MPO_STATUS",
      width: 120,
      cellStyle: (params) => {
        let color = "black";
        if (params.value === "Open") color = "blue";
        else if (params.value === "Accept") color = "green";
        else if (params.value === "Process") color = "orange";
        else if (params.value === "Done") color = "gray";
        return {color, backgroundColor: "white"};
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
    {
      headerName: "Created At",
      field: "CREATED_AT",
      width: 180,
      cellRenderer: (params) => params.value ? moment(params.value).format("DD-MM-YYYY HH:mm") : "",
    },
    {
      headerName: "Updated At",
      field: "UPDATED_AT",
      width: 180,
      cellRenderer: (params) => params.value ? moment(params.value).format("DD-MM-YYYY HH:mm") : "",
    },
  ];

  const itemColumnDefs = [
    {headerName: "Item ID", field: "MATERIAL_ITEM_ID", width: 120},
    {
      headerName: "Item Code/Description",
      field: "ITEM_CODE_DESCRIPTION",
      width: 200,
    },
    {
      headerName: "Supplier Item ID",
      field: "ITEM_SUPPLIER.ITEM_ID",
      width: 120,
      editable: (params) =>
        params.data?.ITEM_SUPPLIER
          ? !params.data?.ITEM_SUPPLIER?.ITEM_ID
          : false,
      cellEditor: "agNumberCellEditor",
      cellStyle: (params) => ({
        backgroundColor: params.data?.ITEM_SUPPLIER
          ? !params.data?.ITEM_SUPPLIER?.ITEM_ID
            ? "#fff3cd"
            : "white"
          : "white",
      }),
    },
    {
      headerName: "Supplier Item Code",
      field: "ITEM_SUPPLIER.CODE",
      width: 120,
      editable: (params) =>
        params.data?.ITEM_SUPPLIER ? !params.data?.ITEM_SUPPLIER?.CODE : false,
      cellEditor: "agNumberCellEditor",
      cellStyle: (params) => ({
        backgroundColor: params.data?.ITEM_SUPPLIER
          ? !params.data?.ITEM_SUPPLIER?.CODE
            ? "#fff3cd"
            : "white"
          : "white",
      }),
    },
    {headerName: "Item Type Code", field: "ITEM_TYPE_CODE", width: 120},
    {headerName: "Item Type Description", field: "ITEM_TYPE_DESC", width: 120},
    {headerName: "Item Category", field: "ITEM_CATEGORY", width: 120},
    {
      headerName: "Item Category Description",
      field: "ITEM_CATEGORY_DESC",
      width: 120,
    },
    {headerName: "Order Code", field: "ORDER_CODE", width: 120},
    {headerName: "Order Description", field: "ORDER_DESCRIPTION", width: 200},
    {headerName: "Color", field: "MATERIAL_ITEM_COLOR", width: 100},
    {headerName: "Size", field: "MATERIAL_ITEM_SIZE", width: 100},
    {headerName: "Serial", field: "MATERIAL_ITEM_SERIAL_NO", width: 100},
    {headerName: "UOM", field: "PURCHASE_UOM", width: 80},
    {headerName: "PO Qty", field: "PURCHASE_ORDER_QTY", width: 100},
    {headerName: "Unit Cost", field: "UNIT_COST", width: 120},
    {headerName: "Finance Cost", field: "FINANCE_COST", width: 120},
    {headerName: "Freight Cost", field: "FREIGHT_COST", width: 120},
    {headerName: "Other Cost", field: "OTHER_COST", width: 120},
    {headerName: "Total Unit Cost", field: "TOTAL_UNIT_COST", width: 120},
    {
      headerName: "Total Purchase Cost",
      field: "TOTAL_PURCHASE_COST",
      width: 120,
    },
  ];

  const fetchPurchaseOrders = async () => {
    try {
      const {data} = await axios.get("/purchase-order/main", {
        params: {
          MPO_STATUS: mpoStatus,
        },
      });
      if (data.status) {
        setPurchaseOrders(data.data || []);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch purchase orders"
      );
    }
  };

  const fetchPurchaseOrderById = async (id) => {
    try {
      const {data} = await axios.get(`/purchase-order/main/${id}`);
      if (data.status) {
        setFormData(data.data);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch purchase order detail"
      );
    }
  };

  const fetchPurchaseOrderItems = async (id) => {
    try {
      const {data} = await axios.get("/purchase-order/detail", {
        params: {PURCHASE_ORDER_ID: id},
      });
      if (data.status) {
        setPurchaseOrderList(data.data || []);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch purchase order items"
      );
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

  const handleRowDoubleClick = (id) => {
    fetchPurchaseOrderById(id);
    fetchPurchaseOrderItems(id);
    setOrderPurchasingId(id);
  };

  const handleBack = () => {
    setOrderPurchasingId("");
    setFormData({});
    setPurchaseOrderList([]);
    fetchPurchaseOrders();
  };

  const handleCellValueChanged = async (params) => {
    const {data} = params;
    if (!data.ITEM_SUPPLIER.ID) {
      toast.error("Item Supplier id not found");
      return;
    }

    try {
      await axios.put(`/master-item-supplier/${data.ITEM_SUPPLIER.ID}`, {
        ITEM_ID: data.ITEM_SUPPLIER.ITEM_ID,
        CODE: data.ITEM_SUPPLIER.CODE,
      });
      toast.success("Supplier info updated!");
      fetchPurchaseOrderItems(orderPurchasingId);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update supplier");
      fetchPurchaseOrderItems(orderPurchasingId);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!orderPurchasingId) return;

    const confirm = await Swal.fire({
      title: `Are you sure you want to change the status to ${status}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Continue!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) {
      return false;
    }

    try {
      await axios.put(`/purchase-order/main/${orderPurchasingId}`, {
        MPO_STATUS: status,
      });
      toast.success(`PO status updated to ${status}`);

      fetchPurchaseOrderById(orderPurchasingId);
      fetchPurchaseOrderItems(orderPurchasingId);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? `Failed to update status to ${status}`
      );
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    // eslint-disable-next-line
  }, [mpoStatus]);

  return (
    <div>
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

      {!orderPurchasingId ? (
        <>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by PO Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={mpoStatus}
                  onChange={(e) => setMpoStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="Accept">Accept</option>
                  <option value="Process">Process</option>
                  <option value="Done">Done</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleBack}>
                Back to Table
              </Button>
              <Button
                className="d-flex align-items-center gap-2"
                variant="success"
                size="sm"
                onClick={() => printMpoToPdf(formData, purchaseOrderList)}
              >
                Print to pdf
              </Button>
            </div>
            <div className="d-flex gap-2">
              {formData?.MPO_STATUS === "Open" && (
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="success"
                  size="sm"
                  onClick={() => handleUpdateStatus("Accept")}
                >
                  <FcAcceptDatabase style={{width: 17, height: 17}} /> Set to
                  Accept
                </Button>
              )}
              {formData?.MPO_STATUS === "Accept" && (
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="warning"
                  size="sm"
                  onClick={() => handleUpdateStatus("Process")}
                >
                  <FcProcess style={{width: 17, height: 17}} /> Set to Process
                </Button>
              )}
            </div>
          </div>

          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>PO No.</Form.Label>
                    <Form.Control size="sm" value={formData?.ID} disabled />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Revisi No.</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData?.REV_ID || 0}
                      readOnly
                      onClick={onOpenRevDetail}
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
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header>
                  <b>Vendor</b>
                </Card.Header>
                <Card.Body>
                  {formData?.VENDOR_DETAIL ? (
                    <>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.VENDOR_DETAIL.VENDOR_NAME || ""}
                          disabled
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.VENDOR_DETAIL.VENDOR_ADDRESS_1 || ""}
                          disabled
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Attn</Form.Label>
                        <Form.Control
                          size="sm"
                          value={`${
                            formData.VENDOR_DETAIL.VENDOR_CONTACT_NAME || ""
                          } / ${
                            formData.VENDOR_DETAIL.VENDOR_CONTACT_POSITION || ""
                          }`}
                          disabled
                        />
                      </Form.Group>
                      <Row>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Tel.</Form.Label>
                            <Form.Control
                              size="sm"
                              value={formData.VENDOR_DETAIL.VENDOR_PHONE || ""}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Fax</Form.Label>
                            <Form.Control
                              size="sm"
                              value={formData.VENDOR_DETAIL.VENDOR_FAX || ""}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          size="sm"
                          value={
                            formData.VENDOR_DETAIL.VENDOR_CONTACT_EMAIL || ""
                          }
                          disabled
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <p>No vendor detail available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="mb-3">
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
                        <Form.Label>Country Name</Form.Label>
                        <Form.Control
                          size="sm"
                          value={formData.COUNTRY_NAME || ""}
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
            </Col>
          </Row>

          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Payment Term</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData.PAYMENT_TERM_NAME || ""}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Payment Reference</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData.PAYMENT_REFERENCE || ""}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Surcharge Amount</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData?.SURCHARGE_AMOUNT || "0.00"}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tax Percentage</Form.Label>
                    <Form.Control
                      size="sm"
                      value={`${formData?.TAX_PERCENTAGE} %` || "0%"}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="mt-3">
                  <Form.Group>
                    <Form.Label>Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.NOTE || ""}
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <b>Items</b>
            </Card.Header>
            <Card.Body>
              <div
                className="ag-theme-alpine"
                style={{height: "400px", width: "100%"}}
              >
                <AgGridReact
                  rowData={purchaseOrderList}
                  columnDefs={itemColumnDefs}
                  enableCellTextSelection={true}
                  onCellValueChanged={handleCellValueChanged}
                />
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
