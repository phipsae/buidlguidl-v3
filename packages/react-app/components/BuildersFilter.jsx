import React from "react";
import { Select } from "@chakra-ui/react";

const BuildersFilter = ({ column: { filterValue, setFilter, preFilteredRows } }) => {
  const options = React.useMemo(() => {
    const cohortTypes = new Set();
    preFilteredRows.forEach(row => {
      if (row.values.stream && row.values.stream.cohortType) {
        cohortTypes.add(row.values.stream.cohortType);
      }
    });
    return [...cohortTypes];
  }, [preFilteredRows]);

  return (
    <Select
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder="All Cohorts"
    >
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
};
