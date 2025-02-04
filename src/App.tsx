import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Check, 
  XCircle, 
  Activity, 
  Cloud, 
  Lock,
  Plus,
  CheckCircle,
  Database,
  HardDrive,
  Network,
  Globe,
  Container,
  Key
} from 'lucide-react';

// AWS Resource types
type AWSResourceType = 'EC2' | 'RDS' | 'S3' | 'VPC' | 'Lambda' | 'ECS' | 'IAM';
type ResourceStatus = 'healthy' | 'warning' | 'critical';

interface Alert {
  id: number;
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  service: AWSResourceType;
  region: string;
}

interface AWSResource {
  id: number;
  name: string;
  type: AWSResourceType;
  status: ResourceStatus;
  region: string;
  details: {
    instanceType?: string;
    size?: string;
    accessLevel?: string;
    lastAccessed?: string;
  };
}

interface ComplianceTask {
  id: number;
  standard: string;
  task: string;
  completed: boolean;
  dueDate: string;
  awsService: AWSResourceType;
}

const AWS_REGIONS = [
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'ap-southeast-1'
];

function getServiceIcon(type: AWSResourceType) {
  switch (type) {
    case 'EC2':
      return <HardDrive className="h-5 w-5" />;
    case 'RDS':
      return <Database className="h-5 w-5" />;
    case 'S3':
      return <Cloud className="h-5 w-5" />;
    case 'VPC':
      return <Network className="h-5 w-5" />;
    case 'Lambda':
      return <Activity className="h-5 w-5" />;
    case 'ECS':
      return <Container className="h-5 w-5" />;
    case 'IAM':
      return <Key className="h-5 w-5" />;
    default:
      return <Cloud className="h-5 w-5" />;
  }
}

function App() {
  // State for alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    { 
      id: 1, 
      severity: 'high', 
      message: 'Unauthorized IAM policy modification detected', 
      timestamp: new Date().toISOString(), 
      acknowledged: false,
      service: 'IAM',
      region: 'us-east-1'
    },
    { 
      id: 2, 
      severity: 'medium', 
      message: 'Unusual EC2 API calls from unrecognized IP', 
      timestamp: new Date().toISOString(), 
      acknowledged: false,
      service: 'EC2',
      region: 'us-west-2'
    },
    { 
      id: 3, 
      severity: 'high', 
      message: 'S3 bucket public access detected', 
      timestamp: new Date().toISOString(), 
      acknowledged: false,
      service: 'S3',
      region: 'us-east-1'
    }
  ]);
  
  // State for AWS resources
  const [resources, setResources] = useState<AWSResource[]>([
    { 
      id: 1, 
      name: 'prod-web-server', 
      type: 'EC2', 
      status: 'healthy',
      region: 'us-east-1',
      details: { instanceType: 't3.large' }
    },
    { 
      id: 2, 
      name: 'customer-data', 
      type: 'S3', 
      status: 'warning',
      region: 'us-east-1',
      details: { size: '2.3 TB', lastAccessed: '2024-03-20' }
    },
    { 
      id: 3, 
      name: 'prod-vpc', 
      type: 'VPC', 
      status: 'healthy',
      region: 'us-east-1',
      details: {}
    },
    { 
      id: 4, 
      name: 'prod-database', 
      type: 'RDS', 
      status: 'healthy',
      region: 'us-east-1',
      details: { instanceType: 'db.r5.xlarge' }
    },
    { 
      id: 5, 
      name: 'auth-service', 
      type: 'Lambda', 
      status: 'healthy',
      region: 'us-east-1',
      details: {}
    }
  ]);

  // State for compliance tasks
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([
    { 
      id: 1, 
      standard: 'AWS CIS', 
      task: 'Enable MFA for all IAM users', 
      completed: true, 
      dueDate: '2024-03-30',
      awsService: 'IAM'
    },
    { 
      id: 2, 
      standard: 'HIPAA', 
      task: 'Encrypt RDS instances', 
      completed: false, 
      dueDate: '2024-03-25',
      awsService: 'RDS'
    },
    { 
      id: 3, 
      standard: 'SOC 2', 
      task: 'Enable CloudTrail in all regions', 
      completed: true, 
      dueDate: '2024-03-28',
      awsService: 'EC2'
    },
    { 
      id: 4, 
      standard: 'PCI DSS', 
      task: 'Review S3 bucket policies', 
      completed: false, 
      dueDate: '2024-03-29',
      awsService: 'S3'
    }
  ]);

  // Form states
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showComplianceForm, setShowComplianceForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ 
    severity: 'medium', 
    message: '', 
    service: 'EC2' as AWSResourceType,
    region: 'us-east-1'
  });
  const [newResource, setNewResource] = useState({ 
    name: '', 
    type: 'EC2' as AWSResourceType, 
    status: 'healthy' as ResourceStatus,
    region: 'us-east-1',
    details: {}
  });
  const [newCompliance, setNewCompliance] = useState({ 
    standard: '', 
    task: '', 
    dueDate: '',
    awsService: 'EC2' as AWSResourceType
  });

  // Calculate AWS-specific metrics
  const securityScore = Math.round(
    ((resources.filter(r => r.status === 'healthy').length / resources.length) * 100 +
    (complianceTasks.filter(t => t.completed).length / complianceTasks.length) * 100 +
    (alerts.filter(a => a.acknowledged).length / alerts.length) * 100) / 3
  );
  
  const activeThreats = alerts.filter(a => !a.acknowledged).length;
  const compliance = Math.round((complianceTasks.filter(t => t.completed).length / complianceTasks.length) * 100);
  const vulnerabilities = resources.filter(r => r.status !== 'healthy').length;

  // Add new alert
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlerts(prev => [...prev, {
      id: Date.now(),
      severity: newAlert.severity as 'high' | 'medium' | 'low',
      message: newAlert.message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      service: newAlert.service,
      region: newAlert.region
    }]);
    setNewAlert({ severity: 'medium', message: '', service: 'EC2', region: 'us-east-1' });
    setShowAlertForm(false);
  };

  // Add new resource
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    setResources(prev => [...prev, {
      id: Date.now(),
      name: newResource.name,
      type: newResource.type,
      status: newResource.status,
      region: newResource.region,
      details: newResource.details
    }]);
    setNewResource({ name: '', type: 'EC2', status: 'healthy', region: 'us-east-1', details: {} });
    setShowResourceForm(false);
  };

  // Add new compliance task
  const handleAddCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    setComplianceTasks(prev => [...prev, {
      id: Date.now(),
      standard: newCompliance.standard,
      task: newCompliance.task,
      completed: false,
      dueDate: newCompliance.dueDate,
      awsService: newCompliance.awsService
    }]);
    setNewCompliance({ standard: '', task: '', dueDate: '', awsService: 'EC2' });
    setShowComplianceForm(false);
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (id: number) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  // Toggle compliance task
  const handleToggleCompliance = (id: number) => {
    setComplianceTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Update resource status
  const handleUpdateResourceStatus = (id: number, status: ResourceStatus) => {
    setResources(prev => prev.map(resource =>
      resource.id === id ? { ...resource, status } : resource
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold">AWS Security Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Globe className="h-5 w-5 text-green-400" />
            <select className="bg-gray-700 rounded-md px-3 py-1 text-sm">
              {AWS_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* AWS Security Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">AWS Security Score</p>
                <h2 className="text-3xl font-bold">{securityScore}%</h2>
              </div>
              <Shield className="h-10 w-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Active Threats</p>
                <h2 className="text-3xl font-bold">{activeThreats}</h2>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">AWS Compliance</p>
                <h2 className="text-3xl font-bold">{compliance}%</h2>
              </div>
              <Check className="h-10 w-10 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">AWS Vulnerabilities</p>
                <h2 className="text-3xl font-bold">{vulnerabilities}</h2>
              </div>
              <XCircle className="h-10 w-10 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* AWS Security Alerts */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
              AWS Security Alerts
            </h2>
            <button
              onClick={() => setShowAlertForm(true)}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Alert
            </button>
          </div>

          {/* Add Alert Form */}
          {showAlertForm && (
            <div className="mb-4 p-4 bg-gray-700 rounded-lg">
              <form onSubmit={handleAddAlert}>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, severity: e.target.value }))}
                      className="w-full bg-gray-600 rounded-lg p-2"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">AWS Service</label>
                    <select
                      value={newAlert.service}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, service: e.target.value as AWSResourceType }))}
                      className="w-full bg-gray-600 rounded-lg p-2"
                    >
                      <option value="EC2">EC2</option>
                      <option value="RDS">RDS</option>
                      <option value="S3">S3</option>
                      <option value="VPC">VPC</option>
                      <option value="Lambda">Lambda</option>
                      <option value="ECS">ECS</option>
                      <option value="IAM">IAM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Region</label>
                    <select
                      value={newAlert.region}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full bg-gray-600 rounded-lg p-2"
                    >
                      {AWS_REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <input
                      type="text"
                      value={newAlert.message}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-gray-600 rounded-lg p-2"
                      placeholder="Enter alert message"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAlertForm(false)}
                      className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
                    >
                      Add Alert
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {alerts.filter(alert => !alert.acknowledged).map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg ${
                alert.severity === 'high' ? 'bg-red-900/50' :
                alert.severity === 'medium' ? 'bg-yellow-900/50' :
                'bg-blue-900/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(alert.service)}
                      <p className="font-semibold">{alert.message}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                      <span>{alert.service}</span>
                      <span>•</span>
                      <span>{alert.region}</span>
                      <span>•</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      alert.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-1 rounded-full"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AWS Resource Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-purple-400" />
                AWS Resources
              </h2>
              <button
                onClick={() => setShowResourceForm(true)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </button>
            </div>

            {/* Add Resource Form */}
            {showResourceForm && (
              <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                <form onSubmit={handleAddResource}>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={newResource.name}
                        onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                        placeholder="Enter resource name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as AWSResourceType }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                      >
                        <option value="EC2">EC2</option>
                        <option value="RDS">RDS</option>
                        <option value="S3">S3</option>
                        <option value="VPC">VPC</option>
                        <option value="Lambda">Lambda</option>
                        <option value="ECS">ECS</option>
                        <option value="IAM">IAM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Region</label>
                      <select
                        value={newResource.region}
                        onChange={(e) => setNewResource(prev => ({ ...prev, region: e.target.value }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                      >
                        {AWS_REGIONS.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={newResource.status}
                        onChange={(e) => setNewResource(prev => ({ ...prev, status: e.target.value as ResourceStatus }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowResourceForm(false)}
                        className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
                      >
                        Add Resource
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {resources.map((resource) => (
                <div key={resource.id} className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {getServiceIcon(resource.type)}
                        <span className="font-medium">{resource.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                        <span>{resource.type}</span>
                        <span>•</span>
                        <span>{resource.region}</span>
                        {resource.details.instanceType && (
                          <>
                            <span>•</span>
                            <span>{resource.details.instanceType}</span>
                          </>
                        )}
                        {resource.details.size && (
                          <>
                            <span>•</span>
                            <span>{resource.details.size}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <select
                      value={resource.status}
                      onChange={(e) => handleUpdateResourceStatus(resource.id, e.target.value as ResourceStatus)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        resource.status === 'healthy' ? 'bg-green-500/20 text-green-300' :
                        resource.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}
                    >
                      <option value="healthy">Healthy</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Lock className="h-5 w-5 mr-2 text-blue-400" />
                AWS Compliance Tasks
              </h2>
              <button
                onClick={() => setShowComplianceForm(true)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>

            {/* Add Compliance Task Form */}
            {showComplianceForm && (
              <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                <form onSubmit={handleAddCompliance}>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Standard</label>
                      <input
                        type="text"
                        value={newCompliance.standard}
                        onChange={(e) => setNewCompliance(prev => ({ ...prev, standard: e.target.value }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                        placeholder="Enter compliance standard"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">AWS Service</label>
                      <select
                        value={newCompliance.awsService}
                        onChange={(e) => setNewCompliance(prev => ({ ...prev, awsService: e.target.value as AWSResourceType }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                      >
                        <option value="EC2">EC2</option>
                        <option value="RDS">RDS</option>
                        <option value="S3">S3</option>
                        <option value="VPC">VPC</option>
                        <option value="Lambda">Lambda</option>
                        <option value="ECS">ECS</option>
                        <option value="IAM">IAM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Task</label>
                      <input
                        type="text"
                        value={newCompliance.task}
                        onChange={(e) => setNewCompliance(prev => ({ ...prev, task: e.target.value }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                        placeholder="Enter task description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newCompliance.dueDate}
                        onChange={(e) => setNewCompliance(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full bg-gray-600 rounded-lg p-2"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowComplianceForm(false)}
                        className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {complianceTasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {getServiceIcon(task.awsService)}
                        <div>
                          <span className="font-medium">{task.standard}</span>
                          <span className="text-sm text-gray-400 ml-2">Due: {task.dueDate}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{task.task}</p>
                    </div>
                    <button
                      onClick={() => handleToggleCompliance(task.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        task.completed
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}
                    >
                      {task.completed ? 'Completed' : 'Pending'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
     </div>
  );
}

export default App;