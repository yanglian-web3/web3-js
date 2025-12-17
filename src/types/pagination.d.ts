
export interface PaginationOptions {
    current: number
    pageSize: number
    pageCount?: number
    total: number
    showQuickJumper: boolean
    showSizeChanger?: boolean
    pageSizeOptions?: number[]
    pageSizeOptionMode?: "down" | "up" | undefined // down 向下拉 up 向上拉
    showTotal?:(total: number, range: number[]) => string
    [key: string]: any; // 添加字符串索引签名
}
