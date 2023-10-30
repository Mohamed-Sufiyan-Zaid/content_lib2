import { useContext, useEffect, useState } from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Select from "../common/Select/Select";
import ConfirmationBox from "../common/ConfirmationBox/ConfirmationBox";
import { ConfirmationBoxText } from "../../i18n/Components";
import { useFetcher, useModifier } from "../../hooks/useReactQuery";
import { HTTPMethods, PromptLibraryApiEndpoints, PromptQueryKeys } from "../../utils/constants";
import UserContext from "../../context/UserContext";
import { ApiResponseKeys } from "../../utils/promptApiKeysMap";
import { ToastMessageText } from "../../i18n/ToastMessageText";

export default function ConfigurePrompt({ openModal, setOpenModal, setToastInfo }) {
  const [group, setGroup] = useState("");
  const [domain, setDomain] = useState("");
  const [subDomain, setSubDomain] = useState("");
  const [category, setCategory] = useState("");
  const { ntId } = useContext(UserContext);
  const isFormValid = domain && subDomain && category;

  const {
    data: groupsList,
    isLoading: isGroupsListLoading,
    isError: isGroupsListError
  } = useFetcher(PromptLibraryApiEndpoints.groupsList, [PromptQueryKeys.groupsList], {}, openModal, 10000, "promptLib");

  const clearForm = () => {
    setGroup("");
    setDomain("");
    setSubDomain("");
    setCategory("");
  };

  const onSuccessCallback = (message) => {
    setToastInfo(message);
  };

  const { mutate, isSuccess: isConfiguredPromptSuccess, isError } = useModifier("", "promptLib");

  const handleSave = () => {
    mutate({
      method: HTTPMethods.POST,
      url: PromptLibraryApiEndpoints.createConfig,
      data: {
        [ApiResponseKeys.ntId]: ntId,
        domain_name: domain,
        sub_domain_name: subDomain,
        category_name: category
      }
    });
  };

  useEffect(() => {
    if (isConfiguredPromptSuccess) {
      onSuccessCallback(ToastMessageText.promptConfigurationSuccess);
    } else if (isError) {
      onSuccessCallback(ToastMessageText.promptConfigurationFailure);
    }
    setOpenModal(false);
    clearForm();
  }, [isConfiguredPromptSuccess]);

  return (
    <ConfirmationBox
      title="Configure Prompt"
      agreeText={ConfirmationBoxText.agreeText}
      disagreeText={ConfirmationBoxText.disagreeText}
      isAgreeDisabled={!isFormValid}
      isOpen={openModal}
      handleClose={() => {
        setOpenModal(false);
        clearForm();
      }}
      handleAccept={handleSave}
    >
      <div className="project-changes-container">
        <div className="configure prompt">
          <Select
            value={group}
            label="Select Group"
            placeholder="Select a group"
            options={groupsList}
            margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
            onChange={(event) => setGroup(event.target.value)}
            isLoading={isGroupsListLoading}
            isError={isGroupsListError}
          />
          <div className="d-flex mb-3">
            <FormControl fullWidth>
              <FormLabel className="mb-2">Domain</FormLabel>
              <TextField value={domain} placeholder="Enter a domain" onChange={(event) => setDomain(event.target.value)} />
            </FormControl>
            <FormControl fullWidth sx={{ margin: "0 0 0 1rem" }}>
              <FormLabel className="mb-2">Sub-Domain</FormLabel>
              <TextField value={subDomain} placeholder="Enter a sub domain" onChange={(event) => setSubDomain(event.target.value)} />
            </FormControl>
            <FormControl fullWidth sx={{ margin: "0 0 0 1rem" }}>
              <FormLabel className="mb-2">Category</FormLabel>
              <TextField value={category} placeholder="Enter a category" onChange={(event) => setCategory(event.target.value)} />
            </FormControl>
          </div>
        </div>
      </div>
    </ConfirmationBox>
  );
}
