import "./ProjectDetails.scss";
import ProjectDetailsHeader from "../../components/common/ProjectDetailsHeader/ProjectDetailsHeader";
import ApplicationCard from "../../components/ApplicationCard/ApplicationCard";
import FolderData from "../../components/FolderData/FolderData";
import AppCardDetails from "../../components/ApplicationCard/AppCardDetails";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ApiEndpoints,
  ContentLibraryApiEndpoints,
  ContentQueryKeys,
  PromptLibraryApiEndpoints,
  PromptQueryKeys,
  QueryKeys
} from "../../utils/constants";
import { useFetcher } from "../../hooks/useReactQuery";
import { useEffect, useState, useContext } from "react";
import {
  ManageTemplatesCardText,
  AuthorDocumentCardText,
  ManagePromptLibraryCardText,
  ManageContentLibraryCardText
} from "../../i18n/ApplicationCardText";
import UserContext from "../../context/UserContext";
import { INDEX_SHARING } from "../../models/components/enums";
import { returnBreadCrumb } from "../../utils/breadCrumbMapper";
import SidebarContext from "../../context/SidebarContext";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSidebarButtons, setSidebarTitle } = useContext(SidebarContext);
  const projectName = location?.state?.projectName || "";
  const { projectId } = useParams();
  const { ntId } = useContext(UserContext);
  const [templateDetailsList, setTemplateDetailsList] = useState({ detailList: [], total: 0 });
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [contentLib, setTotalContentLib] = useState(0);
  const [pendingPrompts, setPendingPrompts] = useState([
    {
      title: "Pending Approvals: ",
      value: 0
    }
  ]);

  const { data: rawTemplatesList } = useFetcher(
    `${ApiEndpoints.getTemplates}`,
    [QueryKeys.templates, projectId],
    { project_id: projectId },
    true,
    30000
  );
  const { data: documentsList } = useFetcher(`${ApiEndpoints.document}`, [QueryKeys.documentsList, projectId], { project_id: projectId }, true, 3000);
  const { data: rawPromptsList } = useFetcher(
    `${PromptLibraryApiEndpoints.promptsListByGroupId}/${ntId}`,
    [PromptQueryKeys.promptsListByGroupId, PromptQueryKeys.prompts],
    {},
    true,
    3000000,
    "promptLib"
  );
  const { data: rawPendingPromptsData } = useFetcher(
    PromptLibraryApiEndpoints.pendingPrompts,
    [PromptQueryKeys.pendingPrompts, PromptQueryKeys.prompts],
    {},
    true,
    3000000,
    "promptLib"
  );
  // TODO: Assumption is that only private content indexes are shown here
  const { data: contentIndexes } = useFetcher(
    ContentLibraryApiEndpoints.contentByIndex,
    [ContentQueryKeys.contentByIndex + 1],
    {
      content_index_type: INDEX_SHARING.PRIVATE
    },
    true,
    10000,
    "contentLib"
  );

  useEffect(() => {
    setSidebarButtons([]);
    setSidebarTitle("Document Authoring");
    return () => {
      setSidebarButtons([]);
      setSidebarTitle("Document Authoring");
    };
  }, []);

  useEffect(() => {
    if (rawTemplatesList?.length) {
      setTemplateDetailsList({
        detailList: [
          {
            title: "Created: ",
            value: rawTemplatesList.length
          },
          {
            title: "Uploaded: ",
            value: 0
          }
        ],
        total: rawTemplatesList.length
      });
    }
  }, [rawTemplatesList]);

  useEffect(() => {
    if (documentsList) {
      setTotalDocuments(documentsList.length);
    }
  }, [documentsList]);

  useEffect(() => {
    if (contentIndexes?.length) {
      setTotalContentLib(contentIndexes.length);
    }
  }, [contentIndexes]);
  useEffect(() => {
    if (rawPromptsList?.length) {
      setTotalPrompts(rawPromptsList.length);
    }
  }, [rawPromptsList]);

  useEffect(() => {
    if (rawPendingPromptsData?.length) {
      setPendingPrompts([
        {
          title: "Pending Approvals ",
          value: rawPendingPromptsData.length
        }
      ]);
    }
  }, [rawPendingPromptsData]);

  return (
    <div className="doc-container">
      <ProjectDetailsHeader navProps={returnBreadCrumb("mainMenu", projectId)} />
      <div className="container">
        <div className="row custom-grid">
          <div className="col-md-6 custom-cell" key={ManageTemplatesCardText.title}>
            <ApplicationCard
              title={ManageTemplatesCardText.title}
              description={ManageTemplatesCardText.description}
              folderChildren={<FolderData title={ManageTemplatesCardText.folderTitle} value={templateDetailsList?.total} type="folder" />}
              detailedChildren={<AppCardDetails detailsList={templateDetailsList?.detailList} />}
              btnText={ManageTemplatesCardText.btnText}
              isBtnDisabled={false}
              handleBtnClick={() => navigate(`/project/${projectId}/templates`, { state: { projectName } })}
            />
          </div>
          <div className="col-md-6 custom-cell" key={AuthorDocumentCardText.title}>
            <ApplicationCard
              title={AuthorDocumentCardText.title}
              description={AuthorDocumentCardText.description}
              folderChildren={<FolderData title={ManageTemplatesCardText.folderTitle} value={totalDocuments} type="folder" />}
              detailedChildren=""
              btnText={ManageTemplatesCardText.btnText}
              isBtnDisabled={false}
              handleBtnClick={() => navigate(`/project/${projectId}/documents`)}
            />
          </div>
          <div className="col-md-6 custom-cell" key={ManagePromptLibraryCardText.title}>
            <ApplicationCard
              title={ManagePromptLibraryCardText.title}
              description={ManagePromptLibraryCardText.description}
              folderChildren={<FolderData value={totalPrompts} type="circular" />}
              detailedChildren={<AppCardDetails detailsList={pendingPrompts} />}
              btnText={ManagePromptLibraryCardText.btnText}
              isBtnDisabled={false}
              btnTwoText={ManagePromptLibraryCardText.btnTwoText}
              handleBtnClick={() => navigate("/prompt/admin")}
              handleBtnClickForBtnTwo={() => navigate("/prompt/engineer")}
              isBtnTwoDisabled={ManagePromptLibraryCardText.isBtnTwoDisabled}
            />
          </div>
          <div className="col-md-6 custom-cell" key={ManageContentLibraryCardText.title}>
            <ApplicationCard
              title={ManageContentLibraryCardText.title}
              description={ManageContentLibraryCardText.description}
              folderChildren={<FolderData title={ManageContentLibraryCardText.folderTitle} value={contentLib} type="folder" />}
              btnText={ManageContentLibraryCardText.btnText}
              isBtnDisabled={ManageContentLibraryCardText.isBtnDisabled}
              handleBtnClick={() => navigate(`/project/${projectId}/content`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProjectDetails;
