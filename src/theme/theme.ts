import { createTheme } from "@mantine/core";
import {
  brandPalettes,
  uiRadii,
  uiTypography,
} from "@/theme/tokens";

export const appTheme = createTheme({
  primaryColor: "oligoTeal",
  primaryShade: 9,
  defaultRadius: uiRadii.card,
  fontFamily: uiTypography.fontFamily,
  headings: {
    fontFamily: uiTypography.fontFamily,
  },
  colors: brandPalettes,
});
