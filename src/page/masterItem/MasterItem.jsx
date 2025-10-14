import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "../../config/axios";

const MasterItemSupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const columnDefs = [
    { 
      headerName: "Main Item ID", 
      field: "MAIN_ITEM_ID", 
      cellStyle: { backgroundColor: 'white' },
      width: 180,
      editable: false 
    },
    { 
      headerName: "Item ID *", 
      field: "ITEM_ID", 
      width: 180,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellClassRules: {
        'ag-cell-error': params => !params.value
      }
    },
    { 
      headerName: "Code *", 
      field: "CODE", 
      width: 150,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellClassRules: {
        'ag-cell-error': params => !params.value
      }
    },
    { 
      headerName: "Description", 
      field: "DESCRIPTION", 
      width: 250,
      editable: true,
      cellEditor: "agTextCellEditor",
    },
    { 
      headerName: "Created At", 
      field: "CREATED_AT", 
      width: 180,
      cellStyle: { backgroundColor: 'white' },
      editable: false,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleString() : "-"
    },
    { 
      headerName: "Updated At", 
      field: "UPDATED_AT", 
      width: 180,
      cellStyle: { backgroundColor: 'white' },
      editable: false,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleString() : "-"
    }
  ];

  
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/master-item-supplier");
      setSuppliers(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to fetch suppliers");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  
  const handleCellValueChanged = async (params) => {
    const { data, colDef, newValue, oldValue } = params;
    const { field } = colDef;
    
    try {
      
      await axios.put(`/master-item-supplier/${data.ID}`, {
        ITEM_ID: data.ITEM_ID,
        CODE: data.CODE,
        DESCRIPTION: data.DESCRIPTION
      });

      toast.success("Supplier updated successfully!");
      
      
      const updatedData = suppliers.map(item => 
        item.ID === data.ID ? { ...item, [field]: newValue } : item
      );
      setSuppliers(updatedData);
      
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update supplier");
      
      const updatedData = suppliers.map(item => 
        item.ID === data.ID ? { ...item, [field]: oldValue } : item
      );
      setSuppliers(updatedData);
    }
  };
  
  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header>
          <h4>Master Item Supplier Management</h4>
        </Card.Header>
        <Card.Body>
          <div className="ag-theme-alpine" style={{ height: "80vh", width: "100%" }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading suppliers...</span>
              </div>
            ) : (
              <AgGridReact
                rowData={suppliers}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={20}
                enableCellTextSelection={true}
                onCellValueChanged={handleCellValueChanged}
                stopEditingWhenCellsLoseFocus={true}
                singleClickEdit={true}
                suppressClickEdit={false}
                
                getRowStyle={(params) => {
                  if (!params.data.ITEM_ID || !params.data.CODE) {
                    return { backgroundColor: '#fff0f0' };
                  }
                  return {};
                }}
              />
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MasterItemSupplierPage;