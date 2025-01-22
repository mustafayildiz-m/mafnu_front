import React, { ChangeEvent } from 'react';

interface GlobalFilterProps {
    filter: string | undefined;
    setFilter: (filterValue: string) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
    return (
        <span className="d-flex mb-4">
            <input
                value={filter || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                placeholder="Tabloda ara..."
                className="form-control"
            />
        </span>
    );
};

export default GlobalFilter;
