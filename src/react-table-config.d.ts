import 'react-table';

declare module 'react-table' {
    export interface TableInstance<D extends object = {}> extends UsePaginationInstanceProps<D>, UseSortByInstanceProps<D>, UseGlobalFiltersInstanceProps<D> {}

    export interface TableState<D extends object = {}> extends UsePaginationState<D>, UseSortByState<D>, UseGlobalFiltersState<D> {}

    export interface ColumnInstance<D extends object = {}> extends UseSortByColumnProps<D> {}
}
