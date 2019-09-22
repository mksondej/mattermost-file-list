import React from "react";

const SortIcon = ({direction}) => (
    <i 
        className={`fa fa-sort-${direction === 0 ? "asc" : "desc"}`} 
    />
);

export default SortIcon;