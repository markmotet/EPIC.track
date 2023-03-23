import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Container, FormLabel, Grid
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MaterialReactTable from 'material-react-table';
import { RESULT_STATUS, REPORT_TYPE, DATE_FORMAT } from '../../../constants/application-constant';
import ReportService from '../../../services/reportService';
import { dateUtils } from '../../../utils';

export default function ResourceForecast() {
  const [reportDate, setReportDate] = useState<string>();
  const [resultStatus, setResultStatus] = useState<string>();
  const [rfData, setRFData] = useState<any[]>([]);
  // const [selectedFilters, setSelectedFilter] = useState<string[]>([]);

  // const filters = [
  //   {
  //     label: 'Capital Investment',
  //     value: 'capital_investment'
  //   },
  //   {
  //     label: 'Responsible EPD',
  //     value: 'responsible_epd'
  //   },
  //   {
  //     label: 'EAO Team',
  //     value: 'eao_team'
  //   },
  //   {
  //     label: 'Work Team Members',
  //     value: 'work_team_members'
  //   },
  //   {
  //     label: 'Referral Timing',
  //     value: 'referral_timing'
  //   }];
  const setMonthColumns = useCallback(() => {
    let columns = [];
    if (rfData && rfData.length > 0) {
      columns = rfData[0].months.map((rfMonth: any, index: number) => {
        return {
          header: rfMonth['label'],
          accessorFn: (row: any) => `${row.months[index].phase}`,
          enableHiding: false,
          enableColumnFilter: false,
          Cell: ({ row }: any) => (
            <Box sx={{
              bgcolor: row.original.months[index].color,
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }
            }>
              {row.original.months[index].phase}
            </Box>
          )
        }
      })
    }
    return columns;
  }, [rfData]);

  const filterFn = useCallback((filterField: string) => rfData
    .filter(p => p[filterField])
    .map(p => p[filterField])
    .filter((ele, index, arr) => arr.findIndex(t => t === ele) === index), [rfData])

  const projectFilter = filterFn('project_name');
  const eaTypeFilter = filterFn('ea_type');
  const projectPhaseFilter = filterFn('project_phase');
  const eaActFilter = filterFn('ea_act');
  const iaacFilter = filterFn('iaac');
  const typeFilter = useMemo(() => rfData.map(p => `${p.type}( ${p.sub_type} )`)
    .filter((ele, index, arr) => arr.findIndex(t => t === ele) === index), [rfData]);
  const envRegionFilter = filterFn('env_region');
  const nrsRegionFilter = filterFn('nrs_region');
  const workLeadFilter = filterFn('work_lead');
  const epdFilter = filterFn('responsible_epd');
  const teamFilter = filterFn('eao_team');
  const cairtLeadFilter = filterFn('cairt_lead');

  const columns = useMemo(
    () => [
      {
        accessorKey: 'project_name',
        header: 'Project',
        enableHiding: false,
        filterVariant: 'select',
        filterSelectOptions: projectFilter
      },
      {
        accessorKey: 'capital_investment',
        header: 'Estimated Capital Investment'
      },
      {
        accessorKey: 'ea_type',
        header: 'EA Type',
        filterVariant: 'select',
        filterSelectOptions: eaTypeFilter
      },
      {
        accessorKey: 'project_phase',
        header: 'Project Phase',
        filterVariant: 'select',
        filterSelectOptions: projectPhaseFilter
      },
      {
        accessorKey: 'ea_act',
        header: 'EA Act',
        filterVariant: 'select',
        filterSelectOptions: eaActFilter
      },
      {
        accessorKey: 'iaac',
        header: 'IAAC',
        filterVariant: 'select',
        filterSelectOptions: iaacFilter
      },
      {
        accessorFn: (row: any): any => `${row.type}( ${row.sub_type} )`,
        header: 'Project Type (Subtype)',
        filterVariant: 'select',
        filterSelectOptions: typeFilter
      },
      {
        accessorKey: 'env_region',
        header: 'ENV Region',
        filterVariant: 'select',
        filterSelectOptions: envRegionFilter
      },
      {
        accessorKey: 'nrs_region',
        header: 'NRS Region',
        filterVariant: 'select',
        filterSelectOptions: nrsRegionFilter
      },
      {
        accessorKey: 'responsible_epd',
        header: 'Responsible EPD',
        filterVariant: 'select',
        filterSelectOptions: epdFilter
      },
      {
        accessorKey: 'cairt_lead',
        header: 'FN CAIRT Lead',
        filterVariant: 'select',
        filterSelectOptions: cairtLeadFilter
      },
      {
        accessorKey: 'eao_team',
        header: 'Lead\'s Team',
        filterVariant: 'select',
        filterSelectOptions: teamFilter
      },
      {
        accessorKey: 'work_lead',
        header: 'Work Lead',
        filterVariant: 'select',
        filterSelectOptions: workLeadFilter
      },
      {
        accessorKey: 'work_team_members',
        header: 'Work Team Members'
      },
      ...setMonthColumns(),
      {
        accessorKey: 'referral_timing',
        header: 'Referral Timing',
        enableHiding: true
      }
    ], [setMonthColumns]
  );

  // const getSelectedFilterLabels = (selected: string[]) => {
  //   const labels = selected.map(val => {
  //     return filters.filter(p => p.value === val)[0].label
  //   });
  //   return labels;
  // }
  const fetchReportData = async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData =
        await ReportService.fetchReportData(REPORT_TYPE.RESOURCE_FORECAST, {
          report_date: reportDate
        });
      setResultStatus(RESULT_STATUS.LOADED);
      if (reportData.status === 200) {
        setRFData((reportData.data as never)['data']);
      }
      if (reportData.status === 204) {
        setResultStatus(RESULT_STATUS.NO_RECORD);
      }
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }
  return (
    <>
      <Grid component="form" onSubmit={(e) => e.preventDefault()}
        container spacing={2} sx={{ mt: '5px', mb: '15px' }}>
        <Grid item sm={2}><FormLabel>Report Date</FormLabel></Grid>
        <Grid item sm={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker format={DATE_FORMAT}
              onChange={(dateVal: any) => setReportDate(dateUtils.formatDate(dateVal.$d))}
              slotProps={{
                textField: {
                  id: 'ReportDate'
                }
              }} />
          </LocalizationProvider>
        </Grid>
        {/* <Grid item sm={2}><FormLabel>Filter</FormLabel></Grid>
        <Grid item sm={2}>
          <FormControl sx={{ width: 300 }}>
            <Select
              multiple
              value={selectedFilters}
              input={<OutlinedInput />}
              onChange={(e: any) => setSelectedFilter(e.target.value)}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Placeholder</em>;
                }

                return getSelectedFilterLabels(selected).join(', ');
              }}
            >
              {
                filters.map(filter => (
                  <MenuItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </MenuItem>
                )
                )}
            </Select>
          </FormControl>
        </Grid> */}
        <Grid item sm={resultStatus === RESULT_STATUS.LOADED ? 7 : 8}>
          <Button variant='contained'
            type='submit'
            onClick={fetchReportData}
            sx={{ float: 'right' }}>Submit
          </Button>
        </Grid>
        <Grid item sm={1}>
          {resultStatus === RESULT_STATUS.LOADED &&
            <Button variant='contained'>Download</Button>}
        </Grid>
      </Grid>
      <MaterialReactTable
        initialState={{
          density: 'compact'
        }}
        columns={columns}
        enableDensityToggle={false}
        enableStickyHeader={true}
        state={{
          isLoading: resultStatus === RESULT_STATUS.LOADING
        }}
        data={rfData} />
      {resultStatus === RESULT_STATUS.ERROR &&
        <Container>
          <Alert severity="error">
            Error occured during processing. Please try again after some time.
          </Alert>
        </Container>}
    </>
  );
}