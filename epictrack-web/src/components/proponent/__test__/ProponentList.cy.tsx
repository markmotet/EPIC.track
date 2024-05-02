import { MemoryRouter as Router } from "react-router-dom";
import ProponentList from "../ProponentList";
import { faker } from "@faker-js/faker";
import { Proponent } from "models/proponent";
import { MasterContext } from "components/shared/MasterContext";
import { Staff } from "models/staff";
import {
  createMockMasterContext,
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";
//ensure proponents are never the same by incrementing the counter
let proponentCounter = 0;

const generateMockProponent = (): Proponent => {
  proponentCounter += 1;
  return {
    id: faker.datatype.number() + proponentCounter,
    name: `${faker.commerce.productName()} ${proponentCounter}`,
    is_active: faker.datatype.boolean(),
    relationship_holder_id: faker.datatype.number() + proponentCounter,
    relationship_holder: mockStaffs[proponentCounter - 1] as Staff,
  };
};

const proponent1 = generateMockProponent();
const proponent2 = generateMockProponent();
const proponents = [proponent1, proponent2];

const endpoints = [
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}pip-org-types`,
  },
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}first_nations`,
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    body: { data: mockStaffs },
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}pip-org-types`,
    body: [],
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    body: [],
  },
];

describe("ProponentList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <MasterContext.Provider
          value={createMockMasterContext(proponents, proponents)}
        >
          <ProponentList />
        </MasterContext.Provider>
      </Router>
    );
  });

  it("should display the proponent list", () => {
    // Select the table container
    cy.get(".MuiInputBase-root");
  });

  it("should filter the proponent list based on the proponent name input", () => {
    testTableFiltering("Name", proponent1.name);
    cy.get("table").contains("tr", proponent1.name).should("be.visible");
    cy.get("table").contains("tr", proponent2.name).should("not.exist");
  });

  it("should filter the proponent list based on the proponent relationship holder  input", () => {
    testTableFiltering(
      "Relationship Holder",
      proponent1.relationship_holder?.full_name as Staff["full_name"]
    );
    cy.get("table")
      .contains(
        "tr",
        proponent1.relationship_holder?.full_name as Staff["full_name"]
      )
      .should("be.visible");
    cy.get("table")
      .contains(
        "tr",
        proponent2.relationship_holder?.full_name as Staff["full_name"]
      )
      .should("not.exist");
  });
});
