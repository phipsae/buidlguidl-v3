import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Select,
  useToast,
  useColorModeValue,
  FormErrorMessage,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  NumberInputField,
  NumberInput,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  Input,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { USER_FUNCTIONS, USER_ROLES, BATCH_STATUS } from "../../helpers/constants";
import AddressInput from "../AddressInput";
import useSignedRequest from "../../hooks/useSignedRequest";
import useConnectedAddress from "../../hooks/useConnectedAddress";

const INITIAL_FORM_STATE = { batchStatus: BATCH_STATUS.CLOSED };

// export function BatchCrudFormModal({ mainnetProvider, builder, isOpen, onClose, onUpdate }) {
//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <ModalOverlay />
//       <ModalContent>
//         <ModalHeader>Edit Builder</ModalHeader>
//         <ModalCloseButton />
//         <ModalBody p={6}>
//           <BatchCrudForm
//             builder={builder}
//             mainnetProvider={mainnetProvider}
//             onUpdate={() => {
//               onClose();
//               if (typeof onUpdate === "function") {
//                 onUpdate();
//               }
//             }}
//           />
//         </ModalBody>
//       </ModalContent>
//     </Modal>
//   );
// }

export function BatchCrudForm({ mainnetProvider, batch, onUpdate }) {
  const address = useConnectedAddress();
  const isEditingBatch = !!batch;

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const { isLoading, makeSignedRequest } = useSignedRequest("batchCreate", address);
  const { isLoading: isLoadingEdit, makeSignedRequest: makeSignedRequestEdit } = useSignedRequest("batchEdit", address);

  useEffect(() => {
    if (isEditingBatch) {
      setFormState({
        batchNumber: batch.number,
        batchStatus: batch.status,
        batchStartDate: batch.startDate,
        batchTelegramLink: batch.telegramLink,
        batchContractAddress: batch.contractAddress,
      });
    }
  }, [isEditingBatch, batch]);

  const handleSubmit = async () => {
    const nextErrors = {
      batchNumber: !formState.batchNumber || isNaN(formState.batchNumber),
      batchStatus: !formState.batchStatus,
      batchStartDate: !formState.batchStartDate,
      batchTelegramLink: !formState.batchTelegramLink,
      batchContractAddress: formState.batchContractAddress && !ethers.utils.isAddress(formState.batchContractAddress),
    };

    setFormErrors(nextErrors);
    if (Object.values(nextErrors).some(hasError => hasError)) {
      return;
    }

    try {
      const requestPayload = {
        batchNumber: formState.batchNumber,
        batchStatus: formState.batchStatus,
        batchStartDate: new Date(formState.batchStartDate).getTime(),
        batchTelegramLink: formState.batchTelegramLink,
        batchContractAddress: formState.batchContractAddress,
      };

      if (isEditingBatch) {
        await makeSignedRequestEdit(requestPayload);
      } else {
        await makeSignedRequest(requestPayload);
      }
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      status: "success",
      description: "Batch saved successfully!",
      variant: toastVariant,
    });

    setFormState(INITIAL_FORM_STATE);
    if (typeof onUpdate === "function") {
      onUpdate();
    }
  };

  return (
    <>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchNumber}>
        <FormLabel htmlFor="batchNumber">
          <strong>Batch Number</strong>
        </FormLabel>
        <NumberInput
          id="batchNumber"
          type="number"
          min={0}
          placeholder="Batch Number"
          value={formState.batchNumber || ""}
          onChange={value => {
            setFormState(prevFormState => ({
              ...prevFormState,
              batchNumber: value,
              batchStatus: value === "" ? "" : prevFormState.batchStatus,
            }));
          }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormErrorMessage>Invalid address</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchStatus}>
        <FormLabel htmlFor="batchStatus">
          <strong>Status</strong>
        </FormLabel>
        <RadioGroup
          id="batchStatus"
          value={formState.batchStatus || BATCH_STATUS.CLOSED}
          onChange={value =>
            setFormState(prevFormState => ({
              ...prevFormState,
              batchStatus: value,
            }))
          }
        >
          <Stack direction="row" spacing={4}>
            <Radio value={BATCH_STATUS.CLOSED}>{BATCH_STATUS.CLOSED}</Radio>
            <Radio value={BATCH_STATUS.OPEN}>{BATCH_STATUS.OPEN}</Radio>
          </Stack>
        </RadioGroup>
        <FormErrorMessage>Required</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchStartDate}>
        <FormLabel htmlFor="batchStartDate">
          <strong>Start Date</strong>
        </FormLabel>
        <Input
          type="date"
          id="batchStartDate"
          value={formState.batchStartDate || ""}
          onChange={e => setFormState(prev => ({ ...prev, batchStartDate: e.target.value }))}
        />
        <FormErrorMessage>Required</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.telegramLink}>
        <FormLabel htmlFor="batchTelegramLink">
          <strong>Telegram Join Link</strong>
        </FormLabel>
        <Input
          id="batchTelegramLink"
          placeholder="https://t.me/+RdnBKIvVnDw5MTky"
          value={formState.batchTelegramLink || ""}
          onChange={e => setFormState(prev => ({ ...prev, batchTelegramLink: e.target.value }))}
        />
        <FormErrorMessage>Required</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isInvalid={formErrors.batchContractAddress}>
        <FormLabel htmlFor="batchContractAddress">
          <strong>Batch Registry Contract Address</strong>
        </FormLabel>
        <AddressInput
          autoFocus
          id="batchContractAddress"
          ensProvider={mainnetProvider}
          placeholder="Registry Contract Address"
          value={formState.batchContractAddress || ""}
          onChange={value => {
            setFormState(prevFormState => ({
              ...prevFormState,
              batchContractAddress: value,
            }));
          }}
        />
        <FormErrorMessage>Invalid address</FormErrorMessage>
      </FormControl>

      <Button colorScheme="blue" px={4} onClick={handleSubmit} isLoading={isLoading || isLoadingEdit} isFullWidth>
        {isEditingBatch ? "Update Batch" : "Add Batch"}
      </Button>
    </>
  );
}