import React from "react";
import { Box, IconButton } from "@mui/material";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { useSnackbar, SnackbarContent } from "notistack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { Palette } from "../../../../styles/theme";
import { CloseIconComponent } from "./icons";
import { ETNotificationProps } from "../type";

const useStyles = makeStyles({
  notificationWrapper: {
    minWidth: "600px",
    display: "flex",
    padding: "16px 24px",
    gap: "16px",
    flexDirection: "column",
  },
  withTitle: {
    flexDirection: "column",
    gap: "8px",
  },
  success: {
    backgroundColor: Palette.success.bg.light,
    color: Palette.success.dark,
  },
  warning: {
    backgroundColor: Palette.secondary.bg.light,
    color: Palette.secondary.dark,
  },
  error: {
    backgroundColor: Palette.error.bg.light,
    color: Palette.error.dark,
  },
  info: {
    color: Palette.primary.main,
    backgroundColor: Palette.primary.bg.light,
  },
  header: {
    display: "flex",
    gap: "16px",
    width: "100%",
    alignItems: "center",
  },
  content: {
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "24px",
    letterSpacing: "-0.32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  actions: {
    display: "flex",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "16px",
    gap: "1rem",
  },
  message: {
    flexGrow: 1,
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "32px",
    letterSpacing: "-0.4px",
  },
});

const ETNotification = React.forwardRef<HTMLDivElement, ETNotificationProps>(
  (props, ref) => {
    const { id, message, type, helpText, actions, iconVariant, ...other } =
      props;
    const { closeSnackbar } = useSnackbar();
    const classes = useStyles();

    const handleDismiss = React.useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        {...other}
        className={clsx(classes.notificationWrapper, {
          [classes.success]: type === "success",
          [classes.warning]: type === "warning",
          [classes.error]: type === "error",
          [classes.info]: type === "info",
          [classes.withTitle]: Boolean(helpText),
        })}
      >
        <Box className={classes.header}>
          {iconVariant[type]}{" "}
          <Typography className={classes.message}>{message}</Typography>
          <IconButton
            onClick={handleDismiss}
            sx={{ width: "2.5rem", height: "2.5rem", padding: "8px" }}
            disableRipple
          >
            <CloseIconComponent />
          </IconButton>
        </Box>
        {(helpText || actions) && (
          <Box className={classes.content}>
            <Typography>{helpText}</Typography>
            {actions && actions.length > 0 && (
              <Box className={classes.actions}>
                {actions?.map((action) => (
                  <Button
                    variant="outlined"
                    color={action.color}
                    onClick={action.callback}
                    sx={{ bgcolor: "inherit" }}
                    key={action.label}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}
      </SnackbarContent>
    );
  }
);

ETNotification.displayName = "ETNotification";

export default ETNotification;