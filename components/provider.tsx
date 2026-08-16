"use client";

import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { Anek_Bangla } from "next/font/google";

const anekBangla = Anek_Bangla({
    subsets: ["bengali"],
    display: "swap",
});

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#0b57d0",
            dark: "#0842a0",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#146c43",
        },
        warning: {
            main: "#f9ab00",
        },
        error: {
            main: "#b3261e",
        },
        background: {
            default: "#f8fbff",
            paper: "#ffffff",
        },
        text: {
            primary: "#1f1f1f",
            secondary: "#5f6368",
        },
        divider: "#dfe5f2",
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: anekBangla.style.fontFamily,
        h1: { fontSize: "clamp(2.6rem, 6vw, 5rem)", fontWeight: 700, lineHeight: 1.02 },
        h4: { fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1 },
        h5: { fontSize: "1.7rem", fontWeight: 700 },
        h6: { fontSize: "1.25rem", fontWeight: 700 },
        button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
        MuiButton: {
            defaultProps: { size: "large", variant: "contained", disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    minHeight: 52,
                    paddingInline: 24,
                    fontSize: "1rem",
                },
            },
        },
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    border: "1px solid #dfe5f2",
                    boxShadow: "0 20px 50px rgba(60, 64, 67, 0.10)",
                },
            },
        },
        MuiTextField: {
            defaultProps: { size: "medium", variant: "outlined" },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "#fff",
                },
            },
        },
        MuiButtonBase: {
            defaultProps: { disableTouchRipple: true },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    // Prevent sticky hover states on mobile touch
                    "@media (hover: none)": {
                        "&:hover": {
                            backgroundColor: "transparent",
                        },
                        "&.Mui-focusVisible": {
                            backgroundColor: "transparent",
                        }
                    },
                },
            },
        },
        MuiSelect: {
            defaultProps: {
                MenuProps: {
                    disableScrollLock: true,
                    PaperProps: {
                        style: {
                            maxHeight: 300,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 700, borderRadius: 8 },
            },
        },
    },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
