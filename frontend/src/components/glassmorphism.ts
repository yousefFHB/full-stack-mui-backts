import type { SxProps, Theme } from "@mui/material";

export const glassCardSx: SxProps<Theme> = {
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.85)",
  boxShadow: "0 16px 48px -12px rgba(15, 23, 42, 0.09), 0 2px 12px -2px rgba(15, 23, 42, 0.04)",
  borderRadius: 4,
  overflow: "hidden",
};

export const glassNavSx: SxProps<Theme> = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  boxShadow: "0 8px 30px -4px rgba(15, 23, 42, 0.06)",
  borderRadius: 3,
};

export const glassInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(255, 255, 255, 0.6)",
    borderRadius: 2.5,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.9)",
    },
    "&.Mui-focused": {
      background: "#ffffff",
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.15)",
    },
  },
};
