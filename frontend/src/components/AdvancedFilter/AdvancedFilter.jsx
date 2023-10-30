import { useState, useEffect } from "react";
import Select from "../common/Select/Select";
import { Button } from "@mui/material";
import { useFetcher } from "../../hooks/useReactQuery";
import { AdvancedFilterText } from "../../i18n/AdvancedFilterText";
import { ContentLibraryApiEndpoints, ContentQueryKeys } from "../../utils/constants";
import { ApiResponseKeys } from "../../utils/contentApiKeysMap";
import ToastMessage from "../common/ToastMessage/ToastMessage";
import { TOAST_TYPE } from "../../models/components/enums";

function AdvancedFilter({ selectedLibrary, setSelectedLibrary }) {
  const { contentIndexId, documentContentIndexId, documentChunkMetadataId } = selectedLibrary;
  const { data: documentContentData, isSuccess: documentDataSuccess } = useFetcher(
    `${ContentLibraryApiEndpoints.documentByContextId}/${contentIndexId}`,
    [ContentQueryKeys.documentByContentId + contentIndexId],
    {},
    contentIndexId > 0,
    10000,
    "contentLib"
  );
  const { data: documentChunkMetaData, isSuccess: chunkMetaDataSuccess } = useFetcher(
    ContentLibraryApiEndpoints.documentChunkMetadata,
    [ContentQueryKeys.documentContentChunkData + documentContentIndexId],
    { [ApiResponseKeys.contentIndexId]: contentIndexId, [ApiResponseKeys.documentId]: documentContentIndexId },
    documentContentIndexId > 0,
    10000,
    "contentLib"
  );
  const [contentLibraryDocumentData, setConnentLibraryDocumentData] = useState([]);
  const [contentChunkMetaData, setConnentChunkMetaData] = useState([]);
  const [openToast, setOpenToast] = useState(false);

  const handleValueChange = (value, key) => {
    setSelectedLibrary({ [key]: value });
  };

  useEffect(() => {
    if (!documentContentData?.length) {
      handleValueChange(-1, "documentContentIndexId");
    }
    const data = documentContentData?.map((item) => ({
      name: item[ApiResponseKeys.fileName],
      id: item[ApiResponseKeys.documentId]
    }));
    setConnentLibraryDocumentData(data);
  }, [documentContentData, documentDataSuccess]);

  useEffect(() => {
    if (!documentChunkMetaData?.length) {
      handleValueChange(-1, "documentChunkMetadataId");
    }
    const data = documentChunkMetaData?.map((item) => ({
      name: item[ApiResponseKeys.section],
      id: item[ApiResponseKeys.contentMetadataId]
    }));
    setConnentChunkMetaData(data);
  }, [documentChunkMetaData, chunkMetaDataSuccess]);

  const handleApplyClick = () => {
    // Open the modal by setting openModal to true
    // setOpenModal(true);
    setOpenToast(true);
  };

  return (
    <div className="d-flex m-2 flex-column advanced-filters-container">
      <Select
        value={documentContentIndexId !== -1 ? documentContentIndexId : ""}
        label={AdvancedFilterText.documentLabel}
        placeholder={AdvancedFilterText.documentPlaceholder}
        options={contentLibraryDocumentData}
        isOptionsArrayOfObjects
        isDisabled={contentIndexId <= 0}
        margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
        onChange={(event) => handleValueChange(event.target.value, "documentContentIndexId")}
      />
      <Select
        value={documentChunkMetadataId !== -1 ? documentChunkMetadataId : ""}
        label={AdvancedFilterText.selectionLabel}
        placeholder={AdvancedFilterText.selectionPlaceholder}
        options={contentChunkMetaData}
        margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
        isOptionsArrayOfObjects
        isDisabled={documentContentIndexId <= 0}
        onChange={(event) => handleValueChange(event.target.value, "documentChunkMetadataId")}
      />
      <div className="d-flex flex-row justify-content-around">
        <Button
          disabled={contentIndexId <= 0 || documentContentIndexId <= 0}
          type="Submit"
          onClick={handleApplyClick}
          disableElevation
          variant="contained"
        >
          {AdvancedFilterText.applyButton}
        </Button>
      </div>
      <ToastMessage isVisible={openToast} hideToast={setOpenToast} severity={TOAST_TYPE.SUCCESS} message="Filter has been successfully applied" />
    </div>
  );
}

export default AdvancedFilter;
