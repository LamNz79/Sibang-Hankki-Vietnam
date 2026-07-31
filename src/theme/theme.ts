import { createTheme } from "@mantine/core";
import {
  brandPalettes,
  uiRadii,
  uiTypography,
} from "@/theme/tokens";

export const appTheme = createTheme({
  primaryColor: "warmCoral",
  primaryShade: 7,
  defaultRadius: uiRadii.card,
  fontFamily: uiTypography.fontFamily,
  headings: {
    fontFamily: uiTypography.fontFamily,
  },
  colors: brandPalettes,
});
