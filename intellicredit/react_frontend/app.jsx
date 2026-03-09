const { useState, useEffect, useRef } = React;

const API_URL = "http://127.0.0.1:8000";

// --- REUSABLE COMPONENTS ---

const MetricCard = ({ title, value, sub, colorClass, icon, warn = false }) => (
    <div className={`metric-card border-l-4 ${colorClass}`}>
        <div className="text-sm text-slate-400 font-semibold tracking-wider mb-2">{title}</div>
        <div className={`text-3xl font-bold flex items-center ${warn ? 'text-red-500' : 'text-white'}`}>
            {value}
            {sub && <span className="text-base font-normal text-slate-400 ml-2">{sub}</span>}
            {icon && <i data-lucide={icon} className={`ml-auto w-6 h-6 opacity-70 ${warn ? 'text-red-500' : ''}`}></i>}
        </div>
    </div>
);

const FeatureChart = ({ features }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!features || Object.keys(features).length === 0) return;
        const sortedFeatures = Object.entries(features).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 5);
        const labels = sortedFeatures.map(f => f[0].replace(/_/g, ' ').toUpperCase());
        const data = sortedFeatures.map(f => f[1]);
        const colors = data.map(v => v > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)');

        if (chartInstance.current) chartInstance.current.destroy();
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'SHAP Impact', data, backgroundColor: colors, borderRadius: 4 }] },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
                    y: { grid: { display: false }, ticks: { color: '#CBD5E1', font: { weight: 'bold' } } }
                }
            }
        });
        return () => chartInstance.current?.destroy();
    }, [features]);

    return <div style={{ height: '300px' }} className="w-full"><canvas ref={chartRef}></canvas></div>;
};

// --- APP ---

const App = () => {
    // Persistent Session Logic
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('auth') === 'true');
    const [loginMode, setLoginMode] = useState(() => localStorage.getItem('loginMode') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || "bank");
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || "Dashboard");

    // Borrower Application State
    const [borrowerView, setBorrowerView] = useState(() => localStorage.getItem('borrowerView') || 'form');
    const [activeBorrowerAppId, setActiveBorrowerAppId] = useState(() => localStorage.getItem('activeBorrowerAppId') || null);
    const [borrowerForm, setBorrowerForm] = useState({
        companyName: '', cin: '', pan: '', gstin: '', doi: '', address: '', industry: 'Manufacturing', requestedAmount: '', promoterNames: ''
    });
    const [pendingApplications, setPendingApplications] = useState([]);
    const [activeApplication, setActiveApplication] = useState(() => {
        const saved = localStorage.getItem('activeApplication');
        return saved ? JSON.parse(saved) : null;
    });

    // Global AI Engine State
    const [pipelineStage, setPipelineStage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const [docData, setDocData] = useState(null);
    const [nlpData, setNlpData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [investigatorInputs, setInvestigatorInputs] = useState({ utilization_pct: 75, machinery_condition: 'Good', inventory_status: 'Normal', employee_strength: 150, management_rating: 4 });
    const [camDraft, setCamDraft] = useState("");
    const [camUrl, setCamUrl] = useState("");
    const [showHighConfidenceOnly, setShowHighConfidenceOnly] = useState(true);

    // Officer Decision State
    const [decision, setDecision] = useState("Approve with Conditions");
    const [limit, setLimit] = useState(35);
    const [rate, setRate] = useState(9.5);
    const [tenure, setTenure] = useState(36);
    const [reason, setReason] = useState("");

    // Sync state to LocalStorage
    useEffect(() => {
        localStorage.setItem('auth', isAuthenticated);
        localStorage.setItem('loginMode', loginMode || '');
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('activeTab', activeTab);
        localStorage.setItem('borrowerView', borrowerView);
        localStorage.setItem('activeBorrowerAppId', activeBorrowerAppId || '');
        localStorage.setItem('activeApplication', activeApplication ? JSON.stringify(activeApplication) : '');
    }, [isAuthenticated, loginMode, userRole, activeTab, borrowerView, activeBorrowerAppId, activeApplication]);

    useEffect(() => { window.lucide && window.lucide.createIcons(); }, [activeTab, pipelineStage, riskData, nlpData, docData, camUrl, userRole, activeApplication, isAuthenticated]);

    // Automatic Data Sync for Dashboard
    useEffect(() => {
        if (isAuthenticated) {
            fetchApplications(); // Initial fetch for both roles
            const interval = setInterval(fetchApplications, 10000); // Sync every 10 seconds
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // ---------------- BORROWER SUBMIT ----------------
    const submitLoanApplication = async (e) => {
        e.preventDefault();
        const newApp = {
            id: Date.now(),
            companyName: borrowerForm.companyName || "New Enterprise P. Ltd.",
            industry: borrowerForm.industry,
            amount: borrowerForm.requestedAmount || "0.0",
            status: "Pending",
            date: new Date().toISOString().split('T')[0],
            cin: borrowerForm.cin,
            pan: borrowerForm.pan,
            gstin: borrowerForm.gstin,
            doi: borrowerForm.doi,
            address: borrowerForm.address,
            promoterNames: borrowerForm.promoterNames
        };

        try {
            await fetch(`${API_URL}/save_application`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newApp)
            });

            // Still update local state for immediate feedback
            setPendingApplications([...pendingApplications, newApp]);
            setActiveBorrowerAppId(newApp.id);
            setBorrowerView('timeline');
            setBorrowerForm({ companyName: '', cin: '', pan: '', gstin: '', doi: '', address: '', industry: 'Manufacturing', requestedAmount: '', promoterNames: '' });
        } catch (err) {
            console.error("Failed to save to backend:", err);
            alert("Backend Engine Offline! Application not saved.");
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await fetch(`${API_URL}/get_applications`);
            const data = await res.json();
            setPendingApplications(data);
        } catch (err) {
            console.error("Fetch failed", err);
        }
    };

    // ---------------- PIPELINE RUNNER ----------------
    const runAutomatedPipeline = async () => {
        if (!activeApplication) return alert("Select an application first.");

        setLoading(true); setPipelineStage(1);
        try {
            setStatusMsg("Extracting financial data & parsing GST...");
            const formObj = new FormData();
            formObj.append('files', new File(['pdf'], 'report.pdf'));

            const extractRes = await fetch(`${API_URL}/upload_documents`, { method: 'POST', body: formObj });
            const extractJson = await extractRes.json();
            setDocData(extractJson.data);

            setTimeout(async () => {
                setPipelineStage(2); setStatusMsg("Scraping news & court records...");
                const cin = activeApplication.cin || '';
                const promoters = activeApplication.promoterNames || '';
                const nlpRes = await fetch(`${API_URL}/external_research/${activeApplication.companyName}?cin=${cin}&promoter_names=${encodeURIComponent(promoters)}`);
                const nlpJson = await nlpRes.json();
                setNlpData(nlpJson);

                setTimeout(async () => {
                    setPipelineStage(3); setStatusMsg("Calculating XGBoost Probabilities & SHAP...");
                    const extFin = extractJson.data.financials;
                    const features = {
                        debt_equity: extFin.total_debt / extFin.equity || 1.5,
                        interest_coverage: extFin.ebitda / extFin.interest_expense || 2.5,
                        revenue_growth: 15.0,
                        cash_flow_stability: 0.8,
                        gst_mismatch_pct: extractJson.data.cross_verification.mismatch_pct || 2.0,
                        utilization_pct: investigatorInputs.utilization_pct,
                        collateral_coverage: 1.8,
                        // New NLP Features for ML Engine
                        news_sentiment_score: nlpJson.news_sentiment_score || 0,
                        litigation_cases: nlpJson.litigation_cases || 0,
                        litigation_severity_score: nlpJson.litigation_severity_score || 0,
                        compliance_flag_count: nlpJson.compliance_flag_count || 0,
                        promoter_risk_score: nlpJson.promoter_risk_score || 0,
                        industry_risk_index: nlpJson.industry_risk_index || 50,
                        nlp_risk_impact_score: nlpJson.nlp_risk_impact_score || 0
                    };

                    const riskRes = await fetch(`${API_URL}/calculate_risk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(features) });
                    const riskJson = await riskRes.json();
                    setRiskData(riskJson);

                    setPipelineStage(4); setStatusMsg("AI Engine processing complete.");
                    setLoading(false);
                }, 1500);
            }, 1500);
        } catch (e) {
            console.error(e); setStatusMsg("Backend connectivity error!"); setLoading(false);
        }
    };

    const recalculateRisk = async () => {
        if (!riskData) return;
        const features = {
            debt_equity: docData.financials.total_debt / docData.financials.equity || 1.5,
            interest_coverage: docData.financials.ebitda / docData.financials.interest_expense || 2.5,
            revenue_growth: 15.0,
            cash_flow_stability: 0.8,
            gst_mismatch_pct: docData.cross_verification.mismatch_pct || 2.0,
            sentiment_score: nlpData.sentiment_score || 0.5,
            litigation_count: nlpData.litigation_count || 0,
            sector_risk_index: nlpData.sector_risk_index || 50,
            utilization_pct: investigatorInputs.utilization_pct,
            collateral_coverage: 1.8
        };
        const riskRes = await fetch(`${API_URL}/calculate_risk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(features) });
        const riskJson = await riskRes.json();
        setRiskData(riskJson);
    }

    // ---------------- BORROWER UI ----------------
    const renderBorrowerForm = () => (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pl-4 pr-12">
            <h2 className="text-3xl font-extrabold mb-2">Corporate Loan Application</h2>
            <p className="text-slate-400 mb-8">Please provide your company particulars and upload available documentation to initiate the intelligent appraisal process.</p>

            <form onSubmit={submitLoanApplication} className="space-y-8">
                {/* Basic Details */}
                <div className="bg-darkPanel border border-slate-700 p-8 rounded-xl shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-blue-400 border-b border-slate-700 pb-2">1. Company Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="text-xs text-slate-400">Company Name *</label><input required className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700" value={borrowerForm.companyName} onChange={e => setBorrowerForm({ ...borrowerForm, companyName: e.target.value })} placeholder="Acme Logistics Pvt Ltd" /></div>
                        <div><label className="text-xs text-slate-400">Industry / Sector *</label>
                            <select className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700" value={borrowerForm.industry} onChange={e => setBorrowerForm({ ...borrowerForm, industry: e.target.value })}>
                                <option>Manufacturing</option><option>Trading</option><option>Services</option><option>Logistics</option><option>NBFC</option><option>Infrastructure</option>
                            </select>
                        </div>
                        <div><label className="text-xs text-slate-400">CIN (Corporate Identification Number)</label><input className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700" value={borrowerForm.cin} onChange={e => setBorrowerForm({ ...borrowerForm, cin: e.target.value })} placeholder="U00000XX0000PTC000000" /></div>
                        <div><label className="text-xs text-slate-400">PAN Number</label><input className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700 uppercase" maxLength="10" value={borrowerForm.pan} onChange={e => setBorrowerForm({ ...borrowerForm, pan: e.target.value })} placeholder="ABCDE1234F" /></div>
                        <div><label className="text-xs text-slate-400">GSTIN</label><input className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700 uppercase" maxLength="15" value={borrowerForm.gstin} onChange={e => setBorrowerForm({ ...borrowerForm, gstin: e.target.value })} placeholder="27ABCDE1234F1Z5" /></div>
                        <div><label className="text-xs text-slate-400">Date of Incorporation</label><input type="date" className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700" value={borrowerForm.doi} onChange={e => setBorrowerForm({ ...borrowerForm, doi: e.target.value })} /></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-400">Promoter / Director Names (Comma Separated) *</label><input required className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700" value={borrowerForm.promoterNames} onChange={e => setBorrowerForm({ ...borrowerForm, promoterNames: e.target.value })} placeholder="John Doe, Jane Smith" /></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-400">Registered Office Address</label><textarea className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700" rows="2" value={borrowerForm.address} onChange={e => setBorrowerForm({ ...borrowerForm, address: e.target.value })} placeholder="Building, Street, City, State, PIN"></textarea></div>
                        <div className="md:col-span-2"><label className="text-xs text-slate-400">Requested Loan Amount (INR Cr) *</label><input required type="number" step="0.01" className="w-full bg-slate-800 p-3 rounded mt-1 border border-slate-700 text-xl text-emerald-400 font-bold" value={borrowerForm.requestedAmount} onChange={e => setBorrowerForm({ ...borrowerForm, requestedAmount: e.target.value })} placeholder="e.g. 50.00" /></div>
                    </div>
                </div>

                {/* Uploads */}
                <div className="bg-darkPanel border border-slate-700 p-8 rounded-xl shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-emerald-400 border-b border-slate-700 pb-2 flex justify-between">
                        2. Document Uploads
                        <span className="text-sm font-normal text-slate-500">(All fields optional, AI will skip missing)</span>
                    </h3>
                    <div className="space-y-4">
                        {[
                            { id: 'ar', label: '1️⃣ Annual Report (Last 3 Years) – PDF' },
                            { id: 'fs', label: '2️⃣ Financial Statements (Balance Sheet, P&L) – PDF/Excel' },
                            { id: 'gstr', label: '3️⃣ GST Returns (GSTR-3B) – Last 12 months' },
                            { id: 'bank', label: '4️⃣ Bank Statements – Last 12 months' },
                            { id: 'itr', label: '5️⃣ Income Tax Returns (ITR) – Last 3 years' },
                            { id: 'col', label: '6️⃣ Collateral Documents (Property Valuation / Asset List)' }
                        ].map(doc => (
                            <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-800 transition">
                                <span className="font-medium text-slate-300">{doc.label}</span>
                                <input type="file" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setBorrowerForm({ companyName: '', cin: '', pan: '', gstin: '', doi: '', address: '', industry: 'Manufacturing', requestedAmount: '', promoterNames: '' })} className="px-6 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 font-bold transition">Clear Form</button>
                    <button type="submit" className="px-10 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 text-lg flex items-center gap-2 transition transform hover:-translate-y-1"><i data-lucide="send"></i> Submit Application</button>
                </div>
            </form>
        </div>
    );

    const renderBorrowerTimeline = () => {
        const app = pendingApplications.find(a => a.id === activeBorrowerAppId) || pendingApplications[pendingApplications.length - 1] || {};

        let docVerificationStatus = pipelineStage >= 1 ? 'Completed' : 'Pending';
        let siteVisitStatus = pipelineStage >= 4 ? 'Completed' : 'Pending';
        let creditRiskStatus = pipelineStage >= 4 ? 'Completed' : 'Pending';
        let committeeStatus = (app.status === 'Approved' || app.status === 'Rejected') ? 'Completed' : (pipelineStage >= 4 ? 'In Progress' : 'Pending');
        let sanctionStatus = (app.status === 'Approved' || app.status === 'Rejected') ? 'Completed' : 'Pending';

        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pl-4 pr-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold flex items-center gap-3"><i data-lucide="clock" className="text-blue-500"></i> Application Status Tracker</h2>
                    <button onClick={() => setBorrowerView('form')} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 font-bold transition">New Application</button>
                </div>

                <div className="bg-darkPanel border border-slate-700 p-8 rounded-xl shadow-xl">
                    <h3 className="text-xl font-bold mb-4 text-white">Tracking ID: #{app.id}</h3>
                    <p className="text-slate-400 mb-8 border-b border-slate-700 pb-6">Your application for {app.amount} Cr is currently undergoing intelligent appraisal.</p>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-slate-600 before:to-transparent">

                        {/* Step 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg"><i data-lucide="check" className="w-5 h-5"></i></div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border border-emerald-500/50 shadow-inner">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-emerald-400 text-sm">Completed</div>
                                    <time className="text-xs text-slate-500">Timestamp: {app.date}</time>
                                </div>
                                <div className="font-bold text-white text-lg">Application Submitted</div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${docVerificationStatus === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white animate-pulse'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg`}>
                                <i data-lucide={docVerificationStatus === 'Completed' ? "check" : "loader"} className={`w-5 h-5 ${docVerificationStatus !== 'Completed' && 'animate-spin'}`}></i>
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border ${docVerificationStatus === 'Completed' ? 'border-emerald-500/50 shadow-inner' : 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className={`font-bold text-sm ${docVerificationStatus === 'Completed' ? 'text-emerald-400' : 'text-blue-400'}`}>{docVerificationStatus === 'Completed' ? 'Completed' : 'In Progress'}</div>
                                </div>
                                <div className="font-bold text-white text-lg mb-1">Document Verification</div>
                                <div className="text-xs text-slate-400">Assigned AI Agent: Document Intelligence</div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${siteVisitStatus === 'Completed' ? 'bg-emerald-500 text-white' : (pipelineStage > 1 ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400')} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg`}>
                                <i data-lucide={siteVisitStatus === 'Completed' ? "check" : (pipelineStage > 1 ? "loader" : "clock")} className={`w-5 h-5 ${pipelineStage > 1 && siteVisitStatus !== 'Completed' && 'animate-spin'}`}></i>
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border ${siteVisitStatus === 'Completed' ? 'border-emerald-500/50' : (pipelineStage > 1 ? 'border-blue-500/50' : 'border-slate-700 border-dashed')}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className={`font-bold text-sm ${siteVisitStatus === 'Completed' ? 'text-emerald-400' : (pipelineStage > 1 ? 'text-blue-400' : 'text-slate-500')}`}>{siteVisitStatus === 'Completed' ? 'Completed' : (pipelineStage > 1 ? 'In Progress' : 'Pending')}</div>
                                </div>
                                <div className="font-bold text-white text-lg mb-1">Site Visit / Due Diligence</div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${creditRiskStatus === 'Completed' ? 'bg-emerald-500 text-white' : (pipelineStage > 1 ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400')} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg`}>
                                <i data-lucide={creditRiskStatus === 'Completed' ? "check" : (pipelineStage > 1 ? "loader" : "clock")} className={`w-5 h-5 ${pipelineStage > 1 && creditRiskStatus !== 'Completed' && 'animate-spin'}`}></i>
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border ${creditRiskStatus === 'Completed' ? 'border-emerald-500/50' : (pipelineStage > 1 ? 'border-blue-500/50' : 'border-slate-700 border-dashed')}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className={`font-bold text-sm ${creditRiskStatus === 'Completed' ? 'text-emerald-400' : (pipelineStage > 1 ? 'text-blue-400' : 'text-slate-500')}`}>{creditRiskStatus === 'Completed' ? 'Completed' : (pipelineStage > 1 ? 'In Progress' : 'Pending')}</div>
                                </div>
                                <div className="font-bold text-white text-lg mb-1">Credit Risk Evaluation</div>
                                <div className="text-xs text-slate-400 mt-1 pb-2 border-b border-slate-700/50">Includes NLP Sentiment Analysis & Contextual ML Scoring</div>
                                {creditRiskStatus === 'Completed' && committeeStatus !== 'Completed' && <div className="text-xs text-amber-400 mt-3 flex items-center gap-1"><i data-lucide="info" className="w-4 h-4"></i> Awaiting manual committee sign-off</div>}
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${committeeStatus === 'Completed' ? 'bg-emerald-500 text-white' : (committeeStatus === 'In Progress' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400')} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow`}>
                                <i data-lucide={committeeStatus === 'Completed' ? "check" : (committeeStatus === 'In Progress' ? "loader" : "clock")} className={`w-5 h-5 ${(committeeStatus === 'In Progress') && 'animate-spin'}`}></i>
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border ${committeeStatus === 'Completed' ? 'border-emerald-500/50' : (committeeStatus === 'In Progress' ? 'border-amber-500/50' : 'border-slate-700 border-dashed')}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className={`font-bold text-sm ${committeeStatus === 'Completed' ? 'text-emerald-400' : (committeeStatus === 'In Progress' ? 'text-amber-400' : 'text-slate-500')}`}>{committeeStatus}</div>
                                </div>
                                <div className="font-bold text-white text-lg mb-1">Credit Committee Review</div>
                                {(committeeStatus === 'In Progress' || committeeStatus === 'Completed') && <div className="text-xs text-slate-400 mt-1">Assigned Officer: V. Sharma (Credit Analyst)</div>}
                            </div>
                        </div>

                        {/* Step 6 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-slate-900 ${sanctionStatus === 'Completed' ? (app.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-700 text-slate-400'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10`}>
                                <i data-lucide={sanctionStatus === 'Completed' ? (app.status === 'Approved' ? "check-circle" : "x-circle") : "clock"} className="w-6 h-6"></i>
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border-2 box-border relative overflow-hidden ${sanctionStatus === 'Completed' ? (app.status === 'Approved' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]') : 'border-slate-700 border-dashed'}`}>
                                <div className="flex items-center justify-between mb-1 relative z-10">
                                    <div className={`font-bold text-sm ${sanctionStatus === 'Completed' ? (app.status === 'Approved' ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500'}`}>{sanctionStatus}</div>
                                </div>
                                <div className={`font-black text-xl mb-3 relative z-10 ${app.status === 'Approved' ? 'text-emerald-400' : (app.status === 'Rejected' ? 'text-red-400' : 'text-white')}`}>Sanction Decision</div>

                                {app.status === 'Approved' && (
                                    <div className="bg-emerald-900/40 p-4 rounded-lg mt-2 border border-emerald-500/50 backdrop-blur-sm relative z-10">
                                        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                                            <div><span className="text-slate-400 block mb-0.5 text-xs">Sanctioned</span> <span className="font-bold text-emerald-400 text-lg">{app.finalLimit} Cr</span></div>
                                            <div><span className="text-slate-400 block mb-0.5 text-xs">Interest Rate</span> <span className="font-bold text-white text-lg">{app.finalRate}%</span></div>
                                            <div className="col-span-2 border-t border-emerald-500/30 pt-2 mt-1"><span className="text-slate-400">Risk Category:</span> <span className="font-bold text-emerald-300 ml-2">Medium-Low</span></div>
                                        </div>
                                        {app.camUrl && (
                                            <button onClick={() => window.open(`${API_URL}/download_cam?path=${encodeURIComponent(app.camUrl)}`)} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"><i data-lucide="download-cloud" className="w-5 h-5"></i> Download Sanction Letter</button>
                                        )}
                                    </div>
                                )}
                                {app.status === 'Rejected' && (
                                    <div className="bg-red-900/30 p-4 rounded-lg mt-2 border border-red-500/50 relative z-10">
                                        <div className="text-xs tracking-wider uppercase font-bold text-red-400 mb-2 flex items-center gap-2"><i data-lucide="alert-triangle" className="w-4 h-4"></i> Professional Rejection Basis</div>
                                        <div className="text-sm text-red-100 italic leading-relaxed">"{app.reason}"</div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                    {sanctionStatus === 'Completed' && app.status === 'Approved' && (
                        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-4">
                            <i data-lucide="info" className="text-blue-400 mt-1"></i>
                            <div>
                                <h4 className="font-bold text-blue-300">Phase 7: Disbursement Pipeline</h4>
                                <p className="text-sm text-slate-400 mt-1">The sanction letter has been pushed to the legal & compliance desk for security perfection and ROC charge filing. A relationship manager will contact you shortly.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderBorrowerPortal = () => {
        if (borrowerView === 'timeline') return renderBorrowerTimeline();
        return renderBorrowerForm();
    };

    // ---------------- BANKER UI (Tabs) ----------------
    const renderBankerTab = () => {
        if (!activeApplication && activeTab !== "Pending Requests") {
            return (
                <div className="p-12 text-center text-slate-500 bg-darkPanel border border-slate-700 rounded-xl max-w-2xl mx-auto mt-20">
                    <i data-lucide="inbox" className="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                    <h2 className="text-xl font-bold text-white mb-2">No Application Selected</h2>
                    <p>Go to the pending requests tab to pick a corporate borrower profile and initiate analysis.</p>
                    <button onClick={() => setActiveTab("Pending Requests")} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg">View Requests</button>
                </div>
            );
        }

        switch (activeTab) {
            case "Pending Requests": return renderPendingRequests();
            case "Borrower Profile": return renderApplicantProfile();
            case "Dashboard": return renderDashboard();
            case "Document Intelligence": return renderDocInt();
            case "NLP Research": return renderNlp();
            case "Investigator Portal": return renderInvestigator();
            case "Officer Decision": return renderDecision();
            case "CAM Generator": return renderCAM();
            default: return null;
        }
    };

    const renderPendingRequests = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Loan Requests Queue</h2>
                <button onClick={fetchApplications} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold border border-slate-700 transition">
                    <i data-lucide="refresh-cw" className="w-4 h-4"></i> Sync with Engine
                </button>
            </div>
            <div className="bg-darkPanel border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400 text-sm">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Company Name</th>
                            <th className="p-4">Industry</th>
                            <th className="p-4">Requested (Cr)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {pendingApplications.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No pending applications.</td></tr>}
                        {pendingApplications.map(app => (
                            <tr key={app.id} className="hover:bg-slate-800/50 transition">
                                <td className="p-4 text-sm">{app.date}</td>
                                <td className="p-4 font-bold text-blue-400">{app.companyName}</td>
                                <td className="p-4 text-sm">{app.industry}</td>
                                <td className="p-4 font-mono font-bold">{app.amount}</td>
                                <td className="p-4"><span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">{app.status}</span></td>
                                <td className="p-4">
                                    <button
                                        onClick={() => { setActiveApplication(app); setActiveTab("Borrower Profile"); setPipelineStage(0); setRiskData(null); setDocData(null); setNlpData(null); setCamUrl(""); }}
                                        className="bg-primary/20 hover:bg-primary hover:text-white text-primary px-4 py-1.5 rounded font-bold transition text-sm">
                                        Open Profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderApplicantProfile = () => (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
                <div>
                    <button onClick={() => setActiveTab("Pending Requests")} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest mb-2 transition">
                        <i data-lucide="arrow-left" className="w-4 h-4"></i> Back to Queue
                    </button>
                    <h2 className="text-3xl font-black text-white">Borrower profile</h2>
                    <p className="text-slate-500 text-sm mt-1">Official corporate identity and contact information.</p>
                </div>
                <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold border border-blue-500/30 flex items-center gap-2">
                    <i data-lucide="verified" className="w-5 h-5"></i> DATA VERIFIED BY MCA
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="building" className="w-4 h-4"></i> Identity & Incorporation</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-400">Legal Company Name</span>
                            <span className="text-white font-bold">{activeApplication.companyName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-400">CIN (Corp Identification)</span>
                            <span className="text-blue-400 font-mono font-bold tracking-tighter">{activeApplication.cin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-400">PAN Number</span>
                            <span className="text-white font-mono font-bold">{activeApplication.pan || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-400">GST Registration No.</span>
                            <span className="text-white font-mono font-bold">{activeApplication.gstin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-400">Incorporation Date</span>
                            <span className="text-white font-bold">{activeApplication.doi || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="users" className="w-4 h-4"></i> Management / Promoters</h3>
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 mb-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-3">Key Stakeholders</p>
                        <div className="flex flex-wrap gap-2">
                            {(activeApplication.promoterNames || "").split(',').map((name, i) => (
                                <span key={i} className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-600 shadow-sm">
                                    <i data-lucide="user" className="w-3.5 h-3.5 text-blue-400"></i> {name.trim()}
                                </span>
                            ))}
                            {!activeApplication.promoterNames && <span className="text-slate-500 text-sm">Not provided</span>}
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2"><i data-lucide="briefcase" className="w-4 h-4"></i> Business Details</h3>
                    <div className="space-y-4">
                        <div className="bg-slate-800/20 p-4 rounded-lg">
                            <span className="text-slate-500 text-xs block mb-1 font-bold">INDUSTRY SECTOR</span>
                            <span className="text-emerald-400 font-black text-lg">{activeApplication.industry}</span>
                        </div>
                        <div className="bg-slate-800/20 p-4 rounded-lg">
                            <span className="text-slate-500 text-xs block mb-1 font-bold">LOAN REQUEST AMOUNT</span>
                            <span className="text-white font-black text-2xl">{activeApplication.amount} <span className="text-slate-500 text-sm">Cr</span></span>
                        </div>
                    </div>
                </div>

                <div className="bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><i data-lucide="map-pinned" className="w-24 h-24"></i></div>
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2"><i data-lucide="map-pin" className="w-4 h-4"></i> Registered Office Address</h3>
                    <p className="text-lg text-slate-200 leading-relaxed font-medium max-w-2xl">{activeApplication.address || 'N/A'}</p>
                    <div className="mt-8 flex gap-4">
                        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition border border-slate-700"><i data-lucide="map" className="w-4 h-4 text-blue-400"></i> VIEW ON MAP</button>
                        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition border border-slate-700"><i data-lucide="external-link" className="w-4 h-4 text-emerald-400"></i> MCA RECORDS</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="animate-fade-in">
            {/* Corporate Snapshot */}
            <div className="bg-darkPanel border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <i data-lucide="building-2" className="text-blue-500"></i> {activeApplication.companyName}
                        </h2>
                        <div className="text-slate-400 text-sm mt-2 flex flex-wrap gap-4 items-center">
                            <span><b className="text-slate-300">Industry:</b> {activeApplication.industry}</span>
                            <span><b className="text-slate-300">Requested:</b> <span className="text-emerald-400 font-bold">{activeApplication.amount} Cr</span></span>
                            <span className="bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/30">Working Capital</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400 bg-slate-800/80 p-3 rounded border border-slate-700 shadow-inner">
                            <div><b className="text-slate-300 block">CIN Number</b> {activeApplication.cin || 'N/A'}</div>
                            <div><b className="text-slate-300 block">PAN</b> {activeApplication.pan || 'N/A'}</div>
                            <div><b className="text-slate-300 block">GSTIN</b> {activeApplication.gstin || 'N/A'}</div>
                            <div><b className="text-slate-300 block">Incorporation Date</b> {activeApplication.doi || 'N/A'}</div>
                            <div className="col-span-2 md:col-span-1"><b className="text-slate-300 block">Promoter Names</b> {activeApplication.promoterNames || 'N/A'}</div>
                            <div className="col-span-2 md:col-span-3"><b className="text-slate-300 block">Registered Office Address</b> {activeApplication.address || 'N/A'}</div>
                        </div>
                    </div>
                    {pipelineStage === 0 && (
                        <button onClick={runAutomatedPipeline} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center gap-2 transform transition hover:scale-105">
                            <i data-lucide="zap" className="w-5 h-5 text-yellow-300"></i> Start AI Analysis
                        </button>
                    )}
                </div>
            </div>

            {/* Pipeline UI */}
            {pipelineStage > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
                    {['📤 Uploads', '🔎 Extract', '📰 NLP', '⚖️ Lit', '🧠 ML', '📊 SHAP', '✅ Complete'].map((step, idx) => {
                        let stClass = "bg-slate-800 text-slate-500 border-slate-700";
                        if (pipelineStage > idx / 2) stClass = "bg-primary/20 text-white border-primary border shadow-[0_0_10px_rgba(59,130,246,0.3)]";
                        else if (pipelineStage === Math.floor(idx / 2) && loading) stClass = "bg-yellow-500/20 text-yellow-500 border-yellow-500 border animate-pulse";
                        return <div key={idx} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border ${stClass}`}>{step}</div>
                    })}
                </div>
            )}

            {pipelineStage < 4 && pipelineStage > 0 && (
                <div className="p-20 text-center animate-pulse">
                    <i data-lucide="loader-2" className="w-16 h-16 text-primary animate-spin mx-auto mb-4"></i>
                    <h3 className="text-xl font-medium text-slate-300">{statusMsg}</h3>
                </div>
            )}

            {pipelineStage === 4 && riskData && (
                <>
                    <h3 className="text-xl font-bold mb-4">AI Risk Overview Panel</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <MetricCard title="PROBABILITY OF DEFAULT" value={`${riskData.probability_of_default}%`} warn={riskData.probability_of_default > 15} colorClass="border-red-500" icon="activity" />
                        <MetricCard title="RISK SCORE" value={riskData.risk_score} sub="/ 100" colorClass="border-amber-500" />
                        <MetricCard title="RISK CLASS" value={riskData.risk_category} colorClass="border-blue-500" />
                        <MetricCard title="MODEL CONFIDENCE" value={`${riskData.confidence_level}%`} colorClass="border-emerald-500" />
                        <MetricCard title="FRAUD INDEX" value={riskData.fraud_risk_index} warn={riskData.fraud_risk_index !== 'Low'} colorClass="border-purple-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-darkPanel border border-slate-700 rounded-xl p-5 shadow-xl">
                            <h4 className="font-bold flex items-center gap-2 mb-4"><i data-lucide="bar-chart-2"></i>SHAP Explainability (Top 5 Drivers)</h4>
                            <FeatureChart features={riskData.shap_values} />
                        </div>
                        <div className="bg-darkPanel border border-slate-700 rounded-xl p-5 shadow-xl flex flex-col justify-center">
                            <h4 className="font-bold flex items-center gap-2 mb-4"><i data-lucide="alert-circle"></i>OSINT Risk Intel</h4>
                            <div className={`text-6xl font-black text-center mt-6 mb-2 drop-shadow-md ${nlpData.news_sentiment_score < 0 ? 'text-red-500' : 'text-emerald-400'}`}>{nlpData.news_sentiment_score}</div>
                            <p className="text-center text-slate-400 mb-8 font-bold text-[10px] uppercase tracking-widest">FinBERT News Sentiment Score</p>
                            <div className="flex justify-between items-center bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <div><div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Litigation Severity</div> <div className={`font-black text-xl ${nlpData.litigation_severity === 'High' ? 'text-red-500' : 'text-amber-500'}`}>{nlpData.litigation_severity}</div></div>
                                <div className="text-right"><div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Impact Score</div> <div className="font-black text-xl text-blue-400">{nlpData.nlp_risk_impact_score} <span className="text-[10px] text-slate-500 font-normal">/ 25</span></div></div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    // ... Other Bank Dashboard views remain identically implemented, using activeApplication for dynamic context ...
    // Document Intelligence
    const renderDocInt = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Document Intelligence</h2>
            {docData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-darkPanel border border-slate-700 p-6 rounded-xl">
                        <h3 className="font-bold mb-4 border-b border-slate-700 pb-2 flex justify-between">
                            AI Extracted Financials <span className="text-slate-500 text-sm font-normal">Values in INR Cr</span>
                        </h3>
                        <table className="w-full text-slate-300">
                            <tbody>
                                {Object.entries(docData.financials).filter(([k]) => !['auditor_remarks', 'risk_disclosures', 'gst_mismatch_pct'].includes(k)).map(([k, v]) => (
                                    <tr key={k} className="border-b border-slate-700/50"><td className="py-2.5 capitalize">{k.replace(/_/g, ' ')}</td><td className="text-right font-mono text-white font-medium">{v}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 p-3 bg-slate-800 border-l-4 border-yellow-500 text-sm rounded"><b>Auditor:</b> {docData.financials.auditor_remarks}</div>
                        <div className="mt-2 p-3 bg-red-900/20 border-l-4 border-red-500 text-sm rounded"><b>Disclosures:</b> {docData.financials.risk_disclosures}</div>
                    </div>

                    <div className="bg-darkPanel border border-slate-700 p-6 rounded-xl">
                        <h3 className="font-bold mb-6 border-b border-slate-700 pb-2 flex justify-between">
                            GST vs Bank Cross-Verification
                            {docData.cross_verification.anomaly_flag ? <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs animate-pulse border border-red-500/50 flex items-center gap-1"><i data-lucide="alert-triangle" className="w-3 h-3"></i> ANOMALY &gt; 20%</span> : <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-xs border border-emerald-500/50 flex items-center gap-1"><i data-lucide="check-circle" className="w-3 h-3"></i> NO ANOMALY</span>}
                        </h3>
                        <div className="space-y-5">
                            <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center"><span className="text-slate-400 text-sm">GST Sales Declared (Last 12 Mo)</span> <span className="text-xl font-bold">{docData.cross_verification.gst_sales_declared} Cr</span></div>
                            <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center"><span className="text-slate-400 text-sm">Bank Inward Credits Received</span> <span className="text-xl font-bold">{docData.cross_verification.bank_inward_credits} Cr</span></div>
                            <div className="pt-4 border-t border-slate-700 mt-6">
                                <span className="text-slate-300">Variance / Mismatch Percentage:</span>
                                <span className={`text-3xl font-bold float-right ${docData.cross_verification.anomaly_flag ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {docData.cross_verification.mismatch_pct}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden"><div className={`${docData.cross_verification.anomaly_flag ? 'bg-red-500' : 'bg-amber-500'} h-full rounded-full`} style={{ width: `${Math.min(docData.cross_verification.mismatch_pct * 3, 100)}%` }}></div></div>
                        </div>
                    </div>
                </div>
            ) : <div className="text-slate-500 p-20 text-center bg-darkPanel border border-slate-700 rounded-xl"><i data-lucide="scan-line" className="w-12 h-12 mx-auto mb-4 opacity-50"></i>Run AI Pipeline initialized from dashboard to extract documents.</div>}
        </div>
    );

    // NLP Research
    const renderNlp = () => (
        <div className="space-y-6 animate-fade-in pb-12">
            <h2 className="text-3xl font-black flex items-center gap-3"><i data-lucide="globe" className="text-blue-500"></i> Secondary Research Agent & OSINT</h2>
            {nlpData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Metrics and Gauges */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">News Sentiment Analysis</h3>
                            <div className="relative flex flex-col items-center">
                                <div className="text-5xl font-black mb-2 text-emerald-400 drop-shadow-md">{nlpData.news_sentiment_score}</div>
                                <div className="bg-slate-800 px-4 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase">FinBERT Scaled [-1 to +1]</div>
                                <div className="w-full bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                                    <div className={`h-full ${nlpData.news_sentiment_score < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.abs(nlpData.news_sentiment_score * 100)}%`, marginLeft: nlpData.news_sentiment_score < 0 ? 'auto' : '0' }}></div>
                                </div>
                                <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-slate-500"><span>NEGATIVE</span><span>NEUTRAL</span><span>POSITIVE</span></div>
                            </div>
                        </div>

                        <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">NLP Risk Impact</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-white">{nlpData.nlp_risk_impact_score}</span>
                                <span className="text-slate-500 mb-1 font-bold">/ 25</span>
                            </div>
                            <div className="mt-4 p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                                <div className="text-xs font-bold text-red-400 flex items-center gap-2 mb-1 uppercase tracking-tighter"><i data-lucide="alert-circle" className="w-3 h-3"></i> AI System Insight</div>
                                <p className="text-sm text-slate-300 italic">"{nlpData.summary_insight}"</p>
                            </div>
                        </div>

                        <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Industry Trend</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${nlpData.industry_risk_trend === 'Rising' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        <i data-lucide={nlpData.industry_risk_trend === 'Rising' ? "trending-up" : "trending-down"} className="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-white leading-none">{nlpData.industry_risk_trend}</div>
                                        <div className="text-xs text-slate-500 mt-1">Sector Volatility</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 font-bold mb-1">INDEX VALUE</div>
                                    <div className="text-xl font-mono font-bold text-slate-300">{nlpData.industry_risk_index}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Litigation & Compliance */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><i data-lucide="scale" className="w-16 h-16"></i></div>
                                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">Litigation Severity</h3>
                                <div className={`text-2xl font-black mb-2 px-4 py-1 rounded inline-block ${nlpData.litigation_severity === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>{nlpData.litigation_severity}</div>
                                <div className="text-sm text-slate-400 mt-4 leading-relaxed">Detected <span className="text-white font-bold">{nlpData.litigation_cases} active cases</span> across Indian Kanoon and e-Courts databases.</div>
                            </div>
                            <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><i data-lucide="shield-alert" className="w-16 h-16"></i></div>
                                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Compliance Flags</h3>
                                <div className="text-4xl font-black text-rose-500 mb-2">{nlpData.compliance_flags}</div>
                                <div className="text-sm text-slate-400 mt-4">Critical notices or penalties issued by MCA, RBI, or SEBI within the last 24 months.</div>
                            </div>
                            <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl md:col-span-2">
                                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Promoter / Director Background Summary</h3>
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${nlpData.promoter_risk_level === 'Elevated' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        <i data-lucide={nlpData.promoter_risk_level === 'Elevated' ? "user-x" : "user-check"} className="w-8 h-8"></i>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-white">Risk Level: {nlpData.promoter_risk_level}</div>
                                        <p className="text-sm text-slate-400 mt-1">Cross-referenced promoters against CIBIL wilful defaulter lists and CBI databases.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Feed */}
                        <div className="bg-darkPanel border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 p-4 border-b border-slate-700 font-bold flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm tracking-widest text-slate-400">RESEARCH SOURCE FEED</span>
                                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 ml-4">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="accent-blue-500"
                                                checked={showHighConfidenceOnly}
                                                onChange={(e) => setShowHighConfidenceOnly(e.target.checked)}
                                            />
                                            Show only high-confidence entities matching "{activeApplication?.companyName}"
                                        </label>
                                    </div>
                                </div>
                                <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded uppercase">Live OSINT Engine</span>
                            </div>
                            <div className="divide-y divide-slate-700/50">
                                {nlpData.detailed_analysis
                                    .filter(item => !showHighConfidenceOnly || item.is_high_confidence)
                                    .map((item, idx) => (
                                        <div key={idx} className={`p-5 hover:bg-slate-800/30 transition group ${!item.is_high_confidence && 'opacity-60'}`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <span className="text-[10px] font-black bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase tracking-wider">{item.source}</span>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${item.category === 'Litigation Risk' ? 'bg-red-900/40 text-red-400' :
                                                            item.category === 'Regulatory Risk' ? 'bg-amber-900/40 text-amber-400' :
                                                                item.category === 'Fraud/Governance Risk' ? 'bg-rose-900/40 text-rose-400' : 'bg-slate-800 text-slate-500'
                                                            }`}>{item.category}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.is_high_confidence ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-slate-600 text-slate-500 bg-slate-800'}`}>
                                                            {item.confidence}% Match Confidence
                                                        </span>
                                                    </div>
                                                    <h4 className="text-slate-200 font-medium mb-3 leading-relaxed">{item.headline}</h4>
                                                    <a href={item.url} target="_blank" className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:text-blue-400 transition">
                                                        <i data-lucide="link" className="w-3 h-3"></i> VIEW ORIGINAL RECORD SOURCE
                                                    </a>
                                                </div>
                                                <div className={`text-lg font-black shrink-0 ${item.impact < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {item.impact > 0 ? '+' : ''}{item.impact}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {nlpData.detailed_analysis.filter(item => !showHighConfidenceOnly || item.is_high_confidence).length === 0 && (
                                    <div className="p-12 text-center text-slate-500 italic">No articles matching the current confidence threshold.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-24 bg-darkPanel border-2 border-dashed border-slate-700 rounded-3xl text-slate-500 shadow-inner">
                    <div className="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"><i data-lucide="scan-eye" className="w-12 h-12 text-slate-600"></i></div>
                    <h3 className="text-2xl font-bold text-slate-300 mb-2">OSINT Agent Idle</h3>
                    <p className="max-w-md mx-auto">Initiate the AI Analysis pipeline from the main dashboard to trigger the deep-web secondary research scan.</p>
                </div>
            )}
        </div>
    );

    // Investigator
    const renderInvestigator = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Investigator Portal (Site Visit)</h2>
            <div className="bg-darkPanel border border-slate-700 p-8 rounded-xl grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-1"><label className="text-sm font-semibold text-slate-300">Factory / Plant Utilization %</label> <span className="text-sm font-bold text-blue-400">{investigatorInputs.utilization_pct}%</span></div>
                        <input type="range" className="w-full accent-blue-500" min="0" max="100" value={investigatorInputs.utilization_pct} onChange={(e) => setInvestigatorInputs({ ...investigatorInputs, utilization_pct: parseInt(e.target.value) })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Machinery & Assets Condition</label>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {['Good', 'Average', 'Poor'].map(c => (
                                <button key={c} onClick={() => setInvestigatorInputs({ ...investigatorInputs, machinery_condition: c })} className={`flex-1 py-2 text-sm font-bold rounded ${investigatorInputs.machinery_condition === c ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Inventory Stock Status</label>
                        <select className="w-full bg-slate-800 border-slate-700 p-3 rounded-lg text-white" value={investigatorInputs.inventory_status} onChange={(e) => setInvestigatorInputs({ ...investigatorInputs, inventory_status: e.target.value })}>
                            <option>Fast Moving</option><option>Normal</option><option>Slow Moving</option><option>Obsolete High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Employee Strength Observed</label>
                        <input type="number" className="w-full bg-slate-800 border-slate-700 p-3 rounded-lg text-white" value={investigatorInputs.employee_strength} onChange={(e) => setInvestigatorInputs({ ...investigatorInputs, employee_strength: parseInt(e.target.value) })} />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><label className="text-sm font-semibold text-slate-300">Management Credibility (1-5)</label> <span className="text-sm font-bold text-amber-500">{investigatorInputs.management_rating} / 5</span></div>
                        <input type="range" className="w-full accent-amber-500" min="1" max="5" value={investigatorInputs.management_rating} onChange={(e) => setInvestigatorInputs({ ...investigatorInputs, management_rating: parseInt(e.target.value) })} />
                    </div>

                    <button onClick={recalculateRisk} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 py-3 rounded-lg font-bold text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] flex justify-center items-center gap-2 mt-4 transition transform hover:-translate-y-1">
                        <i data-lucide="refresh-cw"></i> Recalculate Risk Engine
                    </button>
                </div>

                <div className="bg-slate-800 rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center p-10 text-slate-400 min-h-[400px]">
                    <i data-lucide="camera" className="w-20 h-20 mb-6 opacity-30 text-blue-400"></i>
                    <p className="font-semibold text-lg text-slate-300">Geotagged Photography</p>
                    <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">Drag and drop site verification images here. Geotags are automatically validated against registered address coordinates.</p>
                    <button className="mt-8 bg-slate-700 px-6 py-2 rounded font-medium hover:bg-slate-600 transition">Browse Files</button>
                </div>
            </div>

            {riskData && (
                <div className="bg-blue-900/30 border border-blue-500/50 p-5 rounded-xl shadow-lg flex items-center gap-6 justify-center">
                    <i data-lucide="check-circle" className="text-emerald-400 w-8 h-8"></i>
                    <div>
                        <div className="text-sm text-slate-300">Live ML Score after Investigator Recalibration</div>
                        <div className="text-3xl font-black text-white">{riskData.risk_score} <span className="text-xl font-normal text-slate-400">/ 100</span></div>
                    </div>
                </div>
            )}
        </div>
    );

    // Officer Decision & Appraisal
    const renderDecision = () => {
        const handleSaveDecision = () => {
            const updatedApp = { ...activeApplication, status: decision === 'Reject' ? 'Rejected' : 'Approved', finalDecision: decision, finalLimit: limit, finalRate: rate, reason: reason };
            setPendingApplications(pendingApplications.map(app => app.id === activeApplication.id ? updatedApp : app));
            setActiveApplication(updatedApp);
            alert("Appraisal decision and terms recorded officially in queue!");
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold">Credit Officer Decision & Appraisal</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AI Rec */}
                    <div className="bg-darkPanel border border-slate-700 p-8 rounded-xl shadow-xl">
                        <h3 className="font-bold border-b border-slate-700 pb-3 mb-6 flex items-center gap-2 text-emerald-400"> <i data-lucide="bot"></i> Recommended by IntelliCredit AI</h3>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                <span className="text-slate-400 text-sm">Requested Amount:</span> <span className="font-bold text-lg">{activeApplication.amount} Cr</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-900/10 border border-emerald-500/30 rounded-lg shadow-inner">
                                <span className="text-slate-300 text-sm">Model Suggested Limit:</span> <span className="text-emerald-400 font-bold text-xl">35.00 Cr</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                <span className="text-slate-400 text-sm">Risk-Adjusted Target ROI:</span> <span className="text-emerald-400 font-mono font-bold text-lg">9.50%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                <span className="text-slate-400 text-sm">Optimum Tenure:</span> <span className="font-bold text-lg">36 Months</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                <span className="text-slate-400 text-sm">Required Security Cover:</span> <span className="font-bold text-lg">1.50x Current Assets</span>
                            </div>
                        </div>
                    </div>

                    {/* Human Form */}
                    <div className="bg-darkPanel border border-slate-700 p-8 rounded-xl border-l-4 border-l-primary shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-6">
                            <h3 className="font-bold flex items-center gap-2"> <i data-lucide="user"></i> Final Committee Override</h3>
                            {(activeApplication.status === 'Approved' || activeApplication.status === 'Rejected') && <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 text-xs rounded font-bold border border-blue-500/50">DECISION LOCKED</span>}
                        </div>
                        <div className="space-y-6">
                            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                {['Approve', 'Approve with Conditions', 'Reject'].map(d => (
                                    <button key={d} onClick={() => setDecision(d)} className={`flex-1 py-3 text-sm font-bold rounded transition ${decision === d ? (d === 'Reject' ? 'bg-red-600 text-white shadow' : 'bg-emerald-600 text-white shadow') : 'text-slate-400 hover:text-white'}`}>{d}</button>
                                ))}
                            </div>

                            {decision !== 'Reject' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs text-slate-400 font-bold mb-1 block">Sanction Limit (Cr)</label><input type="number" className="w-full bg-slate-800 border-b-2 border-slate-600 focus:border-blue-500 focus:bg-slate-700 text-xl font-bold p-3 transition rounded-t" value={limit} onChange={e => setLimit(e.target.value)} /></div>
                                    <div><label className="text-xs text-slate-400 font-bold mb-1 block">Final ROI (%)</label><input type="number" className="w-full bg-slate-800 border-b-2 border-slate-600 focus:border-blue-500 focus:bg-slate-700 text-xl font-bold p-3 transition rounded-t" value={rate} onChange={e => setRate(e.target.value)} /></div>
                                    <div className="col-span-2"><label className="text-xs text-slate-400 font-bold mb-1 block">Tenure (Months)</label><input type="number" className="w-full bg-slate-800 border-b-2 border-slate-600 focus:border-blue-500 p-3 transition rounded-t text-lg" value={tenure} onChange={e => setTenure(e.target.value)} /></div>
                                    <div className="col-span-2"><label className="text-xs text-slate-400 font-bold mb-1 block">Specific Covenants / Remarks</label><textarea className="w-full bg-slate-800 border border-slate-700 p-3 rounded" rows="2" placeholder="Subject to perfection of security..."></textarea></div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm text-red-400 font-bold mb-2 block">Mandatory Rejection Basis Details</label>
                                    <textarea className="w-full bg-red-900/10 text-white p-4 rounded-lg border-2 border-red-900/50 focus:border-red-500 outline-none min-h-[150px]" placeholder="Specify exact AI flags or committee findings leading to decline..." value={reason} onChange={e => setReason(e.target.value)}></textarea>
                                </div>
                            )}
                            <button onClick={handleSaveDecision} className="w-full bg-gradient-to-r from-slate-100 to-slate-300 text-slate-900 py-3.5 rounded-lg font-black text-lg shadow-[0_5px_15px_rgba(255,255,255,0.15)] hover:from-white hover:to-slate-200 transition transform hover:-translate-y-1 mt-4">Save Final Appraisal Decision</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // CAM Generator
    const renderCAM = () => {
        const fetchDraft = async () => {
            const res = await fetch(`${API_URL}/get_cam_text`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_name: activeApplication.companyName, pd: riskData?.probability_of_default || 5, risk_score: riskData?.risk_score || 45, sentiment_score: nlpData?.sentiment_score || 0.5, top_drivers: riskData?.top_drivers || [], fraud_risk: riskData?.fraud_risk_index || 'Low', confidence: riskData?.confidence_level || 90 })
            });
            const data = await res.json();
            setCamDraft(data.content + `\n\nOFFICER DECISION: ${decision}\nApproved Limit: ${limit} Cr\nRate: ${rate}%\nComments: ${reason}`);
        };

        const generatePDF = async () => {
            setLoading(true);
            const res = await fetch(`${API_URL}/generate_cam`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_name: activeApplication.companyName, pd: riskData?.probability_of_default, risk_score: riskData?.risk_score, edited_text: camDraft, fraud_risk: riskData?.fraud_risk_index, confidence: riskData?.confidence_level })
            });
            const data = await res.json();
            const url = data.file;
            setCamUrl(url);
            setLoading(false);

            setPendingApplications(pendingApplications.map(app => app.id === activeApplication.id ? { ...app, camUrl: url } : app));
            setActiveApplication({ ...activeApplication, camUrl: url });
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end border-b border-slate-700 pb-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">Credit Appraisal Memo (CAM) Module</h2>
                        <p className="text-slate-400 mt-2">Generate, review, and edit the final formalized document output based on AI parameters.</p>
                    </div>
                    {!camDraft ? (
                        <button onClick={fetchDraft} className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg text-white font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2 transition transform hover:-translate-y-1">
                            <i data-lucide="sparkles"></i> Auto-Generate Draft via LLM
                        </button>
                    ) : (
                        <button onClick={generatePDF} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition transform hover:-translate-y-1">
                            {loading ? <i data-lucide="loader-2" className="animate-spin"></i> : <i data-lucide="file-check-2"></i>} Build Final PDF Export
                        </button>
                    )}
                </div>

                {camDraft ? (
                    <div className="bg-darkPanel p-6 border border-slate-700 rounded-xl shadow-xl">
                        <div className="flex items-center gap-3 text-sm font-semibold text-amber-500 mb-4 bg-amber-500/10 px-4 py-2 rounded"><i data-lucide="alert-triangle" className="w-4 h-4"></i> You may edit the AI generated text below freely before exporting.</div>
                        <textarea className="w-full h-[550px] bg-[#1e1e1e] text-slate-300 p-8 rounded-lg border border-slate-700 font-serif leading-loose outline-none focus:border-purple-500 transition-colors shadow-inner resize-none text-[15px] custom-scroller" value={camDraft} onChange={e => setCamDraft(e.target.value)}></textarea>
                    </div>
                ) : (
                    <div className="py-24 text-center border-2 border-slate-700 border-dashed rounded-xl bg-slate-800/20 max-w-3xl mx-auto shadow-inner mt-12">
                        <i data-lucide="file-signature" className="w-20 h-20 mx-auto text-slate-600 mb-6 drop-shadow-md"></i>
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No Draft Loaded</h3>
                        <p className="text-slate-500 px-12">Click the purple Auto-Generate button to allow IntelliCredit to synthesize all OCR, ML, and NLP data into a professional readable memo format.</p>
                    </div>
                )}

                {camUrl && (
                    <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 border border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] p-6 rounded-xl text-center cursor-pointer hover:from-emerald-800 hover:to-emerald-700 transition transform hover:-translate-y-2 group" onClick={() => window.open(`${API_URL}/download_cam?path=${encodeURIComponent(camUrl)}`)}>
                        <h3 className="text-2xl font-black text-white flex justify-center items-center gap-3 drop-shadow-md"><i data-lucide="download-cloud" className="w-8 h-8 text-emerald-300 group-hover:animate-bounce"></i> Download Approved Document</h3>
                        <p className="text-emerald-300 mt-2 font-medium">CAM is ready. Open PDF format for Credit Committee routing.</p>
                    </div>
                )}
            </div>
        )
    };

    const renderLogin = () => {
        if (!loginMode) {
            return (
                <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in">
                    <div className="bg-darkPanel border border-slate-700 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 transform transition hover:scale-105">
                            <i data-lucide="shield-check" className="w-10 h-10"></i>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-sm mb-1">INTELLICREDIT</h1>
                        <p className="text-emerald-400 text-xs font-bold tracking-[0.2em] mb-8">AI ENGINE V2.0</p>

                        <h2 className="text-slate-300 mb-6 font-medium text-sm">Select your portal to continue:</h2>

                        <div className="space-y-4">
                            <button onClick={() => setLoginMode('borrower')} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-4 rounded-xl flex items-center justify-between transition group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-slate-700 rounded-lg group-hover:bg-slate-600 transition"><i data-lucide="building-2" className="w-5 h-5 text-blue-400"></i></div>
                                    <div className="text-left"><div className="font-bold">Corporate Applicant</div><div className="text-xs text-slate-400 mt-0.5">Submit a loan application</div></div>
                                </div>
                                <i data-lucide="chevron-right" className="text-slate-500 group-hover:text-white transition"></i>
                            </button>
                            <button onClick={() => setLoginMode('bank')} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-500 text-white p-4 rounded-xl flex items-center justify-between transition group shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/20 rounded-lg transition"><i data-lucide="lock" className="w-5 h-5 text-white"></i></div>
                                    <div className="text-left"><div className="font-bold">Bank Officer</div><div className="text-xs text-blue-200 mt-0.5">Review AI appraisals & CAMs</div></div>
                                </div>
                                <i data-lucide="chevron-right" className="text-blue-200 group-hover:text-white transition"></i>
                            </button>
                        </div>
                        <p className="text-slate-500 text-[10px] mt-8 uppercase font-bold tracking-wider">Secure 256-bit encryption. Authorized personnel only.</p>
                    </div>
                </div>
            );
        }

        const handleLoginSubmit = (e) => {
            e.preventDefault();
            setUserRole(loginMode);
            setIsAuthenticated(true);
            if (loginMode === 'bank') setActiveTab('Pending Requests');
        }

        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in relative">
                <button onClick={() => setLoginMode(null)} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 font-medium transition"><i data-lucide="arrow-left" className="w-5 h-5"></i> Back to Portal Selection</button>
                <div className="bg-darkPanel border border-slate-700 p-10 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg">
                            <i data-lucide={loginMode === 'bank' ? "lock" : "building-2"} className={`w-8 h-8 ${loginMode === 'bank' ? 'text-blue-400' : 'text-emerald-400'}`}></i>
                        </div>
                        <h2 className="text-2xl font-black text-white">{loginMode === 'bank' ? 'Officer Sign In' : 'Corporate Sign In'}</h2>
                        <p className="text-slate-400 text-sm mt-1">Enter your credentials to access the platform</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Email Address</label>
                            <input required type="email" placeholder="name@company.com" className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 p-3 rounded-lg text-white transition outline-none" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-400 block">Secure Password</label>
                                <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot?</a>
                            </div>
                            <input required type="password" placeholder="••••••••" className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 p-3 rounded-lg text-white transition outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition shadow-lg mt-2 font-lg flex justify-center gap-2">
                            <i data-lucide="log-in" className="w-5 h-5"></i> Enter Workspace
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const BANK_TABS = [
        { id: "Pending Requests", icon: "inbox" },
        { id: "Borrower Profile", icon: "user-circle" },
        { id: "Dashboard", icon: "layout-dashboard" },
        { id: "Document Intelligence", icon: "file-text" },
        { id: "NLP Research", icon: "globe" },
        { id: "Investigator Portal", icon: "map-pin" },
        { id: "Officer Decision", icon: "briefcase" },
        { id: "CAM Generator", icon: "file-signature" }
    ];

    if (!isAuthenticated) return renderLogin();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Nav Menu */}
            <div className="w-72 bg-darkPanel border-r border-slate-700 flex flex-col p-5 z-20 shadow-[5px_0_20px_rgba(0,0,0,0.3)] shrink-0 transition-all">
                <div className="flex items-center gap-3 mb-8 mt-2 px-2 pb-6 border-b border-slate-800 cursor-pointer" onClick={() => setActiveTab(userRole === 'bank' ? 'Pending Requests' : '')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-lg flex items-center justify-center text-white"><i data-lucide="shield-check" className="w-6 h-6"></i></div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight leading-none drop-shadow-sm">INTELLICREDIT</h1>
                        <span className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] relative -top-1">AI ENGINE V2.0</span>
                    </div>
                </div>

                {/* Role Switcher */}
                <div className="mb-6 px-2">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 shadow-inner">
                        <button onClick={() => { setUserRole('borrower'); setActiveApplication(null); }} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition ${userRole === 'borrower' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><i data-lucide="building-2" className="w-3 h-3"></i> Applicant</button>
                        <button onClick={() => { setUserRole('bank'); setActiveTab('Pending Requests'); }} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition ${userRole === 'bank' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><i data-lucide="lock" className="w-3 h-3"></i> Bank Officer</button>
                    </div>
                </div>

                {userRole === "bank" ? (
                    <div className="space-y-1.5 flex-1 overflow-y-auto custom-scroller pr-2">
                        {BANK_TABS.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-all text-sm group ${activeTab === t.id ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border-l-4 border-blue-500 shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-4 border-transparent'
                                }`}>
                                <i data-lucide={t.icon} className={`w-5 h-5 ${activeTab === t.id ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
                                {t.id}
                                {t.id === "Pending Requests" && pendingApplications.length > 0 && <span className={'ml-auto bg-amber-500 text-xs text-white px-2 py-0.5 rounded-full font-bold'}>{pendingApplications.length}</span>}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <i data-lucide="shield-check" className="w-16 h-16 text-slate-700 mb-4"></i>
                        <p className="text-slate-500 text-sm font-medium">Borrower Portal</p>
                    </div>
                )}

                {/* User Profile Footer */}
                <div className="mt-auto pt-6 border-t border-slate-800 px-2 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {userRole === 'bank' ? (
                                <>
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600 rounded-full flex items-center justify-center shadow-lg"><i data-lucide="user-check" className="w-5 h-5 text-emerald-400"></i></div>
                                    <div><div className="text-sm font-bold text-white leading-tight">V. Sharma</div><div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider mt-0.5">Senior Analyst</div></div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600 rounded-full flex items-center justify-center shadow-lg"><i data-lucide="briefcase" className="w-5 h-5 text-slate-300"></i></div>
                                    <div><div className="text-sm font-bold text-white leading-tight">Corporate User</div><div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Guest Intake</div></div>
                                </>
                            )}
                        </div>
                        <button onClick={() => {
                            setIsAuthenticated(false);
                            setLoginMode(null);
                            setPipelineStage(0);
                            setActiveApplication(null);
                            localStorage.clear();
                        }} className="text-slate-500 hover:text-red-400 p-2 transition rounded-lg hover:bg-slate-800" title="Logout"><i data-lucide="log-out" className="w-5 h-5"></i></button>
                    </div>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="flex-1 overflow-y-auto custom-scroller bg-darkBg text-slate-100 p-8 pb-32">
                {userRole === 'borrower' ? renderBorrowerPortal() : renderBankerTab()}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
