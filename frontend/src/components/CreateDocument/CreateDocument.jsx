import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Select from "../common/Select/Select";
import ConfirmationBox from "../common/ConfirmationBox/ConfirmationBox";
import "./CreateDocument.scss";
import { ConfirmationBoxText } from "../../i18n/Components";
import { ApiEndpoints, ContentLibraryApiEndpoints, ContentQueryKeys, HTTPMethods, QueryKeys } from "../../utils/constants";
import { useFetcher, useModifier } from "../../hooks/useReactQuery";
import { ApiResponseKeys } from "../../utils/apiKeysMap";
import { ApiResponseKeys as contentApiResponseKeys } from "../../utils/contentApiKeysMap";
import UserContext from "../../context/UserContext";
import { ToastMessageText } from "../../i18n/ToastMessageText";

export default function CreateDocument({ openModal, setOpenModal, preSelectedTemplateDetails = {}, onDocumentCreated }) {
  const [contentDropdownData, setContentDropdownData] = useState([]);
  const navigate = useNavigate();
  const backdropRef = useRef(null);
  const [documentDetails, setDocumentDetails] = useState({
    documentName: "",
    templateId: ""
  });
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [templatesList, setTemplatesList] = useState([]);
  const { projectId } = useParams();
  const { ntId } = useContext(UserContext);
  const [selectedLibrary, setSelectedLibrary] = useState({
    contentIndexId: -1
  });

  const { data: templateApiList, isSuccess } = useFetcher(`${ApiEndpoints.getTemplates}`, [QueryKeys.templates], { project_id: projectId }, true);
  const onSuccessCallback = (message, newTemplateData) => {
    onDocumentCreated(message);
    setOpenModal(false);
    navigate(`/project/${projectId}/document/${newTemplateData.id}`);
  };

  const { mutate } = useModifier([QueryKeys.documentsList], "docAuth", (newTemplateData) => {
    onSuccessCallback(ToastMessageText.documentCreated, newTemplateData);
  });
  const { data: contentLibrarySelectData, isSuccess: isContentLibraryDataSuccess } = useFetcher(
    ContentLibraryApiEndpoints.contentIndex,
    [ContentQueryKeys.content],
    {},
    true,
    10000,
    "contentLib"
  );
  useEffect(() => {
    if (
      documentDetails.documentName.length > 0 &&
      (documentDetails.templateId || preSelectedTemplateDetails?.name?.length > 0) &&
      selectedLibrary.contentIndexId > 0
    ) {
      setIsSaveDisabled(false);
    } else {
      setIsSaveDisabled(true);
    }
  }, [documentDetails, preSelectedTemplateDetails, selectedLibrary]);

  useEffect(() => {
    const data = contentLibrarySelectData?.map((element) => ({
      name: element[contentApiResponseKeys.contentIndexName],
      id: element[contentApiResponseKeys.contentIndexId]
    }));
    setContentDropdownData(data);
  }, [contentLibrarySelectData, isContentLibraryDataSuccess]);

  useEffect(() => {
    if (templateApiList?.length > 0) {
      const templates = templateApiList.map((template) => ({
        displayName: template[ApiResponseKeys.templateName],
        val: template[ApiResponseKeys.id]
      }));
      setTemplatesList(templates);
    }
  }, [isSuccess, templateApiList]);

  const handleSave = () => {
    const requestPayload = {
      [ApiResponseKeys.documentName]: documentDetails.documentName,
      [ApiResponseKeys.templateId]: documentDetails.templateId || preSelectedTemplateDetails?.id,
      [ApiResponseKeys.projectId]: projectId,
      // TODO: Get the BE team accept this as int instead of string, remove corresponsing parseInt from Edit doc
      [ApiResponseKeys.contentLibrary]: `${selectedLibrary.contentIndexId}`,
      [ApiResponseKeys.contentLibraryMetadata]: "",
      [ApiResponseKeys.docAuthor]: ntId
    };
    mutate({
      method: HTTPMethods.POST,
      url: ApiEndpoints.document,
      data: requestPayload
    });
  };

  const handleLibrary = ({ target: { value } }) => {
    setSelectedLibrary({ contentIndexId: value });
  };
  return (
    <ConfirmationBox
      title="Create Document"
      isOpen={openModal}
      agreeText={ConfirmationBoxText.agreeText}
      disagreeText={ConfirmationBoxText.disagreeText}
      handleClose={() => setOpenModal(false)}
      handleAccept={() => handleSave(documentDetails)}
      isAgreeDisabled={isSaveDisabled}
    >
      <div className="create-document-container" ref={backdropRef}>
        <FormControl fullWidth sx={{ margin: { xs: "0 0 1rem 0", md: "0 0 2rem 0" } }}>
          <FormLabel className="mb-2">Document Name</FormLabel>
          <TextField
            value={documentDetails.documentName}
            placeholder="Enter a document name"
            onChange={(event) => setDocumentDetails({ ...documentDetails, documentName: event.target.value })}
          />
        </FormControl>
        {preSelectedTemplateDetails?.name?.length > 0 ? (
          <>
            <FormLabel className="mb-2">Template Name</FormLabel>
            <p>{preSelectedTemplateDetails.name}</p>
          </>
        ) : (
          <Select
            isOptionsArrayOfObjects
            displayValueKey="displayName"
            actualValueKey="val"
            value={documentDetails.templateId}
            onChange={(event) => setDocumentDetails({ ...documentDetails, templateId: event.target.value })}
            label="Template"
            placeholder="Select a template"
            options={[...templatesList]}
            margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
          />
        )}

        <div className="d-flex">
          <Select
            value={selectedLibrary?.contentIndexId === -1 ? "" : selectedLibrary.contentIndexId}
            label="Content Library"
            placeholder="Select a Library"
            options={contentDropdownData}
            margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
            onChange={handleLibrary}
            isOptionsArrayOfObjects
          />
        </div>
      </div>
    </ConfirmationBox>
  );
}
