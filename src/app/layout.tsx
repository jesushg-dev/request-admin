import { ReactNode } from 'react';

import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import '@syncfusion/ej2-base/styles/tailwind.css';
import '@syncfusion/ej2-buttons/styles/tailwind.css';
import '@syncfusion/ej2-calendars/styles/tailwind.css';
import '@syncfusion/ej2-dropdowns/styles/tailwind.css';
import '@syncfusion/ej2-inputs/styles/tailwind.css';
import '@syncfusion/ej2-lists/styles/tailwind.css';
import '@syncfusion/ej2-navigations/styles/tailwind.css';
import '@syncfusion/ej2-popups/styles/tailwind.css';
import '@syncfusion/ej2-splitbuttons/styles/tailwind.css';
import '@syncfusion/ej2-layouts/styles/tailwind.css';
import '@syncfusion/ej2-react-layouts/styles/tailwind.css';
import '@syncfusion/ej2-react-dropdowns/styles/tailwind.css';
import '@syncfusion/ej2-react-grids/styles/tailwind.css';
import '@syncfusion/ej2-react-kanban/styles/tailwind.css';
import '@syncfusion/ej2-react-diagrams/styles/tailwind.css';
import '@syncfusion/ej2-react-lists/styles/tailwind.css';
import '@syncfusion/ej2-react-popups/styles/tailwind.css';
import '@syncfusion/ej2-react-inputs/styles/tailwind.css';
import '@syncfusion/ej2-richtexteditor/styles/tailwind.css';
import '@syncfusion/ej2-icons/styles/tailwind.css';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children;
}
