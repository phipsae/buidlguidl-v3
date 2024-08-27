import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Input,
  List,
  ListItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";

const CohortColumnFilter = ({ filterValue, setFilter, cohorts }) => {
  const { baseColor } = useCustomColorModes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCohorts = useMemo(() => {
    return cohorts.filter(cohort => cohort.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, cohorts]);

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-start">
      <PopoverTrigger>
        <Button
          rightIcon={<ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          bgColor={baseColor}
          width="250px"
          borderRadius="md"
          fontWeight="normal"
        >
          {filterValue || "All Cohorts"}
        </Button>
      </PopoverTrigger>
      <PopoverContent width="250px">
        <PopoverBody padding={0}>
          <Input
            placeholder="Search cohorts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            padding="8px 12px"
            borderRadius="md"
            borderWidth="0 0 1px 0"
            _focus={{
              bg: "gray.50",
              borderColor: "gray.200",
            }}
          />
          <List maxHeight="200px" overflowY="auto">
            <ListItem
              padding="8px 12px"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              onClick={() => {
                setFilter(undefined);
                setIsOpen(false);
              }}
            >
              All Cohorts
            </ListItem>
            {filteredCohorts.map((cohort, index) => (
              <ListItem
                key={index}
                padding="8px 12px"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                onClick={() => {
                  setFilter(cohort.name);
                  setIsOpen(false);
                }}
              >
                {cohort.name}
              </ListItem>
            ))}
          </List>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default CohortColumnFilter;
