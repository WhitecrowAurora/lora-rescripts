import React from 'react';
import { useApp } from '../context/AppContext';
import { LaunchPage } from '../pages/LaunchPage';
import { RuntimePage } from '../pages/RuntimePage';
import { AdvancedPage } from '../pages/AdvancedPage';
import { InstallPage } from '../pages/InstallPage';
import { ExtensionsPage } from '../pages/ExtensionsPage';
import { ConsolePage } from '../pages/ConsolePage';
import { AboutPage } from '../pages/AboutPage';
import type { PageId } from '../api/types';

const pages: Record<PageId, React.ComponentType> = {
  launch: LaunchPage,
  runtime: RuntimePage,
  advanced: AdvancedPage,
  install: InstallPage,
  extensions: ExtensionsPage,
  console: ConsolePage,
  about: AboutPage,
};

export function PageRouter() {
  const { activePage } = useApp();
  const Page = pages[activePage] || LaunchPage;
  return (
    <div key={activePage} className="page-enter h-full">
      <Page />
    </div>
  );
}
