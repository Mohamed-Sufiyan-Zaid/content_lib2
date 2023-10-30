import { useState, useEffect, useRef } from "react";
import "./ProjectTemplates.scss";
import Table from "../../components/common/Table/Table";
import Button from "@mui/material/Button";
import KebabMenu from "../../components/common/KebabMenu/KebabMenu";
import ProjectDetailsHeader from "../../components/common/ProjectDetailsHeader/ProjectDetailsHeader";
import CreateEditViewTemplate from "../CreateEditViewDeleteTemplate/CreateEditViewDeleteTemplate";
import { Plus } from "../../assets";
import {
  CreatedTemplateTableHeaders,
  TemplateType,
  CreatedTemplateKebabMenuOptions,
  UploadedTemplateKebabMenuOptions,
  ApiEndpoints,
  QueryKeys,
  TemplateState
} from "../../utils/constants";
import { useFetcher } from "../../hooks/useReactQuery";
import { useLocation, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import UploadTemplate from "../UploadTemplate/UploadTemplate";
import { ApiResponseKeys } from "../../utils/apiKeysMap";
import { getFullDateFormatted } from "../../utils/dateUtils";
import { returnBreadCrumb } from "../../utils/breadCrumbMapper";
import CreateDocument from "../../components/CreateDocument/CreateDocument";
import ToastMessage from "../../components/common/ToastMessage/ToastMessage";
import { TOAST_TYPE } from "../../models/components/enums";
import { projectTemplateText } from "../../i18n/ProjectTemplateText";

export default function ProjectTemplates() {
  const location = useLocation();
  const projectName = location?.state?.projectName || "";
  const [tablePageNo, setTablePageNo] = useState(0);
  const [openModal, setOpenModal] = useState(""); // to open view/edit/delete modals
  const [tableRows, setTableRows] = useState([]);
  const [createDocument, setCreateDocument] = useState(false);
  const { projectId } = useParams();
  const selectedTemplateRef = useRef({});
  const [preSelectedTemplateDetails, setPreSelectedTemplateDetails] = useState({});
  const [toastInfo, setToastInfo] = useState({
    message: "",
    severity: ""
  });
  const [openToast, setOpenToast] = useState(false);

  const buttons = [
    {
      text: "Create Template",
      onClick: () => setOpenModal("create"),
      icon: Plus
    }
  ];

  const showToast = (message) => {
    setToastInfo({
      message,
      severity: TOAST_TYPE.SUCCESS
    });
    setOpenToast(true);
  };
  //   const { ntId } = useContext(UserContext);

  const {
    data: rawTemplatesList,
    isFetching,
    isLoading,
    isError,
    isSuccess
  } = useFetcher(`${ApiEndpoints.getTemplates}`, [QueryKeys.templates, projectId], { project_id: projectId }, true);

  const handleMenuItemClick = (optionIndex, templateData) => {
    const kebabMenuOptions = CreatedTemplateKebabMenuOptions;
    selectedTemplateRef.current = templateData;
    setOpenModal(kebabMenuOptions[optionIndex].key);
  };

  const generateTableContent = (templateData = [], templateType = TemplateType.CREATED) => {
    const newTableData = templateData.map((template, index) => [
      template.templateName,
      template.createdBy,
      getFullDateFormatted(template.createdOn || template.updatedOn),
      <div key={index} className="d-flex">
        <Button
          variant="text"
          sx={{ textDecoration: "underline" }}
          onClick={() => {
            setPreSelectedTemplateDetails({ name: template.templateName, id: template.templateId });
            setCreateDocument(true);
          }}
        >
          Use
        </Button>
        <KebabMenu
          handleMenuItemClick={(optionIndex) => handleMenuItemClick(optionIndex, template)}
          menuOptions={templateType === TemplateType.CREATED ? CreatedTemplateKebabMenuOptions : UploadedTemplateKebabMenuOptions}
          closeOnSelect
        />
      </div>
    ]);
    setTableRows(newTableData);
  };

  const mapTemplateListRows = (data) =>
    data.map((template) => ({
      templateName: template[ApiResponseKeys.templateName],
      createdBy: template[ApiResponseKeys.templateCreatedBy],
      createdOn: template[ApiResponseKeys.createdOn],
      updatedOn: template[ApiResponseKeys.updatedOn],
      templateId: template[ApiResponseKeys.id]
    }));

  useEffect(() => {
    if (rawTemplatesList) {
      const updatedList = mapTemplateListRows(rawTemplatesList);
      generateTableContent(updatedList);
    }
  }, [rawTemplatesList, isSuccess]);

  const getTemplateComponent = () => {
    const viewTemplateModal = ["create", "edit", "view", "delete"];
    if (viewTemplateModal.includes(openModal)) {
      const templateStateMapping = {
        create: TemplateState.CREATED,
        edit: TemplateState.EDITED,
        view: TemplateState.READONLY,
        delete: TemplateState.DELETE
      };

      const templateState = templateStateMapping[openModal];

      return (
        <CreateEditViewTemplate
          templateData={selectedTemplateRef.current}
          open
          setOpen={setOpenModal}
          templateState={templateState}
          templateName={openModal === "create" ? "" : "Test"}
          setToastInfo={showToast}
          projectName={projectName}
        />
      );
    }
    return <div />;
  };

  return (
    <div className="home-container">
      <ToastMessage isVisible={openToast} hideToast={setOpenToast} message={toastInfo.message} severity={toastInfo.severity} />
      <ProjectDetailsHeader navProps={returnBreadCrumb("manageTemplates", projectId)} buttons={buttons} />
      <h1 className="heading">{projectTemplateText.templateHeading}</h1>
      {isSuccess && (
        <Table
          rows={tableRows}
          headers={CreatedTemplateTableHeaders}
          isPaginated
          pageNo={tablePageNo}
          handlePageChange={(_, newPage) => setTablePageNo(newPage)}
        />
      )}
      {(isFetching || isLoading) && (
        <div className="d-flex align-items-center justify-content-center mt-6">
          <CircularProgress sx={{ margin: "auto" }} />
        </div>
      )}
      {isError && (
        <div className="d-flex align-items-center justify-content-center table-error">
          <div>{projectTemplateText.errorFetchingTemplates}</div>
        </div>
      )}
      {getTemplateComponent()}
      <UploadTemplate open={openModal === "upload"} setOpen={setOpenModal} />
      {createDocument && (
        <CreateDocument
          openModal={createDocument}
          setOpenModal={setCreateDocument}
          preSelectedTemplateDetails={preSelectedTemplateDetails}
          onDocumentCreated={showToast}
        />
      )}
    </div>
  );
}
