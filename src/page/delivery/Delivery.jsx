import React, {useEffect, useRef, useState} from "react";
import {AgGridReact} from "ag-grid-react";
import {Pie} from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";
import * as XLSX from "xlsx";

import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";

import {GrTrash, GrAdd} from "react-icons/gr";
import {toast} from "react-toastify";
import axios from "../../config/axios";
import Swal from "sweetalert2";
import {colorListSummary, defaultColDef} from "../../util/general";
import "./delivery.css";
import moment from "moment/moment";

ChartJS.register(ArcElement, Tooltip, Legend);

const DeliverySummaryList = () => {
  const poGridRef = useRef(null);

  const [schedules, setSchedules] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState([]);

  const [packingList, setPackingList] = useState([]);

  const [selectedPurchaseOrders, setSelectedPurchaseOrders] = useState([]);
  const [showNotConsumeModal, setShowNotConsumeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [notConsumedItems, setNotConsumedItems] = useState([]);

  const [modalShow, setModalShow] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [deliveryScheduleList, setDeliveryScheduleList] = useState([]);
  const [packingListSummary, setPackingListSummary] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

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
    PACKING_SLIP_NO: "",
    INVOICE_NO: "",
    DELIVERY_NOTE: "",
    FORWARDER_NOTE: "",
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
      headerName: "Supplier Item Id",
      field: "ITEM_ID",
      width: 150,
      editable: false,
    },
    {
      headerName: "Supplier Item Code",
      field: "SUPPLIER_CODE",
      width: 200,
      editable: false,
    },
    {
      headerName: "Supplier Item Desc",
      field: "SUPPLIER_DESCRIPTION",
      width: 200,
      editable: false,
    },
    {
      headerName: "Dim ID",
      field: "MATERIAL_ITEM_DIM_ID",
      width: 100,
      cellStyle: {fontWeight: "bold"},
    },
    {
      headerName: "Color",
      field: "MATERIAL_ITEM_COLOR",
      width: 100,
      cellStyle: {fontWeight: "bold"},
    },
    {
      headerName: "Size",
      field: "MATERIAL_ITEM_SIZE",
      width: 100,
      cellStyle: {fontWeight: "bold"},
    },
    {
      headerName: "Serial NO",
      field: "MATERIAL_ITEM_SERIAL_NO",
      width: 130,
      cellStyle: {fontWeight: "bold"},
    },
    {
      headerName: "Purchase OUM",
      field: "PURCHASE_UOM",
      width: 100,
      cellStyle: {fontWeight: "bold"},
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
      headerName: "Allocate Qty",
      field: "INPUT_QUANTITY",
      width: 120,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellStyle: {backgroundColor: "#fff3cd"},
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

  const packingListColumnDefs = [
    {
      headerName: "Purchase Order ID",
      field: "DELIVERY_SUMMARY_LIST.PURCHASE_ORDER_DETAIL.PURCHASE_ORDER_ID",
      width: 130,
    },
    {
      headerName: "ITEM ID",
      field: "ITEM.ITEM_ID",
      width: 130,
    },
    {
      headerName: "ITEM CODE",
      field: "ITEM.CODE",
      width: 130,
    },
    {
      headerName: "Dim ID",
      field: "DELIVERY_SUMMARY_LIST.PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_DIM_ID",
      width: 250,
    },
    {
      headerName: "SIZE",
      field: "DELIVERY_SUMMARY_LIST.PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_SIZE",
      width: 250,
    },
    {
      headerName: "COLOR",
      field: "DELIVERY_SUMMARY_LIST.PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_COLOR",
      width: 150,
    },
    {
      headerName: "PACK",
      field: "PACK",
      width: 150,
    },
    {
      headerName: "Quantity / PCS",
      field: "QUANTITY",
      width: 150,
    },
  ];

  const deliverySummaryLineColumnDefs = [
    {
      headerName: "MPO ID",
      field: "PURCHASE_ORDER_DETAIL.PURCHASE_ORDER_ID",
      width: 130,
    },
    {
      headerName: "Item Description",
      field: "PURCHASE_ORDER_DETAIL.ITEM_CODE_DESCRIPTION",
      width: 250,
    },
    {
      headerName: "Supplier Item ID",
      field: "PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.ITEM_ID",
      width: 150,
      editable: (params) =>
        !params.data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.IS_ITEM_ID,
      cellStyle: (params) => ({
        backgroundColor: !params.data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.IS_ITEM_ID ? "#fff3cd" : "white",
      }),
    },
    {
      headerName: "Supplier Item Code",
      field: "PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.CODE",
      width: 150,
      editable: (params) =>
        !params.data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.IS_CODE,
      cellStyle: (params) => ({
        backgroundColor: !params.data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.IS_CODE ? "#fff3cd" : "white",
      }),
    },
    {
      headerName: "Supplier Item Description",
      field: "PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.DESCRIPTION",
      width: 150,
      editable: (params) =>
        !params.data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.IS_DESCRIPTION,
      cellStyle: (params) => ({
        backgroundColor: !params.data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.IS_DESCRIPTION ? "#fff3cd" : "white",
      }),
    },
    {
      headerName: "Dim ID",
      field: "PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_DIM_ID",
      width: 100,
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
      headerName: "Serial NO",
      field: "PURCHASE_ORDER_DETAIL.MATERIAL_ITEM_SERIAL_NO",
      width: 90,
    },
    {
      headerName: "UOM",
      field: "PURCHASE_ORDER_DETAIL.PURCHASE_UOM",
      width: 80,
    },
    {
      headerName: "Required Quantity",
      field: "PURCHASE_ORDER_QTY",
      width: 120,
      cellStyle: {backgroundColor: "#90EE90", fontWeight: "bold"},
    },
    {
      headerName: "Send Quantity",
      field: "QUANTITY",
      width: 120,
      cellStyle: {color: "green", fontWeight: "bold"},
    },
    {
      headerName: "Balance Quantity",
      field: "BALANCE_QUANTITY",
      width: 120,
      cellStyle: (params) => ({color: !!Number(params.data.BALANCE_QUANTITY)  && "red", fontWeight: "bold"}),
    },
  ];

  const scheduleColumnDefs = [
    {headerName: "ATD", field: "ATD_DATE", width: 120},
    {headerName: "ATA", field: "ATA_DATE", width: 120},
    {headerName: "Delivery Mode", field: "DELIVERY_MODE", width: 150},
    {headerName: "Port Of Discharge", field: "PORT_OF_DISCHARGE", width: 150},
    {headerName: "Port Of Loading", field: "PORT_OF_LOADING", width: 150},
    {headerName: "Packing Slip No", field: "PACKING_SLIP_NO", width: 150},
    {headerName: "Invoice No", field: "INVOICE_NO", width: 150},
    {headerName: "Delivery Note", field: "DELIVERY_NOTE", width: 150},
    {headerName: "Created By", field: "CREATED.INITIAL", width: 150},
    {
      headerName: "Created Date",
      field: "CREATED_AT",
      width: 150,
      cellRenderer: (params) => moment(params.value).format("DD-MM-YYYY HH:mm"),
    },
    {headerName: "Updated By", field: "UPDATED.INITIAL", width: 150},
    {
      headerName: "Updated Date",
      field: "UPDATED_AT",
      width: 150,
      cellRenderer: (params) => moment(params.value).format("DD-MM-YYYY HH:mm"),
    },
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

      setDeliveryScheduleList(
        data.data.map((item) => ({
          ...item,
          PURCHASE_ORDER_DETAIL: {
            ...item.PURCHASE_ORDER_DETAIL,
            MASTER_ITEM_SUPPLIER: {
              ...item.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER,
              IS_ITEM_ID: !!item.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.ITEM_ID,
              IS_CODE: !!item.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.CODE,
              IS_DESCRIPTION: !!item.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.DESCRIPTION,
            },
          },
        }))
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch delivery schedules"
      );
    }
  };

  const fetchPackingList = async (deliverySummaryId) => {
    if (!deliverySummaryId) return;
    try {
      const {data} = await axios.get("/packing/list", {
        params: {
          DELIVERY_SUMMARY_ID: deliverySummaryId,
        },
      });
      if (data.data.length) {
        setCurrentSchedule({
          ...currentSchedule,
          PACK_ALREADY: true,
        });
      }

      setPackingList(data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to fetch packing list"
      );
      setPackingList([]);
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

  const importExcelPackingList = async (file) => {
    if (!file) return;
    if (!currentSchedule?.ID) {
      toast.warn("Please save the schedule first");
      return;
    }

    setLoading2(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: "array"});
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const requiredColumns = [
        "Box Seq/No",
        "MPO ID",
        "Supplier Item ID",
        "Dim ID",
        "Pack",
        "PCS",
      ];
      const missingColumns = requiredColumns.filter(
        (col) => !jsonData[0]?.hasOwnProperty(col)
      );
      if (missingColumns.length > 0) {
        setLoading2(false);
        toast.error(`Missing required columns: ${missingColumns.join(", ")}`);
        return;
      }

      const transformedData = jsonData
        .map((row) => ({
          BOX_SEQ: row["Box Seq/No"],
          MPO_ID: row["MPO ID"],
          ITEM_ID: row["Supplier Item ID"],
          DIM_ID: row["Dim ID"],
          SIZE: row["Size"],
          COLOR: row["Color"],
          UOM: row["UOM"],
          PACK: row["Pack"],
          QTY: parseFloat(row["PCS"]) || 0,
          BARCODE_CODE: row["Barcode / QR Code Box"],
        }))
        .filter((item) => item.BOX_SEQ && item.MPO_ID && item.ITEM_ID);

      if (transformedData.length === 0) {
        setLoading2(false);
        toast.warn("No valid data found in the file");
        return;
      }

      try {
        await axios.post("/packing/list/bulk", {
          DELIVERY_SUMMARY_ID: currentSchedule.ID,
          LIST_DETAIL: transformedData,
        });
        toast.success("Packing list imported successfully!");
        setLoading2(false);
        fetchPackingList(currentSchedule.ID);
      } catch (err) {
        setLoading2(false);
        toast.error(err.response?.data?.message ?? "Failed to import excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e) => {
    if (loading) {
      toast.warn("Proccess file stil running, please wait");
      return;
    }
    const file = e.target.files[0];
    if (file) {
      importExcelPackingList(file);
      e.target.value = null;
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
      setLoading(false);
      setTimeout(() => {
        fetchDeliverySummariesList(currentSchedule.ID);
      }, 400);
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

  const openDetailModal = (packingListData) => {
    setModalData(packingListData);
    setModalShow(true);
  };

  const handleDelete = async (id) => {
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
      await axios.delete(`/packing/list/${id}`);
      toast.success("Packing list deleted successfully");
      fetchPackingList(currentSchedule.ID);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? "Failed to delete packing list"
      );
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
        const {data: respData} = await axios.put(
          `/v2/delivery/summary-list/${currentSchedule.ID}`,
          {PURCHASE_ORDER_LIST: selectedPurchaseOrders.map((item) => item.ID)}
        );
        if (respData.data) {
          const confirm = await Swal.fire({
            title: "Change MPO?",
            html: "An MPO is already active.<br><strong>If you proceed, the current MPO data will be permanently lost.</strong>",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Change MPO!",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            reverseButtons: true,
          });
          setLoading(false);
          if (!confirm.isConfirmed) return;
        }

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
      return response?.ID;
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message ?? "Operation failed");
      return null;
    }
  };

  const handleOpenItemConsume = async () => {
    if (selectedPurchaseOrders.length === 0) {
      toast.warn("Please select at least one Purchase Order");
      return;
    }

    try {
      const idReq = await handleSave();
      if (!idReq) return;
      await fetchItemNotCounsume(idReq);
      setShowNotConsumeModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to open modal");
    }
  };

  const fetchItemNotCounsume = async (id) => {
    try {
      const {data} = await axios.get("/purchase-order/detail-delivery", {
        params: {DELIVERY_SUMMARY_ID: id},
      });

      const itemsWithInputs = data.data.map((item) => ({
        ...item,
        INPUT_QUANTITY: item.QUANTITY_USED || 0,
      }));

      setNotConsumedItems(itemsWithInputs);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to fetch items");
      setNotConsumedItems([]);
    }
  };

  const fetchDeliveryBalance = async (id) => {
    try {
      const {data} = await axios.get("/packing/list-balance", {
        params: {DELIVERY_SUMMARY_ID: id},
      });

      setPackingListSummary(data.data);
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

  const handleCellValueChanged2 = async (params) => {
    const {data} = params;
    try {
      await axios.put(
        `/master-item-supplier/${data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.ID}`,
        {
          ITEM_ID: data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.ITEM_ID,
          CODE: data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.CODE,
          DESCRIPTION:
            data.PURCHASE_ORDER_DETAIL.MASTER_ITEM_SUPPLIER.DESCRIPTION,
        }
      );

      toast.success("Supplier updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update supplier");
    }
    fetchDeliverySummariesList(currentSchedule.ID);
  };

  const exportToExcel = () => {
    if (!deliveryScheduleList || deliveryScheduleList.length === 0) {
      toast.warn("No data to export");
      return;
    }

    const exportData = deliveryScheduleList.map((item) => ({
      "MPO ID": item.PURCHASE_ORDER_DETAIL?.PURCHASE_ORDER_ID || "",
      "Item Description":
        item.PURCHASE_ORDER_DETAIL?.ITEM_CODE_DESCRIPTION || "",
      "Supplier Item ID":
        item.PURCHASE_ORDER_DETAIL?.MASTER_ITEM_SUPPLIER?.ITEM_ID || "",
      "Supplier Item Code":
        item.PURCHASE_ORDER_DETAIL?.MASTER_ITEM_SUPPLIER?.CODE || "",
      "Supplier Item Description":
        item.PURCHASE_ORDER_DETAIL?.MASTER_ITEM_SUPPLIER?.DESCRIPTION || "",
      "Dim ID": item.PURCHASE_ORDER_DETAIL?.MATERIAL_ITEM_DIM_ID || "",
      Color: item.PURCHASE_ORDER_DETAIL?.MATERIAL_ITEM_COLOR || "",
      Size: item.PURCHASE_ORDER_DETAIL?.MATERIAL_ITEM_SIZE || "",
      UOM: item.PURCHASE_ORDER_DETAIL?.PURCHASE_UOM || "",
      Quantity: item.QUANTITY || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Delivery Summary");

    XLSX.writeFile(wb, `Delivery Summary Required, INV_${currentSchedule.INVOICE_NO}.xlsx`);
  };

  const exportToExcelPackingList = () => {
    let exportData = [];

    packingList.forEach((box) => {
      console.log("box.PACKING_LIST_DETAILS ", box.PACKING_LIST_DETAILS);
      
      if (box.PACKING_LIST_DETAILS && box.PACKING_LIST_DETAILS.length > 0) {
        box.PACKING_LIST_DETAILS.forEach((detail) => {
          exportData.push({
            "Box Seq/No": box.SEQUENCE,
            "Barcode / QR Code Box": box.BARCODE_CODE || "",
            "MPO ID": detail.PURCHASE_ORDER_ID || "",
            "Supplier Item ID": detail.SUPPLIER_ITEM_ID || "",
            "Dim ID": detail.DIM_ID,
            Color: "",
            Size: "",
            OUM: "",
            PACK: detail.PACK || 0,
            PCS: detail.QUANTITY || 0,
          });
        });
      } else {
        exportData.push({
          "Box Seq/No": box.SEQUENCE,
          "Barcode / QR Code Box": box.BARCODE_CODE || "",
          "MPO ID": "",
          "Supplier Item ID": "",
          "Dim ID": "",
          Color: "",
          Size: "",
          OUM: "",
          Pack: "",
          PCS: "",
        });
      }
    });

    if (!packingList.length) {
      exportData = [
        {
          "Box Seq/No": "",
          "Barcode / QR Code Box": "",
          "MPO ID": "",
          "Supplier Item ID": "",
          "Dim ID": "",
          Color: "",
          Size: "",
          OUM: "",
          Pack: "",
          PCS: "",
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOX");

    XLSX.writeFile(
      wb,
      `Template Packing List INV: ${currentSchedule.INVOICE_NO}.xlsx`
    );
  };

  const handleBack = () => {
    setShowForm(false);
    resetForm();
  };

  const changeTab = (e) => {
    if (e === "packing-list") {
      if (!currentSchedule?.ID) {
        toast.error("Create Dlivery Schedule First");
        return;
      }
      fetchDeliveryBalance(currentSchedule?.ID);
      fetchPackingList(currentSchedule?.ID);
    }
    setActiveTab(e);
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
      PACKING_SLIP_NO: "",
      INVOICE_NO: "",
      DELIVERY_NOTE: "",
      FORWARDER_NOTE: "",
      CONTAINER_NOTE: "",
    });
    setActiveTab("summary");
    setSchedules([]);
    setPurchaseOrders([]);
    setSelectedPurchaseOrders([]);
    setNotConsumedItems([]);
    setDeliveryScheduleList([]);
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
      if (!api) return;
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
    // eslint-disable-next-line
  }, [purchaseOrders]);

 const calculateSummary = () => {
  if (!deliveryScheduleList || deliveryScheduleList.length === 0) {
    return {labels: [], data: [], total: 0, balanceData: []};
  }

  const grouped = deliveryScheduleList.reduce((acc, item) => {
    const itemId =
      item.PURCHASE_ORDER_DETAIL?.MASTER_ITEM_SUPPLIER?.ITEM_ID || "Unknown";
    const dimId =
      item.PURCHASE_ORDER_DETAIL?.MATERIAL_ITEM_DIM_ID || "Unknown";
    const key = `${itemId} (${dimId})`;

    if (!acc[key]) {
      acc[key] = {scheduledQty: 0, itemId, dimId};
    }
    acc[key].scheduledQty += item.QUANTITY || 0;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const data = labels.map((label) => grouped[label].scheduledQty);
  const total = data.reduce((sum, qty) => sum + qty, 0);

  const balanceData = labels.map((label) => {
    const {itemId, dimId} = grouped[label];
    const scheduledQty = grouped[label].scheduledQty;

    let packedQty = 0;
    packingListSummary.forEach((p) => {
      const pItemId = p.ITEM?.ITEM_ID;
      const pDimId =
        p.DELIVERY_SUMMARY_LIST?.PURCHASE_ORDER_DETAIL?.MATERIAL_ITEM_DIM_ID;

        
      if (pItemId === itemId && pDimId === dimId) {
        packedQty += p.TOTAL_QUANTITY || 0;
      }
    });

    const balance = scheduledQty - packedQty;
    return {label, itemId, dimId, scheduledQty, packedQty, balance};
  });

  return {labels, data, total, balanceData};
};
  const summaryData = calculateSummary();

  return (
    <div className="container-fluid">
      <input
        id="fileInput"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{display: "none"}}
      />
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="modal-detail-title"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="modal-detail-title">
            Packing List Details: {modalData?.SEQUENCE}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData ? (
            <>
              <div className="mb-3">
                <h6>General Information</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Sequence:</strong>
                      </td>
                      <td>{modalData.SEQUENCE}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Delivery Summary ID:</strong>
                      </td>
                      <td>{modalData.DELIVERY_SUMMARY_ID}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Created At:</strong>
                      </td>
                      <td>{new Date(modalData.CREATED_AT).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Created By:</strong>
                      </td>
                      <td>{modalData.CREATED_ID || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Updated At:</strong>
                      </td>
                      <td>
                        {modalData.UPDATED_AT
                          ? new Date(modalData.UPDATED_AT).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Updated By:</strong>
                      </td>
                      <td>{modalData.UPDATED_ID || "N/A"}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div>
                <h6>Items in This Packing List</h6>
                <Table striped bordered hover size="sm">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Supplier Item ID</th>
                      <th>Size</th>
                      <th>Code</th>
                      <th>Pack</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.PACKING_LIST_DETAILS &&
                    modalData.PACKING_LIST_DETAILS.length > 0 ? (
                      modalData.PACKING_LIST_DETAILS.map((item) => (
                        <tr key={item.ID}>
                          <td>{item.ID}</td>
                          <td>{item.SUPPLIER_ITEM_ID}</td>
                          <td>{item.SIZE || "N/A"}</td>
                          <td>{item.CODE || "N/A"}</td>
                          <td>{item.PACK || "N/A"}</td>
                          <td>{item.QUANTITY}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDelete(modalData?.ID);
              setModalShow(false);
            }}
          >
            Delete Packing List
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
                    <Form.Label>Forwarder Note</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentSchedule.FORWARDER_NOTE}
                      onChange={(e) =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          FORWARDER_NOTE: e.target.value,
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
            </Card.Body>
          </Card>
          <Tabs
            activeKey={activeTab}
            id="sourcing-tabs"
            className="my-3"
            onSelect={(e) => changeTab(e)}
          >
            <Tab eventKey="summary" title="Summary">
              {!currentSchedule.PACK_ALREADY && (
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
              )}
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>List Item Purchsaer Order</h5>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={exportToExcel}
                      >
                        Export Excel
                      </Button>
                      {!currentSchedule.PACK_ALREADY && (
                        <Button
                          className="mx-3"
                          variant="success"
                          size="sm"
                          onClick={handleOpenItemConsume}
                        >
                          Save & Add Purchsae Order List
                        </Button>
                      )}
                    </div>
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
                        defaultColDef={defaultColDef}
                        pagination={true}
                        enableCellTextSelection={true}
                        onCellValueChanged={handleCellValueChanged2}
                        stopEditingWhenCellsLoseFocus={true}
                        singleClickEdit={true}
                        suppressClickEdit={false}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p>No List Item Purchsaer Order found.</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="packing-list" title="Packing List">
              <Card className="my-4">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center my-1">
                    <h5>Box List</h5>
                    <div className="d-flex gap-3 align-items-center">
                      <Button size="sm" onClick={exportToExcelPackingList}>
                        Export Template Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        disabled={loading2}
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                      >
                        {loading2 ? (
                          <Spinner
                            animation="border"
                            variant="warning"
                            size="sm"
                          />
                        ) : (
                          "Import Excel (Replace all And Bulk Create)"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Container fluid>
                    <Row>
                      <Col md={8}>
                        <div className="d-flex flex-wrap gap-3">
                          {packingList && packingList.length > 0 ? (
                            packingList.map((box, idx) => (
                              <Card
                                key={idx}
                                className="shadow-sm"
                                style={{width: "100%", cursor: "pointer"}}
                              >
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <Card.Title className="text-primary">
                                        Box Seq {box.SEQUENCE}
                                      </Card.Title>
                                      <Card.Subtitle className="mb-2">
                                        Barcode / QR CODE:{" "} {box.BARCODE_CODE || "-"}
                                      </Card.Subtitle>
                                      <Row style={{width: '350px'}}>
                                        <Col sm="6">
                                        <Card.Subtitle className="mb-2 text-muted">
                                          Total Pack:{" "} {box.PACKING_LIST_DETAILS.reduce((sum, item) => sum + Number(item.PACK), 0)}
                                        </Card.Subtitle>
                                        </Col>
                                        <Col sm="6">
                                        <Card.Subtitle className="mb-2 text-muted">
                                          Total Quantity:{" "} {box.PACKING_LIST_DETAILS.reduce((sum, item) => sum + Number(item.QUANTITY), 0)}
                                        </Card.Subtitle>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div>
                                      <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => openDetailModal(box)}
                                      >
                                        Watch
                                      </button>

                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(box.ID)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>

                                  <Card.Text>
                                    <strong>Created Date:</strong>{" "}
                                    {new Date(box.CREATED_AT).toLocaleString()}
                                  </Card.Text>
                                  <hr />
                                  <div
                                    className="ag-theme-alpine"
                                    style={{height: "200px", width: "100%"}}
                                  >
                                    <AgGridReact
                                      columnDefs={packingListColumnDefs}
                                      rowData={box.PACKING_LIST_DETAILS}
                                    />
                                  </div>
                                </Card.Body>
                              </Card>
                            ))
                          ) : (
                            <div className="w-100 text-center py-5">
                              <div className="d-flex flex-column align-items-center justify-content-center">
                                <div style={{fontSize: "3rem", color: "#ccc"}}>
                                  📦
                                </div>
                                <h5 className="text-muted mt-3">
                                  No Packing Lists Found
                                </h5>
                                <p className="text-muted">
                                  There are currently no packing lists for this
                                  delivery schedule.
                                </p>
                                <p className="text-muted">
                                  Please import a packing list using the "Import
                                  Excel" button.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col md={4}>
                        <h5>List item Required</h5>
                        {summaryData.labels.length > 0 ? (
                          <>
                            <div
                              style={{
                                height: "250px",
                                width: "250px",
                                margin: "0 auto",
                              }}
                            >
                              <Pie
                                data={{
                                  labels: summaryData.labels,
                                  datasets: [
                                    {
                                      data: summaryData.data,
                                      backgroundColor: colorListSummary,
                                      borderWidth: 1,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                    },
                                  },
                                }}
                              />
                            </div>
                            <div className="mt-4">
                              <h6>Summary:</h6>
                              <ul className="list-group">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                  <b>Total Quantity</b>
                                  <span className="badge bg-primary rounded-pill">
                                    {summaryData.total}
                                  </span>
                                </li>
                                {summaryData.balanceData.map((item, index) => (
                                  <li
                                    key={index}
                                    className="list-group-item d-flex flex-column align-items-start"
                                  >
                                    <div className="d-flex justify-content-between w-100">
                                      <span>{item.label}</span>
                                      <div>
                                        <span className="badge bg-secondary rounded-pill me-2">
                                          Sch: {item.scheduledQty}
                                        </span>
                                        <span className="badge bg-info rounded-pill me-2">
                                          Pck: {item.packedQty}
                                        </span>
                                        <span
                                          className={`badge rounded-pill ${
                                            item.balance < 0
                                              ? "bg-danger"
                                              : item.balance > 0
                                              ? "bg-danger"
                                              : "bg-success"
                                          }`}
                                        >
                                          Bal: {item.balance}
                                        </span>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <p>No delivery data available.</p>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Container>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DeliverySummaryList;