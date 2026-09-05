import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface AdminTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const AdminTable: React.FC<AdminTableProps> = ({ children, style, className = '', ...props }) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF' }}>
      <table
        className={`admin-table ${className}`}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.85rem',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          ...style,
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const AdminTableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, style, ...props }) => (
  <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', ...style }} {...props}>
    {children}
  </thead>
);

export const AdminTableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, style, className = '', ...props }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`} style={style} {...props}>
    {children}
  </tbody>
);

export const AdminTableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, style, className = '', ...props }) => (
  <tr
    className={`admin-table-row ${className}`}
    style={{
      borderBottom: '1px solid #F1F5F9',
      transition: 'background-color 0.1s ease',
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#F8FAFC';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
    {...props}
  >
    {children}
  </tr>
);

export const AdminTableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, style, ...props }) => (
  <th
    style={{
      padding: '12px 16px',
      fontWeight: 700,
      fontSize: '0.775rem',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      ...style,
    }}
    {...props}
  >
    {children}
  </th>
);

export const AdminTableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, style, ...props }) => (
  <td
    style={{
      padding: '14px 16px',
      color: '#0F172A',
      fontWeight: 500,
      verticalAlign: 'middle',
      ...style,
    }}
    {...props}
  >
    {children}
  </td>
);

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '14px 18px',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
        {totalItems ? (
          <>
            Showing <strong>{Math.min((currentPage - 1) * (itemsPerPage || 10) + 1, totalItems)}</strong> to{' '}
            <strong>{Math.min(currentPage * (itemsPerPage || 10), totalItems)}</strong> of <strong>{totalItems}</strong> entries
          </>
        ) : (
          <>Page {currentPage} of {totalPages}</>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1,
            color: '#475569',
          }}
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1,
            color: '#475569',
          }}
        >
          <ChevronLeft size={14} />
        </button>

        <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
          {currentPage}
        </span>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1,
            color: '#475569',
          }}
        >
          <ChevronRight size={14} />
        </button>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1,
            color: '#475569',
          }}
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};
