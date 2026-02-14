// src/shared/components/ui/data-table.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

// Definisi tipe untuk satu kolom
export interface ColumnDef<T> {
  header: string;
  // Class untuk styling lebar kolom, alignment, dll
  className?: string;
  // Fungsi untuk merender isi cell.
  // Jika string, dia akan mencoba akses property langsung dari data (key).
  // Jika function, dia akan panggil function tersebut dengan data row.
  cell: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyState,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className='w-full space-y-3 p-4'>
        {/* Simple Skeleton Loading */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className='h-12 w-full bg-gray-100 rounded animate-pulse'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <Table className='w-full'>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {emptyState || 'Tidak ada data.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={(item as { id: string }).id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={`whitespace-normal ${col.className || ''}`}>
                      {/* Render cell content */}
                      {col.cell(item, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
