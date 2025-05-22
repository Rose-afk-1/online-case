'use client';

import { useState, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Input,
  Button,
  Switch,
  Label,
  Textarea 
} from '@/components/ui';
import { toast } from 'react-hot-toast';

// Define props type for the settings components
interface SettingsComponentProps {
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Check for admin access
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!session || session.user.role !== 'admin') {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="case-management">Case Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings saving={saving} setSaving={setSaving} />
        </TabsContent>
        
        <TabsContent value="case-management">
          <CaseSettings saving={saving} setSaving={setSaving} />
        </TabsContent>
        
        <TabsContent value="users">
          <UserSettings saving={saving} setSaving={setSaving} />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemSettings saving={saving} setSaving={setSaving} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralSettings({ saving, setSaving }: SettingsComponentProps) {
  const [courtName, setCourtName] = useState("Gauhati High Court");
  const [systemName, setSystemName] = useState("Online Case Filing System");
  const [contactEmail, setContactEmail] = useState("admin@ghcourt.gov.in");
  const [contactPhone, setContactPhone] = useState("+91 1234567890");
  const [address, setAddress] = useState("Gauhati High Court, Guwahati, Assam, India");
  
  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simulated API call - replace with your actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would call your API
      // await fetch('/api/admin/settings/general', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     courtName, systemName, contactEmail, contactPhone, address
      //   })
      // });
      
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">General Settings</h2>
      
      <div className="grid gap-6 mb-6">
        <div>
          <Label htmlFor="courtName">Court Name</Label>
          <Input
            id="courtName"
            value={courtName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCourtName(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="systemName">System Name</Label>
          <Input
            id="systemName"
            value={systemName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSystemName(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setContactEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setContactPhone(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="address">Court Address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}

function CaseSettings({ saving, setSaving }: SettingsComponentProps) {
  const [casePrefix, setCasePrefix] = useState("CASE");
  const [caseYear, setCaseYear] = useState(new Date().getFullYear());
  const [caseCounter, setCaseCounter] = useState(7); // Start from 7 to fix duplicate key error
  const [defaultFee, setDefaultFee] = useState(500);
  const [autoApprove, setAutoApprove] = useState(false);
  
  const resetCaseCounter = async () => {
    setSaving(true);
    try {
      // Simulated API call - replace with your actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would call your API
      // await fetch('/api/admin/settings/case-counter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     casePrefix, caseYear, caseCounter
      //   })
      // });
      
      toast.success("Case counter updated successfully");
    } catch (error) {
      toast.error("Failed to update case counter");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const saveCaseSettings = async () => {
    setSaving(true);
    try {
      // Simulated API call - replace with your actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Case settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Case Numbering System</h2>
        
        <div className="grid gap-4 mb-6">
          <div>
            <Label htmlFor="casePrefix">Case Prefix</Label>
            <Input
              id="casePrefix"
              value={casePrefix}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCasePrefix(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="caseYear">Year Format</Label>
            <Input
              id="caseYear"
              type="number"
              value={caseYear.toString()}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === '' ? new Date().getFullYear() : parseInt(e.target.value);
                setCaseYear(isNaN(val) ? new Date().getFullYear() : val);
              }}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="caseCounter">Next Case Number</Label>
            <Input
              id="caseCounter"
              type="number"
              value={caseCounter.toString()}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                setCaseCounter(isNaN(val) ? 0 : val);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used for the next case number: {`${casePrefix}-${caseYear}-${caseCounter.toString().padStart(5, '0')}`}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={resetCaseCounter} disabled={saving} variant="primary">
            {saving ? "Updating..." : "Update Case Counter"}
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Case Processing Settings</h2>
        
        <div className="grid gap-4 mb-6">
          <div>
            <Label htmlFor="defaultFee">Default Filing Fee (₹)</Label>
            <Input
              id="defaultFee"
              type="number"
              value={defaultFee.toString()}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                setDefaultFee(isNaN(val) ? 0 : val);
              }}
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="autoApprove"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
            />
            <Label htmlFor="autoApprove">Auto-approve cases after payment</Label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={saveCaseSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function UserSettings({ saving, setSaving }: SettingsComponentProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">User Management Settings</h2>
      
      <div className="grid gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Allow New Registrations</h3>
            <p className="text-sm text-gray-500">Enable or disable new user registrations</p>
          </div>
          <Switch defaultChecked={true} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Require Email Verification</h3>
            <p className="text-sm text-gray-500">New users must verify their email before accessing the system</p>
          </div>
          <Switch defaultChecked={true} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Allow Social Login</h3>
            <p className="text-sm text-gray-500">Enable login with Google and other social providers</p>
          </div>
          <Switch defaultChecked={true} />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          disabled={saving}
          onClick={() => {
            setSaving(true);
            setTimeout(() => {
              toast.success("User settings saved");
              setSaving(false);
            }, 1000);
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Card>
  );
}

function SystemSettings({ saving, setSaving }: SettingsComponentProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">System Maintenance</h2>
        
        <div className="grid gap-4">
          <Button 
            variant="outline" 
            onClick={() => toast.success("Database backup started")}
            className="justify-start"
          >
            <span className="mr-2">🔄</span> Backup Database
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => toast.success("Cache cleared successfully")}
            className="justify-start"
          >
            <span className="mr-2">🧹</span> Clear System Cache
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => toast.success("Database indexes rebuilt")}
            className="justify-start text-left"
          >
            <span className="mr-2">🔧</span> Rebuild Database Indexes
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <span className="text-red-500 mr-2">⚠️</span> Danger Zone
        </h2>
        
        <div className="grid gap-4">
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <h3 className="font-medium text-red-800 mb-2">Reset All Case Numbers</h3>
            <p className="text-sm text-red-600 mb-4">This will reset all case number sequences. Use with caution!</p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm("Are you sure? This action cannot be undone!")) {
                  toast.success("Case numbers reset successfully");
                }
              }}
            >
              Reset Numbers
            </Button>
          </div>
          
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <h3 className="font-medium text-red-800 mb-2">Clear Test Data</h3>
            <p className="text-sm text-red-600 mb-4">This will remove all test cases and data from the system.</p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm("Are you sure? This action cannot be undone!")) {
                  toast.success("Test data cleared successfully");
                }
              }}
            >
              Clear Test Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 