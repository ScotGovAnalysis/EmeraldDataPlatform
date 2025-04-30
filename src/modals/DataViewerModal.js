import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Download, Filter, ArrowUpDown, X, Settings, RefreshCw, ChevronDown, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import styles from '../styles/Embedded_Modal.module.css';

const DataViewerModal = ({ isOpen, onRequestClose, tableData = [], dimensionLabels = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [columnVisibilityMenuOpen, setColumnVisibilityMenuOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract column headers using dimensionLabels
  const columns = useMemo(() => {
    if (!tableData || !Array.isArray(tableData) || tableData.length === 0) return [];
    return Object.keys(tableData[0]).map(key => ({
      id: key,
      name: key === 'Value' ? 'Value' : (dimensionLabels[key] || key), // Use label if available, else ID
      visible: true
    }));
  }, [tableData, dimensionLabels]);

  // Initialize visible columns
  useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map(col => col.id));
    }
  }, [columns]);

  // Apply search, filters, and sorting
  useEffect(() => {
    if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...tableData];

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue && filterValue.trim() !== '') {
        result = result.filter(row => {
          const cellValue = String(row[column]).toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle various data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        // Handle date strings
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
        }

        // Default string comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        if (sortConfig.direction === 'ascending') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(bString);
        }
      });
    }

    setFilteredData(result);
  }, [tableData, searchTerm, sortConfig, columnFilters]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1); // Reset to first page on new filter
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'ascending' });
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (!filteredData.length) return;

    const visibleData = filteredData.map(row => {
      const newRow = {};
      visibleColumns.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });

    const headers = visibleColumns.map(col => 
      col === 'Value' ? 'Value' : (dimensionLabels[col] || col)
    ).join(',');
    const csvRows = visibleData.map(row =>
      visibleColumns.map(col => {
        const cell = row[col];
        if (cell === null || cell === undefined) return '';
        const cellStr = String(cell);
        return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
          ? `"${cellStr.replace(/"/g, '""')}"`
          : cellStr;
      }).join(',')
    );

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'table_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.modalOverlay} ${isFullScreen ? styles.fullScreen : ''}`}>
      <div className={`${styles.modalContent} ${isFullScreen ? styles.fullScreenContent : ''}`}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>Table Data</span>
            <span className={styles.rowCount}>
              {filteredData.length} {filteredData.length === 1 ? 'row' : 'rows'}
              {tableData && filteredData.length !== tableData.length && ` (filtered from ${tableData.length})`}
            </span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.actionButton}
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              className={styles.closeButton}
              onClick={onRequestClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.toolbarContainer}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearchButton}
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.toolbarActions}>
            <div className={styles.filterDropdown}>
              <button
                className={styles.filterButton}
                onClick={() => {
                  setFilterMenuOpen(!filterMenuOpen);
                  setColumnVisibilityMenuOpen(false);
                }}
                aria-label="Filter columns"
              >
                <Filter size={16} />
                <span>Filter</span>
                <ChevronDown size={14} />
              </button>

              {filterMenuOpen && (
                <div className={styles.filterMenu}>
                  <div className={styles.filterMenuHeader}>
                    <h4>Filter Columns</h4>
                    <button
                      className={styles.resetButton}
                      onClick={resetFilters}
                    >
                      <RefreshCw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className={styles.columnFilters}>
                    {columns.map(column => (
                      <div key={column.id} className={styles.columnFilterItem}>
                        <label>{column.name}:</label>
                        <input
                          type="text"
                          placeholder={`Filter ${column.name.toLowerCase()}...`}
                          value={columnFilters[column.id] || ''}
                          onChange={(e) => handleFilterChange(column.id, e.target.value)}
                          className={styles.columnFilterInput}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.columnVisibilityDropdown}>
              <button
                className={styles.columnVisibilityButton}
                onClick={() => {
                  setColumnVisibilityMenuOpen(!columnVisibilityMenuOpen);
                  setFilterMenuOpen(false);
                }}
                aria-label="Column visibility"
              >
                <Settings size={16} />
                <span>Columns</span>
                <ChevronDown size={14} />
              </button>

              {columnVisibilityMenuOpen && (
                <div className={styles.columnVisibilityMenu}>
                  <div className={styles.columnVisibilityHeader}>
                    <h4>Visible Columns</h4>
                  </div>

                  <div className={styles.columnList}>
                    {columns.map(column => (
                      <div key={column.id} className={styles.columnVisibilityItem}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(column.id)}
                            onChange={() => toggleColumnVisibility(column.id)}
                            className={styles.columnCheckbox}
                          />
                          <span>{column.name}</span>
                        </label>
                        {visibleColumns.includes(column.id) ? (
                          <Eye size={14} className={styles.visibilityIcon} />
                        ) : (
                          <EyeOff size={14} className={styles.visibilityIcon} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={styles.exportButton}
              onClick={exportCSV}
              disabled={!filteredData.length}
              aria-label="Export to CSV"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenTable : ''}`}>
            {filteredData.length > 0 ? (
              <>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      {columns
                        .filter(column => visibleColumns.includes(column.id))
                        .map(column => (
                          <th
                            key={column.id}
                            className={sortConfig.key === column.id ? styles.sortedColumn : ''}
                            onClick={() => requestSort(column.id)}
                          >
                            <div className={styles.columnHeader}>
                              <span>{column.name}</span>
                              <ArrowUpDown
                                size={14}
                                className={`${styles.sortIcon} ${
                                  sortConfig.key === column.id
                                    ? sortConfig.direction === 'ascending'
                                      ? styles.sortAscending
                                      : styles.sortDescending
                                    : ''
                                }`}
                              />
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        {columns
                          .filter(column => visibleColumns.includes(column.id))
                          .map(column => (
                            <td key={`${rowIndex}-${column.id}`} className={styles.dataTableCell}>
                              {row[column.id] !== undefined && row[column.id] !== null
                                ? String(row[column.id])
                                : '—'}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.paginationContainer}>
                  <div className={styles.paginationInfo}>
                    Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} rows
                  </div>

                  <div className={styles.paginationControls}>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className={styles.pageSizeSelector}
                    >
                      {[10, 25, 50, 100].map(size => (
                        <option key={size} value={size}>
                          {size} rows
                        </option>
                      ))}
                    </select>

                    <div className={styles.pageNavigation}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        className={styles.paginationButton}
                      >
                        First
                      </button>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={styles.paginationButton}
                      >
                        Previous
                      </button>

                      <span className={styles.pageIndicator}>
                        Page {currentPage} of {totalPages || 1}
                      </span>

                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={styles.paginationButton}
                      >
                        Next
                      </button>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className={styles.paginationButton}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noDataMessage}>
                {tableData && tableData.length ? 'No matching results found.' : 'No data available.'}
                {searchTerm || Object.values(columnFilters).some(f => f) ? (
                  <button
                    onClick={resetFilters}
                    className={styles.resetFiltersButton}
                  >
                    Reset filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewerModal;