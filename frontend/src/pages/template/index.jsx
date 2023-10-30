import React from "react";
import TabComponent from "../../component/tabs/index";
import Table from "../../components/common/Table/Table";
import { MyProjects } from "../../jsonData";

function Template() {
  return (
    <div>
      <p>Back to Project Home</p>
      <TabComponent
        tabConfigs={[
          { value: "a", label: "Created", component: <Table MyProjects={MyProjects} /> },
          { value: "b", label: "Uploaded", component: <Table MyProjects={MyProjects} /> }
        ]}
      />
    </div>
  );
}

export default Template;
