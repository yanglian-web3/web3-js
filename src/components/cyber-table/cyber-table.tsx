// components/cyber-table.tsx
"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import {PaginationOptions} from "@/src/types/pagination";

export interface CyberTableColumn<T> {
  key: keyof T
  header: string
  cell?: (value: T[keyof T], row: T) => React.ReactNode
  width?: string
  sortable?: boolean
  className?: string
}

export interface CyberTableProps<T> {
    columns: CyberTableColumn<T>[]
    data: T[]
    sortField?: keyof T
    sortDirection?: "asc" | "desc"
    onSort?: (field: keyof T) => void
    onRowClick?: (row: T) => void
    className?: string
    emptyMessage?: string
    pagination?: PaginationOptions
}

export function CyberTable<T>({
                                columns,
                                data,
                                sortField,
                                sortDirection,
                                onSort,
                                onRowClick,
                                className,
                                emptyMessage = "No data available",
                                  pagination
                              }: CyberTableProps<T>) {

    const defautlPaginationOptions:PaginationOptions = {
        current: 1,
        pageSize: 10,
        pageCount: 5,
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30, 40]
    } // 默认配置

    const renderPaginationOptions = pagination ? {...defautlPaginationOptions, ...pagination} : null

  return (
      <div className={cn(
          "relative rounded-xl overflow-hidden",
          "bg-cyber-dark-400/50",
          "border border-cyber-neon-400/20",
          "shadow-neon-lg",
          "backdrop-blur-sm",
          "animate-in fade-in-50 duration-500",
          className
      )}>
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-5 grid-background -z-10" />

        {/* 扫描线效果 */}
        <div className="
        absolute inset-0 opacity-10
        bg-[linear-gradient(transparent_50%,rgba(0,255,157,0.1)_50%)]
        bg-[length:100%_8px]
        animate-scan-line
        -z-10
      " />

        {/* 边框发光效果 */}
        <div className="
        absolute inset-0 rounded-xl
        border border-cyber-neon-400/10
        shadow-[inset_0_0_20px_rgba(0,255,157,0.1)]
        -z-10
      " />

        <div className="relative z-10">
          {/* 表格容器 */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              {/* 表头 */}
              <thead>
              <tr className="
                border-b border-cyber-neon-400/20
                bg-gradient-to-r from-cyber-dark-400/80 to-cyber-dark-300/80
                backdrop-blur-sm
              ">
                {columns.map((column) => (
                    <th
                        key={String(column.key)}
                        style={{ width: column.width }}
                        className={cn(
                            "py-4 px-6 text-left",
                            "text-sm font-semibold",
                            column.sortable && "cursor-pointer select-none",
                            "group",
                            column.className
                        )}
                        onClick={() => column.sortable && onSort?.(column.key)}
                    >
                      <div className="flex items-center gap-2">
                      <span className={cn(
                          "text-gray-300",
                          "group-hover:text-cyber-neon-400",
                          "transition-colors duration-300"
                      )}>
                        {column.header}
                      </span>

                        {column.sortable && (
                            <div className="flex flex-col">
                              <ChevronUp className={cn(
                                  "w-3 h-3",
                                  sortField === column.key && sortDirection === "asc"
                                      ? "text-cyber-neon-400"
                                      : "text-gray-500 group-hover:text-gray-400"
                              )} />
                              <ChevronDown className={cn(
                                  "w-3 h-3 -mt-1",
                                  sortField === column.key && sortDirection === "desc"
                                      ? "text-cyber-neon-400"
                                      : "text-gray-500 group-hover:text-gray-400"
                              )} />
                            </div>
                        )}
                      </div>
                    </th>
                ))}
              </tr>
              </thead>

              {/* 表格内容 */}
              <tbody className="divide-y divide-cyber-dark-300/50">
              {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                      <tr
                          key={rowIndex}
                          onClick={() => onRowClick?.(row)}
                          className={cn(
                              "group",
                              "bg-gradient-to-r from-transparent via-cyber-dark-300/10 to-transparent",
                              "hover:from-cyber-dark-300/30 hover:via-cyber-neon-400/10 hover:to-cyber-dark-300/30",
                              "border-l-4 border-l-transparent",
                              "hover:border-l-cyber-neon-400/50",
                              "transition-all duration-500",
                              onRowClick && "cursor-pointer"
                          )}
                      >
                        {columns.map((column) => (
                            <td
                                key={String(column.key)}
                                className={cn(
                                    "py-4 px-6",
                                    "text-white/90",
                                    "transition-colors duration-300",
                                    "group-hover:text-white"
                                )}
                            >
                              {column.cell
                                  ? column.cell(row[column.key], row)
                                  : String(row[column.key])
                              }
                            </td>
                        ))}
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center">
                      <div className="
                      flex flex-col items-center justify-center gap-3
                      text-gray-500
                    ">
                        <div className="
                        w-16 h-16 rounded-full
                        bg-cyber-dark-300
                        flex items-center justify-center
                      ">
                          <div className="
                          w-8 h-8
                          border-2 border-dashed border-gray-600
                          rounded-full
                          animate-spin
                        " />
                        </div>
                        <p className="text-lg font-medium">{emptyMessage}</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          {/* 表格底部 */}
          {data.length > 0 && (
              <div className="
            px-6 py-3
            border-t border-cyber-dark-300/50
            bg-gradient-to-r from-cyber-dark-400/80 to-cyber-dark-300/80
            backdrop-blur-sm
            flex items-center justify-between
            text-sm text-gray-400
          ">
                <div>
                  Showing <span className="text-cyber-neon-400">{data.length}</span> items
                </div>
                  { renderPaginationOptions ? <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                          {[1, 2, 3].map((num) => (
                              <button
                                  key={num}
                                  className="
                      w-8 h-8 rounded
                      flex items-center justify-center
                      border border-cyber-dark-300
                      hover:border-cyber-neon-400/50
                      hover:text-cyber-neon-400
                      transition-colors
                    "
                              >
                                  {num}
                              </button>
                          ))}
                      </div>
                  </div> : null}

              </div>
          )}
        </div>
      </div>
  )
}