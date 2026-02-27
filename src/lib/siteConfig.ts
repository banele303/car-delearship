// Centralized site branding & contact configuration
export const siteConfig = {
  brand: {
    name: 'Advanced Auto',
    tagline: 'Cars You Can Trust',
  },
  contact: {
    phoneDisplay: '+27 68 072 0424',
    phoneRaw: '+27680720424',
    whatsappNumberRaw: '+27680720424',
    whatsappMessage: "Hi I'm interested in a vehicle",
    emailGeneral: 'info@advancedauto.co.za',
    emailTradeIn: 'tradein@advancedauto.co.za',
    addressLine: '2A Amanda Ave, Gleneagles, Johannesburg South, 2091',
    hours: {
      weekday: '08:00–17:00',
      saturday: '08:00–14:00',
      sunday: 'Closed'
    }
  }
} as const;

export type SiteConfig = typeof siteConfig;
