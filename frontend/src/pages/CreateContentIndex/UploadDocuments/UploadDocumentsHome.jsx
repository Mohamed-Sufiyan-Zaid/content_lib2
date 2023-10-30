import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useFetcher, useModifier } from "../../../hooks/useReactQuery";
import { ContentLibraryApiEndpoints, ContentQueryKeys, ContentType, HTTPMethods } from "../../../utils/constants";
import UploadFile from "../../../components/common/UploadFile/UploadFile";
import UploadDocumentsPage from "./UploadDocumentsPage";
import { ApiResponseKeys } from "../../../utils/contentApiKeysMap";

function UploadDocumentsHome({ contentIndexId, setContentIndexCreationStatus, setOpenToast, setContentIndexMessage }) {
  const [showDocumentListComponent, setShowDocumentListComponent] = useState(false);
  const [documents, setDocuments] = useState([]);

  const customOnSuccess = () => {
    setContentIndexCreationStatus("success");
    setContentIndexMessage("Document uploaded successfully.");
    setOpenToast(true);
  };
  const handleCustomError = () => {
    setContentIndexCreationStatus("error");
    setContentIndexMessage("Failed to upload document.");
    setOpenToast(true);
  };

  const { mutate, status: apiChangeStatus } = useModifier([ContentQueryKeys.uploadDocuments], "contentLib", customOnSuccess, handleCustomError);
  const {
    data: documentList = [],
    isSuccess: isDocumentSuccess,
    isLoading: isDocumentLoading
  } = useFetcher(
    `${ContentLibraryApiEndpoints.documentByContextId}/${contentIndexId}`,
    [ContentQueryKeys.uploadDocuments],
    {},
    contentIndexId !== 0,
    10000,
    "contentLib"
  );

  const setFiles = (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i += 1) {
      formData.append("files", files[i]);
    }
    const paramsData = {
      [ApiResponseKeys.contentIndexId]: contentIndexId,
      [ApiResponseKeys.docSource]: "upload"
    };
    setShowDocumentListComponent(true);
    mutate({
      method: HTTPMethods.POST,
      url: ContentLibraryApiEndpoints.uploadDocument,
      params: paramsData,
      data: formData,
      contentType: ContentType.MULTIPART_FORM_DATA
    });
  };

  useEffect(() => {
    if (documentList) {
      setShowDocumentListComponent(true);
      setDocuments(documentList);
    }
  }, [isDocumentSuccess, documentList, isDocumentLoading]);

  return (
    <div className="custom-right bg">
      {showDocumentListComponent ? (
        <UploadDocumentsPage documents={documents} isDocumentLoading={isDocumentLoading} setFiles={setFiles} />
      ) : (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <UploadFile setFiles={setFiles} />
        </div>
      )}
      {apiChangeStatus === "loading" && (
        <div className="project-action-loader start-50 top-50 d-flex position-fixed align-items-center justify-content-center mt-6">
          <CircularProgress sx={{ margin: "auto" }} />
        </div>
      )}
    </div>
  );
}

export default UploadDocumentsHome;
