import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../config/axios'; 

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [mpoStatus, setMpoStatus] = useState("Open"); 
  const [orderPurchasingId, setOrderPurchasingId] = useState("");
  const [formData, setFormData] = useState({});
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);

  
  const columnDefs = [
    { headerName: "PO ID", field: "ID", width: 120 },
    { headerName: "Rev No", field: "REV_ID", width: 100 },
    { headerName: "PO Date", field: "MPO_DATE", width: 120 },
    { headerName: "Vendor ID", field: "VENDOR_ID", width: 120 },
    { headerName: "Company ID", field: "COMPANY_ID", width: 120 },
    { headerName: "Currency", field: "CURRENCY_CODE", width: 100 },
    { headerName: "Tax %", field: "TAX_PERCENTAGE", width: 100 },
    { headerName: "Surcharge", field: "SURCHARGE_AMOUNT", width: 120 },
    {
      headerName: "Status",
      field: "MPO_STATUS",
      width: 120,
      cellStyle: (params) => {
        let color = 'black';
        if (params.value === 'Open') color = 'blue';
        else if (params.value === 'Accept') color = 'green';
        else if (params.value === 'Process') color = 'orange';
        else if (params.value === 'Done') color = 'gray';
        return { color, backgroundColor: 'white' };
      }
    },
    { headerName: "Created At", field: "CREATED_AT", width: 180 },
    { headerName: "Updated At", field: "UPDATED_AT", width: 180 },
  ];

  
  const itemColumnDefs = [
    { headerName: "Item ID", field: "MATERIAL_ITEM_ID", width: 120 },
    { headerName: "Item Code/Description", field: "ITEM_CODE_DESCRIPTION", width: 200 },
    { headerName: "Item Type Code", field: "ITEM_TYPE_CODE", width: 120 },
    { headerName: "Item Category", field: "ITEM_CATEGORY", width: 120 },
    { headerName: "Order Code", field: "ORDER_CODE", width: 120 },
    { headerName: "Order Description", field: "ORDER_DESCRIPTION", width: 200 },
    { headerName: "Color", field: "MATERIAL_ITEM_COLOR", width: 100 },
    { headerName: "Size", field: "MATERIAL_ITEM_SIZE", width: 100 },
    { headerName: "Serial", field: "MATERIAL_ITEM_SERIAL_NO", width: 100 },
    { headerName: "UOM", field: "PURCHASE_UOM", width: 80 },
    { headerName: "PO Qty", field: "PURCHASE_ORDER_QTY", width: 100 },
    { headerName: "Unit Cost", field: "UNIT_COST", width: 120 },
    { headerName: "Finance Cost", field: "FINANCE_COST", width: 120 },
    { headerName: "Freight Cost", field: "FREIGHT_COST", width: 120 },
    { headerName: "Other Cost", field: "OTHER_COST", width: 120 },
    { headerName: "Total Unit Cost", field: "TOTAL_UNIT_COST", width: 120 },
    { headerName: "Total Purchase Cost", field: "TOTAL_PURCHASE_COST", width: 120 },
  ];

  
  const fetchPurchaseOrders = async () => {
    try {
      const { data } = await axios.get('/purchase-order/main', {
        params: {
          MPO_STATUS: mpoStatus 
        }
      });
      if (data.status) {
        setPurchaseOrders(data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to fetch purchase orders");
    }
  };

  
  const fetchPurchaseOrderById = async (id) => {
    try {
      const { data } = await axios.get(`/purchase-order/main/${id}`);
      if (data.status) {
        setFormData(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to fetch purchase order detail");
    }
  };

  
  const fetchPurchaseOrderItems = async (id) => {
    try {
      const { data } = await axios.get('/purchase-order/detail', {
        params: { PURCHASE_ORDER_ID: id }
      });
      if (data.status) {
        setPurchaseOrderList(data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to fetch purchase order items");
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

  
  const handleUpdateStatus = async (status) => {
    if (!orderPurchasingId) return;

    try {
      await axios.put(`/purchase-order/main/${orderPurchasingId}`, { MPO_STATUS: status });
      toast.success(`PO status updated to ${status}`);
      
      fetchPurchaseOrderById(orderPurchasingId);
    } catch (err) {
      toast.error(err.response?.data?.message ?? `Failed to update status to ${status}`);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    // eslint-disable-next-line
  }, [mpoStatus]); 

  return (
    <div>
      {!orderPurchasingId ? (
        <>
          {/* Filter Status */}
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

          {/* Tabel Utama */}
          <div className="ag-theme-alpine" style={{ height: "95vh", width: "100%" }}>
            <AgGridReact
              rowData={purchaseOrders}
              columnDefs={columnDefs}
              pagination={true}
              rowSelection="single"
              onRowDoubleClicked={(params) => handleRowDoubleClick(params.data.ID)}
            />
          </div>
        </>
      ) : (
        <div>
          {/* Tombol Back & Update Status */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="secondary" size="sm" onClick={handleBack}>
              Back to Table
            </Button>
            <div className="d-flex gap-2">
              {formData?.MPO_STATUS === "Open" && (
                <Button variant="success" size="sm" onClick={() => handleUpdateStatus("Accept")}>
                  Set to Accept
                </Button>
              )}
              {formData?.MPO_STATUS === "Accept" && (
                <Button variant="warning" size="sm" onClick={() => handleUpdateStatus("Process")}>
                  Set to Process
                </Button>
              )}
              {formData?.MPO_STATUS === "Process" && (
                <Button variant="info" size="sm" onClick={() => handleUpdateStatus("Done")}>
                  Set to Done
                </Button>
              )}
            </div>
          </div>

          {/* Header PO */}
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
                    <Form.Control size="sm" value={formData?.REV_ID || 0} disabled />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control size="sm" value={formData?.MPO_DATE} disabled />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>PO Status</Form.Label>
                    <Form.Control size="sm" value={formData?.MPO_STATUS} disabled />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Detail Vendor */}
          <Row>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header><b>Vendor</b></Card.Header>
                <Card.Body>
                  {formData?.VENDOR_DETAIL ? (
                    <>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control size="sm" value={formData.VENDOR_DETAIL.VENDOR_NAME || ''} disabled />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Address</Form.Label>
                        <Form.Control size="sm" value={formData.VENDOR_DETAIL.VENDOR_ADDRESS_1 || ''} disabled />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Attn</Form.Label>
                        <Form.Control size="sm" value={`${formData.VENDOR_DETAIL.VENDOR_CONTACT_NAME || ''} / ${formData.VENDOR_DETAIL.VENDOR_CONTACT_POSITION || ''}`} disabled />
                      </Form.Group>
                      <Row>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Tel.</Form.Label>
                            <Form.Control size="sm" value={formData.VENDOR_DETAIL.VENDOR_PHONE || ''} disabled />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Fax</Form.Label>
                            <Form.Control size="sm" value={formData.VENDOR_DETAIL.VENDOR_FAX || ''} disabled />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control size="sm" value={formData.VENDOR_DETAIL.VENDOR_CONTACT_EMAIL || ''} disabled />
                      </Form.Group>
                    </>
                  ) : (
                    <p>No vendor detail available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Detail Invoice */}
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header><b>Invoice Detail</b></Card.Header>
                <Card.Body>
                  {formData?.INVOICE_DETAIL ? (
                    <>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control size="sm" value={formData.INVOICE_DETAIL.INVOICE_COMPANY_NAME || ''} disabled />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Address</Form.Label>
                        <Form.Control size="sm" value={formData.INVOICE_DETAIL.INVOICE_ADDRESS || ''} disabled />
                      </Form.Group>
                      <Row>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Tel.</Form.Label>
                            <Form.Control size="sm" value={formData.INVOICE_DETAIL.INVOICE_PHONE || ''} disabled />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-2">
                            <Form.Label>Fax</Form.Label>
                            <Form.Control size="sm" value={formData.INVOICE_DETAIL.INVOICE_FAX || ''} disabled />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control size="sm" value={formData.INVOICE_DETAIL.INVOICE_EMAIL || ''} disabled />
                      </Form.Group>
                    </>
                  ) : (
                    <p>No invoice detail available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Detail Delivery (dari PurchaseOrderNoteModel) */}
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header><b>Delivery Detail</b></Card.Header>
                <Card.Body>
                  <Row>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>ETD Date</Form.Label>
                        <Form.Control size="sm" value={formData.MPO_ETD || ''} disabled />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>ETA Date</Form.Label>
                        <Form.Control size="sm" value={formData.MPO_ETA || ''} disabled />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-2">
                    <Form.Label>Delivery Mode</Form.Label>
                    <Form.Control size="sm" value={formData.DELIVERY_MODE_CODE || ''} disabled />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Delivery Term</Form.Label>
                    <Form.Control size="sm" value={formData.DELIVERY_TERM || ''} disabled />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Country ID</Form.Label>
                    <Form.Control size="sm" value={formData.COUNTRY_ID || ''} disabled />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Port of Discharge</Form.Label>
                    <Form.Control size="sm" value={formData.PORT_DISCHARGE || ''} disabled />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Delivery Unit</Form.Label>
                    <Form.Control size="sm" value={formData.DELIVERY_UNIT || ''} disabled />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Warehouse</Form.Label>
                    <Form.Control size="sm" value={formData.WAREHOUSE_NAME || ''} disabled />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Payment & Note */}
          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Payment Term</Form.Label>
                    <Form.Control size="sm" value={formData.PAYMENT_TERM_NAME || ''} disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Payment Reference</Form.Label>
                    <Form.Control size="sm" value={formData.PAYMENT_REFERENCE || ''} disabled />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Surcharge</Form.Label>
                    <Form.Control size="sm" value={formData?.SURCHARGE_AMOUNT || '0.00'} disabled />
                  </Form.Group>
                </Col>
                <Col md={12} className="mt-3">
                  <Form.Group>
                    <Form.Label>Note</Form.Label>
                    <Form.Control as="textarea" rows={2} value={formData.NOTE || ''} disabled />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Items */}
          <Card>
            <Card.Header>
              <b>Items</b>
            </Card.Header>
            <Card.Body>
              <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }}>
                <AgGridReact
                  rowData={purchaseOrderList}
                  columnDefs={itemColumnDefs}
                  enableCellTextSelection={true}
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