import React from "react";
import sendIcon from "../../../assets/images/send.svg";

const TextArea = ({ value, onChange, rows, handleOnClick, handleOnKeyPress }) => (
  <div style={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
    <textarea
      className="form-control"
      value={value}
      onChange={onChange}
      onKeyDown={handleOnKeyPress}
      rows={rows}
      style={{
        width: "100%",
        minHeight: "40px",
        border: "1px solid #e6e6e6",
        background: "#f6f6f6",
        paddingLeft: "1em",
        paddingRight: "48px",
        resize: "none"
      }}
      placeholder="Please input your prompt here"
    />
    <img
      src={sendIcon}
      role="presentation"
      onClick={handleOnClick}
      alt="Send"
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        width: "15px"
      }}
    />
  </div>
);

export default TextArea;
