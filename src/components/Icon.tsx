export type IconName =
  | 'logo'
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'settings'
  | 'search'
  | 'plus'
  | 'check'
  | 'clock'
  | 'alert'
  | 'list'
  | 'trash'
  | 'close';

const PATHS: Record<IconName, string> = {
  logo: 'M4 6.5 12 3l8 3.5v5c0 4.5-3.2 8.2-8 9.5-4.8-1.3-8-5-8-9.5v-5Zm4.5 5 2.5 2.5 4.5-4.5',
  dashboard: 'M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9-3h7v10h-7V10Z',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  calendar: 'M5 5h14v15H5V5Zm0 5h14M9 3v4m6-4v4',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3 2 1.5-2 3.5-2.4-.8a7 7 0 0 1-1.6.9L16.5 19h-4l-.5-2.9a7 7 0 0 1-1.6-.9l-2.4.8-2-3.5L7.5 12 5 10.5l2-3.5 2.4.8c.5-.4 1-.7 1.6-.9L11.5 5h4l.5 2.9c.6.2 1.1.5 1.6.9l2.4-.8 2 3.5L19 12Z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4v4l3 2',
  alert: 'M12 4 3 19h18L12 4Zm0 6v4m0 3v.01',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  trash: 'M5 7h14M10 7V4h4v3m-8 0 1 13h10l1-13M10 11v6m4-6v6',
  close: 'M6 6l12 12M18 6 6 18',
};

type Props = { name: IconName; size?: number };

export default function Icon({ name, size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
