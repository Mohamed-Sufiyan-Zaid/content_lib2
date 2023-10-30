import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import UploadBox from "../../components/common/UploadBox/UploadBox";
import "./UploadTemplate.scss";
import { useState } from "react";

function UploadTemplate({ open, setOpen }) {
  const [files, setFiles] = useState([]);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = () => {
    const formData = new FormData();
    formData.append("file", files[0]);
    // eslint-disable-next-line no-console
    console.log(formData);
    // TODO: Call API to upload file as binary using formData where body: formData and 'Content-Type': 'multipart/form-data'
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="dialog-title" className="uploadTemplateDialog">
      <DialogContent>
        <UploadBox setFiles={setFiles} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadTemplate;
