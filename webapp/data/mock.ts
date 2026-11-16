// Vervang deze hardcoded voorbeelddata later door echte gegevens.
export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: "people" | "check" | "activity" | "spark";
};

export type ActivityRow = {
  id: string;
  name: string;
  detail: string;
  time: string;
  status: "Afgerond" | "In behandeling" | "Gepland";
};

export const dashboardStats: DashboardStat[] = [
  { label: "Bewoners actief", value: "24", change: "+3 deze maand", positive: true, icon: "people" },
  { label: "Taken afgerond", value: "86%", change: "+12% deze week", positive: true, icon: "check" },
  { label: "Activiteiten", value: "08", change: "2 vandaag", positive: true, icon: "activity" },
  { label: "Open meldingen", value: "03", change: "1 vraagt aandacht", positive: false, icon: "spark" },
];

export const chartValues = [28, 38, 34, 57, 48, 69, 61, 82, 72, 91, 77, 95];
export const chartLabels = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

export const recentActivity: ActivityRow[] = [
  { id: "A-1048", name: "Keuken schoonmaken", detail: "Mila Jansen · Begane grond", time: "Vandaag, 10:42", status: "Afgerond" },
  { id: "A-1047", name: "Boodschappen aangevuld", detail: "Jonas de Vries · Gedeelde lijst", time: "Vandaag, 09:18", status: "In behandeling" },
  { id: "A-1046", name: "Filmavond gepland", detail: "Sam Bakker · Woonkamer", time: "Gisteren, 19:30", status: "Gepland" },
  { id: "A-1045", name: "Papierbak buitengezet", detail: "Noor Visser · Achterom", time: "Gisteren, 16:05", status: "Afgerond" },
];

export const upcomingItems = [
  { day: "14", month: "NOV", title: "Keuken schoonmaken", person: "Mila Jansen", time: "09:00" },
  { day: "15", month: "NOV", title: "Huisavond", person: "Alle bewoners", time: "20:00" },
  { day: "16", month: "NOV", title: "Papier en karton", person: "Jonas de Vries", time: "08:30" },
];