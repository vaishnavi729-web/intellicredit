const { useState, useEffect, useRef } = React;

const API_URL = "http://127.0.0.1:8000";

// --- REUSABLE COMPONENTS ---

const Sidebar = ({ userRole, activeTab, setActiveTab, onLogout, borrowerView, setBorrowerView }) => {
    const bankLinks = [
        { id: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'Pending Requests', icon: 'clipboard-list' },
        { id: 'Borrower Profile', icon: 'building-2' },
        { id: 'Document Intelligence', icon: 'brain-circuit' },
        { id: 'NLP Research', icon: 'globe' },
        { id: 'Investigator Portal', icon: 'hard-hat' },
        { id: 'Officer Decision', icon: 'check-square' },
        { id: 'CAM Generator', icon: 'file-text' }
    ];

    const corporateLinks = [
        { id: 'dashboard', label: '📊 Dashboard', icon: 'layout-dashboard' },
        { id: 'form', label: '📝 New Loan Application', icon: 'plus-circle' },
        { id: 'my_applications', label: '📂 My Applications', icon: 'folder' },
        { id: 'documents', label: '📄 Documents', icon: 'files' },
        { id: 'extraction', label: '📂 Document Extraction', icon: 'brain-circuit' },
        { id: 'ews_research', label: '🌐 EWS & NLP Research', icon: 'globe' },
        { id: 'timeline', label: '⏳ Application Timeline', icon: 'timer' },
        { id: 'profile', label: '👤 Profile', icon: 'user' }
    ];

    return (
        <div className="w-64 bg-darkPanel border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-black text-white italic">IC</div>
                <h1 className="text-xl font-black italic tracking-tighter text-white">INTELLICREDIT</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {userRole === 'bank' ? (
                    bankLinks.map(link => (
                        <button key={link.id} onClick={() => setActiveTab(link.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition text-sm ${activeTab === link.id ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <i data-lucide={link.icon} className="w-5 h-5"></i> {link.id}
                        </button>
                    ))
                ) : (
                    corporateLinks.map(link => (
                        <button key={link.id} onClick={() => setBorrowerView(link.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition text-sm ${borrowerView === link.id ? 'bg-emerald-500/20 text-white border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            {link.label}
                        </button>
                    ))
                )}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg font-bold transition text-sm">
                    <i data-lucide="log-out" className="w-5 h-5"></i> 🚪 Logout
                </button>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, sub, warn, colorClass, icon = "activity" }) => (
    <div className={`bg-darkPanel border-l-4 ${colorClass || 'border-slate-700'} p-5 rounded-xl shadow-xl transition transform hover:-translate-y-1`}>
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</h4>
            <i data-lucide={icon} className={`w-4 h-4 ${warn ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}></i>
        </div>
        <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${warn ? 'text-red-500' : 'text-white'}`}>{value}</span>
            {sub && <span className="text-xs text-slate-500 font-bold">{sub}</span>}
        </div>
    </div>
);

const SignupPage = ({ onSignup, onReturnToLogin }) => {
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({});

    const handleBack = () => { if (role) setRole(null); else onReturnToLogin(); };

    const bankSignup = (e) => {
        e.preventDefault();
        onSignup('bank', formData);
    };

    const corporateSignup = (e) => {
        e.preventDefault();
        onSignup('corporate', formData);
    };

    if (!role) {
        return (
            <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 bg-grid">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div onClick={() => setRole('bank')} className="bg-darkPanel border-2 border-slate-700 hover:border-primary p-12 rounded-3xl cursor-pointer transition transform hover:scale-105 group text-center">
                        <i data-lucide="building-2" className="w-16 h-16 mx-auto mb-6 text-slate-500 group-hover:text-primary"></i>
                        <h2 className="text-2xl font-black text-white mb-4 italic">🏦 Bank Officer</h2>
                        <p className="text-slate-400">Appraise and monitor corporate loan applications with AI-driven risk intelligence.</p>
                    </div>
                    <div onClick={() => setRole('corporate')} className="bg-darkPanel border-2 border-slate-700 hover:border-emerald-500 p-12 rounded-3xl cursor-pointer transition transform hover:scale-105 group text-center">
                        <i data-lucide="users" className="w-16 h-16 mx-auto mb-6 text-slate-500 group-hover:text-emerald-500"></i>
                        <h2 className="text-2xl font-black text-white mb-4 italic">🏢 Corporate Applicant</h2>
                        <p className="text-slate-400">Apply for facilities, upload docs, and track your sanction pipeline in real-time.</p>
                    </div>
                    <button onClick={onReturnToLogin} className="md:col-span-2 text-slate-500 hover:text-white font-bold transition">← Already have an account? Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 bg-grid">
            <div className="max-w-md w-full bg-darkPanel border border-slate-700 p-8 rounded-3xl shadow-2xl animate-fade-in">
                <button onClick={handleBack} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6">← Back</button>
                <h2 className="text-3xl font-black text-white mb-2 italic">{role === 'bank' ? '🏦 Bank Signup' : '🏢 Corporate Signup'}</h2>

                {role === 'bank' ? (
                    <form onSubmit={bankSignup} className="space-y-4">
                        <input required placeholder="Full Name" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input required placeholder="Bank Name (e.g. HDFC Bank)" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
                        <input required placeholder="Bank Branch" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, branch: e.target.value })} />
                        <input required type="email" placeholder="Official Email (@bank domain)" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <input required placeholder="Employee ID" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, empId: e.target.value })} />
                        <input required type="password" placeholder="Password" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, pass: e.target.value })} />
                        <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl transition shadow-xl shadow-primary/20">CREATE OFFICER ACCOUNT</button>
                    </form>
                ) : (
                    <form onSubmit={corporateSignup} className="space-y-4">
                        <input required placeholder="Company Name *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                        <input required placeholder="CIN *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, cin: e.target.value })} />
                        <input placeholder="GSTIN (optional)" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                        <input required placeholder="PAN *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, pan: e.target.value })} />
                        <input required placeholder="Promoter Names *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, promoterNames: e.target.value })} />
                        <input required type="email" placeholder="Email *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <input required placeholder="Mobile *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                        <input required type="password" placeholder="Password *" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700" onChange={e => setFormData({ ...formData, pass: e.target.value })} />
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition shadow-xl shadow-emerald-500/20">CREATE CORPORATE ACCOUNT</button>
                    </form>
                )}
            </div>
        </div>
    );
};

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

const FiveCsGrid = ({ docData, nlpData, riskData }) => {
    const cs = [
        {
            name: "Character",
            icon: "user-check",
            color: "text-blue-400",
            metrics: [
                { label: "Promoter Litigation", value: nlpData.litigation_severity === 'Low' ? 'Clean' : nlpData.litigation_severity, status: nlpData.litigation_severity === 'Low' ? 'success' : 'warn' },
                { label: "News Sentiment", value: `${nlpData.news_sentiment_score}/100`, status: nlpData.news_sentiment_score > 70 ? 'success' : 'warn' }
            ]
        },
        {
            name: "Capacity",
            icon: "gauge",
            color: "text-emerald-400",
            metrics: [
                { label: "EBITDA Margin", value: `${docData.ebitda_margin}%`, status: 'info' },
                { label: "DSCR (Coverage)", value: `${docData.ratios?.dscr}x`, status: docData.ratios?.dscr > 1.5 ? 'success' : 'warn' }
            ]
        },
        {
            name: "Capital",
            icon: "pie-chart",
            color: "text-amber-400",
            metrics: [
                { label: "Debt-to-Equity", value: docData.debt_to_equity, status: docData.debt_to_equity < 2 ? 'success' : 'warn' },
                { label: "Interest Coverage", value: `${docData.interest_coverage}x`, status: 'info' }
            ]
        },
        {
            name: "Collateral",
            icon: "shield",
            color: "text-purple-400",
            metrics: [
                { label: "Security Coverage", value: "1.85x", status: 'success' },
                { label: "Asset Quality", value: "High", status: 'success' }
            ]
        },
        {
            name: "Conditions",
            icon: "trending-up",
            color: "text-rose-400",
            metrics: [
                { label: "Industry Trend", value: nlpData.industry_risk_trend, status: 'info' },
                { label: "Regulatory Flag", value: nlpData.compliance_flags === 0 ? 'Clean' : 'Alert', status: nlpData.compliance_flags === 0 ? 'success' : 'danger' }
            ]
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            {cs.map((c, i) => (
                <div key={i} className="bg-darkPanel border border-slate-700/50 p-5 rounded-2xl hover:border-slate-500 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg bg-slate-800 ${c.color} group-hover:scale-110 transition`}>
                            <i data-lucide={c.icon} className="w-5 h-5"></i>
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-white">{c.name}</h4>
                    </div>
                    <div className="space-y-3">
                        {c.metrics.map((m, j) => (
                            <div key={j}>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{m.label}</div>
                                <div className={`text-sm font-black flex items-center justify-between ${m.status === 'success' ? 'text-emerald-400' :
                                    m.status === 'warn' ? 'text-amber-400' :
                                        m.status === 'danger' ? 'text-rose-500' : 'text-blue-400'
                                    }`}>
                                    {m.value}
                                    {m.status === 'success' && <i data-lucide="check-circle" className="w-3 h-3"></i>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const DEFAULT_DOC_DATA = {
    revenue_current: 250.00,
    ebitda_margin: 18.5,
    debt_to_equity: 0.85,
    current_ratio: 1.45,
    interest_coverage: 4.2,
    risk_engine: {
        document_risk_score: 5,
        risk_breakdown: ["Strong Financial Growth Pattern", "Auditor Reliability Confirmed"]
    },
    ratios: {
        financial_health: 'Strong',
        debt_to_equity: 0.85,
        interest_coverage: 4.2,
        net_profit_margin: 8.5,
        dscr: 1.8,
        current_ratio: 1.45,
        quick_ratio: 1.15
    },
    trends: {
        revenue_trend: 'Stable Growth',
        revenue_cagr: 12.5,
        profitability: 'Improving'
    },
    auditor_analysis: {
        is_flagged: false,
        remarks: 'The financial statements present a true and fair view of the state of affairs.'
    },
    financials: {
        "Total Revenue": 250.0,
        "Ebitda": 46.25,
        "PAT": 21.25,
        "Total Debt": 85.0,
        "Total Equity": 100.0,
        "Current Assets": 145.0,
        "Current Liabilities": 100.0
    }
};

const DEFAULT_NLP_DATA = {
    news_sentiment_score: 75,
    litigation_severity: 'Low',
    nlp_risk_impact_score: 3,
    promoter_risk_score: 10,
    industry_risk_index: 25,
    industry_risk_trend: 'Stable',
    litigation_cases: 0,
    compliance_flags: 0,
    promoter_risk_level: 'Stable',
    summary_insight: "No material adverse findings. Positive growth indicators present.",
    detailed_analysis: [
        {
            source: "Google News",
            category: "Growth Intel",
            confidence: 92,
            headline: "Borrower entity exhibits strong market expansion and digital transformation focus.",
            url: "#",
            impact: 7,
            is_high_confidence: true
        },
        {
            source: "Business Standard",
            category: "Sector Update",
            confidence: 88,
            headline: "Industry sector showing resilient recovery patterns in current fiscal quarter.",
            url: "#",
            impact: 5,
            is_high_confidence: true
        }
    ]
};

const DEFAULT_RISK_DATA = {
    probability_of_default: 2.45,
    risk_score: 88,
    risk_category: 'Elite Grade (AAA)',
    confidence_level: 98.2,
    fraud_risk_index: 'Minimal',
    shap_values: {
        'Net_Profit_Margin': -0.12,
        'Asset_Quality': -0.09,
        'News_Sentiment': -0.08,
        'Regulatory_Compliance': -0.05,
        'Promoter_Experience': -0.04
    }
};

// --- APP ---

const App = () => {
    // Persistent Session Logic
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('auth') === 'true');
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [loginMode, setLoginMode] = useState(() => localStorage.getItem('loginMode') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || "Dashboard");

    // Corporate User State
    const [corporateData, setCorporateData] = useState(() => {
        const saved = localStorage.getItem('corporateData');
        if (saved) return JSON.parse(saved);
        return {
            companyName: 'Your Company Name Ltd.',
            cin: 'L00000MH0000PLC000000',
            gstin: '27AAAAA1234A1Z1',
            pan: 'AAAAA1234A',
            promoterNames: 'Proprietor Name',
            email: 'admin@company.com',
            mobile: '+91-00-00000000',
            address: 'Head Office, Corporate Park, City, State - Zip'
        };
    });

    // Borrower Application State
    const [borrowerView, setBorrowerView] = useState(() => localStorage.getItem('borrowerView') || 'dashboard');
    const [activeBorrowerAppId, setActiveBorrowerAppId] = useState(() => localStorage.getItem('activeBorrowerAppId') || null);
    const [borrowerForm, setBorrowerForm] = useState({
        requestedAmount: '', purpose: '', ar: null, fs: null, gstr: null, bank: null, itr: null, notes: '', targetBank: ''
    });
    const [pendingApplications, setPendingApplications] = useState(() => {
        const saved = localStorage.getItem('pendingApplications');
        if (saved) return JSON.parse(saved);
        return [];
    });

    const [activeApplication, setActiveApplication] = useState(() => {
        const saved = localStorage.getItem('activeApplication');
        if (saved) return JSON.parse(saved);
        return null;
    });

    // Global AI Engine State
    const [pipelineStage, setPipelineStage] = useState(4); // Pre-set to completed for hardcoded bank
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const [docData, setDocData] = useState(DEFAULT_DOC_DATA);
    const [nlpData, setNlpData] = useState(DEFAULT_NLP_DATA);
    const [riskData, setRiskData] = useState(DEFAULT_RISK_DATA);
    const [investigatorInputs, setInvestigatorInputs] = useState({ utilization_pct: 75, machinery_condition: 'Good', inventory_status: 'Normal', employee_strength: 150, management_rating: 4, review_summary: '' });
    const [camUrl, setCamUrl] = useState("");
    const [showHighConfidenceOnly, setShowHighConfidenceOnly] = useState(false);

    // Officer Decision State
    const [decision, setDecision] = useState("Approve");
    const [limit, setLimit] = useState(475);
    const [rate, setRate] = useState(8.25);
    const [tenure, setTenure] = useState(60);
    const [reason, setReason] = useState("Strong financial position and dominant market share justify the requested expansion facility.");
    const [credentials, setCredentials] = useState({ email: '', pass: '' });
    const [editingApp, setEditingApp] = useState(null);

    // Sync state to LocalStorage
    useEffect(() => {
        localStorage.setItem('auth', isAuthenticated);
        localStorage.setItem('loginMode', loginMode || '');
        localStorage.setItem('userRole', userRole || '');
        localStorage.setItem('activeTab', activeTab);
        localStorage.setItem('borrowerView', borrowerView);
        localStorage.setItem('activeBorrowerAppId', activeBorrowerAppId || '');
        localStorage.setItem('activeApplication', activeApplication ? JSON.stringify(activeApplication) : '');
        localStorage.setItem('corporateData', JSON.stringify(corporateData));
    }, [isAuthenticated, loginMode, userRole, activeTab, borrowerView, activeBorrowerAppId, activeApplication, corporateData]);

    useEffect(() => { window.lucide && window.lucide.createIcons(); }, [activeTab, pipelineStage, riskData, nlpData, docData, camUrl, userRole, activeApplication, isAuthenticated, isSignupOpen, loginMode]);

    useEffect(() => {
        if (isAuthenticated) fetchApplications();
    }, [isAuthenticated, userRole, activeTab, borrowerView]);

    // ---------------- AUTH LOGIC ----------------
    const handleLogin = (role) => {
        setUserRole(role);
        setIsAuthenticated(true);
        setActiveTab("Dashboard");
        setBorrowerView("dashboard");
    };

    const handleSignup = async (role, data) => {
        const mappedRole = role === 'corporate' ? 'borrower' : 'bank';
        try {
            const signupRes = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, role: mappedRole })
            });
            const signupJson = await signupRes.json();

            if (signupJson.status === 'success') {
                if (role === 'corporate') {
                    await fetch(`${API_URL}/save_profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    setCorporateData(data);
                } else {
                    localStorage.setItem('bankName', data.bankName);
                }

                setUserRole(mappedRole);
                setLoginMode(mappedRole);
                setIsAuthenticated(true);
                setIsSignupOpen(false);
                if (role === 'corporate') {
                    setBorrowerView('dashboard');
                } else {
                    setActiveTab('Pending Requests');
                }
            } else {
                alert("Signup failed: " + signupJson.message);
            }
        } catch (err) {
            console.error("Signup error", err);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setLoginMode(null);
        localStorage.clear();
        window.location.reload();
    };

    // ---------------- BORROWER SUBMIT ----------------
    const submitLoanApplication = async (e) => {
        e.preventDefault();
        const newApp = {
            id: Date.now(),
            companyName: corporateData.companyName || "New Enterprise P. Ltd.",
            industry: "Manufacturing", // Default for simulation
            amount: borrowerForm.requestedAmount || "0.0",
            status: "Pending",
            date: new Date().toISOString().split('T')[0],
            cin: corporateData.cin,
            pan: corporateData.pan,
            gstin: corporateData.gstin,
            promoterNames: corporateData.promoterNames,
            purpose: borrowerForm.purpose,
            notes: borrowerForm.notes,
            address: corporateData.address,
            bank: borrowerForm.targetBank || "State Bank of India"
        };

        try {
            await fetch(`${API_URL}/save_application`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newApp)
            });
            setPendingApplications([...pendingApplications, newApp]);
            setActiveBorrowerAppId(newApp.id);
            setBorrowerView('timeline');
            setPipelineStage(0);
            setRiskData(DEFAULT_RISK_DATA);
            setDocData(DEFAULT_DOC_DATA);
            setNlpData(DEFAULT_NLP_DATA);
            setCamUrl("");
            setBorrowerForm({ requestedAmount: '', purpose: '', notes: '', targetBank: '' });
        } catch (err) {
            console.error("Failed to save:", err);
            alert("Backend Engine Offline!");
        }
    };

    const fetchApplications = async () => {
        try {
            let url = `${API_URL}/get_applications`;
            if (userRole === 'bank') {
                const bank = localStorage.getItem('bankName');
                // In demo mode or if no specific bank, fetch ALL applications
                if (bank && bank !== 'Demo Bank') {
                    url += `?bank=${encodeURIComponent(bank)}`;
                }
            } else if (userRole === 'borrower') {
                url += `?company=${encodeURIComponent(corporateData.companyName)}`;
            }
            const res = await fetch(url);
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
                const targetBank = activeApplication.bank || localStorage.getItem('bankName') || '';
                const nlpRes = await fetch(`${API_URL}/external_research/${activeApplication.companyName}?cin=${cin}&promoter_names=${encodeURIComponent(promoters)}&bank=${encodeURIComponent(targetBank)}`);
                const nlpJson = await nlpRes.json();
                setNlpData(nlpJson);

                // Auto-set Investigator Inputs to "Correct" (High Quality) values for the demo
                setInvestigatorInputs({
                    utilization_pct: 85,
                    machinery_condition: 'Good',
                    inventory_status: 'Fast Moving',
                    employee_strength: 240,
                    management_rating: 5,
                    review_summary: 'Site visit completed. Operations are running at optimal capacity. Management appears highly competent and transparent.'
                });

                setTimeout(async () => {
                    setPipelineStage(3); setStatusMsg("Calculating XGBoost Probabilities & SHAP...");

                    // Combine all intelligence for a holistic risk assessment
                    const combinedPayload = {
                        ...extractJson.data,
                        industry_risk_index: nlpJson.industry_risk_index || 50,
                        litigation_count: nlpJson.litigation_count || 0,
                        promoter_score: (100 - (nlpJson.promoter_risk_score || 0)),
                        utilization_pct: 85, // Use hardcoded "correct" value for run
                        // Contextual items for backend logic
                        nlp_risk_impact_score: nlpJson.nlp_risk_impact_score || 0,
                        requested_amount: activeApplication.amount
                    };

                    const riskRes = await fetch(`${API_URL}/calculate_risk`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(combinedPayload)
                    });
                    const riskJson = await riskRes.json();
                    setRiskData(riskJson);

                    // Pre-fill Decision Form with AI Recommendations
                    setLimit(riskJson.recommended_limit || activeApplication.amount);
                    setRate(riskJson.interest_rate || 9.5);
                    setDecision(riskJson.decision || "Approve");
                    setReason(riskJson.decision === "Reject" ? "Risk triggers exceeded threshold." : "Strong financial and operational performance justifies sanction.");

                    setPipelineStage(4); setStatusMsg("AI Engine processing complete.");
                    setLoading(false);
                }, 1500);
            }, 1500);
        } catch (e) {
            console.error(e);
            setStatusMsg("Backend connectivity error! Loading local AI simulation data...");
            setLoading(false);
            setDocData(DEFAULT_DOC_DATA);
            setNlpData(DEFAULT_NLP_DATA);
            setRiskData(DEFAULT_RISK_DATA);
            setLimit(45.00);
            setRate(9.50);
            setDecision("Approve");
            setPipelineStage(4);
        }
    };

    const recalculateRisk = async () => {
        if (!riskData) return;
        const combinedPayload = {
            ...docData,
            industry_risk_index: nlpData.industry_risk_index || 50,
            litigation_count: nlpData.litigation_count || 0,
            promoter_score: (100 - (nlpData.promoter_risk_score || 0)),
            utilization_pct: investigatorInputs.utilization_pct,
            nlp_risk_impact_score: nlpData.nlp_risk_impact_score || 0,
            requested_amount: activeApplication.amount
        };
        const riskRes = await fetch(`${API_URL}/calculate_risk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(combinedPayload)
        });
        const riskJson = await riskRes.json();
        setRiskData(riskJson);
    }

    // ---------------- BORROWER UI ----------------
    const renderBorrowerDashboard = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pl-4 pr-12 pb-20">
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter">Welcome, {corporateData.companyName}</h2>
                    <p className="text-slate-400 mt-2">Manage your active credit facilities and AI appraisal progress.</p>
                </div>
                <button onClick={() => setBorrowerView('form')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2">
                    <i data-lucide="plus-circle" className="w-5 h-5"></i> Apply for New Loan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2">Total Facilities</div>
                    <div className="text-3xl font-black text-white">{pendingApplications.length}</div>
                </div>
                <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2">Approved Limit</div>
                    <div className="text-3xl font-black text-emerald-400">{pendingApplications.reduce((acc, app) => acc + (app.status === 'Approved' ? parseFloat(app.finalLimit || 0) : 0), 0)} Cr</div>
                </div>
                <div className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2">Active Tracker</div>
                    {(() => {
                        const inProgressApp = pendingApplications.find(a => a.status === 'Pending');
                        return inProgressApp
                            ? <div className="text-3xl font-black text-blue-400 flex items-center gap-2">#{inProgressApp.id} <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full uppercase animate-pulse">In Progress</span></div>
                            : <div className="text-3xl font-black text-slate-500">No active apps</div>;
                    })()}
                </div>
            </div>

            <div className="bg-darkPanel border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Recent Loan Applications</h3>
                    <button onClick={() => setBorrowerView('my_applications')} className="text-blue-400 text-sm font-bold hover:underline">View All</button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">App ID</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Bank</th>
                            <th className="px-6 py-4">Requested (Cr)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {pendingApplications.slice(0, 5).map(app => (
                            <tr key={app.id} className="hover:bg-slate-800/30 transition text-[11px]">
                                <td className="px-6 py-4 font-mono font-bold text-slate-300">#{app.id}</td>
                                <td className="px-6 py-4 font-bold text-white">{app.companyName}</td>
                                <td className="px-6 py-4 font-bold text-blue-400">{app.bank || 'State Bank of India'}</td>
                                <td className="px-6 py-4 font-black text-white">{app.amount} Cr</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>{app.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center flex flex-col gap-2">
                                    <button onClick={() => { setActiveBorrowerAppId(app.id); setBorrowerView('timeline'); }} className="text-blue-400 hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                                        <i data-lucide="crosshair" className="w-4 h-4"></i> Track
                                    </button>
                                    {app.status === 'Approved' && (
                                        <button
                                            onClick={() => window.open(`${API_URL}/download_cam?path=${encodeURIComponent(app.camUrl || 'cam_report.pdf')}`)}
                                            className="text-emerald-400 hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] uppercase"
                                        >
                                            <i data-lucide="download-cloud" className="w-4 h-4"></i> Download
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMyApplications = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pl-4 pr-12 pb-20">
            <h2 className="text-4xl font-black text-white italic tracking-tighter border-b border-slate-800 pb-6 mb-8">My Loan History</h2>
            <div className="grid grid-cols-1 gap-4">
                {pendingApplications.map(app => (
                    <div key={app.id} className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl flex items-center justify-between hover:border-blue-500/50 transition">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                                <i data-lucide="file-text" className="text-blue-400"></i>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Application ID: #{app.id}</div>
                                <div className="text-xl font-black text-white leading-none">{app.amount} Cr <span className="text-sm font-normal text-slate-400 ml-2">({app.purpose})</span></div>
                                <div className="text-xs text-slate-500 mt-2">Submitted on {app.date}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>{app.status}</span>
                            {app.status === 'Pending' && (
                                <button onClick={() => { setEditingApp({ ...app }); setBorrowerView('edit_form'); }} className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-5 py-2.5 rounded-lg font-bold border border-blue-500/30 transition flex items-center gap-2">
                                    <i data-lucide="pencil" className="w-4 h-4"></i> Edit
                                </button>
                            )}
                            <button onClick={() => { setActiveBorrowerAppId(app.id); setBorrowerView('timeline'); }} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-bold border border-slate-600 transition flex items-center gap-2">
                                <i data-lucide="eye" className="w-4 h-4"></i> Track Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const updateLoanApplication = async (e) => {
        e.preventDefault();
        if (!editingApp) return;
        try {
            const res = await fetch(`${API_URL}/update_application/${editingApp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingApp)
            });
            const data = await res.json();
            if (data.status === 'success') {
                setPendingApplications(prev => prev.map(a => a.id === editingApp.id ? { ...a, ...editingApp } : a));
                setEditingApp(null);
                setBorrowerView('my_applications');
            }
        } catch (err) {
            console.error('Update failed:', err);
            alert('Backend Engine Offline!');
        }
    };

    const renderEditForm = () => {
        if (!editingApp) return <div className="text-slate-500 text-center p-20">No application selected for editing.</div>;
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pl-4 pr-12 pb-20">
                <div className="flex border-b border-slate-800 pb-4 mb-6 items-end justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter">Edit Application</h2>
                        <p className="text-slate-400 mt-2">Update your facility request. Application ID: <span className="text-blue-400 font-bold">#{editingApp.id}</span></p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Editing As</span>
                        <span className="text-emerald-400 font-bold">{corporateData.companyName}</span>
                    </div>
                </div>

                <form onSubmit={updateLoanApplication} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-darkPanel border border-slate-700 p-8 rounded-3xl shadow-xl">
                            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-3 border-b border-slate-800 pb-4"><i data-lucide="banknote" className="text-emerald-400"></i> Capital Requirement</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Requested Loan Amount (INR Cr) *</label>
                                    <input required type="number" step="0.01" className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-2xl font-black text-emerald-400" value={editingApp.amount} onChange={e => setEditingApp({ ...editingApp, amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Purpose of Loan *</label>
                                    <select required className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold text-white" value={editingApp.purpose || ''} onChange={e => setEditingApp({ ...editingApp, purpose: e.target.value })}>
                                        <option value="">Select Purpose</option>
                                        <option>Working Capital</option>
                                        <option>Term Loan (CAPEX)</option>
                                        <option>Trade Finance (LC/BG)</option>
                                        <option>Project Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Target Bank *</label>
                                    <select required className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold text-white" value={editingApp.bank || ''} onChange={e => setEditingApp({ ...editingApp, bank: e.target.value })}>
                                        <option value="">Select Financial Institution</option>
                                        <option>HDFC Bank</option>
                                        <option>ICICI Bank</option>
                                        <option>State Bank of India</option>
                                        <option>Axis Bank</option>
                                        <option>Kotak Mahindra Bank</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Industry</label>
                                    <input className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold text-white" value={editingApp.industry || ''} onChange={e => setEditingApp({ ...editingApp, industry: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Additional Notes / Special Requests</label>
                                    <textarea className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-white min-h-[100px]" placeholder="Briefly describe your business requirement..." value={editingApp.notes || ''} onChange={e => setEditingApp({ ...editingApp, notes: e.target.value })}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 pt-6">
                        <button type="button" onClick={() => { setEditingApp(null); setBorrowerView('my_applications'); }} className="px-8 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition">Cancel</button>
                        <button type="submit" className="px-12 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black italic shadow-xl shadow-blue-500/20 transition transform hover:-translate-y-1 flex items-center gap-3">
                            <i data-lucide="save"></i> SAVE CHANGES
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderBorrowerDocuments = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pl-4 pr-12 pb-20">
            <h2 className="text-4xl font-black text-white italic tracking-tighter border-b border-slate-800 pb-6 mb-8">Uploaded Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Annual Reports', 'Financial Statements', 'GST Returns', 'Bank Statements', 'ITR Filings', 'KYC Documents'].map((doc, idx) => (
                    <div key={idx} className="bg-darkPanel border border-slate-700 p-6 rounded-2xl shadow-xl group hover:border-emerald-500/50 transition cursor-pointer">
                        <i data-lucide="file-check" className="w-10 h-10 mb-4 text-emerald-400 group-hover:scale-110 transition"></i>
                        <h4 className="font-bold text-white mb-2">{doc}</h4>
                        <p className="text-xs text-slate-500 mb-4">Last updated 2 days ago</p>
                        <button className="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-white transition">Preview File</button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBorrowerProfile = () => (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pl-4 pr-12 pb-20">
            <h2 className="text-4xl font-black text-white italic tracking-tighter border-b border-slate-800 pb-6 mb-8">Corporate Profile</h2>

            <div className="bg-darkPanel border border-slate-700 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><i data-lucide="building-2" className="w-48 h-48"></i></div>

                <form className="space-y-6 relative z-10" onSubmit={e => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Company Name *</label>
                            <input className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white font-bold" value={corporateData.companyName} onChange={e => setCorporateData({ ...corporateData, companyName: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">CIN *</label>
                            <input className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white font-mono" value={corporateData.cin} onChange={e => setCorporateData({ ...corporateData, cin: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">GSTIN (Optional)</label>
                            <input className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white font-mono" value={corporateData.gstin} onChange={e => setCorporateData({ ...corporateData, gstin: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">PAN *</label>
                            <input className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white font-mono" value={corporateData.pan} onChange={e => setCorporateData({ ...corporateData, pan: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Mobile *</label>
                            <input className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white" value={corporateData.mobile} onChange={e => setCorporateData({ ...corporateData, mobile: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Email *</label>
                            <input className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white" value={corporateData.email} onChange={e => setCorporateData({ ...corporateData, email: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Promoter Names *</label>
                            <textarea className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white" value={corporateData.promoterNames} onChange={e => setCorporateData({ ...corporateData, promoterNames: e.target.value })}></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Company Address *</label>
                            <textarea className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-white" value={corporateData.address} onChange={e => setCorporateData({ ...corporateData, address: e.target.value })}></textarea>
                        </div>
                    </div>

                    <button type="button" onClick={async () => {
                        try {
                            await fetch(`${API_URL}/save_profile`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(corporateData)
                            });

                            const updatedApps = pendingApplications.map(app => ({
                                ...app,
                                companyName: corporateData.companyName,
                                address: corporateData.address,
                                cin: corporateData.cin,
                                pan: corporateData.pan,
                                gstin: corporateData.gstin,
                                promoterNames: corporateData.promoterNames
                            }));
                            setPendingApplications(updatedApps);
                            if (activeApplication) setActiveApplication({
                                ...activeApplication,
                                companyName: corporateData.companyName,
                                address: corporateData.address,
                                cin: corporateData.cin,
                                pan: corporateData.pan,
                                gstin: corporateData.gstin,
                                promoterNames: corporateData.promoterNames
                            });
                            alert("Profile changes saved to database! Bank Officer records updated.");
                        } catch (err) {
                            alert("Failed to save profile on backend.");
                        }
                    }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] mt-4">Save Profile Changes</button>
                </form>
            </div>
        </div>
    );

    const renderBorrowerForm = () => (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pl-4 pr-12 pb-20">
            <div className="flex border-b border-slate-800 pb-4 mb-6 items-end justify-between">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter">New Loan Application</h2>
                    <p className="text-slate-400 mt-2">Submit your facility request for AI-driven credit appraisal.</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Applying As</span>
                    <span className="text-emerald-400 font-bold">{corporateData.companyName}</span>
                </div>
            </div>

            <form onSubmit={submitLoanApplication} className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                    {/* Facility Details */}
                    <div className="bg-darkPanel border border-slate-700 p-8 rounded-3xl shadow-xl">
                        <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-3 border-b border-slate-800 pb-4"><i data-lucide="banknote" className="text-emerald-400"></i> Capital Requirement</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Requested Loan Amount (INR Cr) *</label>
                                <input required type="number" step="0.01" className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-2xl font-black text-emerald-400" placeholder="e.g. 25.50" value={borrowerForm.requestedAmount} onChange={e => setBorrowerForm({ ...borrowerForm, requestedAmount: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Purpose of Loan *</label>
                                <select required className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold text-white" value={borrowerForm.purpose} onChange={e => setBorrowerForm({ ...borrowerForm, purpose: e.target.value })}>
                                    <option value="">Select Purpose</option>
                                    <option>Working Capital</option>
                                    <option>Term Loan (CAPEX)</option>
                                    <option>Trade Finance (LC/BG)</option>
                                    <option>Project Finance</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Target Bank *</label>
                                <select required className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold text-white" value={borrowerForm.targetBank} onChange={e => setBorrowerForm({ ...borrowerForm, targetBank: e.target.value })}>
                                    <option value="">Select Financial Institution</option>
                                    <option>HDFC Bank</option>
                                    <option>ICICI Bank</option>
                                    <option>State Bank of India</option>
                                    <option>Axis Bank</option>
                                    <option>Kotak Mahindra Bank</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Additional Notes / Special Requests</label>
                                <textarea className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-white min-h-[100px]" placeholder="Briefly describe your business requirement..." value={borrowerForm.notes} onChange={e => setBorrowerForm({ ...borrowerForm, notes: e.target.value })}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Financial Uploads */}
                    <div className="bg-darkPanel border border-slate-700 p-8 rounded-3xl shadow-xl">
                        <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-3 border-b border-slate-800 pb-4"><i data-lucide="upload-cloud" className="text-blue-400"></i> Financial Uploads</h3>
                        <div className="space-y-4">
                            {[
                                { id: 'ar', label: 'Annual Reports (Last 3 Yrs)' },
                                { id: 'fs', label: 'Financial Statements (P&L, BS)' },
                                { id: 'gstr', label: 'GST Returns (Last 12 Mo)' },
                                { id: 'bank', label: 'Bank Statements (Primary A/c)' }
                            ].map(doc => (
                                <div key={doc.id} className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">{doc.label} *</label>
                                    <input type="file" required={doc.id !== 'ar'} multiple accept=".pdf,.xlsx,.xls,.doc,.docx" className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-6 pt-6">
                    <button type="button" onClick={() => setBorrowerView('dashboard')} className="px-8 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition">Cancel</button>
                    <button type="submit" className="px-12 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-1 flex items-center gap-3">
                        <i data-lucide="send"></i> SUBMIT TO AI ENGINE
                    </button>
                </div>
            </form >
        </div >
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
        switch (borrowerView) {
            case 'dashboard': return renderBorrowerDashboard();
            case 'form': return renderBorrowerForm();
            case 'my_applications': return renderMyApplications();
            case 'edit_form': return renderEditForm();
            case 'documents': return renderBorrowerDocuments();
            case 'extraction': return renderDocInt();
            case 'ews_research': return renderNlp();
            case 'timeline': return renderBorrowerTimeline();
            case 'profile': return renderBorrowerProfile();
            default: return renderBorrowerDashboard();
        }
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
                                        onClick={() => { setActiveApplication(app); setActiveTab("Borrower Profile"); setPipelineStage(4); setRiskData(DEFAULT_RISK_DATA); setDocData(DEFAULT_DOC_DATA); setNlpData(DEFAULT_NLP_DATA); setCamUrl(""); }}
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

                    <h3 className="text-xl font-bold mt-10 mb-4 flex items-center gap-2">
                        <i data-lucide="shield-check" className="text-blue-500"></i> Five Cs of Credit Analysis
                        <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded uppercase ml-2 tracking-widest">Mandatory Compliance Overview</span>
                    </h3>
                    <FiveCsGrid docData={docData} nlpData={nlpData} riskData={riskData} />
                </>
            )}
        </div>
    );

    // ... Other Bank Dashboard views remain identically implemented, using activeApplication for dynamic context ...
    // Document Intelligence
    const renderDocInt = () => (
        <div className="space-y-6 animate-fade-in pb-12">
            <h2 className="text-3xl font-black flex items-center gap-3"><i data-lucide="brain-circuit" className="text-emerald-500"></i> Document Intelligence & Interpretation</h2>

            {docData ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1: Composite Risk Score */}
                        <div className="bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500"></div>
                            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="shield-alert" className="w-4 h-4"></i> Document Risk Engine</h3>
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className={`text-7xl font-black mb-2 drop-shadow-lg ${docData.risk_engine.document_risk_score > 15 ? 'text-red-500' : 'text-emerald-400'}`}>
                                    {docData.risk_engine.document_risk_score}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-6">Aggregate Engine Score [0-30]</div>

                                <div className="w-full space-y-2 mt-4">
                                    {docData.risk_engine.risk_breakdown.map((risk, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <i data-lucide="plus-circle" className="w-3 h-3 text-red-400"></i> {risk}
                                        </div>
                                    ))}
                                    {docData.risk_engine.risk_breakdown.length === 0 && <div className="text-center py-4 text-emerald-400 font-bold text-sm bg-emerald-500/10 rounded border border-emerald-500/20">Clean Document Profile</div>}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Financial Ratio Engine */}
                        <div className="lg:col-span-2 bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><i data-lucide="percent" className="w-4 h-4"></i> Financial Ratio Engine</h3>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${docData.ratios.financial_health === 'Strong' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : (docData.ratios.financial_health === 'Stressed' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30')}`}>
                                    {docData.ratios.financial_health} HEALTH
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Debt to Equity (DER)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.debt_to_equity}x</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${Math.min(docData.ratios.debt_to_equity * 40, 100)}%` }}></div></div>
                                </div>
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Interest Coverage (ICR)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.interest_coverage}x</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${docData.ratios.interest_coverage < 2 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(docData.ratios.interest_coverage * 20, 100)}%` }}></div></div>
                                </div>
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Net Profit Margin</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.net_profit_margin}%</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${docData.ratios.net_profit_margin < 5 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(docData.ratios.net_profit_margin * 5, 100)}%` }}></div></div>
                                </div>
                            </div>
                        </div>

                        {/* New section for Core Debt & Liquidity Ratios */}
                        <div className="lg:col-span-3 bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="line-chart" className="w-4 h-4"></i> Core Debt & Liquidity Ratios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Debt to Equity (DER)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.debt_to_equity}x</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${Math.min(docData.ratios.debt_to_equity * 40, 100)}%` }}></div></div>
                                </div>
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Interest Coverage (ICR)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.interest_coverage}x</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${docData.ratios.interest_coverage < 2 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(docData.ratios.interest_coverage * 20, 100)}%` }}></div></div>
                                </div>
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-amber-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">DSCR (Security Coverage)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.dscr}x</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${docData.ratios.dscr < 1.2 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(docData.ratios.dscr * 50, 100)}%` }}></div></div>
                                </div>
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Current Ratio (CR)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.current_ratio}</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${docData.ratios.current_ratio < 1.0 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(docData.ratios.current_ratio * 40, 100)}%` }}></div></div>
                                </div>
                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Quick Ratio (QR)</div>
                                    <div className="text-2xl font-black text-white">{docData.ratios.quick_ratio}</div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${docData.ratios.quick_ratio < 0.8 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(docData.ratios.quick_ratio * 50, 100)}%` }}></div></div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Trends and Auditor Remarks */}
                        <div className="bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl flex flex-col justify-between">
                            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="trending-up" className="w-4 h-4"></i> Trend Intelligence</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-lg">
                                    <span className="text-slate-400 text-xs font-bold uppercase">Revenue Trend</span>
                                    <span className={`font-black flex items-center gap-1 ${docData.trends.revenue_trend === 'Strong Growth' ? 'text-emerald-400' : (docData.trends.revenue_trend === 'Stable' ? 'text-white' : 'text-red-400')}`}>
                                        <i data-lucide={docData.trends.revenue_trend === 'Strong Growth' ? 'trending-up' : 'trending-down'} className="w-4 h-4"></i> {docData.trends.revenue_trend}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-lg">
                                    <span className="text-slate-400 text-xs font-bold uppercase">3-Yr Revenue CAGR</span>
                                    <span className={`font-black ${docData.trends.revenue_cagr > 10 ? 'text-emerald-400' : (docData.trends.revenue_cagr > 0 ? 'text-white' : 'text-red-400')}`}>{docData.trends.revenue_cagr}%</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-lg">
                                    <span className="text-slate-400 text-xs font-bold uppercase">Profit Stability</span>
                                    <span className={`font-black ${docData.trends.profitability === 'Consistent' || docData.trends.profitability === 'Improving' ? 'text-white' : 'text-amber-400'}`}>{docData.trends.profitability}</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl relative overflow-hidden">
                            <div className={`absolute top-0 right-0 h-full w-2 ${docData.auditor_analysis.is_flagged ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="file-check" className="w-4 h-4"></i> Auditor Remark Classification</h3>
                            <div className={`p-6 rounded-xl border ${docData.auditor_analysis.is_flagged ? 'bg-red-900/10 border-red-500/30' : 'bg-emerald-900/10 border-emerald-500/30'}`}>
                                <div className="flex items-start gap-4">
                                    <i data-lucide={docData.auditor_analysis.is_flagged ? "alert-triangle" : "check-circle"} className={`w-8 h-8 mt-1 ${docData.auditor_analysis.is_flagged ? 'text-red-500' : 'text-emerald-500'}`}></i>
                                    <div>
                                        <div className="text-lg font-bold text-white mb-2 leading-tight">{docData.auditor_analysis.remarks}</div>
                                        <p className="text-xs text-slate-400">Classified using IntelliCredit Keyword Detection Engine. Scanned for: "Qualified", "Adverse", "Going Concern", "Material Uncertainty".</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="bg-darkPanel border border-slate-700 p-8 rounded-2xl shadow-xl mt-6">
                        <h3 className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">Raw Extraction Checksum</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {Object.entries(docData.financials).map(([k, v]) => (
                                <div key={k} className="border-b border-slate-800 pb-2">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{k.replace(/_/g, ' ')}</div>
                                    <div className="text-lg font-bold text-slate-300 font-mono">{v} <span className="text-[10px] text-slate-500 font-normal">Cr</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
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
                                            Show only high-confidence entities matching "{activeApplication?.companyName || corporateData?.companyName || 'Target Entity'}"
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

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Investigator Summary / Review</label>
                        <textarea className="w-full bg-slate-800 border-slate-700 p-3 rounded-lg text-white min-h-[120px]" placeholder="Add your site visit observations..." value={investigatorInputs.review_summary} onChange={(e) => setInvestigatorInputs({ ...investigatorInputs, review_summary: e.target.value })}></textarea>
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
        const handleSaveDecision = async () => {
            const decisionPayload = {
                id: activeApplication.id,
                status: decision === 'Reject' ? 'Rejected' : 'Approved',
                finalLimit: limit,
                finalRate: rate,
                reason: reason
            };
            try {
                const res = await fetch(`${API_URL}/submit_decision`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(decisionPayload)
                });
                const data = await res.json();
                if (data.status === 'success') {
                    const updatedApp = { ...activeApplication, ...decisionPayload };
                    setPendingApplications(pendingApplications.map(app => app.id === activeApplication.id ? updatedApp : app));
                    setActiveApplication(updatedApp);
                    alert("Appraisal decision and terms recorded officially in database!");
                }
            } catch (err) {
                alert("Failed to submit decision to engine.");
            }
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
                body: JSON.stringify({ id: activeApplication.id, company_name: activeApplication.companyName, pd: riskData?.probability_of_default, risk_score: riskData?.risk_score, edited_text: camDraft, fraud_risk: riskData?.fraud_risk_index, confidence: riskData?.confidence_level })
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
                        <div className="mt-8 border-t border-slate-700/50 pt-6">
                            <p className="text-slate-400 text-sm italic mb-3">New to the platform?</p>
                            <button onClick={() => setIsSignupOpen(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-600 transition flex items-center justify-center gap-2">
                                <i data-lucide="user-plus" className="w-4 h-4 text-emerald-400"></i> Create New Account
                            </button>
                        </div>
                        <p className="text-slate-500 text-[10px] mt-8 uppercase font-bold tracking-wider opacity-60">Secure 256-bit encryption. Authorized personnel only.</p>
                    </div>
                </div>
            );
        }


        const handleLoginSubmit = async (e) => {
            e.preventDefault();

            // Bypass login for demo purposes
            if (loginMode === 'bank') {
                setUserRole('bank');
                setIsAuthenticated(true);
                localStorage.setItem('bankName', 'Demo Bank');
                setActiveTab('Pending Requests');
                return;
            } else {
                setUserRole('borrower');
                setIsAuthenticated(true);
                setActiveTab('Dashboard');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });
                const data = await res.json();
                if (data.status === 'success') {
                    const u = data.user;
                    setUserRole(u.role);
                    setIsAuthenticated(true);
                    if (u.role === 'bank') {
                        localStorage.setItem('bankName', u.bankName);
                        setActiveTab('Pending Requests');
                    } else {
                        // Fetch the full profile from the backend
                        const profRes = await fetch(`${API_URL}/get_profile/${encodeURIComponent(u.companyName)}`);
                        const profData = await profRes.json();
                        if (profData) setCorporateData(profData);
                        setActiveTab('Dashboard');
                    }
                } else {
                    alert("Invalid credentials!");
                }
            } catch (err) {
                alert("Login service unavailable.");
            }
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
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Email Address (Optional for Demo)</label>
                            <input type="email" placeholder="name@company.com" className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 p-3 rounded-lg text-white transition outline-none" value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-400 block">Secure Password</label>
                                <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Forgot?</span>
                            </div>
                            <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 p-3 rounded-lg text-white transition outline-none" value={credentials.pass} onChange={e => setCredentials({ ...credentials, pass: e.target.value })} />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition shadow-lg mt-2 font-lg flex justify-center gap-2">
                            <i data-lucide="log-in" className="w-5 h-5"></i> Enter Workspace
                        </button>
                    </form>

                    {loginMode === 'bank' && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setUserRole('bank');
                                setIsAuthenticated(true);
                                localStorage.setItem('bankName', 'Demo Bank');
                                setActiveTab('Pending Requests');
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 py-3 rounded-lg transition flex items-center justify-center gap-2 mt-4 font-bold text-sm">
                            <i data-lucide="zap" className="w-4 h-4 text-emerald-400"></i> Fast-Track Bank Officer Demo
                        </button>
                    )}
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

    if (isSignupOpen) return <SignupPage onSignup={handleSignup} onReturnToLogin={() => setIsSignupOpen(false)} />;
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
                    <div className="space-y-1.5 flex-1 overflow-y-auto custom-scroller pr-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
                            { id: 'form', label: 'New Application', icon: 'plus-circle' },
                            { id: 'my_applications', label: 'My Applications', icon: 'folder' },
                            { id: 'documents', label: 'Documents', icon: 'files' },
                            { id: 'ews_research', label: 'EWS & NLP Research', icon: 'globe' },
                            { id: 'timeline', label: 'Timeline', icon: 'timer' },
                            ...(pendingApplications.some(a => a.status === 'Approved') ? [{ id: 'download_cam', label: 'Download CAM', icon: 'file-check' }] : []),
                            { id: 'profile', label: 'Profile', icon: 'user' }
                        ].map(link => (
                            <button key={link.id} onClick={() => {
                                if (link.id === 'download_cam') {
                                    const approvedApp = pendingApplications.find(a => a.status === 'Approved');
                                    if (approvedApp && approvedApp.camUrl) {
                                        window.open(`${API_URL}/download_cam?path=${encodeURIComponent(approvedApp.camUrl)}`);
                                    } else {
                                        window.open(`${API_URL}/download_cam?path=cam_report.pdf`);
                                    }
                                } else {
                                    setBorrowerView(link.id);
                                }
                            }} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-all text-sm group ${borrowerView === link.id ? 'bg-gradient-to-r from-emerald-600/20 to-transparent text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-4 border-transparent'
                                }`}>
                                <i data-lucide={link.icon} className={`w-5 h-5 ${borrowerView === link.id ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
                                {link.label}
                                {link.id === 'download_cam' && <span className="ml-auto bg-emerald-500 w-2 h-2 rounded-full animate-ping"></span>}
                            </button>
                        ))}
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
                                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setBorrowerView('profile')}>
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600 rounded-full flex items-center justify-center shadow-lg group-hover:ring-emerald-500 transition-all"><i data-lucide="briefcase" className="w-5 h-5 text-slate-300 group-hover:text-emerald-400"></i></div>
                                    <div><div className="text-sm font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">{corporateData.companyName} Admin</div><div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Corporate Finance</div></div>
                                </div>
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
                {userRole === 'borrower' && pendingApplications.some(a => a.status === 'Approved') && (
                    <div className="mb-8 animate-slide-down">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-lg">
                            <div className="flex items-center gap-3 text-emerald-400 font-bold italic tracking-tight">
                                <i data-lucide="bell-ring" className="w-5 h-5 animate-bounce"></i>
                                CONGRATULATIONS {corporateData.companyName.toUpperCase()}! YOUR FACILITY HAS BEEN APPROVED.
                            </div>
                            <button
                                onClick={() => {
                                    const approvedApp = pendingApplications.find(a => a.status === 'Approved');
                                    if (approvedApp && approvedApp.camUrl) {
                                        window.open(`${API_URL}/download_cam?path=${encodeURIComponent(approvedApp.camUrl)}`);
                                    } else {
                                        window.open(`${API_URL}/download_cam?path=cam_report.pdf`);
                                    }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black italic uppercase transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                            >
                                <i data-lucide="download-cloud" className="w-4 h-4"></i> Download Sanction Letter / CAM
                            </button>
                        </div>
                    </div>
                )}
                {userRole === 'borrower' ? renderBorrowerPortal() : renderBankerTab()}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
