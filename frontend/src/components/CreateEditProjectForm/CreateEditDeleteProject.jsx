import { useEffect, useState, useContext } from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Select from "../common/Select/Select";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmationBox from "../common/ConfirmationBox/ConfirmationBox";
import { useFetcher, useModifier } from "../../hooks/useReactQuery";
import { ApiEndpoints, QueryKeys, HTTPMethods } from "../../utils/constants";
import "./CreateEditDeleteProject.scss";
import UserContext from "../../context/UserContext";
import { ApiResponseKeys } from "../../utils/apiKeysMap";
import { defaultProjectData } from "./pageConstants";
import { ConfirmationBoxText } from "../../i18n/Components";
import { ToastMessageText } from "../../i18n/ToastMessageText";

export default function CreateEditDeleteProject({ openModal, setOpenModal, actionType, projectData, setToastInfo }) {
  const [projectDetails, setProjectDetails] = useState(actionType !== "create" ? { ...projectData } : { ...defaultProjectData });
  const [actionTemp, setActionTemp] = useState(null);
  const { ntId } = useContext(UserContext);
  const getApiKeys = () => {
    switch (actionType) {
      case "create":
        return { method: HTTPMethods.POST, key: QueryKeys.projectsList };
      case "edit":
        return { method: HTTPMethods.PUT, key: QueryKeys.projectsList };
      case "delete":
        return { method: HTTPMethods.DELETE, key: QueryKeys.projectsList };
      default:
        return {};
    }
  };
  const handleValueChange = (newValue, changingParam) => {
    const newProjectDetails = { ...projectDetails };
    newProjectDetails[changingParam] = newValue;
    setProjectDetails(newProjectDetails);
  };
  const {
    data: domains = [],
    isLoading: isDomainLoading,
    isError: isDomainError
  } = useFetcher(ApiEndpoints.getDomains, [QueryKeys.getDomains], {}, openModal === true);
  // TODO: Uncomment if Sub domain is to be enabled back again
  // const {
  //   data: subDomains = [],
  //   isLoading: isSubDomainLoading,
  //   isError: isSubDomainError
  // } = useFetcher(ApiEndpoints.getSubDomains, [QueryKeys.getSubDomains], {domain_id: 1}, openModal === true);

  useEffect(() => setProjectDetails({ ...projectData }), [projectData]);

  const { mutate, status: apiChangeStatus } = useModifier([getApiKeys().key]);

  const formatRequestPayload = (data) => {
    switch (actionType) {
      case "edit":
        return {
          [ApiResponseKeys.ntId]: ntId,
          [ApiResponseKeys.projectId]: data.projectId,
          [ApiResponseKeys.projectName]: data.projectName,
          [ApiResponseKeys.projectGroup]: data.projectGroup,
          [ApiResponseKeys.projectDomain]: data.projectDomain,
          [ApiResponseKeys.projectSubDomain]: "dummy_sub_domain"
        };
      case "create":
        return {
          [ApiResponseKeys.ntId]: ntId,
          [ApiResponseKeys.projectName]: data.projectName,
          [ApiResponseKeys.projectGroup]: data.projectGroup,
          [ApiResponseKeys.projectDomain]: data.projectDomain,
          [ApiResponseKeys.projectSubDomain]: "dummy_sub_domain"
        };
      case "delete":
        return {
          [ApiResponseKeys.projectId]: data.projectId
        };
      default:
        console.warn("Action not specified");
        return null;
    }
  };
  const onSuccessCallback = (action) => {
    let message;

    switch (action) {
      case "create":
        message = ToastMessageText.projectCreated;
        break;
      case "edit":
        message = ToastMessageText.projectEdited;
        break;
      default:
        message = ToastMessageText.projectDeleted;
        break;
    }
    setToastInfo(message);
  };

  const isFormInvalid = !projectDetails.projectName || !projectDetails.projectGroup || !projectDetails.projectDomain;
  const handleSave = (data, action) => {
    const formattedData = formatRequestPayload(data);
    mutate(
      action === "delete"
        ? { method: getApiKeys().method, url: ApiEndpoints.projectOperations, data: {}, params: formattedData }
        : { method: getApiKeys().method, url: ApiEndpoints.projectOperations, data: formattedData }
    );
    onSuccessCallback(action);
    setActionTemp(action);
  };
  useEffect(() => {
    if (apiChangeStatus === "success") {
      onSuccessCallback(actionTemp);
    }
  }, [apiChangeStatus, actionTemp]);

  return (
    <ConfirmationBox
      title={`${actionType === "create" ? "Create" : actionType === "edit" ? "Edit" : "Delete"} Project`}
      isOpen={openModal}
      agreeText={`${actionType === "create" ? "Create" : actionType === "edit" ? ConfirmationBoxText.agreeText : ConfirmationBoxText.deleteText}`}
      disagreeText={ConfirmationBoxText.disagreeText}
      handleClose={() => setOpenModal(false)}
      handleAccept={() => handleSave(projectDetails, actionType)}
      isAgreeDisabled={isFormInvalid}
    >
      <div className="project-changes-container">
        {actionType !== "delete" ? (
          <div className="create-edit-container">
            <FormControl fullWidth sx={{ margin: { xs: "0 0 1rem 0", md: "0 0 2rem 0" } }}>
              <FormLabel className="mb-2">Project Name</FormLabel>
              <TextField
                value={projectDetails.projectName}
                placeholder="Enter project name"
                onChange={(event) => handleValueChange(event.target.value, "projectName")}
              />
            </FormControl>
            <Select
              value={projectDetails.projectGroup}
              label="Select Group"
              placeholder="Select a group"
              options={["Group 1", "Group 2", "Group 3", "Group 4", "Group 5", "Group 6"]}
              margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
              onChange={(event) => handleValueChange(event.target.value, "projectGroup")}
            />
            <div className="d-flex">
              <Select
                value={projectDetails.projectDomain}
                label="Select Domain"
                placeholder="Select a domain"
                options={domains.map((domain) => domain[ApiResponseKeys.domainName])}
                margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
                onChange={(event) => handleValueChange(event.target.value, "projectDomain")}
                isLoading={isDomainLoading}
                isError={isDomainError}
              />
              {/* TODO: Uncomment if Sub domain is to be enabled back again */}
              {/* <Select
                value={projectDetails.projectSubDomain}
                label="Select Sub Domain"
                placeholder="Select a sub domain"
                options={subDomains.map((subDomain) => subDomain[ApiResponseKeys.subDomainName])}
                margin="0 0 0 1rem"
                onChange={(event) => handleValueChange(event.target.value, "projectSubDomain")}
                isLoading={isSubDomainLoading}
                isError={isSubDomainError}
              /> */}
            </div>
          </div>
        ) : (
          <div className="delete-project-container">
            <h6 className="mt-4 sub-heading">Project Name:</h6>
            <p className="mt-1 project-name m-1">{projectData.projectName}</p>
            <p className="delete-disclaimer mt-2">You are about to delete a project, this action cannot be reversed.</p>
          </div>
        )}
        {apiChangeStatus === "loading" && (
          <div className="project-action-loader d-flex position-absolute align-items-center justify-content-center mt-6">
            <CircularProgress sx={{ margin: "auto" }} />
          </div>
        )}
      </div>
    </ConfirmationBox>
  );
}
