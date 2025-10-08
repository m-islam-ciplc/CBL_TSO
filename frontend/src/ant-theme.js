// Ant Design Custom Theme Configuration
export const antTheme = {
  token: {
    // Color palette - CBL brand colors
    colorPrimary: '#2c3e50',
    colorPrimaryHover: '#34495e',
    colorPrimaryActive: '#1a252f',

    // Layout colors
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBorder: '#d9d9d9',

    // Typography
    fontSize: 13,
    fontSizeLG: 15,
    fontSizeXL: 18,
    fontSizeHeading1: 28,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // Spacing
    padding: 12,
    paddingLG: 16,
    paddingXL: 24,
    margin: 8,
    marginLG: 12,
    marginXL: 16,

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,

    // Component specific
    controlHeight: 32,
    controlHeightLG: 36,
    controlHeightSM: 28,
  },
  components: {
    Button: {
      controlHeight: 32,
      fontSize: 13,
      paddingInline: 12,
      borderRadius: 6,
    },
    Card: {
      padding: 12,
      paddingLG: 16,
      borderRadius: 8,
    },
    Table: {
      padding: 8,
      fontSize: 12,
    },
    Select: {
      controlHeight: 32,
      fontSize: 13,
    },
    Input: {
      controlHeight: 32,
      fontSize: 13,
    },
    Form: {
      itemMarginBottom: 16,
    },
  },
};
