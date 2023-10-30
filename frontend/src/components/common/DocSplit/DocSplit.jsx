import * as React from "react";
import Select from "../Select/Select";
import "./DocSplit.scss";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function DocSplit({ itemsList, handleValueChange, deleteItem, optionsList }) {
  return (
    <div className="dotSplit-component">
      {itemsList?.map((item, index) => (
        <div key={index}>
          <div className="row align-items-center">
            <div className="col-lg-10">
              <Select
                value={item}
                placeholder="Select Option"
                options={optionsList}
                margin={{ xs: "0 0 1rem 0", md: "0 0 2rem 0" }}
                onChange={(event) => handleValueChange(event.target.value, index)}
              />
            </div>
            <div className="col-lg-2">
              <DeleteOutlineIcon onClick={() => deleteItem(index)} color="primary" className="icon-middle" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
