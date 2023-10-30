import Checkbox from "@mui/material/Checkbox";
import Pill from "../common/Pills/Pill";
import "./PromptDetails.scss";
import { Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { PromptEngineerPromptDetails, PromptAdminPromptDetails } from "../../utils/constants";
import { PromptDetailsText } from "../../i18n/PromptDetailsText";
import { commonText } from "../../i18n/Common";

const label = { inputProps: { "aria-label": "Checkbox" } };
const PromptDetails = ({ promptData, isAdmin, showDivider = false, isChecked = false, handleCheckboxClick = () => {} }) => {
  const [promptDetails, setPromptDetails] = useState([]);
  useEffect(() => {
    setPromptDetails(
      (isAdmin ? PromptAdminPromptDetails : PromptEngineerPromptDetails).map((prompt) => ({
        title: prompt.label,
        value: promptData[prompt.variableName]
      }))
    );
  }, [promptData]);

  return (
    <div className="prompt-details-container">
      <div className="d-flex align-items-start">
        {isAdmin && (
          <Checkbox
            sx={{ marginLeft: "0.25rem", marginRight: "0.5rem" }}
            {...label}
            checked={isChecked}
            onChange={(event) => handleCheckboxClick(event, promptData.promptId)}
          />
        )}
        <div className={`prompt-details ${isAdmin ? "admin" : ""}`}>
          <div>
            <div className="prompt-text">{PromptDetailsText.promptText}</div>
            <div>{promptData.promptText}</div>
          </div>
          <div className="prompt-sub-detail-container">
            {promptDetails.map((prompt, index) => (
              <div key={index} className={`prompt-grid-items ${isAdmin ? "admin" : ""}`}>
                <div>
                  <div className="prompt-data-header">{prompt.title}</div>
                  <div>{prompt.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="prompt-data-header mt-3">{commonText.tagsText}</div>
          {promptData.tags.map((item, index) => (
            <Pill label={item} key={index} />
          ))}
          <div />
          {showDivider && <Divider sx={{ marginY: "1rem" }} />}
        </div>
      </div>
    </div>
  );
};

PromptDetails.defaultProps = {
  promptText: PromptDetailsText.promptText
};
export default PromptDetails;
