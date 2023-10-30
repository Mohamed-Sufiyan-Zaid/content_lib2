import { useState, useEffect, useContext } from "react";
import "./ProjectDocuments.scss";
import Button from "@mui/material/Button";
import Table from "../../components/common/Table/Table";
import KebabMenu from "../../components/common/KebabMenu/KebabMenu";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentTableHeaders, DocumentTableKebabMenuOptions, ApiEndpoints, QueryKeys } from "../../utils/constants";
import { ProjectDocumentsText } from "../../i18n/ProjectDocumentsText";
import ProjectDetailsHeader from "../../components/common/ProjectDetailsHeader/ProjectDetailsHeader";
import { useFetcher } from "../../hooks/useReactQuery";
import Plus from "../../assets/icons/plus.svg";
import CreateDocument from "../../components/CreateDocument/CreateDocument";
import { ApiResponseKeys } from "../../utils/apiKeysMap";
import { getFullDateFormatted } from "../../utils/dateUtils";
import { exportDocument, getDownloadMetaData } from "../../utils/downloadUtil";
import UserContext from "../../context/UserContext";
// import { NavHeaderText } from "../../i18n/Components";
import { removeGeneratedPlaceHolders } from "../../utils/documentUtils";
import { cleanHtmlForDownload } from "../../utils/placeHolderUtilityFunctions";
import ToastMessage from "../../components/common/ToastMessage/ToastMessage";
import { TOAST_TYPE } from "../../models/components/enums";
import { returnBreadCrumb } from "../../utils/breadCrumbMapper";

const ProjectDocuments = () => {
  const [tableRows, setTableRows] = useState([]);
  const [tablePageNo, setTablePageNo] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { ntId } = useContext(UserContext);
  const [documentId, setDocumentId] = useState("");
  const [openToast, setOpenToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({
    message: "",
    severity: ""
  });

  const buttons = [
    {
      text: "New Document",
      onClick: () => setOpenModal(true),
      icon: Plus
    }
  ];

  const { data: documentsList, isSuccess } = useFetcher(
    `${ApiEndpoints.document}`,
    [QueryKeys.documentsList, projectId],
    { project_id: projectId },
    true
  );

  const { data: documentDetails, isSuccess: isDocumentDetailApisSuccess } = useFetcher(
    `${ApiEndpoints.document}/${documentId}`,
    [QueryKeys.documentDetails, documentId],
    {},
    typeof documentId === "number",
    3000000,
    "docAuth",
    false
  );

  const handleMenuItemClick = (optionIndex, id) => {
    const selectedValue = DocumentTableKebabMenuOptions[optionIndex].key;
    if (selectedValue === "download") {
      setDocumentId(id);
    }
  };

  const showToast = (message) => {
    setToastInfo({
      message,
      severity: TOAST_TYPE.SUCCESS
    });
    setOpenToast(true);
  };
  const generateTableContent = (allDocuments) => {
    const newTableData = [];
    allDocuments.forEach((document, index) => {
      newTableData[index + 1] = [
        document.documentName,
        document.createdBy,
        getFullDateFormatted(document.createdOn),
        <div key={index} className="d-flex">
          <Button
            variant="text"
            sx={{ textDecoration: "underline" }}
            onClick={() => navigate(`/project/${projectId}/document/${document.documentId}`)}
          >
            {ProjectDocumentsText.tableOption}
          </Button>
          <KebabMenu
            handleMenuItemClick={(optionIndex) => handleMenuItemClick(optionIndex, document.documentId)}
            menuOptions={DocumentTableKebabMenuOptions}
            closeOnSelect
          />
        </div>
      ];
    });
    setTableRows(newTableData);
  };

  const mapDocumentListRows = (data) =>
    data.map((document) => ({
      documentName: document[ApiResponseKeys.documentName],
      createdBy: document[ApiResponseKeys.docAuthor],
      createdOn: document[ApiResponseKeys.createdOn],
      documentId: document[ApiResponseKeys.id]
    }));

  useEffect(() => {
    if (documentsList?.length > 0) {
      const updatedList = mapDocumentListRows(documentsList);
      generateTableContent(updatedList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentsList, isSuccess]);

  useEffect(() => {
    if (isDocumentDetailApisSuccess) {
      const meta = getDownloadMetaData(ntId);
      const cleanedHtml = cleanHtmlForDownload(documentDetails[ApiResponseKeys.htmlContent]);
      exportDocument(meta, removeGeneratedPlaceHolders(cleanedHtml), meta.title);
    }
  });

  return (
    <div className="doc-container">
      <ToastMessage isVisible={openToast} hideToast={setOpenToast} message={toastInfo.message} severity={toastInfo.severity} />
      <ProjectDetailsHeader navProps={returnBreadCrumb("manageDocuments", projectId)} buttons={buttons} />
      <div>
        <h1 className="doc-heading mb-lg-3">All Documents</h1>
        <Table
          rows={tableRows}
          headers={DocumentTableHeaders}
          isPaginated
          pageNo={tablePageNo}
          handlePageChange={(_, newPage) => setTablePageNo(newPage)}
        />
        {openModal && <CreateDocument openModal={openModal} setOpenModal={setOpenModal} onDocumentCreated={showToast} />}
      </div>
    </div>
  );
};
export default ProjectDocuments;
