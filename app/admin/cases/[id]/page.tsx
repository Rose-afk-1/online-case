'use client';

import CaseDetails from './CaseDetails';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function CaseDetailsPage({ params }: PageProps) {
  return <CaseDetails params={params} />;
} 