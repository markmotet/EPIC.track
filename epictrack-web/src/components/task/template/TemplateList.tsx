import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import { RESULT_STATUS } from "../../../constants/application-constant";
import TemplateForm from "./CreateTemplateForm";
import { Template } from "../../../models/template";
import TaskService from "../../../services/taskService";
import MasterTrackTable from "../../shared/MasterTrackTable";
import TrackDialog from "../../shared/TrackDialog";
import { EpicTrackPageGridContainer } from "../../shared";
import TemplateTaskList from "./TemplateTasksList";

const TemplateList = () => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [templateId, setTemplateId] = React.useState<number>();
  const [deleteTemplateId, setDeleteTemplateId] = React.useState<number>();
  const [showCreateDialog, setShowCreateDialog] =
    React.useState<boolean>(false);
  const [showDetailsDialog, setShowDetailsDialog] =
    React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [eaActs, setEAActs] = React.useState<string[]>([]);
  const [phases, setPhases] = React.useState<string[]>([]);
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);

  const titleSuffix = "Task Template Details";
  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    setShowCreateDialog(false);
    setShowDetailsDialog(false);
  };
  const onViewDetails = (id: number) => {
    setTemplateId(id);
    setShowDetailsDialog(true);
  };
  const getTemplates = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const templateResult = await TaskService.getTemplates();
      if (templateResult.status === 200) {
        setTemplates(templateResult.data as never);
      }
    } catch (error) {
      console.error("Template List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getTemplates();
  }, []);

  React.useEffect(() => {
    const eaActs = templates
      .map((t) => t.ea_act.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setEAActs(eaActs);
    const phases = templates
      .map((t) => t.phase.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setPhases(phases);
    const workTypes = templates
      .map((t) => t.work_type.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setWorkTypes(workTypes);
  }, [templates]);

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setDeleteTemplateId(id);
  };

  const deleteTemplate = async (templateId?: number) => {
    const result = await TaskService.deleteTemplate(templateId);
    if (result.status === 200) {
      setDeleteTemplateId(undefined);
      setShowDeleteDialog(false);
      getTemplates();
    }
  };

  const columns = React.useMemo<MRT_ColumnDef<Template>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        sortingFn: "sortFn",
      },
      {
        accessorKey: "ea_act.name",
        filterVariant: "multi-select",
        header: "EA Act",
        filterSelectOptions: eaActs,
      },
      {
        accessorKey: "work_type.name",
        filterVariant: "multi-select",
        header: "Work Type",
        filterSelectOptions: workTypes,
      },
      {
        accessorKey: "phase.name",
        header: "Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phases,
      },
      {
        accessorKey: "is_active",
        header: "Active",
        filterVariant: "checkbox",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && (
              <Chip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <Chip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [eaActs]
  );

  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={templates}
            initialState={{
              sorting: [
                {
                  id: "name",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton
                  onClick={() => onViewDetails(row.original.id)}
                  title="View Tasks"
                >
                  <VisibilityIcon />
                </IconButton>
                {/* <Switch
                  color="success"
                  defaultChecked={row.original.is_active}
                  title="Approve/Disable"
                  onChange={(e) => handleApproval(e, row.original.id)}
                /> */}
                <IconButton onClick={() => handleDelete(row.original.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Button
                  onClick={() => {
                    setShowCreateDialog(true);
                    setTemplateId(undefined);
                  }}
                  variant="contained"
                >
                  Create Task Template
                </Button>
              </Box>
            )}
          />
        </Grid>
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showCreateDialog}
        dialogTitle={(templateId ? "Update " : "Create ") + titleSuffix}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <TemplateForm
          onCancel={onDialogClose}
          templateId={templateId}
          onSubmitSuccess={getTemplates}
        />
      </TrackDialog>
      <TrackDialog
        open={showDetailsDialog}
        dialogTitle="Template Tasks"
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <TemplateTaskList
          onCancel={onDialogClose}
          templateId={templateId}
          onApproval={getTemplates}
        />
      </TrackDialog>
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle="Delete"
        dialogContentText="Are you sure you want to delete?"
        okButtonText="Yes"
        cancelButtonText="No"
        isActionsRequired
        onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={() => deleteTemplate(deleteTemplateId)}
      />
    </>
  );
};

export default TemplateList;