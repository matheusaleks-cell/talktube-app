import {
  LayoutDashboard,
  CalendarCheck,
  Video,
  Languages,
  Cog,
  Users,
  BarChart3,
  Bell,
  FileText,
  Package,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
};

export const userNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard />,
  },
  {
    href: '/dashboard/meetings',
    label: 'Minhas Reuniões',
    icon: <CalendarCheck />,
  },
  {
    href: '/dashboard/recordings',
    label: 'Gravações',
    icon: <Video />,
  },
  {
    href: '/dashboard/interpreters',
    label: 'Intérpretes',
    icon: <Languages />,
  },
  {
    href: '/dashboard/settings',
    label: 'Configurações',
    icon: <Cog />,
  },
];

export const adminNavItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: <LayoutDashboard />,
  },
  {
    href: '/admin/users',
    label: 'Usuários',
    icon: <Users />,
  },
  {
    href: '/admin/meetings',
    label: 'Reuniões',
    icon: <CalendarCheck />,
  },
  {
    href: '/admin/interpreters',
    label: 'Intérpretes',
    icon: <Languages />,
  },
  {
    href: '/admin/reminders',
    label: 'Lembretes',
    icon: <Bell />,
  },
  {
    href: '/admin/reports',
    label: 'Relatórios',
    icon: <BarChart3 />,
  },
   {
    href: '/admin/settings',
    label: 'Configurações',
    icon: <Cog />,
  },
];

export const languages = [
  "Português", "Inglês", "Espanhol", "Francês", "Alemão", "Mandarim", "Japonês", "Russo", "Italiano", "Coreano", "Árabe"
];

export const timezones = [
  "(GMT-11:00) Midway Island, Samoa",
  "(GMT-10:00) Hawaii",
  "(GMT-09:00) Alaska",
  "(GMT-08:00) Pacific Time (US & Canada)",
  "(GMT-07:00) Mountain Time (US & Canada)",
  "(GMT-06:00) Central Time (US & Canada)",
  "(GMT-05:00) Eastern Time (US & Canada)",
  "(GMT-04:00) Atlantic Time (Canada)",
  "(GMT-03:00) Buenos Aires, Georgetown",
  "(GMT-02:00) Mid-Atlantic",
  "(GMT-01:00) Azores",
  "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London",
  "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
  "(GMT+02:00) Athens, Bucharest, Istanbul",
  "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
  "(GMT+04:00) Abu Dhabi, Muscat",
  "(GMT+05:00) Islamabad, Karachi, Tashkent",
  "(GMT+06:00) Almaty, Novosibirsk",
  "(GMT+07:00) Bangkok, Hanoi, Jakarta",
  "(GMT+08:00) Beijing, Perth, Singapore, Hong Kong",
  "(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
  "(GMT+10:00) Brisbane, Canberra, Melbourne, Sydney",
  "(GMT+11:00) Magadan, Solomon Is., New Caledonia",
  "(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka",
];

export const chartData = [
  { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Fev", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Abr", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mai", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Ago", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Set", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Out", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Dez", total: Math.floor(Math.random() * 5000) + 1000 },
]

export const languageUsageData = [
  { name: 'Inglês', value: 480, fill: 'hsl(var(--chart-1))' },
  { name: 'Português', value: 320, fill: 'hsl(var(--chart-2))' },
  { name: 'Espanhol', value: 250, fill: 'hsl(var(--chart-3))' },
  { name: 'Francês', value: 180, fill: 'hsl(var(--chart-4))' },
  { name: 'Outros', value: 100, fill: 'hsl(var(--muted))' },
];
