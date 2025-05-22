'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Case types for dropdown selection
const CASE_TYPES = [
  { label: 'Civil', value: 'civil' },
  { label: 'Criminal', value: 'criminal' },
  { label: 'Family', value: 'family' },
  { label: 'Constitutional', value: 'constitutional' },
  { label: 'Administrative/Service', value: 'administrative' },
  { label: 'Tax and Revenue', value: 'tax' },
  { label: 'Consumer', value: 'consumer' },
  { label: 'Company and Commercial', value: 'commercial' },
  { label: 'Election', value: 'election' },
  { label: 'Special/Miscellaneous', value: 'special' },
  { label: 'Cyber Crime', value: 'cybercrime' },
  { label: 'Other', value: 'other' }
];

// Define type for case title options
type CaseTitleOption = {
  label: string;
  value: string;
};

// Define type for the CASE_TITLES_BY_TYPE object
type CaseTitlesMap = {
  [key: string]: CaseTitleOption[];
};

// Case titles by type
const CASE_TITLES_BY_TYPE: CaseTitlesMap = {
  civil: [
    { label: "Title Suit (T.S.)", value: "title_suit" },
    { label: "Original Suit (O.S.)", value: "original_suit" },
    { label: "Money Suit (M.S.)", value: "money_suit" },
    { label: "Execution Petition (E.P.)", value: "execution_petition" },
    { label: "Hindu Marriage Original Petition (H.M.O.P.)", value: "hindu_marriage_original_petition" },
    { label: "Family Court Original Petition (F.C.O.P.)", value: "family_court_original_petition" },
    { label: "Land Acquisition Case (L.A.C.)", value: "land_acquisition_case" },
    { label: "Interlocutory Application (I.A.)", value: "interlocutory_application" },
    { label: "Civil Suit (C.S.)", value: "civil_suit" },
    { label: "Regular Second Appeal (R.S.A.)", value: "regular_second_appeal" },
    { label: "Appeal Suit (A.S.)", value: "appeal_suit" },
    { label: "Rent Control Case (R.C.)", value: "rent_control_case" },
    { label: "Probate Application (P.A.)", value: "probate_application" },
    { label: "Small Causes Case (S.C.C.)", value: "small_causes_case" },
    { label: "Guardianship Original Petition (G.O.P.)", value: "guardianship_original_petition" },
    { label: "Original Petition (O.P.)", value: "original_petition" },
    { label: "Maintenance Case (M.C.)", value: "maintenance_case" },
    { label: "Civil Miscellaneous Appeal (C.M.A.)", value: "civil_miscellaneous_appeal" },
    { label: "Civil Revision Petition (C.R.P.)", value: "civil_revision_petition" },
    { label: "Regular First Appeal (R.F.A)", value: "regular_first_appeal" },
    { label: "Miscellaneous Petition (M.P.)", value: "miscellaneous_petition" },
    { label: "Civil Miscellaneous Petition (C.M.P.)", value: "civil_miscellaneous_petition" },
    { label: "Succession Certificate (S.C.)", value: "succession_certificate" },
    { label: "Letters of Administration Petition (L.O.P.)", value: "letters_of_administration_petition" },
    { label: "Restoration Application (R.A.)", value: "restoration_application" },
    { label: "Transfer Petition (T.P.)", value: "transfer_petition" }
  ],
  criminal: [
    { label: "General Register Case (G.R. Case)", value: "general_register_case" },
    { label: "Complaint Register Case (C.R. Case)", value: "complaint_register_case" },
    { label: "Police Report Case (P.R. Case)", value: "police_report_case" },
    { label: "Calendar Case / Criminal Case (C.C.)", value: "calendar_case" },
    { label: "Sessions Trial Case (S.T. Case)", value: "sessions_trial_case" },
    { label: "Security for Keeping Peace (U/s 107 CrPC)", value: "security_keeping_peace" },
    { label: "Land/Property Dispute Case (U/s 145 CrPC)", value: "land_property_dispute_case" },
    { label: "Maintenance Case (M.C.)", value: "maintenance_case" },
    { label: "Excise Case (E.C. Case)", value: "excise_case" },
    { label: "Police Station Case (P.S. Case)", value: "police_station_case" },
    { label: "Negotiable Instruments Act Case (N.I. Act Case)", value: "negotiable_instruments_act_case" },
    { label: "Criminal Appeal (Crl.A.)", value: "criminal_appeal" },
    { label: "Criminal Revision Petition (Crl.R.P.)", value: "criminal_revision_petition" },
    { label: "Criminal Miscellaneous Case (Crl.M.C.)", value: "criminal_miscellaneous_case" },
    { label: "Criminal Original Petition (Crl.O.P.)", value: "criminal_original_petition" },
    { label: "Bail Application (B.A.)", value: "bail_application" },
    { label: "Anticipatory Bail Application (A.B.A.)", value: "anticipatory_bail_application" },
    { label: "Writ Petition (Criminal) (W.P. (Cr.))", value: "writ_petition_criminal" },
    { label: "Habeas Corpus Petition (H.C.P.)", value: "habeas_corpus_petition" },
    { label: "Criminal Petition (Crl.P.)", value: "criminal_petition" },
    { label: "SC/ST Atrocities Case (SC/ST Case)", value: "sc_st_atrocities_case" },
    { label: "Narcotic Drugs and Psychotropic Substances Case (NDPS Case)", value: "ndps_case" },
    { label: "Protection of Children from Sexual Offences (POCSO Case)", value: "pocso_case" },
    { label: "Unlawful Activities (Prevention) Act Case (UAPA Case)", value: "uapa_case" },
    { label: "Enforcement Directorate Case (E.D. Case)", value: "enforcement_directorate_case" },
    { label: "Central Bureau of Investigation Case (C.B.I. Case)", value: "cbi_case" },
    { label: "Essential Commodities Act Case (E.C. Act Case)", value: "essential_commodities_act_case" },
    { label: "Foreign Exchange Management Act (FEMA Case)", value: "fema_case" },
    { label: "Information Technology Act Case (I.T. Act Case)", value: "it_act_case" },
    { label: "Miscellaneous Petition (M.P.)", value: "miscellaneous_petition" },
    { label: "Transfer Case (T.P.)", value: "transfer_case" },
    { label: "Domestic Violence Case (D.V. Case)", value: "domestic_violence_case" },
    { label: "Letters Patent Appeal (L.P.A.)", value: "letters_patent_appeal" }
  ],
  family: [
    { label: "Hindu Marriage Original Petition (H.M.O.P.)", value: "hindu_marriage_original_petition" },
    { label: "Family Court Original Petition (F.C.O.P.)", value: "family_court_original_petition" },
    { label: "Guardianship Original Petition (G.O.P.)", value: "guardianship_original_petition" },
    { label: "Original Petition (Family Court) (O.P. (F.C.))", value: "original_petition_family_court" },
    { label: "Maintenance Case (M.C.)", value: "maintenance_case" },
    { label: "Restitution Case (R.C.)", value: "restitution_case" },
    { label: "Custody Case", value: "custody_case" },
    { label: "Visitation Petition", value: "visitation_petition" },
    { label: "Domestic Violence Case (D.V. Case)", value: "domestic_violence_case" },
    { label: "Protection of Women from Domestic Violence Act Case (P.W.D.V.A. Case)", value: "pwdva_case" },
    { label: "Interim Application (I.A.)", value: "interim_application" },
    { label: "Writ Petition (Civil) (W.P. (C))", value: "writ_petition_civil" },
    { label: "Appeal Suit (A.S.)", value: "appeal_suit" },
    { label: "Civil Revision Petition (C.R.P.)", value: "civil_revision_petition" },
    { label: "Civil Miscellaneous Appeal (C.M.A.)", value: "civil_miscellaneous_appeal" },
    { label: "Mutual Consent Petition", value: "mutual_consent_petition" },
    { label: "Nullity Petition", value: "nullity_petition" },
    { label: "Adoption Petition", value: "adoption_petition" },
    { label: "Mediation Referral Case", value: "mediation_referral_case" }
  ],
  constitutional: [
    { label: "W.P. (C) – Writ Petition (Civil)", value: "writ_petition_civil" },
    { label: "W.P. (Cr.) – Writ Petition (Criminal)", value: "writ_petition_criminal" },
    { label: "W.P. (PIL) – Public Interest Litigation", value: "public_interest_litigation" },
    { label: "W.P. (Tax) – Writ Petition (Tax-related)", value: "writ_petition_tax" },
    { label: "W.P. (Service) – Writ Petition (Service-related)", value: "writ_petition_service" },
    { label: "W.P. (Edu) – Writ Petition (Education-related)", value: "writ_petition_education" },
    { label: "W.P. (Election) – Writ Petition (Election matters)", value: "writ_petition_election" },
    { label: "S.L.P. (C) – Special Leave Petition (Civil)", value: "special_leave_petition_civil" },
    { label: "S.L.P. (Cr.) – Special Leave Petition (Criminal)", value: "special_leave_petition_criminal" },
    { label: "T.P. (C) – Transfer Petition (Civil)", value: "transfer_petition_civil" },
    { label: "T.P. (Cr.) – Transfer Petition (Criminal)", value: "transfer_petition_criminal" },
    { label: "Review Petition (C) – Review Petition (Civil)", value: "review_petition_civil" },
    { label: "Review Petition (Cr.) – Review Petition (Criminal)", value: "review_petition_criminal" },
    { label: "Curative Petition – Curative Petition", value: "curative_petition" },
    { label: "Original Suit – Filed under Article 131 (Inter-state disputes, rare)", value: "original_suit_article_131" }
  ],
  administrative: [
    { label: "O.A. – Original Application", value: "original_application" },
    { label: "R.A. – Review Application", value: "review_application" },
    { label: "M.A. – Miscellaneous Application", value: "miscellaneous_application" },
    { label: "W.P. (Service) – Writ Petition (Service)", value: "writ_petition_service" },
    { label: "C.A. – Contempt Application", value: "contempt_application" },
    { label: "A.T.A. – Administrative Tribunal Appeal", value: "administrative_tribunal_appeal" },
    { label: "T.A. – Transferred Application", value: "transferred_application" },
    { label: "I.A. – Interim Application", value: "interim_application" },
    { label: "P.A. – Promotion Appeal", value: "promotion_appeal" },
    { label: "Reinstatement Petition", value: "reinstatement_petition" }
  ],
  tax: [
    { label: "T.A. – Tax Appeal", value: "tax_appeal" },
    { label: "T.C. – Tax Case / Tax Case (Appeal)", value: "tax_case" },
    { label: "W.P. (Tax) – Writ Petition (Tax-related)", value: "writ_petition_tax" },
    { label: "R.A. (Tax) – Review Application (Tax)", value: "review_application_tax" },
    { label: "I.T.A. – Income Tax Appeal", value: "income_tax_appeal" },
    { label: "S.T.A. – Sales Tax Appeal", value: "sales_tax_appeal" },
    { label: "G.S.T.A. – GST Appeal", value: "gst_appeal" },
    { label: "E.T.A. – Entry Tax Appeal", value: "entry_tax_appeal" },
    { label: "C.E.A. – Central Excise Appeal", value: "central_excise_appeal" },
    { label: "C.A. (Tax) – Customs Appeal", value: "customs_appeal" },
    { label: "Revision Petition (Tax)", value: "revision_petition_tax" },
    { label: "S.L.P. (Tax) – Special Leave Petition (Tax matters)", value: "special_leave_petition_tax" },
    { label: "M.A. (Tax) – Miscellaneous Application (Tax)", value: "miscellaneous_application_tax" },
    { label: "I.A. (Tax) – Interim Application (Tax-related)", value: "interim_application_tax" }
  ],
  consumer: [
    { label: "C.C. – Consumer Complaint", value: "consumer_complaint" },
    { label: "F.A. – First Appeal", value: "first_appeal" },
    { label: "R.P. – Revision Petition", value: "revision_petition" },
    { label: "I.A. – Interim Application", value: "interim_application" },
    { label: "E.A. – Execution Application", value: "execution_application" },
    { label: "M.A. – Miscellaneous Application", value: "miscellaneous_application" },
    { label: "R.A. – Review Application", value: "review_application" },
    { label: "C.A. – Contempt Application", value: "contempt_application" },
    { label: "P.A. – Public Awareness Complaint (rare)", value: "public_awareness_complaint" },
    { label: "A.F.A. – Appeal From Final Order (used in higher forums)", value: "appeal_from_final_order" }
  ],
  commercial: [
    { label: "C.P. – Company Petition", value: "company_petition" },
    { label: "C.A. – Company Application", value: "company_application" },
    { label: "I.A. – Interim Application", value: "interim_application" },
    { label: "T.C.P. – Transfer Company Petition (from High Court to NCLT)", value: "transfer_company_petition" },
    { label: "T.C.A. – Transfer Company Appeal", value: "transfer_company_appeal" },
    { label: "C.A. (AT) (Insolvency) – Company Appeal (Appellate Tribunal – Insolvency)", value: "company_appeal_at_insolvency" },
    { label: "C.A. (AT) (Company) – Company Appeal (Appellate Tribunal – Company Law)", value: "company_appeal_at_company_law" },
    { label: "I.B.C. Case – Insolvency & Bankruptcy Code Case (informal title)", value: "ibc_case" },
    { label: "M.A. – Miscellaneous Application (within company/IBC matters)", value: "miscellaneous_application_company" },
    { label: "R.P. (IBC) – Resolution Plan (in IBC matters)", value: "resolution_plan_ibc" },
    { label: "A.No. – Application Number (used in NCLT for various motions)", value: "application_number_nclt" },
    { label: "C.S. (Comm.) – Commercial Suit (in Commercial Courts)", value: "commercial_suit" },
    { label: "O.P. (Comm.) – Original Petition (Commercial)", value: "original_petition_commercial" }
  ],
  election: [
    { label: "E.P. – Election Petition", value: "election_petition" },
    { label: "W.P. (Election) – Writ Petition (Election-related)", value: "writ_petition_election" },
    { label: "S.L.P. (Election) – Special Leave Petition (Election matter)", value: "special_leave_petition_election" },
    { label: "T.P. (Election) – Transfer Petition (Election matter)", value: "transfer_petition_election" },
    { label: "R.P. (Election) – Review Petition (Election matter)", value: "review_petition_election" },
    { label: "C.A. (Election) – Civil Appeal (Election matter)", value: "civil_appeal_election" },
    { label: "I.A. (Election) – Interim Application (related to election case)", value: "interim_application_election" },
    { label: "M.A. (Election) – Miscellaneous Application (in election matters)", value: "miscellaneous_application_election" }
  ],
  special: [
    { label: "O.A. – Original Application", value: "original_application" },
    { label: "M.A. – Miscellaneous Application", value: "miscellaneous_application" },
    { label: "I.A. – Interim Application", value: "interim_application" },
    { label: "R.P. – Review Petition", value: "review_petition" },
    { label: "C.A. – Civil Appeal", value: "civil_appeal" },
    { label: "Crl.A. – Criminal Appeal", value: "criminal_appeal" },
    { label: "S.L.P. (Crl./Civ.) – Special Leave Petition (Criminal/Civil)", value: "special_leave_petition" },
    { label: "O.S. – Original Suit", value: "original_suit" },
    { label: "P.I.L. – Public Interest Litigation", value: "public_interest_litigation" },
    { label: "C.P. – Contempt Petition", value: "contempt_petition" },
    { label: "T.P. – Transfer Petition", value: "transfer_petition" },
    { label: "Arb. P. – Arbitration Petition", value: "arbitration_petition" },
    { label: "A.A. – Arbitration Application", value: "arbitration_application" },
    { label: "N.A. – National Green Tribunal Application (Environmental matters)", value: "national_green_tribunal_application" },
    { label: "H.R.P. – Human Rights Petition", value: "human_rights_petition" }
  ],
  cybercrime: [
    { label: "C.C. – Criminal Case", value: "criminal_case_cybercrime" },
    { label: "Crl. Case – Criminal Case", value: "crl_case_cybercrime" },
    { label: "W.P. (Cr.) – Writ Petition (Criminal) for Cybercrime", value: "writ_petition_criminal_cybercrime" },
    { label: "S.L.P. (Cr.) – Special Leave Petition for Cybercrime-related appeals", value: "special_leave_petition_criminal_cybercrime" },
    { label: "C.A. (Cr.) – Criminal Appeal", value: "criminal_appeal_cybercrime" },
    { label: "I.A. (Cr.) – Interim Application", value: "interim_application_cybercrime" },
    { label: "M.A. (Cr.) – Miscellaneous Application", value: "miscellaneous_application_cybercrime" },
    { label: "FIR No. X/20XX – First Information Report number used during investigation", value: "fir_cybercrime" },
    { label: "B.A. – Bail Application", value: "bail_application_cybercrime" },
    { label: "A.B.A. – Anticipatory Bail Application", value: "anticipatory_bail_application_cybercrime" }
  ],
  other: [
    { label: "Other Legal Matter", value: "other_legal_matter" },
    { label: "Custom Case", value: "custom_case" }
  ]
};

interface CaseFormProps {
  onSubmit: (formData: any) => Promise<void>;
}

export default function CaseForm({ onSubmit }: CaseFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    caseType: '',
    title: '',
    description: '',
    plaintiffs: '',
    defendants: '',
    courtLocation: '',
    filingFee: '0',
    customTitle: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset title if case type changes
    if (name === 'caseType') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        title: '' // Reset title when case type changes
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const submissionData = {...formData};
    
    // Handle custom title if needed
    if (formData.title === 'custom' && formData.customTitle) {
      submissionData.title = formData.customTitle;
    }
    
    try {
      await onSubmit(submissionData);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="case-filing-form">
      <div className="mb-8">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            ← Back
          </button>
          <Link href="/user/dashboard">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
              Dashboard
            </button>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">File a New Case</h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete the form below to file a new case with the court system.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-300">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Case Type field */}
        <div className="space-y-2">
          <label htmlFor="caseType" className="block text-sm font-medium">
            Case Type <span className="text-red-500">*</span>
          </label>
          <select
            id="caseType"
            name="caseType"
            value={formData.caseType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a case type</option>
            {CASE_TYPES.map((type, index) => (
              <option key={index} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Case Title field - now a dropdown based on case type */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Case Title <span className="text-red-500">*</span>
          </label>
          <select
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={!formData.caseType}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {formData.caseType ? "Select a case title" : "Please select a case type first"}
            </option>
            {formData.caseType && CASE_TITLES_BY_TYPE[formData.caseType]?.map((title, index) => (
              <option key={index} value={title.value}>
                {title.label}
              </option>
            ))}
            <option value="custom">Other (Specify)</option>
          </select>
          
          {/* Show text input if "Other" is selected */}
          {formData.title === 'custom' && (
            <div className="mt-2">
              <input
                type="text"
                id="customTitle"
                name="customTitle"
                value={formData.customTitle}
                onChange={handleChange}
                placeholder="Enter custom case title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Case Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Detailed description of the case"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mt-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2 text-red-500">⚠</span>
            Required Case Parties
          </h3>
          <p className="text-sm text-red-600 font-medium mb-3">
            Both plaintiffs and defendants are mandatory fields and cannot be left empty
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-red-200 rounded-md bg-red-50 mb-4">
          <div className="space-y-2">
            <label htmlFor="plaintiffs" className="block text-sm font-medium text-red-700">
              * Plaintiff(s) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="plaintiffs"
              name="plaintiffs"
              value={formData.plaintiffs}
              onChange={handleChange}
              required
              placeholder="Name(s) of plaintiff(s)"
              className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-700">
              The party filing the case. For multiple plaintiffs, separate names with commas.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="defendants" className="block text-sm font-medium text-red-700">
              * Defendant(s) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="defendants"
              name="defendants"
              value={formData.defendants}
              onChange={handleChange}
              required
              placeholder="Name(s) of defendant(s)"
              className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-700">
              The party being sued or charged. For multiple defendants, separate names with commas.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="courtLocation" className="block text-sm font-medium">
              Court Location
            </label>
            <input
              type="text"
              id="courtLocation"
              name="courtLocation"
              value={formData.courtLocation}
              onChange={handleChange}
              placeholder="Preferred court location (if any)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="filingFee" className="block text-sm font-medium">
              Filing Fee (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="filingFee"
              name="filingFee"
              value={formData.filingFee}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Submitting...' : 'Submit Case'}
          </button>
        </div>
      </form>
    </div>
  );
} 